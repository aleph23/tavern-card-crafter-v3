import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
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
  const [colors, setColors] = useState<ThemeColors>(DEFAULT_THEME_COLORS)
  const [isHydrated, setIsHydrated] = useState(false)
  const isFirstRender = useRef(true)

  useEffect(() => {
    let active = true
    const hydrate = async () => {
      await configManager.loadConfig()
      if (active) {
        const config = configManager.getConfig()
        if (config.themeColors) {
          setColors(config.themeColors)
        }
        setIsHydrated(true)
      }
    }
    hydrate()
    return () => {
      active = false
    }
  }, [])

  // Apply colors and derivations to CSS variables
  useEffect(() => {
    if (!isHydrated) return

    const root = document.documentElement

    // Base 5 colors
    root.style.setProperty('--primary', colors.primary)
    root.style.setProperty('--secondary', colors.secondary)
    root.style.setProperty('--primary-foreground', colors.primaryForeground)
    root.style.setProperty('--secondary-foreground', colors.secondaryForeground) // second-fore and accent are the same
    root.style.setProperty('--border', colors.border)

    // Derived colors
    // Ring is derived from Accent (secondary-foreground)
    const ring = deriveRingColor(colors.secondaryForeground)
    root.style.setProperty('--ring', ring)

    // Muted is derived from Background (which is currently fixed or based on secondary/primary in CSS,
    // but the request implies "whatever is being muted".
    // Usually --muted and --muted-foreground. Let's derive them from background and foreground.)
    // For now, let's stick to the prompt's rule: "subtracting 10 percent intensity from whatever is being muted"
    // We'll apply this to --muted (from primary) and --muted-foreground (from foreground)

    const primary = 'var(--primary)'
    const foreground = 'var(--foreground)' // Current index.css value
    const accent = 'var(--secondary-foreground)'
    const border = 'var(--border)'

    const muted = deriveMutedColor(primary)
    const mutedForeground = deriveMutedColor(foreground)
    const mutedAccent: string = deriveMutedColor(accent)
    const mutedBorder: string = deriveMutedColor(border)

    root.style.setProperty('--muted', muted)
    root.style.setProperty('--muted-foreground', mutedForeground)
    root.style.setProperty('--muted-accent', mutedAccent)
    root.style.setProperty('--muted-border', mutedBorder)

    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    // Save to configManager (which also handles persistence)
    if (configManager.isConfigLoaded()) {
      const currentConfig = configManager.getConfig()
      configManager.saveConfig({ ...currentConfig, themeColors: colors })
    }
  }, [colors, isHydrated])

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
