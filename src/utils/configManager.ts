import { AppConfig, Endpoint, InferenceSettings, AISettings } from '@/types/config';

const defaultConfig: AppConfig = {
  activeChatEndpointId: 'default-openrouter',
  activeImageEndpointId: '',
  inferenceSettings: {
    maxTokens: 800,
    temp: 0.7,
  },
  endpoints: [
    {
      id: 'default-openrouter',
      name: 'OpenRouter',
      provider: 'openrouter',
      apiKey: '',
      apiUrl: 'https://openrouter.ai/api',
      model: 'openrouter/free',
      type: 'text',
      availableModels: ["openrouter/free"],
    }
  ]
};

class ConfigManager {
  private config: AppConfig;
  private isLoaded: boolean = false;

  constructor() {
    this.config = { ...defaultConfig };
  }

  async loadConfig(): Promise<AppConfig> {
    if (this.isLoaded) return this.config;

    try {
      let loadedConfig: AppConfig | null = null;

      if (window.electronAPI) {
        loadedConfig = await window.electronAPI.loadConfig();
      } else {
        // Fallback for web mode
        const stored = localStorage.getItem('app_config');
        if (stored) {
          loadedConfig = JSON.parse(stored);
        }
      }

      if (loadedConfig) {
        // Merge with defaults to ensure structure validity
        // Deep merge is complex, so we'll just ensure top-level keys exist
        this.config = {
          ...defaultConfig,
          ...loadedConfig,
          inferenceSettings: {
            ...defaultConfig.inferenceSettings,
            ...(loadedConfig.inferenceSettings || {})
          },
          // Ensure endpoints is an array
          endpoints: Array.isArray(loadedConfig.endpoints) ? loadedConfig.endpoints : defaultConfig.endpoints
        };
      } else {
        // If no config found, save default
        await this.saveConfig(defaultConfig);
      }
    } catch (error) {
      console.error('Failed to load config:', error);
      this.config = { ...defaultConfig };
    } finally {
      this.isLoaded = true;
    }
    return this.config;
  }

  async saveConfig(config: AppConfig): Promise<void> {
    this.config = config;

    try {
      if (window.electronAPI) {
        await window.electronAPI.saveConfig(config);
      } else {
        localStorage.setItem('app_config', JSON.stringify(config));
      }
    } catch (error) {
      console.error('Failed to save config:', error);
      throw error;
    }
  }

  async resetConfig(): Promise<void> {
    this.config = { ...defaultConfig };
    try {
      if (window.electronAPI) {
        await window.electronAPI.resetConfig();
      } else {
        localStorage.removeItem('app_config');
      }
    } catch (error) {
      console.error('Failed to reset config:', error);
      throw error;
    }
  }

  getConfig(): AppConfig {
    return { ...this.config };
  }

  getActiveChatEndpoint(): Endpoint | undefined {
    return this.config.endpoints.find(e => e.id === this.config.activeChatEndpointId);
  }

  // Helper to convert internal config to the AISettings format expected by components
  getActiveAISettings(): AISettings {
    const activeEndpoint = this.getActiveChatEndpoint();
    const { inferenceSettings } = this.config;
    const { maxTokens, temp } = inferenceSettings;

    if (!activeEndpoint) {
      // Return default if no active endpoint found
      return {
        apiKey: '',
        apiUrl: 'https://openrouter.ai/api',
        model: 'openrouter/free',
        provider: 'openrouter',
        maxTokens,
        infTemp: temp,
      };
    }

    const { apiKey, apiUrl, model, provider } = activeEndpoint;

    return {
      apiKey,
      apiUrl,
      model,
      provider,
      maxTokens,
      infTemp: temp,
    };
  }
}

export const configManager = new ConfigManager();
