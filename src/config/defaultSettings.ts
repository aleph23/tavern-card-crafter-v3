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
  primary: 'oklch(0.197 0.12 278.979)',
  secondary: 'oklch(0.188 0.087 328.363)',
  primaryForeground: 'oklch(0.952 0.023 277.957)',
  secondaryForeground: 'oklch(0.727 0.188 51.746)',
  border: 'oklch(0.702 0.322 328.363)',
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
