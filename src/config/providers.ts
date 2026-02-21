
export interface ApiProvider {
  name: string;
  value: string;
  url: string;
  modelsUrl: string;
  models: string[];
  requiresKey: boolean;
  tips: string;
}

export const apiProviders: ApiProvider[] = [
  {
    name: "OpenAI official",
    value: "openai",
    url: "https://api.openai.com",
    modelsUrl: "https://api.openai.com/v1/models",
    models: ["gpt-5.1", "gpt-120b-oss", "gpt-4-turbo", "gpt-4"],
    requiresKey: true,
    tips: "Requires a valid OpenAI API Key."
  },
  {
    name: "DeepSeek",
    value: "deepseek",
    url: "https://api.deepseek.com",
    modelsUrl: "https://api.deepseek.com/v1/models",
    models: ["deepseek-r1-0502", "deepseek-v3.2"],
    requiresKey: true,
    tips: "DeepSeek API. Cost-effective and high performance."
  },
  {
    name: "Moonshot AI",
    value: "moonshot",
    url: "https://api.moonshot.ai",
    modelsUrl: "https://api.moonshot.ai/v1/models",
    models: ["kimi-k2.5", "kimi-k2.5-thinking", "kimi-k2-0905-preview"],
    requiresKey: true,
    tips: "Moonshot AI (Kimi). Supports long context."
  },
  {
    name: "Zhipu AI (GLM)",
    value: "zhipu",
    url: "https://api.z.ai/api/paas/v4/",
    modelsUrl: "https://open.z.ai/api/paas/v4/models",
    models: ["glm-5", "glm-4.6", "glm-4.7", "glm-4.5-air"],
    requiresKey: true,
    tips: "Zhipu AI / GLM models (Z-ai). Fairly creative."
  },
  {
    name: "01.AI (Yi)",
    value: "yi",
    url: "https://api.lingyiwanwu.com",
    modelsUrl: "https://api.lingyiwanwu.com/v1/models",
    models: ["yi-lightning", "yi-medium", "yi-spark"],
    requiresKey: true,
    tips: "01.AI (Lingyi Wanwu) models."
  },
  {
    name: "OpenRouter",
    value: "openrouter",
    url: "https://openrouter.ai/api",
    modelsUrl: "https://openrouter.ai/api/v1/models",
    models: ["openrouter/free"],
    requiresKey: true,
    tips: "OpenRouter unified interface. Free models available (no credit card required)."
  },
  {
    name: "Ollama (local)",
    value: "ollama",
    url: "http://localhost:11434",
    modelsUrl: "http://localhost:11434/api/tags",
    models: ["your-model-here"],
    requiresKey: false,
    tips: "Local Ollama service, no API key required. You need to download the model first: ollama pull Model name. Default port 11434"
  },
  {
    name: "LM Studio (local)",
    value: "lmstudio",
    url: "http://localhost:1234",
    modelsUrl: "http://localhost:1234/v1/models",
    models: ["local-model"],
    requiresKey: false,
    tips: "LM Studio local service, no API key is required, the model needs to be loaded first. Default port 1234"
  },
  {
    name: "OneAPI/New API",
    value: "oneapi",
    url: "http://localhost:3000/v1",
    modelsUrl: "http://localhost:3000/v1/models",
    models: ["gpt-3.5-turbo", "gpt-4", "claude-3-sonnet"],
    requiresKey: true,
    tips: "One API unified interface supports multiple model proxy. Default port 3000"
  },
  {
    name: "Custom (OpenAI Compatible)",
    value: "custom",
    url: "http://localhost:5001/api/v1",
    modelsUrl: "http://localhost:5001/api/v1/models",
    models: ["your-model-here"],
    requiresKey: true,
    tips: "Custom OpenAI-compatible interface. Manually configure URL and models."
  }
];
