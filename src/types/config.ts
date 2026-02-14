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
  activeImageEndpointId: string;
  inferenceSettings: InferenceSettings;
  endpoints: Endpoint[];
}
