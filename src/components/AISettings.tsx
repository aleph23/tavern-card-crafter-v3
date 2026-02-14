import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTitle, DialogTrigger, DialogHeader } from "@/components/ui/dialog";
import { Settings, Loader2, Check, X, RefreshCw, AlertCircle, Info, Plus, Trash2, Power } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { buildApiUrl } from "@/utils/buildApiUrl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PromptEditor } from "./PromptEditor";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { configManager } from "@/utils/configManager";
import { AppConfig, Endpoint } from "@/types/config";

// Re-export for compatibility with other components
export interface AISettings {
  apiKey: string;
  apiUrl: string;
  model: string;
  provider: string;
  maxTokens?: number;
  infTemp?: number;
}

interface AISettingsProps {
  onSettingsChange: (settings: AISettings) => void;
  currentSettings: AISettings | null; // Kept for interface compatibility but we'll use configManager mostly
}

export const AISettings = ({ onSettingsChange }: AISettingsProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [testingEndpointId, setTestingEndpointId] = useState<string | null>(null);
  const [loadingModelsEndpointId, setLoadingModelsEndpointId] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<Record<string, 'idle' | 'success' | 'error'>>({});
  const [lastError, setLastError] = useState<Record<string, string>>({});

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

  useEffect(() => {
    loadConfig();
  }, [isOpen]); // Reload when opened, but also load initially

  const loadConfig = async () => {
    const loadedConfig = await configManager.loadConfig();
    setConfig(loadedConfig);
  };

  const handleEndpointChange = (index: number, field: keyof Endpoint, value: any) => {
    if (!config) return;
    const newEndpoints = [...config.endpoints];
    newEndpoints[index] = { ...newEndpoints[index], [field]: value };

    // Auto-update available models if provider changes
    if (field === 'provider') {
      const provider = apiProviders.find(p => p.value === value);
      if (provider) {
        newEndpoints[index].apiUrl = provider.url;
        newEndpoints[index].availableModels = provider.models;
        newEndpoints[index].model = provider.models[0] || '';
        // Clear API key if not required
        if (!provider.requiresKey) {
          newEndpoints[index].apiKey = '';
        }
      }
    }

    setConfig({ ...config, endpoints: newEndpoints });
  };

  const handleAddEndpoint = () => {
    if (!config) return;
    if (config.endpoints.length >= 6) {
      toast({
        title: "Limit reached",
        description: "You can only have up to 6 endpoints.",
        variant: "destructive"
      });
      return;
    }

    const newEndpoint: Endpoint = {
      id: crypto.randomUUID(),
      name: `New Endpoint ${config.endpoints.length + 1}`,
      provider: 'openai',
      apiKey: '',
      apiUrl: 'https://api.openai.com/v1/chat/completions',
      model: 'gpt-3.5-turbo',
      type: 'text',
      availableModels: ["gpt-3.5-turbo", "gpt-4"]
    };

    setConfig({ ...config, endpoints: [...config.endpoints, newEndpoint] });
  };

  const handleDeleteEndpoint = (index: number) => {
    if (!config) return;
    if (config.endpoints.length <= 1) {
      toast({
        title: "Cannot delete",
        description: "You must have at least one endpoint.",
        variant: "destructive"
      });
      return;
    }

    const endpointToDelete = config.endpoints[index];
    const newEndpoints = config.endpoints.filter((_, i) => i !== index);

    // If active endpoint is deleted, switch to the first one
    let newActiveId = config.activeChatEndpointId;
    if (endpointToDelete.id === config.activeChatEndpointId) {
      newActiveId = newEndpoints[0].id;
    }

    setConfig({
      ...config,
      endpoints: newEndpoints,
      activeChatEndpointId: newActiveId
    });
  };

  const handleSetActive = (id: string) => {
    if (!config) return;
    setConfig({ ...config, activeChatEndpointId: id });
  };

  const buildModelsUrl = (baseUrl: string, provider: string): string => {
    if (!baseUrl) return '';
    const cleanUrl = baseUrl.replace(/\/+$/, '');
    if (provider === 'ollama') {
      return baseUrl.includes('/api/tags') ? cleanUrl : `${cleanUrl}/api/tags`;
    }
    if (baseUrl.includes('/models')) return cleanUrl;
    return cleanUrl.includes('/v1') ? `${cleanUrl}/models` : `${cleanUrl}/v1/models`;
  };

  const parseApiError = (error: any): string => {
    try {
      if (typeof error === 'string') {
        if (error.includes('model')) return "The model does not exist or is invalid.";
        if (error.includes('Unauthorized') || error.includes('401')) return "Invalid API Key.";
        if (error.includes('Failed to fetch')) return "Network connection failed. Check URL and server status.";
        return error;
      }
      return error?.error?.message || "Unknown error";
    } catch {
      return "Failed to parse error message";
    }
  };

  const testConnection = async (endpoint: Endpoint) => {
    const currentProvider = apiProviders.find(p => p.value === endpoint.provider);

    if (currentProvider?.requiresKey && !endpoint.apiKey) {
      toast({ title: "Missing API Key", description: "Please enter an API key.", variant: "destructive" });
      return;
    }
    if (!endpoint.apiUrl) {
      toast({ title: "Missing API URL", description: "Please enter an API URL.", variant: "destructive" });
      return;
    }

    setTestingEndpointId(endpoint.id);
    setConnectionStatus(prev => ({ ...prev, [endpoint.id]: 'idle' }));
    setLastError(prev => ({ ...prev, [endpoint.id]: '' }));

    try {
      const apiUrl = buildApiUrl(endpoint.apiUrl, endpoint.provider);
      let headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (currentProvider?.requiresKey && endpoint.apiKey) {
        headers['Authorization'] = `Bearer ${endpoint.apiKey}`;
      }

      const requestBody = {
        model: endpoint.model,
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 10,
        temperature: 0.1
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(30000)
      });

      if (response.ok) {
        setConnectionStatus(prev => ({ ...prev, [endpoint.id]: 'success' }));
        toast({ title: "Connection Successful", description: `${endpoint.name} connected successfully.` });
      } else {
        const errorText = await response.text();
        const errorMessage = parseApiError(errorText);
        setConnectionStatus(prev => ({ ...prev, [endpoint.id]: 'error' }));
        setLastError(prev => ({ ...prev, [endpoint.id]: errorMessage }));
        toast({ title: "Connection Failed", description: errorMessage, variant: "destructive" });
      }
    } catch (error: any) {
      const errorMessage = parseApiError(error.message || "Network error");
      setConnectionStatus(prev => ({ ...prev, [endpoint.id]: 'error' }));
      setLastError(prev => ({ ...prev, [endpoint.id]: errorMessage }));
      toast({ title: "Connection Failed", description: errorMessage, variant: "destructive" });
    } finally {
      setTestingEndpointId(null);
    }
  };

  const fetchModels = async (index: number) => {
    if (!config) return;
    const endpoint = config.endpoints[index];
    const currentProvider = apiProviders.find(p => p.value === endpoint.provider);

    if (currentProvider?.requiresKey && !endpoint.apiKey) {
      toast({ title: "Missing API Key", description: "Please enter an API key.", variant: "destructive" });
      return;
    }
    if (!endpoint.apiUrl) {
      toast({ title: "Missing API URL", description: "Please enter an API URL.", variant: "destructive" });
      return;
    }

    setLoadingModelsEndpointId(endpoint.id);

    try {
      const modelsUrl = currentProvider?.modelsUrl || buildModelsUrl(endpoint.apiUrl, endpoint.provider);
      let headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (currentProvider?.requiresKey && endpoint.apiKey) {
        headers['Authorization'] = `Bearer ${endpoint.apiKey}`;
      }

      const response = await fetch(modelsUrl, {
        headers,
        signal: AbortSignal.timeout(15000)
      });

      if (response.ok) {
        const data = await response.json();
        let modelIds: string[] = [];

        if (endpoint.provider === 'ollama' && data.models) {
          modelIds = data.models.map((model: any) => model.name).filter((name: string) => name && name.trim() !== '');
        } else if (data.data && Array.isArray(data.data)) {
          modelIds = data.data.map((model: any) => model.id).filter((id: string) => id && id.trim() !== '');
        }

        if (modelIds.length > 0) {
          handleEndpointChange(index, 'availableModels', modelIds);
          // If current model is not in list, select first one
          if (!modelIds.includes(endpoint.model)) {
            handleEndpointChange(index, 'model', modelIds[0]);
          }
          toast({ title: "Models Fetched", description: `Found ${modelIds.length} models.` });
        } else {
          toast({ title: "No Models Found", description: "Using default model list.", variant: "default" });
        }
      } else {
        toast({ title: "Fetch Failed", description: "Could not fetch models.", variant: "destructive" });
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Fetch Failed", description: "Network error while fetching models.", variant: "destructive" });
    } finally {
      setLoadingModelsEndpointId(null);
    }
  };

  const handleSave = async () => {
    if (!config) return;
    try {
      await configManager.saveConfig(config);
      onSettingsChange(configManager.getActiveAISettings());
      setIsOpen(false);
      toast({ title: "Settings Saved", description: "Configuration updated successfully." });
    } catch (error) {
      console.error(error);
      toast({ title: "Save Failed", description: "Could not save configuration.", variant: "destructive" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          AI Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto">
        {!config ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
        <DialogHeader>
          <DialogTitle>AI Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="connection">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="connection">Connection & Parameters</TabsTrigger>
            <TabsTrigger value="prompts">Prompt Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="connection" className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">API Providers</Label>
                {config.endpoints.length < 6 && (
                  <Button variant="outline" size="sm" onClick={handleAddEndpoint}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Provider
                  </Button>
                )}
              </div>

              <Accordion type="single" collapsible className="w-full">
                {config.endpoints.map((endpoint, index) => {
                  const isActive = endpoint.id === config.activeChatEndpointId;
                  const provider = apiProviders.find(p => p.value === endpoint.provider);

                  return (
                    <AccordionItem key={endpoint.id} value={endpoint.id}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-2 w-full pr-4">
                          <Button
                            variant={isActive ? "default" : "ghost"}
                            size="icon"
                            className={`h-6 w-6 rounded-full ${isActive ? "bg-green-500 hover:bg-green-600" : "text-gray-400"}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSetActive(endpoint.id);
                            }}
                            title={isActive ? "Active Chat Endpoint" : "Set as Active Chat Endpoint"}
                          >
                            <Power className="h-3 w-3" />
                          </Button>
                          <span className={`flex-1 text-left ${isActive ? "font-bold text-green-600 dark:text-green-400" : ""}`}>
                            {endpoint.name || "Unnamed Endpoint"}
                          </span>
                          {config.endpoints.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteEndpoint(index);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 px-1">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Name</Label>
                            <Input
                              value={endpoint.name}
                              onChange={(e) => handleEndpointChange(index, 'name', e.target.value)}
                              placeholder="My Endpoint"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Provider</Label>
                            <Select
                              value={endpoint.provider}
                              onValueChange={(value) => handleEndpointChange(index, 'provider', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {apiProviders.map((p) => (
                                  <SelectItem key={p.value} value={p.value}>{p.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {provider?.requiresKey && (
                          <div className="space-y-2">
                            <Label>API Key</Label>
                            <Input
                              type="password"
                              value={endpoint.apiKey}
                              onChange={(e) => handleEndpointChange(index, 'apiKey', e.target.value)}
                              placeholder="sk-..."
                            />
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label>API URL</Label>
                          <Input
                            value={endpoint.apiUrl}
                            onChange={(e) => handleEndpointChange(index, 'apiUrl', e.target.value)}
                            placeholder="https://api..."
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Model</Label>
                          <div className="flex gap-2">
                            <Select
                              value={endpoint.model}
                              onValueChange={(value) => handleEndpointChange(index, 'model', value)}
                            >
                              <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Select model" />
                              </SelectTrigger>
                              <SelectContent>
                                {(endpoint.availableModels || provider?.models || []).map((m) => (
                                  <SelectItem key={m} value={m}>{m}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => fetchModels(index)}
                              disabled={loadingModelsEndpointId === endpoint.id}
                              title="Fetch Models"
                            >
                              {loadingModelsEndpointId === endpoint.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <RefreshCw className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => testConnection(endpoint)}
                            disabled={testingEndpointId === endpoint.id}
                          >
                            {testingEndpointId === endpoint.id ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : connectionStatus[endpoint.id] === 'success' ? (
                              <Check className="h-4 w-4 mr-2 text-green-500" />
                            ) : connectionStatus[endpoint.id] === 'error' ? (
                              <X className="h-4 w-4 mr-2 text-destructive" />
                            ) : null}
                            Test Connection
                          </Button>
                          {lastError[endpoint.id] && (
                            <span className="text-xs text-destructive max-w-[300px] truncate" title={lastError[endpoint.id]}>
                              {lastError[endpoint.id]}
                            </span>
                          )}
                        </div>

                        {provider?.tips && (
                          <Alert>
                            <Info className="h-4 w-4" />
                            <AlertDescription className="text-xs">{provider.tips}</AlertDescription>
                          </Alert>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </div>

            <div className="space-y-4 border-t pt-4">
              <h4 className="font-medium text-lg">Inference Settings (Global)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Max Tokens ({config.inferenceSettings.maxTokens})</Label>
                  <Input
                    type="number"
                    min="1"
                    max="8192"
                    value={config.inferenceSettings.maxTokens}
                    onChange={(e) => setConfig({
                      ...config,
                      inferenceSettings: { ...config.inferenceSettings, maxTokens: parseInt(e.target.value) || 800 }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Temperature ({config.inferenceSettings.temp})</Label>
                  <Input
                    type="number"
                    min="0"
                    max="2"
                    step="0.1"
                    value={config.inferenceSettings.temp}
                    onChange={(e) => setConfig({
                      ...config,
                      inferenceSettings: { ...config.inferenceSettings, temp: parseFloat(e.target.value) || 1.0 }
                    })}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button onClick={handleSave} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                Save All Settings
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="prompts">
            <PromptEditor />
          </TabsContent>
        </Tabs>
        </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AISettings;
