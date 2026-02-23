import { AppConfig, Endpoint, InferenceSettings, Settings } from '@/types/settings'
import { DEFAULT_APP_CONFIG, DEFAULT_SETTINGS } from '@/config/defaultSettings'

const defaultConfig: AppConfig = DEFAULT_APP_CONFIG()

class ConfigManager {
  private config: AppConfig
  private isLoaded: boolean = false

  constructor() {
    this.config = { ...defaultConfig }
  }

  async loadConfig(): Promise<AppConfig> {
    if (this.isLoaded) return this.config

    try {
      let loadedConfig: AppConfig | null = null

      if (window.electronAPI) {
        loadedConfig = await window.electronAPI.loadConfig()
      } else {
        // Fallback for web mode
        const stored = localStorage.getItem('app_config')
        if (stored) {
          loadedConfig = JSON.parse(stored)
        }
      }

      if (loadedConfig) {
        // Merge with defaults to ensure structure validity
        this.config = {
          ...defaultConfig,
          ...loadedConfig,
          inferenceSettings: { ...defaultConfig.inferenceSettings, ...(loadedConfig.inferenceSettings || {}) },
          endpoints: Array.isArray(loadedConfig.endpoints) ? loadedConfig.endpoints : defaultConfig.endpoints,
        }
      } else {
        // If no config found, save default
        await this.saveConfig(defaultConfig)
      }
    } catch (error) {
      console.error('Failed to load config:', error)
      this.config = { ...defaultConfig }
    } finally {
      this.isLoaded = true
    }

    return this.config
  }

  async saveConfig(config: AppConfig): Promise<void> {
    this.config = config

    try {
      if (window.electronAPI) {
        await window.electronAPI.saveConfig(config)
      } else {
        localStorage.setItem('app_config', JSON.stringify(config))
      }
    } catch (error) {
      console.error('Failed to save config:', error)
      throw error
    }
  }

  async resetConfig(): Promise<void> {
    this.config = { ...defaultConfig }
    try {
      if (window.electronAPI) {
        await window.electronAPI.resetConfig()
      } else {
        localStorage.removeItem('app_config')
      }
    } catch (error) {
      console.error('Failed to reset config:', error)
      throw error
    }
  }

  getConfig(): AppConfig {
    return { ...this.config }
  }

  getActiveChatEndpoint(): Endpoint | undefined {
    return this.config.endpoints.find((e) => e.id === this.config.activeChatEndpointId)
  }

  // Helper to convert internal config to the Settings format expected by components
  getActiveAISettings(): Settings {
    const activeEndpoint = this.getActiveChatEndpoint()
    const { inferenceSettings } = this.config

    if (!activeEndpoint) {
      // Return configured defaults if no active endpoint found
      return {
        apiKey: DEFAULT_SETTINGS.apiKey,
        apiUrl: DEFAULT_SETTINGS.apiUrl,
        model: DEFAULT_SETTINGS.model,
        provider: DEFAULT_SETTINGS.provider,
        inferenceSettings,
      }
    }

    const { apiKey, apiUrl, model, provider } = activeEndpoint

    return { apiKey, apiUrl, model, provider, inferenceSettings }
  }
}

export const configManager = new ConfigManager()
