import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { ThemeColors } from '@/types/settings'
import { DEFAULT_THEME_COLORS } from '@/config/defaultSettings'
import { configManager } from '@/utils/configManager'
import { deriveRingColor, deriveMutedColor } from '@/utils/themeUtils'

interface ThemeContextType {
  colors: ThemeColors
  updateColor: (key: keyof ThemeColors, value: string) => void
  resetColors: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

/**
 * Provides a theme context for the application, managing user-configurable OKLCH color tokens.
 * Persists colors to localStorage and applies them to document root CSS variables.
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [colors, setColors] = useState<ThemeColors>(() => {
    // Attempt to load from configManager first, then fallback to DEFAULT
    const config = configManager.getConfig()
    return config.themeColors || DEFAULT_THEME_COLORS
  })

  // Apply colors and derivations to CSS variables
  useEffect(() => {
    const root = document.documentElement

    // Base 5 colors
    root.style.setProperty('--primary', colors.primary)
    root.style.setProperty('--secondary', colors.secondary)
    root.style.setProperty('--primary-foreground', colors.primaryForeground)
    root.style.setProperty('--secondary-foreground', colors.secondaryForeground)
    root.style.setProperty('--border', colors.border)

    // Derived colors
    // Ring is derived from Accent (secondary-foreground)
    const ring = deriveRingColor(colors.secondaryForeground)
    root.style.setProperty('--ring', ring)

    // Muted is derived from Background (which is currently fixed or based on secondary/primary in CSS,
    // but the request implies "whatever is being muted".
    // Usually --muted and --muted-foreground. Let's derive them from background and foreground.)
    // For now, let's stick to the prompt's rule: "subtracting 10 percent intensity from whatever is being muted"
    // We'll apply this to --muted (from background) and --muted-foreground (from foreground)

    // Background is currently fixed at oklch(0.11 0.04 280) in index.css
    // Let's make background and foreground reactive if they weren't already?
    // Actually the user only gave us 5 tokens.
    // Let's see what index.css has for muted.

    const background = 'oklch(0.11 0.04 280)' // Current index.css value
    const foreground = 'oklch(0.96 0.015 285)' // Current index.css value

    const muted = deriveMutedColor(background)
    const mutedForeground = deriveMutedColor(foreground)

    root.style.setProperty('--muted', muted)
    root.style.setProperty('--muted-foreground', mutedForeground)

    // Save to configManager (which also handles persistence)
    const currentConfig = configManager.getConfig()
    configManager.saveConfig({ ...currentConfig, themeColors: colors })
  }, [colors])

  const updateColor = useCallback((key: keyof ThemeColors, value: string) => {
    setColors((prev) => ({ ...prev, [key]: value }))
  }, [])

  const resetColors = useCallback(() => {
    setColors(DEFAULT_THEME_COLORS)
  }, [])

  return <ThemeContext.Provider value={{ colors, updateColor, resetColors }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
