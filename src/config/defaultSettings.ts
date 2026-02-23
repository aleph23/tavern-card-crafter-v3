import { apiProviders } from '@/config/providers'
import type { AppConfig, Settings } from '@/types/settings'

// Pick the global default provider here
const defaultProvider = apiProviders.find((p) => p.value === 'openrouter') ?? apiProviders[0]

export const DEFAULT_SETTINGS: Settings = {
  apiKey: '',
  apiUrl: defaultProvider.url,
  model: defaultProvider.models[0] ?? '',
  provider: defaultProvider.value,
  inferenceSettings: { maxTokens: 800, temp: 0.7 },
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
  }
}
