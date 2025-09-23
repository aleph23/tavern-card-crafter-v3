import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings, Loader2, Check, X, RefreshCw, AlertCircle, Info } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AISettingsProps {
  onSettingsChange: (settings: AISettings) => void;
  currentSettings: AISettings | null;
}

export interface AISettings {
  apiKey: string;
  apiUrl: string;
  model: string;
  provider: string;
}

const AISettings = ({ onSettingsChange, currentSettings }: AISettingsProps) => {
  const { toast } = useToast();

  // API provider preset configuration
  const apiProviders = [
    {
      name: "OpenAI official",
      value: "openai",
      url: "https://api.openai.com",
      modelsUrl: "https://api.openai.com/v1/models",
      models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-4", "gpt-3.5-turbo"],
      requiresKey: true,
      tips: "Need an overseas network environment and an effective Open AI API Key"
    },
    {
      name: "DeepSeek In-depth search",
      value: "deepseek",
      url: "https://api.deepseek.com",
      modelsUrl: "https://api.deepseek.com/v1/models",
      models: ["deepseek-chat", "deepseek-coder"],
      requiresKey: true,
      tips: "Direct access in China, high cost performance"
    },
    {
      name: "The dark side of the moon Moonshot",
      value: "moonshot",
      url: "https://api.moonshot.cn",
      modelsUrl: "https://api.moonshot.cn/v1/models",
      models: ["moonshot-v1-8k", "moonshot-v1-32k", "moonshot-v1-128k"],
      requiresKey: true,
      tips: "Domestic API, support long context"
    },
    {
      name: "Wisdom GLM",
      value: "zhipu",
      url: "https://open.bigmodel.cn/api/paas/v4",
      modelsUrl: "https://open.bigmodel.cn/api/paas/v4/models",
      models: ["glm-4-plus", "glm-4-0520", "glm-4", "glm-4-air", "glm-4-airx", "glm-4-flash"],
      requiresKey: true,
      tips: "Zhipu Qingyan API, domestic servicesn API, domestic services"
    },
    {
      name: "Zero 10,000 things Yi",
      value: "yi",
      url: "https://api.lingyiwanwu.com",
      modelsUrl: "https://api.lingyiwanwu.com/v1/models",
      models: ["yi-large", "yi-medium", "yi-spark", "yi-large-rag"],
      requiresKey: true,
      tips: "Zero One All Things API"
    },
    {
      name: "OpenRouter",
      value: "openrouter",
      url: "https://openrouter.ai/api",
      modelsUrl: "https://openrouter.ai/api/v1/models",
      models: ["openai/gpt-4o", "anthropic/claude-3.5-sonnet", "google/gemini-2.0-flash-exp", "deepseek/deepseek-r1-distill-qwen-7b"],
      requiresKey: true,
      tips: "Open Router unified interface, supports multiple models"
    },
    {
      name: "Ollama (local)",
      value: "ollama",
      url: "http://localhost:11434",
      modelsUrl: "http://localhost:11434/api/tags",
      models: ["llama3.2", "llama3.1", "qwen2.5", "deepseek-coder", "codegemma", "mistral"],
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
      url: "http://localhost:3000",
      modelsUrl: "http://localhost:3000/v1/models",
      models: ["gpt-3.5-turbo", "gpt-4", "claude-3-sonnet"],
      requiresKey: true,
      tips: "One API unified interface supports multiple model proxy. Default port 3000"
    },
    {
      name: "Customize Open AI Compatible interface",
      value: "custom",
      url: "",
      modelsUrl: "",
      models: ["gpt-3.5-turbo", "gpt-4"],
      requiresKey: true,
      tips: "Customize Open AI-compatible interface, please manually configure the API address and model name"
    }
  ];

  const [settings, setSettings] = useState<AISettings>(
    currentSettings || {
      apiKey: "",
      apiUrl: "https://api.openai.com/v1/chat/completions",
      model: "gpt-3.5-turbo",
      provider: "openai"
    }
  );
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [lastError, setLastError] = useState<string>("");

  // Default model list (used when the model list cannot be obtained)
  const defaultModels = [
    "gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-4", "gpt-3.5-turbo",
    "deepseek-chat", "deepseek-coder",
    "moonshot-v1-8k", "moonshot-v1-32k", "moonshot-v1-128k",
    "glm-4-plus", "glm-4", "glm-4-air", "glm-4-flash",
    "yi-large", "yi-medium", "llama3.2", "llama3.1", "qwen2.5"
  ];

  useEffect(() => {
    const currentProvider = apiProviders.find(p => p.value === settings.provider);
    if (currentProvider && currentProvider.models.length > 0) {
      setAvailableModels(currentProvider.models);
      // If the current model is not in the available model list, the first available model will be automatically selected
      if (!currentProvider.models.includes(settings.model)) {
        setSettings(prev => ({
          ...prev,
          model: currentProvider.models[0]
        }));
      }
    } else {
      setAvailableModels(defaultModels);
    }
  }, [settings.provider]);

  const handleProviderChange = (providerValue: string) => {
    const provider = apiProviders.find(p => p.value === providerValue);
    if (provider) {
      setSettings(prev => ({
        ...prev,
        provider: providerValue,
        apiUrl: provider.url,
        model: provider.models[0] || prev.model,
        // If it is a provider that does not require a key, clear the key
        apiKey: provider.requiresKey ? prev.apiKey : ""
      }));
      setAvailableModels(provider.models.length > 0 ? provider.models : defaultModels);
    }
  };

  // Intelligently build API URL - Special treatment for different providers
  const buildApiUrl = (baseUrl: string, provider: string = settings.provider): string => {
    if (!baseUrl) return '';

    // Remove the end slash
    const cleanUrl = baseUrl.replace(/\/+$/, '');

    // Ollama special treatment
    if (provider === 'ollama') {
      if (baseUrl.includes('/v1/chat/completions')) {
        return cleanUrl;
      }
      return `${cleanUrl}/v1/chat/completions`;
    }

    // Special processing of Zhipu GLM
    if (provider === 'zhipu') {
      if (baseUrl.includes('/chat/completions')) {
        return cleanUrl;
      }
      return `${cleanUrl}/chat/completions`;
    }

    // Standard processing from other providers
    if (baseUrl.includes('/chat/completions')) {
      return cleanUrl;
    }

    // Smartly add endpoints
    if (cleanUrl.includes('/v1')) {
      return `${cleanUrl}/chat/completions`;
    } else {
      return `${cleanUrl}/v1/chat/completions`;
    }
  };

  // Build the model API address
  const buildModelsUrl = (baseUrl: string, provider: string = settings.provider): string => {
    if (!baseUrl) return '';

    const cleanUrl = baseUrl.replace(/\/+$/, '');

    // Ollama special treatment
    if (provider === 'ollama') {
      if (baseUrl.includes('/api/tags')) {
        return cleanUrl;
      }
      return `${cleanUrl}/api/tags`;
    }

    // Other providers
    if (baseUrl.includes('/models')) {
      return cleanUrl;
    }

    if (cleanUrl.includes('/v1')) {
      return `${cleanUrl}/models`;
    } else {
      return `${cleanUrl}/v1/models`;
    }
  };

  // Parsing API error message
  const parseApiError = (error: any, response?: Response): string => {
    try {
      if (typeof error === 'string') {
        // Handle common errors
        if (error.includes('model') && (error.includes('not found') || error.includes('Invalid model'))) {
          return "The model does not exist, please check the model name or download the model first (if Ollama needs to execute it: ollama pull Model name)";
        }
        if (error.includes('No channels available') || error.includes('no available channels')) {
          return "There is no available channel for the current API grouping. Please check the API configuration or contact the service provider.";
        }
        if (error.includes('User location is not supported') || error.includes('location')) {
          return "This API service is not supported in the current region, and it may be necessary to use a proxy or replace the API provider.";
        }
        if (error.includes('Unauthorized') || error.includes('401')) {
          return "The API key is invalid or expired. Please check if the key is correct.";
        }
        if (error.includes('rate limit') || error.includes('429')) {
          return "API call frequency exceeds the limit, please try again later";
        }
        if (error.includes('quota') || error.includes('insufficient')) {
          return "The API limit is insufficient, please check the account balance";
        }
        if (error.includes('Failed to fetch') || error.includes('fetch')) {
          return "The network connection has failed. Please check whether the network or API address is correct. For local services, make sure the service is started";
        }
        if (error.includes('CORS')) {
          return "Cross-domain requests are blocked, please check the CORS configuration of the API service";
        }
        return error;
      }

      if (error?.error?.message) {
        return error.error.message;
      }

      return "Unknown error";
    } catch {
      return "Failed to parse error message";
    }
  };

  const testConnection = async () => {
    const currentProvider = apiProviders.find(p => p.value === settings.provider);

    // Check if the API key is required - Fix local service key check
    if (currentProvider?.requiresKey && !settings.apiKey) {
      toast({
        title: "Configuration missing",
        description: "Please fill in the API key first",
        variant: "destructive"
      });
      return;
    }

    if (!settings.apiUrl) {
      toast({
        title: "Configuration missing",
        description: "Please fill in the API address first",
        variant: "destructive"
      });
      return;
    }

    // For local services, if no model list is obtained, it is recommended to obtain the model first
    if (['ollama', 'lmstudio'].includes(settings.provider) &&
      availableModels.length === 0) {
      toast({
        title: "Recommended operation",
        description: "It is recommended to click the Get Model button to get the list of available models first.",
        variant: "default"
      });
    }

    // Check if the current model is in the list of available models
    if (availableModels.length > 0 && !availableModels.includes(settings.model)) {
      toast({
        title: "Invalid model",
        description: `Current model"${settings.model}"Not in the available models list, please select a valid model or get the model list first`,
        variant: "destructive"
      });
      return;
    }

    setIsTestingConnection(true);
    setConnectionStatus('idle');
    setLastError("");

    try {
      const apiUrl = buildApiUrl(settings.apiUrl, settings.provider);

      console.log('Testing connection to:', apiUrl);
      console.log('Provider:', settings.provider);
      console.log('Model:', settings.model);

      // Use a unified Open AI-compatible format
      let headers: any = {
        'Content-Type': 'application/json',
      };

      // Only providers that require a key will add Authorization header
      if (currentProvider?.requiresKey && settings.apiKey) {
        headers['Authorization'] = `Bearer ${settings.apiKey}`;
      }

      const requestBody = {
        model: settings.model,
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 10,
        temperature: 0.1
      };

      console.log('Request headers:', headers);
      console.log('Request body:', requestBody);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(30000) // 30 seconds timeout
      });

      console.log('Response status:', response.status);

      if (response.ok || response.status === 200) {
        setConnectionStatus('success');
        setLastError("");
        toast({
          title: "Connection successfully ✅",
          description: `${settings.provider.toUpperCase()} API connection test passed`,
        });
      } else {
        const errorText = await response.text();
        console.log('Error response:', errorText);

        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: { message: errorText } };
        }

        const errorMessage = parseApiError(errorData, response);
        setConnectionStatus('error');
        setLastError(`${response.status}: ${errorMessage}`);

        // Special tips for local services
        if (['ollama', 'lmstudio'].includes(settings.provider) && response.status === 400) {
          toast({
            title: "Connection failed ❌",
            description: `${errorMessage}. It is recommended to get the model list first to ensure that you use a valid model name.`,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Connection failed ❌",
            description: `${errorMessage}`,
            variant: "destructive"
          });
        }
      }
    } catch (error: any) {
      console.error('Connection test error:', error);

      let errorMessage = "Network connection error";

      if (error.name === 'TimeoutError') {
        errorMessage = "Request timeout, please check the network connection or API address";
      } else if (error.message?.includes('Failed to fetch')) {
        if (settings.provider === 'ollama') {
          errorMessage = "Unable to connect to the Ollama service. Please make sure:\n1. Ollama has been started (ollama serve)\n2. The service runs on the correct port (Default 11434)\n3. Firewall allows access";
        } else if (settings.provider === 'lmstudio') {
          errorMessage = "Unable to connect to LM Studio Services. Please make sure:\n1. LM Studio is started\n2. Local server enabled\n3. The service runs on the correct port (Default 1234)";
        } else {
          errorMessage = "The network connection failed. Please check whether the API address is correct or whether the service is running.";
        }
      } else if (error.message?.includes('CORS')) {
        errorMessage = "Cross-domain requests are blocked, please check the CORS configuration of the API service";
      } else if (error.message) {
        errorMessage = parseApiError(error.message);
      }

      setConnectionStatus('error');
      setLastError(errorMessage);
      toast({
        title: "Connection failed ❌",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const fetchModels = async () => {
    const currentProvider = apiProviders.find(p => p.value === settings.provider);

    // Check if the API key is required
    if (currentProvider?.requiresKey && !settings.apiKey) {
      toast({
        title: "Configuration missing",
        description: "Please fill in the API key first",
        variant: "destructive"
      });
      return;
    }

    if (!settings.apiUrl) {
      toast({
        title: "Configuration missing",
        description: "Please fill in the API address first",
        variant: "destructive"
      });
      return;
    }

    setIsLoadingModels(true);

    try {
      const modelsUrl = currentProvider?.modelsUrl || buildModelsUrl(settings.apiUrl, settings.provider);

      console.log('Fetching models from:', modelsUrl);
      console.log('Provider:', settings.provider);

      let headers: any = {};

      // Only providers that require a key will add Authorization header
      if (currentProvider?.requiresKey && settings.apiKey) {
        headers['Authorization'] = `Bearer ${settings.apiKey}`;
      }

      const response = await fetch(modelsUrl, {
        headers,
        signal: AbortSignal.timeout(15000) // 15 seconds timeout
      });

      console.log('Models response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Models data:', data);

        let modelIds: string[] = [];

        if (settings.provider === 'ollama' && data.models) {
          modelIds = data.models.map((model: any) => model.name).filter((name: string) => name && name.trim() !== '');
        } else if (data.data && Array.isArray(data.data)) {
          modelIds = data.data.map((model: any) => model.id).filter((id: string) => id && id.trim() !== '');
        }

        if (modelIds.length > 0) {
          setAvailableModels(modelIds);
          toast({
            title: "Get successful ✅",
            description: `Successfully obtained ${modelIds.length} A model`,
          });
        } else {
          setAvailableModels(currentProvider?.models || defaultModels);
          toast({
            title: "Use preset list",
            description: "Unable to parse model data, use preset model list",
          });
        }
      } else {
        setAvailableModels(currentProvider?.models || defaultModels);
        const errorText = await response.text();
        console.log('Models fetch error:', errorText);
        toast({
          title: "Failed to obtain",
          description: `Unable to get the model list: ${response.status}, use the preset model list`,
        });
      }
    } catch (error: any) {
      console.error('Models fetch error:', error);
      setAvailableModels(currentProvider?.models || defaultModels);

      let errorMessage = "Unable to connect to API server, use preset model list";
      if (settings.provider === 'ollama') {
        errorMessage = "Unable to connect to Ollama service to get the model list, make sure Ollama is started";
      }

      toast({
        title: "Failed to obtain",
        description: errorMessage,
      });
    } finally {
      setIsLoadingModels(false);
    }
  };

  const handleSave = () => {
    const currentProvider = apiProviders.find(p => p.value === settings.provider);

    // Check the necessary fields
    if (currentProvider?.requiresKey && !settings.apiKey) {
      toast({
        title: "Configuration missing",
        description: "Please fill in the API key",
        variant: "destructive"
      });
      return;
    }

    if (!settings.apiUrl) {
      toast({
        title: "Configuration missing",
        description: "Please fill in the API address",
        variant: "destructive"
      });
      return;
    }

    // Ensure the API address format is correct
    const finalSettings = {
      ...settings,
      apiUrl: buildApiUrl(settings.apiUrl, settings.provider)
    };

    localStorage.setItem('ai-settings', JSON.stringify(finalSettings));
    onSettingsChange(finalSettings);
    setIsOpen(false);
    toast({
      title: "Save successfully ✅",
      description: "AI settings saved",
    });
  };

  const getConnectionIcon = () => {
    if (isTestingConnection) {
      return <Loader2 className="w-4 h-4 animate-spin" />;
    }
    switch (connectionStatus) {
      case 'success':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'error':
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const currentProvider = apiProviders.find(p => p.value === settings.provider);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          AI Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>AI Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="provider">API provider</Label>
            <Select value={settings.provider} onValueChange={handleProviderChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select an API provider" />
              </SelectTrigger>
              <SelectContent>
                {apiProviders.map((provider) => (
                  <SelectItem key={provider.value} value={provider.value}>
                    {provider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {currentProvider?.tips && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {currentProvider.tips}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {currentProvider?.requiresKey && (
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={settings.apiKey}
                onChange={(e) => setSettings(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder="Enter your API key..."
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="apiUrl">API Address</Label>
            <Input
              id="apiUrl"
              value={settings.apiUrl}
              onChange={(e) => setSettings(prev => ({ ...prev, apiUrl: e.target.value }))}
              placeholder="Enter the API address and the system will automatically complete it/v1/chat/completions..."
            />
            <p className="text-xs text-muted-foreground">
              Tip: Just enter the basic address and the system will automatically add it /v1/chat/completions suffix
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={testConnection}
              disabled={isTestingConnection || !settings.apiUrl || (currentProvider?.requiresKey && !settings.apiKey)}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              {getConnectionIcon()}
              <span className="ml-2">Test connection</span>
            </Button>
            <Button
              onClick={fetchModels}
              disabled={isLoadingModels || !settings.apiUrl || (currentProvider?.requiresKey && !settings.apiKey)}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              {isLoadingModels ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Get the model
            </Button>
          </div>

          {lastError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Connection error:</strong> {lastError}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="model">Model selection</Label>
            <Select value={settings.model} onValueChange={(value) => setSettings(prev => ({ ...prev, model: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {availableModels.filter(model => model && model.trim() !== '').map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSave} className="w-full">
            Save settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AISettings;
