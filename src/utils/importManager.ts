/**
 * importManager.ts
 *
 * Handles all character card import concerns:
 *
 *  1. extractPNGCharacterData  — reads a PNG file and extracts embedded character JSON
 *     using three progressive methods: tEXt chunk scan, string pattern search, base64 scan.
 *
 *  2. upgradeToV3              — accepts ANY raw import payload (unknown) and returns a
 *     fully-normalised CharacterCardV3, regardless of the source version.
 *
 * Version detection (internal, no extra types needed in charactercard.ts):
 *   spec === 'chara_card_v3'  → V3  (data envelope present)
 *   spec === 'chara_card_v2'  → V2  (data envelope present)
 *   spec === 'chara_card_v1'  → V1  (may or may not have data envelope)
 *   no spec / flat            → legacy  (BaseCharacterData fields at root, char_name alias)
 *
 * Coercion strategy (per spec):
 *   • String fields  — any value accepted; numbers/booleans are String()-coerced.
 *   • Number fields  — type-check → extract numeric substring → use spec default (toast) → ask user.
 *   • Boolean fields — type-check → spec default → coerce from string/number only if NO spec default.
 *   • Array fields   — bare strings wrapped; existing arrays pass through; else [].
 *   • character_book — each entry normalised via normalizeCharacterBookEntry from types.
 *   • assets         — each item coerced to the Asset shape.
 *   • Date fields    — string or numeric unix timestamps both accepted as strings (no conversion).
 */

import {
  CharacterCardV3,
  CharacterBook,
  CharacterBookEntry,
  Asset,
  normalizeCharacterBookEntry,
} from '@/types/charactercard'

// ---------------------------------------------------------------------------
// Public callback interface — lets the caller (Index.tsx) wire in toast/prompt UI
// ---------------------------------------------------------------------------

/**
 * Callbacks passed to upgradeToV3 to handle number coercion failures.
 * This keeps importManager framework-agnostic: the UI layer decides how to surface them.
 */
export interface UpgradeCallbacks {
  /**
   * Called when a number field could not be auto-parsed and the spec default was used instead.
   * Recommended action: show a toast informing the user the field was defaulted.
   */
  onNumberDefaulted?: (field: string, rawValue: unknown, defaultUsed: number) => void

  /**
   * Called when a number field could not be parsed AND there is no spec default.
   * The field will be left undefined; recommended action: prompt the user to provide a value.
   */
  onNumberMissing?: (field: string, rawValue: unknown) => void
}

// ---------------------------------------------------------------------------
// Internal version detection
// ---------------------------------------------------------------------------

type CardVersion = 'v3' | 'v2' | 'v1' | 'legacy'

function detectCardVersion(raw: Record<string, unknown>): CardVersion {
  if (raw.spec === 'chara_card_v3') return 'v3'
  if (raw.spec === 'chara_card_v2') return 'v2'
  if (raw.spec === 'chara_card_v1') return 'v1'
  return 'legacy'
}

// ---------------------------------------------------------------------------
// Pure coercion helpers (framework-agnostic, no side effects)
// ---------------------------------------------------------------------------

/**
 * Accept any value as a string.
 * Numbers and booleans are coerced via String(). null/undefined → fallback.
 */
function coerceToString(val: unknown, fallback = ''): string {
  if (val === null || val === undefined) return fallback
  if (typeof val === 'string') return val
  if (typeof val === 'number' || typeof val === 'boolean') return String(val)
  return fallback
}

/**
 * Accept any value as a string array.
 * - Array  → each element coerceToString-ed (empty strings filtered)
 * - String → wrapped in single-element array (if non-empty)
 * - else   → []
 */
function coerceToStringArray(val: unknown): string[] {
  if (Array.isArray(val)) return val.map((v) => coerceToString(v)).filter(Boolean)
  if (typeof val === 'string' && val.length > 0) return [val]
  return []
}

/**
 * Accept any value as a boolean.
 *
 * Ordering:
 *   1. Type-check  — if it's already a boolean, use it directly.
 *   2. Spec default — use the caller-supplied default (the V3 spec value for this field).
 *      This takes priority over any attempted string/number coercion.
 *   3. Coerce from string/number — only reached when specDefault is undefined (i.e. the
 *      field has no defined spec default). In practice all V3 boolean fields have defaults,
 *      so this path is reserved for hypothetical future optional fields.
 */
function coerceToBoolean(val: unknown, specDefault: boolean): boolean {
  // 1. Already a boolean — use it.
  if (typeof val === 'boolean') return val
  // 2. Spec default takes priority over any coercion attempt.
  return specDefault
}

/**
 * Attempt boolean coercion for optional fields that have no defined spec default.
 * Returns undefined if the value cannot be determined.
 */
function coerceToBooleanOptional(val: unknown): boolean | undefined {
  if (typeof val === 'boolean') return val
  if (val === 1 || val === '1' || val === 'true') return true
  if (val === 0 || val === '0' || val === 'false') return false
  return undefined
}

/**
 * Try to extract a number from val.
 * Returns the number on success, or undefined on failure (caller decides how to handle).
 * Does NOT emit any side effects — callbacks are the caller's responsibility.
 */
function tryParseNumber(val: unknown): number | undefined {
  if (typeof val === 'number' && !isNaN(val)) return val
  if (typeof val === 'string') {
    const extracted = parseFloat(val.replace(/[^0-9.-]/g, ''))
    if (!isNaN(extracted)) return extracted
  }
  return undefined
}

function normalizeExtensions(val: unknown): Record<string, unknown> {
  if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
    return val as Record<string, unknown>
  }
  return {}
}

// ---------------------------------------------------------------------------
// Blank card factory
// ---------------------------------------------------------------------------

function blankV3Card(): CharacterCardV3 {
  const today = Math.floor(Date.now() / 1000).toString()
  return {
    spec: 'chara_card_v3',
    spec_version: '3.0',
    data: {
      name: '',
      nickname: '',
      description: '',
      personality: '',
      mes_example: '',
      scenario: '',
      first_mes: '',
      alternate_greetings: [],
      tags: [],
      creator: '',
      character_version: '',
      creator_notes: '',
      creator_notes_multilingual: '',
      source: '',
      system_prompt: '',
      post_history_instructions: '',
      character_book: { entries: [] },
      group_only_greetings: [],
      creation_date: today,
      modification_date: today,
      extensions: {},
      assets: [],
    },
  }
}

// ---------------------------------------------------------------------------
// Main upgrader
// ---------------------------------------------------------------------------

/**
 * Accepts any raw import payload (unknown) and returns a fully normalised CharacterCardV3.
 *
 * Field resolution priority (src = inner data envelope when present, root = raw object):
 *   src[field] → root[field] → spec default
 *
 * Number coercion failures are surfaced via the optional callbacks parameter so the
 * calling component (e.g. Index.tsx) can show appropriate toast/prompt UI.
 */
export function upgradeToV3(raw: unknown, callbacks?: UpgradeCallbacks): CharacterCardV3 {
  if (!raw || typeof raw !== 'object') {
    console.warn('importManager.upgradeToV3: received non-object payload; returning blank card.')
    return blankV3Card()
  }

  const root = raw as Record<string, unknown>
  const version = detectCardVersion(root)

  const hasEnvelope =
    (version === 'v3' || version === 'v2' || version === 'v1') && typeof root.data === 'object' && root.data !== null
  const src: Record<string, unknown> = hasEnvelope ? (root.data as Record<string, unknown>) : root

  // ---- Callback-aware number resolvers (closures over `callbacks`) ----

  /**
   * Resolve a number field that has a required spec default.
   * On parse failure: fires onNumberDefaulted and uses the default.
   */
  function resolveNumber(val: unknown, specDefault: number, fieldLabel: string): number {
    const parsed = tryParseNumber(val)
    if (parsed !== undefined) return parsed
    callbacks?.onNumberDefaulted?.(fieldLabel, val, specDefault)
    return specDefault
  }

  /**
   * Resolve an optional number field that has NO required spec default.
   * On parse failure: fires onNumberMissing and returns undefined.
   */
  function resolveNumberOptional(val: unknown, fieldLabel: string): number | undefined {
    if (val === undefined || val === null) return undefined
    const parsed = tryParseNumber(val)
    if (parsed !== undefined) return parsed
    callbacks?.onNumberMissing?.(fieldLabel, val)
    return undefined
  }

  // ---- Sub-normalizers as closures (so they share the resolvers above) ----

  function normalizeBookEntry(rawEntry: unknown): CharacterBookEntry {
    const e: Record<string, unknown> =
      rawEntry !== null && typeof rawEntry === 'object' ? (rawEntry as Record<string, unknown>) : {}

    return normalizeCharacterBookEntry({
      content: coerceToString(e.content),
      keys: coerceToStringArray(e.keys),
      insertion_order: resolveNumber(e.insertion_order, 10, 'insertion_order'),
      enabled: coerceToBoolean(e.enabled, true),
      use_regex: coerceToBoolean(e.use_regex, false),
      case_sensitive: coerceToBoolean(e.case_sensitive, false),
      constant: coerceToBoolean(e.constant, false),
      priority: resolveNumber(e.priority, 100, 'priority'),
      position: e.position === 'before_char' || e.position === 'after_char' ? e.position : 'after_char',
      name: e.name !== undefined ? coerceToString(e.name) : undefined,
      id: e.id !== undefined ? (typeof e.id === 'number' ? e.id : coerceToString(e.id)) : undefined,
      comment: e.comment !== undefined ? coerceToString(e.comment) : undefined,
      // selective has no required default → use coerceToBooleanOptional
      selective: e.selective !== undefined ? coerceToBooleanOptional(e.selective) : undefined,
      secondary_keys: e.secondary_keys !== undefined ? coerceToStringArray(e.secondary_keys) : undefined,
      extensions:
        e.extensions !== null && typeof e.extensions === 'object'
          ? (e.extensions as Record<string, unknown>)
          : undefined,
    })
  }

  function normalizeCharacterBook(val: unknown): CharacterBook {
    if (!val || typeof val !== 'object') return { entries: [] }
    const book = val as Record<string, unknown>
    const rawEntries = Array.isArray(book.entries) ? book.entries : []
    const result: CharacterBook = { entries: rawEntries.map(normalizeBookEntry) }
    if (book.name !== undefined) result.name = coerceToString(book.name)
    if (book.description !== undefined) result.description = coerceToString(book.description)
    // scan_depth / token_budget are optional with no mandated spec defaults → resolveNumberOptional
    if (book.scan_depth !== undefined)
      result.scan_depth = resolveNumberOptional(book.scan_depth, 'character_book.scan_depth')
    if (book.token_budget !== undefined)
      result.token_budget = resolveNumberOptional(book.token_budget, 'character_book.token_budget')
    // recursive_scanning is optional boolean with no spec default → coerceToBooleanOptional
    if (book.recursive_scanning !== undefined)
      result.recursive_scanning = coerceToBooleanOptional(book.recursive_scanning)
    if (book.extensions !== null && typeof book.extensions === 'object')
      result.extensions = book.extensions as Record<string, unknown>
    return result
  }

  function normalizeAssets(val: unknown): Asset[] {
    if (!Array.isArray(val)) return []
    return val
      .filter((a): a is Record<string, unknown> => a !== null && typeof a === 'object')
      .map((a) => ({
        type: coerceToString(a.type, 'unknown'),
        uri: coerceToString(a.uri),
        name: coerceToString(a.name, 'unnamed'),
        ext: coerceToString(a.ext, 'unknown'),
      }))
  }

  // ---- Field pickers ----

  function pick(key: string, coerce: (v: unknown) => string, fallback = ''): string {
    const fromSrc = src[key]
    if (fromSrc !== undefined && fromSrc !== null && fromSrc !== '') return coerce(fromSrc)
    const fromRoot = root[key]
    if (fromRoot !== undefined && fromRoot !== null && fromRoot !== '') return coerce(fromRoot)
    return fallback
  }

  function pickArray(key: string): unknown {
    if (src[key] !== undefined && src[key] !== null) return src[key]
    if (root[key] !== undefined && root[key] !== null) return root[key]
    return undefined
  }

  // ---- Field resolution ----

  // Name: V1 legacy cards may use char_name instead of name.
  const name =
    coerceToString(src.char_name) ||
    coerceToString(src.name) ||
    coerceToString(root.char_name) ||
    coerceToString(root.name)

  // Date fields: accept string or numeric unix timestamp — coerce both to string.
  // creation_date: src → root, with V1 "create_date" alias as final fallback.
  const creation_date = coerceToString(
    src.creation_date ?? root.creation_date ?? src.create_date ?? root.create_date,
    ''
  )
  const modification_date = Math.floor(Date.now() / 1000).toString()

  return {
    spec: 'chara_card_v3',
    spec_version: '3.0',
    data: {
      name,
      nickname: pick('nickname', coerceToString),
      description: pick('description', coerceToString),
      personality: pick('personality', coerceToString),
      scenario: pick('scenario', coerceToString),
      first_mes: pick('first_mes', coerceToString),
      mes_example: pick('mes_example', coerceToString),
      creator_notes: pick('creator_notes', coerceToString),
      creator_notes_multilingual: pick('creator_notes_multilingual', coerceToString),
      source: pick('source', coerceToString),
      system_prompt: pick('system_prompt', coerceToString),
      post_history_instructions: pick('post_history_instructions', coerceToString),
      creator: pick('creator', coerceToString),
      character_version: pick('character_version', coerceToString, '1.0'),
      alternate_greetings: coerceToStringArray(pickArray('alternate_greetings')),
      group_only_greetings: coerceToStringArray(pickArray('group_only_greetings')),
      tags: coerceToStringArray(pickArray('tags')),
      character_book: normalizeCharacterBook(src.character_book ?? root.character_book),
      assets: normalizeAssets(src.assets ?? root.assets),
      extensions: normalizeExtensions(src.extensions ?? root.extensions),
      creation_date,
      modification_date,
    },
  }
}

// ---------------------------------------------------------------------------
// PNG extractor (moved from Index.tsx)
// ---------------------------------------------------------------------------

/**
 * Extract character data embedded in a PNG file.
 *
 * Tries three progressive methods:
 *   1. tEXt chunk scan   — looks for chara/card_v2/card_v3/Comment keywords
 *   2. String pattern search — scans full UTF-8 text for JSON-like patterns
 *   3. Base64 scan       — finds long base64 strings and tries to decode them
 *
 * @param file - The PNG file to extract data from.
 * @returns Promise resolving to the raw parsed object (pass to upgradeToV3).
 * @throws Error if no character data is found.
 */
export const extractPNGCharacterData = async (file: File): Promise<unknown> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer
        const uint8Array = new Uint8Array(arrayBuffer)

        console.log('PNG file size:', uint8Array.length)

        // ----------------------------------------------------------------
        // Method 1: tEXt chunk scan
        // ----------------------------------------------------------------
        let foundData: unknown = null

        for (let i = 8; i < uint8Array.length - 8; i++) {
          const chunkLength =
            (uint8Array[i] << 24) | (uint8Array[i + 1] << 16) | (uint8Array[i + 2] << 8) | uint8Array[i + 3]

          // tEXt chunk marker: 0x74455874
          if (
            uint8Array[i + 4] === 0x74 &&
            uint8Array[i + 5] === 0x45 &&
            uint8Array[i + 6] === 0x58 &&
            uint8Array[i + 7] === 0x74
          ) {
            console.log('Found tEXt chunk at:', i, 'length:', chunkLength)

            const textStart = i + 8
            const textEnd = textStart + chunkLength

            if (textEnd <= uint8Array.length) {
              try {
                // Find null-byte keyword terminator
                let keyEnd = textStart
                while (keyEnd < textEnd && uint8Array[keyEnd] !== 0) keyEnd++

                const keyword = new TextDecoder('utf-8', { fatal: false }).decode(uint8Array.slice(textStart, keyEnd))
                console.log('tEXt keyword:', keyword)

                if (keyword === 'chara' || keyword === 'card_v3' || keyword === 'card_v2' || keyword === 'Comment') {
                  const dataStart = keyEnd + 1
                  const textDataBytes = uint8Array.slice(dataStart, textEnd)
                  console.log('Found potential character data, length:', textDataBytes.length)

                  try {
                    // Try base64 → UTF-8 → JSON
                    const textData = new TextDecoder('utf-8', { fatal: false }).decode(textDataBytes)
                    const decoded = atob(textData)
                    const decodedBytes = new Uint8Array(decoded.length)
                    for (let j = 0; j < decoded.length; j++) decodedBytes[j] = decoded.charCodeAt(j)
                    const decodedText = new TextDecoder('utf-8', { fatal: false }).decode(decodedBytes)
                    foundData = JSON.parse(decodedText)
                    console.log('Successfully parsed base64 JSON with UTF-8 handling')
                    break
                  } catch {
                    try {
                      // Try raw UTF-8 → JSON
                      const textData = new TextDecoder('utf-8', { fatal: false }).decode(textDataBytes)
                      foundData = JSON.parse(textData)
                      console.log('Successfully parsed direct JSON with UTF-8 handling')
                      break
                    } catch {
                      console.log('Failed to parse tEXt chunk as JSON')
                    }
                  }
                }
              } catch (e) {
                console.log('Error processing tEXt chunk:', e)
              }
            }

            // Skip past this chunk (length + type + data + CRC)
            i += 8 + chunkLength + 4 - 1 // -1 because the for loop increments
          }
        }

        // ----------------------------------------------------------------
        // Method 2: String pattern search
        // ----------------------------------------------------------------
        if (!foundData) {
          console.log('tEXt method failed, trying string search...')
          const fullText = new TextDecoder('utf-8', { fatal: false }).decode(uint8Array)

          const jsonPatterns = [
            /"spec"\s*:\s*"chara_card_v[123]"/g,
            /"name"\s*:\s*"/g,
            /\{\s*"name"\s*:/g,
            /\{\s*"char_name"\s*:/g,
          ]

          outer: for (const pattern of jsonPatterns) {
            const matches = [...fullText.matchAll(pattern)]
            console.log(`Pattern ${pattern.source} found ${matches.length} matches`)

            for (const match of matches) {
              if (match.index == null) continue

              // Walk backwards to the opening brace
              let jsonStart = match.index
              while (jsonStart > 0 && fullText[jsonStart] !== '{') jsonStart--

              if (jsonStart >= 0) {
                let braceCount = 0
                let jsonEnd = -1
                for (let i = jsonStart; i < fullText.length; i++) {
                  if (fullText[i] === '{') braceCount++
                  if (fullText[i] === '}') braceCount--
                  if (braceCount === 0 && i > jsonStart) {
                    jsonEnd = i + 1
                    break
                  }
                }

                if (jsonEnd > jsonStart) {
                  try {
                    foundData = JSON.parse(fullText.substring(jsonStart, jsonEnd))
                    console.log('Successfully parsed JSON from string search')
                    break outer
                  } catch {
                    console.log('Failed to parse extracted JSON')
                  }
                }
              }
            }
          }
        }

        // ----------------------------------------------------------------
        // Method 3: Base64 scan
        // ----------------------------------------------------------------
        if (!foundData) {
          console.log('String search failed, trying base64 scan...')
          const fullText = new TextDecoder('utf-8', { fatal: false }).decode(uint8Array)
          const base64Pattern = /[A-Za-z0-9+/]{100,}={0,2}/g
          const base64Matches = [...fullText.matchAll(base64Pattern)]
          console.log(`Found ${base64Matches.length} potential base64 strings`)

          for (const match of base64Matches) {
            try {
              const decoded = atob(match[0])
              const decodedBytes = new Uint8Array(decoded.length)
              for (let j = 0; j < decoded.length; j++) decodedBytes[j] = decoded.charCodeAt(j)
              const decodedText = new TextDecoder('utf-8', { fatal: false }).decode(decodedBytes)

              if (
                decodedText.includes('"name"') ||
                decodedText.includes('"char_name"') ||
                decodedText.includes('chara_card')
              ) {
                foundData = JSON.parse(decodedText)
                console.log('Successfully parsed base64 character data with UTF-8')
                break
              }
            } catch {
              // Keep trying the next candidate
            }
          }
        }

        if (foundData) {
          console.log('Character data found:', foundData)
          resolve(foundData)
        } else {
          console.log('No character data found in PNG')
          reject(new Error('No character data found in PNG'))
        }
      } catch (error) {
        console.error('PNG parsing error:', error)
        reject(error)
      }
    }

    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsArrayBuffer(file)
  })
}

// ---------------------------------------------------------------------------
// JSON reader
// ---------------------------------------------------------------------------

/**
 * Read and parse a JSON character card file.
 *
 * Returns the raw parsed object — pass to upgradeToV3 exactly as you would
 * the result of extractPNGCharacterData, keeping the import flow symmetrical.
 *
 * @param file - The .json file to read.
 * @returns Promise resolving to the raw parsed object.
 * @throws Error if the file cannot be read or is not valid JSON.
 */
export const readJSONCharacterFile = async (file: File): Promise<unknown> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        resolve(JSON.parse(content))
      } catch (error) {
        reject(new Error(`Failed to parse JSON file "${file.name}": ${error}`))
      }
    }
    reader.onerror = () => reject(new Error(`Failed to read file "${file.name}"`))
    reader.readAsText(file)
  })
}
