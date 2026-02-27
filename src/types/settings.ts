// Define types for app settings
export interface ThemeColors {
  primary: string
  secondary: string
  primaryForeground: string
  secondaryForeground: string
  border: string
}

export interface InferenceSettings {
  endpoint?: Endpoint
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
