import { formatHex, oklch, parse, Color } from 'culori'

/**
 * Converts a hex color string to an OKLCH CSS string format: oklch(L C H)
 */
export const hexToOklch = (hex: string): string => {
  try {
    const parsed = parse(hex)
    if (!parsed) return 'oklch(0 0 0)'
    const color = oklch(parsed)
    return `oklch(${color.l.toFixed(2)} ${color.c.toFixed(2)} ${color.h !== undefined ? color.h.toFixed(2) : '0'})`
  } catch (e) {
    console.error('Error converting hex to oklch', e)
    return 'oklch(0 0 0)'
  }
}

/**
 * Converts an OKLCH CSS string to a hex color string.
 */
export const oklchToHex = (oklchStr: string): string => {
  try {
    const parsed = parse(oklchStr)
    if (!parsed) return '#000000'
    return formatHex(parsed) || '#000000'
  } catch (e) {
    console.error('Error converting oklch to hex', e)
    return '#000000'
  }
}

/**
 * Extracts components from an oklch string.
 */
export const parseOklch = (oklchStr: string) => {
  const match = oklchStr.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/)
  if (match) {
    return { l: parseFloat(match[1]), c: parseFloat(match[2]), h: parseFloat(match[3]) }
  }
  return { l: 0, c: 0, h: 0 }
}

/**
 * Derives the Ring color by adding 135 degrees to the Accent color's hue.
 */
export const deriveRingColor = (accentOklch: string): string => {
  const { l, c, h } = parseOklch(accentOklch)
  const newH = (h + 135) % 360
  return `oklch(${l.toFixed(2)} ${c.toFixed(2)} ${newH.toFixed(2)})`
}

/**
 * Derives a Muted version of a color by subtracting 10% (0.04 scaled) from its chroma.
 * Note: 10% intensity of chroma is roughly 0.04 in OKLCH (max chroma is ~0.4)
 */
export const deriveMutedColor = (baseOklch: string): string => {
  const { l, c, h } = parseOklch(baseOklch)
  const newC = Math.max(0, c - 0.04)
  return `oklch(${l.toFixed(2)} ${newC.toFixed(2)} ${h.toFixed(2)})`
}
