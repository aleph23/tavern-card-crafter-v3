// Define types for app settings
export interface ThemeColors {
  primary: string
  secondary: string
  primaryForeground: string
  secondaryForeground: string
  border: string
}

export interface InferenceSettings {
  apiKey: string
  apiUrl: string
  model: string
  provider: string
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
  themeColors?: ThemeColors
}

// Re-export for compatibility with other components
export interface Settings {
  inferenceSettings: InferenceSettings
}
