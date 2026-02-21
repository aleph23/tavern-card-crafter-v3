export interface InferenceSettings {
  maxTokens: number;
  temp: number;
}

export interface Endpoint {
  id: string;
  name: string;
  provider: string;
  apiKey: string;
  apiUrl: string;
  model: string;
  type: 'text' | 'image';
  availableModels?: string[]; // Cache for fetched models
}

export interface AppConfig {
  activeChatEndpointId: string;
  // activeImageEndpointId?: string;  // Image endpoints are not yet supported
  inferenceSettings: InferenceSettings;
  endpoints: Endpoint[];
}
// Re-export for compatibility with other components
export interface Settings {
  apiKey: string;
  apiUrl: string;
  model: string;
  provider: string;
  inferenceSettings: InferenceSettings;  // Proper reference
}

export const DEFAULT_SETTINGS: Settings = {
  apiKey: "",
  apiUrl: "https://openrouter.ai/api",
  model: "openrouter/free",
  provider: "openrouter",
  inferenceSettings: {  // ✅ Correct nesting
    maxTokens: 800,
    temp: 0.7            // ✅ Correct property name
  }
};
