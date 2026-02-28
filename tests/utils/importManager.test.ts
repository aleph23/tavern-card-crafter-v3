import { describe, it, expect, vi } from 'vitest'
import { upgradeToV3 } from '../../src/utils/importManager.ts'
import type { CharacterCardV3 } from '../../src/types/charactercard.ts'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Minimal V3 card with all required fields present. */
function makeV3Payload(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    spec: 'chara_card_v3',
    spec_version: '3.0',
    data: {
      name: 'TestChar',
      description: 'A test character',
      personality: 'Brave',
      scenario: 'In a tavern',
      first_mes: 'Hello!',
      mes_example: '{{user}}: Hi\n{{char}}: Hey!',
      creator_notes: 'notes',
      creator_notes_multilingual: '',
      source: '',
      system_prompt: '',
      post_history_instructions: '',
      creator: 'tester',
      character_version: '1.0',
      alternate_greetings: ['Yo!'],
      group_only_greetings: [],
      tags: ['test'],
      character_book: { entries: [] },
      assets: [],
      extensions: {},
      creation_date: '1700000000',
      modification_date: '1700000000',
      ...overrides,
    },
  }
}

function makeV2Payload(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    spec: 'chara_card_v2',
    spec_version: '2.0',
    data: {
      name: 'V2Char',
      description: 'A V2 character',
      personality: 'Calm',
      scenario: 'Library',
      first_mes: 'Greetings.',
      mes_example: '',
      creator_notes: '',
      system_prompt: '',
      post_history_instructions: '',
      creator: '',
      character_version: '1.0',
      alternate_greetings: [],
      tags: [],
      extensions: {},
      ...overrides,
    },
  }
}

function makeLegacyPayload(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    char_name: 'LegacyChar',
    description: 'A legacy character',
    personality: 'Bold',
    scenario: 'Dungeon',
    first_mes: 'Hail.',
    mes_example: '',
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('upgradeToV3', () => {
  // ---- Output shape ----

  it('always returns a well-formed CharacterCardV3 envelope', () => {
    const result = upgradeToV3(makeV3Payload())
    expect(result.spec).toBe('chara_card_v3')
    expect(result.spec_version).toBe('3.0')
    expect(result.data).toBeDefined()
  })

  it('returns a blank card when input is null/undefined/non-object', () => {
    for (const bad of [null, undefined, 42, 'string', true]) {
      const result = upgradeToV3(bad)
      expect(result.spec).toBe('chara_card_v3')
      expect(result.data.name).toBe('')
    }
  })

  // ---- V3 passthrough ----

  it('passes through well-formed V3 data', () => {
    const result = upgradeToV3(makeV3Payload())
    expect(result.data.name).toBe('TestChar')
    expect(result.data.description).toBe('A test character')
    expect(result.data.personality).toBe('Brave')
    expect(result.data.alternate_greetings).toEqual(['Yo!'])
    expect(result.data.tags).toEqual(['test'])
  })

  // ---- V2 → V3 promotion ----

  it('promotes a V2 card to V3 with all V3-specific fields set', () => {
    const result = upgradeToV3(makeV2Payload())
    expect(result.spec).toBe('chara_card_v3')
    expect(result.data.name).toBe('V2Char')
    // V3-only fields should exist (with defaults)
    expect(result.data.assets).toEqual([])
    expect(result.data.group_only_greetings).toEqual([])
    expect(result.data.creator_notes_multilingual).toBe('')
  })

  // ---- Legacy (no spec) → V3 promotion ----

  it('promotes a legacy card (no spec, flat structure) to V3', () => {
    const result = upgradeToV3(makeLegacyPayload())
    expect(result.spec).toBe('chara_card_v3')
    expect(result.data.name).toBe('LegacyChar')
    expect(result.data.description).toBe('A legacy character')
  })

  it('resolves char_name from legacy alias', () => {
    const result = upgradeToV3({ char_name: 'AliasName' })
    expect(result.data.name).toBe('AliasName')
  })

  // ---- String coercion ----

  it('coerces numeric values in string fields to strings', () => {
    const result = upgradeToV3(makeV3Payload({ name: 42, personality: true }))
    expect(result.data.name).toBe('42')
    expect(result.data.personality).toBe('true')
  })

  // ---- Array coercion ----

  it('wraps a bare string in an array for array fields', () => {
    const result = upgradeToV3(makeV3Payload({ tags: 'solo-tag', alternate_greetings: 'one-greeting' }))
    expect(result.data.tags).toEqual(['solo-tag'])
    expect(result.data.alternate_greetings).toEqual(['one-greeting'])
  })

  it('coerces array elements to strings and filters empties', () => {
    const result = upgradeToV3(makeV3Payload({ tags: [1, null, 'valid', ''] }))
    expect(result.data.tags).toEqual(['1', 'valid'])
  })

  // ---- Boolean coercion ----

  it('preserves existing boolean values in character_book entries', () => {
    const payload = makeV3Payload({
      character_book: {
        entries: [
          {
            content: 'lore text',
            keys: ['key1'],
            insertion_order: 5,
            enabled: false,
            use_regex: true,
            case_sensitive: true,
            constant: true,
            priority: 50,
            position: 'before_char',
          },
        ],
      },
    })

    const result = upgradeToV3(payload)
    const entry = result.data.character_book!.entries[0]
    expect(entry.enabled).toBe(false)
    expect(entry.use_regex).toBe(true)
    expect(entry.case_sensitive).toBe(true)
    expect(entry.constant).toBe(true)
    expect(entry.position).toBe('before_char')
  })

  // ---- Number coercion ----

  it('fires onNumberDefaulted callback when a number field cannot be parsed', () => {
    const onNumberDefaulted = vi.fn()
    const payload = makeV3Payload({
      character_book: {
        entries: [
          {
            content: 'lore',
            keys: ['k'],
            insertion_order: 'not-a-number',
            enabled: true,
            use_regex: false,
            case_sensitive: false,
            constant: false,
            priority: 100,
            position: 'after_char',
          },
        ],
      },
    })

    upgradeToV3(payload, { onNumberDefaulted })
    expect(onNumberDefaulted).toHaveBeenCalledWith('insertion_order', 'not-a-number', 10)
  })

  it('extracts numeric substrings ("50px" → 50)', () => {
    const payload = makeV3Payload({
      character_book: {
        entries: [
          {
            content: 'lore',
            keys: ['k'],
            insertion_order: '50px',
            enabled: true,
            use_regex: false,
            case_sensitive: false,
            constant: false,
            priority: '200pts',
            position: 'after_char',
          },
        ],
      },
    })

    const result = upgradeToV3(payload)
    const entry = result.data.character_book!.entries[0]
    expect(entry.insertion_order).toBe(50)
    expect(entry.priority).toBe(200)
  })

  // ---- Extensions normalization ----

  it('passes through object extensions and defaults non-object to {}', () => {
    const r1 = upgradeToV3(makeV3Payload({ extensions: { foo: 'bar' } }))
    expect(r1.data.extensions).toEqual({ foo: 'bar' })

    const r2 = upgradeToV3(makeV3Payload({ extensions: 'invalid' }))
    expect(r2.data.extensions).toEqual({})
  })

  // ---- Assets normalization ----

  it('normalizes asset entries', () => {
    const result = upgradeToV3(
      makeV3Payload({
        assets: [{ type: 'avatar', uri: 'data:image/png;base64,...', name: 'main', ext: 'png' }],
      }),
    )
    expect(result.data.assets).toHaveLength(1)
    expect(result.data.assets[0]).toEqual({
      type: 'avatar',
      uri: 'data:image/png;base64,...',
      name: 'main',
      ext: 'png',
    })
  })

  it('defaults missing asset fields', () => {
    const result = upgradeToV3(makeV3Payload({ assets: [{}] }))
    expect(result.data.assets[0]).toEqual({
      type: 'unknown',
      uri: '',
      name: 'unnamed',
      ext: 'unknown',
    })
  })

  // ---- Date handling ----

  it('preserves string creation_date and always refreshes modification_date', () => {
    const result = upgradeToV3(makeV3Payload({ creation_date: '1700000000' }))
    expect(result.data.creation_date).toBe('1700000000')
    // modification_date should be set to "now" (a recent unix timestamp string)
    expect(Number(result.data.modification_date)).toBeGreaterThan(1700000000)
  })

  it('accepts numeric creation_date and coerces to string', () => {
    const result = upgradeToV3(makeV3Payload({ creation_date: 1700000000 }))
    expect(result.data.creation_date).toBe('1700000000')
  })

  // ---- character_version default ----

  it('defaults character_version to "1.0" when missing', () => {
    const result = upgradeToV3({ spec: 'chara_card_v3', spec_version: '3.0', data: { name: 'X' } })
    expect(result.data.character_version).toBe('1.0')
  })

  // ---- Field resolution priority (src > root) ----

  it('prefers data envelope (src) over root for matching field names', () => {
    const result = upgradeToV3({
      spec: 'chara_card_v3',
      spec_version: '3.0',
      name: 'RootName',
      data: {
        name: 'EnvelopeName',
      },
    })
    expect(result.data.name).toBe('EnvelopeName')
  })
})
