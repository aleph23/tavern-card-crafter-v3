// Define types for app settings
export interface InferenceSettings {
  maxTokens: number
  temp: number
}

export interface Endpoint {
  id: string
  name: string
  provider: string
  apiKey: string
  apiUrl: string
  model: string
  type: 'text' | 'image'
  availableModels?: string[] // Cache for fetched models
}

export interface AppConfig {
  activeChatEndpointId: string
  // activeImageEndpointId?: string;  // Image endpoints are not yet supported
  inferenceSettings: InferenceSettings
  endpoints: Endpoint[]
}

// Re-export for compatibility with other components
export interface Settings {
  apiKey: string
  apiUrl: string
  model: string
  provider: string
  inferenceSettings: InferenceSettings
}
