import { describe, it, expect } from 'vitest'
import { buildApiUrl } from '../../src/utils/buildApiUrl.ts'

describe('buildApiUrl', () => {
  // ---- Empty / missing base URL ----

  it('returns empty string when baseUrl is empty', () => {
    expect(buildApiUrl('', 'openai')).toBe('')
  })

  it('returns empty string when baseUrl is falsy', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(buildApiUrl(undefined as any, 'openai')).toBe('')
  })

  // ---- Trailing slash cleanup ----

  it('strips trailing slashes from baseUrl', () => {
    const result = buildApiUrl('https://api.example.com/', 'openai')
    expect(result).not.toMatch(/\/$/)
  })

  // ---- Ollama provider ----

  it('appends /v1/chat/completions for ollama when not present', () => {
    expect(buildApiUrl('http://localhost:11434', 'ollama')).toBe('http://localhost:11434/v1/chat/completions')
  })

  it('preserves existing /v1/chat/completions for ollama', () => {
    expect(buildApiUrl('http://localhost:11434/v1/chat/completions', 'ollama')).toBe(
      'http://localhost:11434/v1/chat/completions',
    )
  })

  // ---- Zhipu provider ----

  it('appends /chat/completions for zhipu when not present', () => {
    expect(buildApiUrl('https://open.bigmodel.cn/api/paas/v4', 'zhipu')).toBe(
      'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    )
  })

  it('preserves existing /chat/completions for zhipu', () => {
    expect(buildApiUrl('https://open.bigmodel.cn/api/paas/v4/chat/completions', 'zhipu')).toBe(
      'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    )
  })

  // ---- Standard providers ----

  it('returns cleanUrl when /chat/completions already present', () => {
    expect(buildApiUrl('https://api.openai.com/v1/chat/completions', 'openai')).toBe(
      'https://api.openai.com/v1/chat/completions',
    )
  })

  it('appends /chat/completions when /v1 is present', () => {
    expect(buildApiUrl('https://api.openai.com/v1', 'openai')).toBe('https://api.openai.com/v1/chat/completions')
  })

  it('appends /v1/chat/completions when no /v1 path', () => {
    expect(buildApiUrl('https://api.example.com', 'generic')).toBe('https://api.example.com/v1/chat/completions')
  })

  // ---- Edge case: double slashes ----

  it('handles multiple trailing slashes gracefully', () => {
    const result = buildApiUrl('https://api.example.com///', 'openai')
    expect(result).toBe('https://api.example.com/v1/chat/completions')
  })
})
