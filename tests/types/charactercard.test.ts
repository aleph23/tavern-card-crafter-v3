import { describe, it, expect } from 'vitest'
import {
  createCharacterBookEntry,
  isValidCharacterBookEntry,
  normalizeCharacterBookEntry,
  isCharacterCardV3,
  isCharacterCardV2,
} from '../../src/types/charactercard.ts'
import type { CharacterCardV3, CharacterCardV2 } from '../../src/types/charactercard.ts'

// ---------------------------------------------------------------------------
// createCharacterBookEntry
// ---------------------------------------------------------------------------

describe('createCharacterBookEntry', () => {
  it('creates an entry with correct defaults', () => {
    const entry = createCharacterBookEntry({ content: 'lore text', keys: ['dragon'] })
    expect(entry.content).toBe('lore text')
    expect(entry.keys).toEqual(['dragon'])
    expect(entry.insertion_order).toBe(10)
    expect(entry.enabled).toBe(true)
    expect(entry.use_regex).toBe(false)
    expect(entry.case_sensitive).toBe(false)
    expect(entry.constant).toBe(false)
    expect(entry.priority).toBe(100)
    expect(entry.position).toBe('after_char')
  })

  it('allows overriding all default values', () => {
    const entry = createCharacterBookEntry({
      content: 'lore',
      keys: ['key'],
      insertion_order: 5,
      enabled: false,
      use_regex: true,
      case_sensitive: true,
      constant: true,
      priority: 50,
      position: 'before_char',
      name: 'Entry1',
      id: 42,
      comment: 'A note',
      selective: true,
      secondary_keys: ['extra'],
      extensions: { custom: true },
    })
    expect(entry.insertion_order).toBe(5)
    expect(entry.enabled).toBe(false)
    expect(entry.use_regex).toBe(true)
    expect(entry.case_sensitive).toBe(true)
    expect(entry.constant).toBe(true)
    expect(entry.priority).toBe(50)
    expect(entry.position).toBe('before_char')
    expect(entry.name).toBe('Entry1')
    expect(entry.id).toBe(42)
    expect(entry.selective).toBe(true)
    expect(entry.secondary_keys).toEqual(['extra'])
    expect(entry.extensions).toEqual({ custom: true })
  })

  it('throws when keys are empty and constant is false', () => {
    expect(() => createCharacterBookEntry({ content: 'lore', keys: [] })).toThrow()
  })

  it('allows empty keys when constant is true', () => {
    const entry = createCharacterBookEntry({ content: 'lore', keys: [], constant: true })
    expect(entry.keys).toEqual([])
    expect(entry.constant).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// isValidCharacterBookEntry
// ---------------------------------------------------------------------------

describe('isValidCharacterBookEntry', () => {
  it('returns true for a valid entry with content and keys', () => {
    const entry = createCharacterBookEntry({ content: 'text', keys: ['key'] })
    expect(isValidCharacterBookEntry(entry)).toBe(true)
  })

  it('returns false when content is empty', () => {
    const entry = normalizeCharacterBookEntry({ content: '', keys: ['key'] })
    expect(isValidCharacterBookEntry(entry)).toBe(false)
  })

  it('returns false when content is only whitespace', () => {
    const entry = normalizeCharacterBookEntry({ content: '   ', keys: ['key'] })
    expect(isValidCharacterBookEntry(entry)).toBe(false)
  })

  it('returns false when keys are empty and constant is false', () => {
    const entry = normalizeCharacterBookEntry({ content: 'text', keys: [], constant: false })
    expect(isValidCharacterBookEntry(entry)).toBe(false)
  })

  it('returns true when keys are empty but constant is true', () => {
    const entry = normalizeCharacterBookEntry({ content: 'text', keys: [], constant: true })
    expect(isValidCharacterBookEntry(entry)).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// normalizeCharacterBookEntry
// ---------------------------------------------------------------------------

describe('normalizeCharacterBookEntry', () => {
  it('fills defaults for a fully empty partial', () => {
    const entry = normalizeCharacterBookEntry({})
    expect(entry.content).toBe('')
    expect(entry.keys).toEqual([])
    expect(entry.insertion_order).toBe(10)
    expect(entry.enabled).toBe(true)
    expect(entry.use_regex).toBe(false)
    expect(entry.case_sensitive).toBe(false)
    expect(entry.constant).toBe(false)
    expect(entry.priority).toBe(100)
    expect(entry.position).toBe('after_char')
  })

  it('preserves provided values over defaults', () => {
    const entry = normalizeCharacterBookEntry({ content: 'dragon lore', enabled: false, priority: 200 })
    expect(entry.content).toBe('dragon lore')
    expect(entry.enabled).toBe(false)
    expect(entry.priority).toBe(200)
  })
})

// ---------------------------------------------------------------------------
// Type guards
// ---------------------------------------------------------------------------

describe('isCharacterCardV3', () => {
  it('returns true for a V3 card', () => {
    const card: CharacterCardV3 = {
      spec: 'chara_card_v3',
      spec_version: '3.0',
      data: {} as CharacterCardV3['data'],
    }
    expect(isCharacterCardV3(card)).toBe(true)
  })

  it('returns false for a V2 card', () => {
    const card: CharacterCardV2 = {
      spec: 'chara_card_v2',
      spec_version: '2.0',
      data: {} as CharacterCardV2['data'],
    }
    expect(isCharacterCardV3(card)).toBe(false)
  })
})

describe('isCharacterCardV2', () => {
  it('returns true for a V2 card', () => {
    const card: CharacterCardV2 = {
      spec: 'chara_card_v2',
      spec_version: '2.0',
      data: {} as CharacterCardV2['data'],
    }
    expect(isCharacterCardV2(card)).toBe(true)
  })

  it('returns false for a V3 card', () => {
    const card: CharacterCardV3 = {
      spec: 'chara_card_v3',
      spec_version: '3.0',
      data: {} as CharacterCardV3['data'],
    }
    expect(isCharacterCardV2(card)).toBe(false)
  })
})
