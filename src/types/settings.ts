import { InferenceSettings } from "@/types/config";

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
