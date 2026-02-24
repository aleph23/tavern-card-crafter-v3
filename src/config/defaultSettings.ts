import { apiProviders } from '@/config/providers'
import type { AppConfig, Settings, ThemeColors } from '@/types/settings'

// Pick the global default provider here
const defaultProvider = apiProviders.find((p) => p.value === 'openrouter') ?? apiProviders[0]

export const DEFAULT_SETTINGS: Settings = {
  apiKey: '',
  apiUrl: defaultProvider.url,
  model: defaultProvider.models[0] ?? '',
  provider: defaultProvider.value,
  inferenceSettings: { maxTokens: 800, temp: 0.7 },
}

export const DEFAULT_THEME_COLORS: ThemeColors = {
  primary: 'oklch(0.42 0.22 280)',
  secondary: 'oklch(0.22 0.16 325)',
  primaryForeground: 'oklch(0.97 0.02 285)',
  secondaryForeground: 'oklch(0.78 0.18 65)',
  border: 'oklch(0.62 0.28 325)',
}

// Single source of truth for the initial app configuration
export const DEFAULT_APP_CONFIG = (): AppConfig => {
  const defaultId = crypto.randomUUID()

  return {
    endpoints: [
      {
        id: defaultId,
        name: defaultProvider.name,
        provider: DEFAULT_SETTINGS.provider,
        apiKey: DEFAULT_SETTINGS.apiKey,
        apiUrl: DEFAULT_SETTINGS.apiUrl,
        model: DEFAULT_SETTINGS.model,
        type: 'text',
        availableModels: [DEFAULT_SETTINGS.model],
      },
    ],
    activeChatEndpointId: defaultId,
    inferenceSettings: { ...DEFAULT_SETTINGS.inferenceSettings },
    themeColors: { ...DEFAULT_THEME_COLORS },
  }
}
