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

  // API提供商预设配置
  const apiProviders = [
    {
      name: "OpenAI 官方",
      value: "openai",
      url: "https://api.openai.com",
      modelsUrl: "https://api.openai.com/v1/models",
      models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-4", "gpt-3.5-turbo"],
      requiresKey: true,
      tips: "需要海外网络环境和有效的OpenAI API密钥"
    },
    {
      name: "DeepSeek 深度求索",
      value: "deepseek",
      url: "https://api.deepseek.com",
      modelsUrl: "https://api.deepseek.com/v1/models",
      models: ["deepseek-chat", "deepseek-coder"],
      requiresKey: true,
      tips: "国内可直接访问，性价比高"
    },
    {
      name: "月之暗面 Moonshot",
      value: "moonshot", 
      url: "https://api.moonshot.cn",
      modelsUrl: "https://api.moonshot.cn/v1/models",
      models: ["moonshot-v1-8k", "moonshot-v1-32k", "moonshot-v1-128k"],
      requiresKey: true,
      tips: "国内API，支持长上下文"
    },
    {
      name: "智谱 GLM",
      value: "zhipu",
      url: "https://open.bigmodel.cn/api/paas/v4",
      modelsUrl: "https://open.bigmodel.cn/api/paas/v4/models",
      models: ["glm-4-plus", "glm-4-0520", "glm-4", "glm-4-air", "glm-4-airx", "glm-4-flash"],
      requiresKey: true,
      tips: "智谱清言API，国内服务"
    },
    {
      name: "零一万物 Yi",
      value: "yi",
      url: "https://api.lingyiwanwu.com",
      modelsUrl: "https://api.lingyiwanwu.com/v1/models",
      models: ["yi-large", "yi-medium", "yi-spark", "yi-large-rag"],
      requiresKey: true,
      tips: "零一万物API"
    },
    {
      name: "OpenRouter",
      value: "openrouter",
      url: "https://openrouter.ai/api",
      modelsUrl: "https://openrouter.ai/api/v1/models",
      models: ["openai/gpt-4o", "anthropic/claude-3.5-sonnet", "google/gemini-2.0-flash-exp", "deepseek/deepseek-r1-distill-qwen-7b"],
      requiresKey: true,
      tips: "OpenRouter统一接口，支持多种模型"
    },
    {
      name: "Ollama (本地)",
      value: "ollama",
      url: "http://localhost:11434",
      modelsUrl: "http://localhost:11434/api/tags",
      models: ["llama3.2", "llama3.1", "qwen2.5", "deepseek-coder", "codegemma", "mistral"],
      requiresKey: false,
      tips: "本地Ollama服务，无需API密钥。需要先下载模型：ollama pull 模型名。默认端口11434"
    },
    {
      name: "LM Studio (本地)",
      value: "lmstudio",
      url: "http://localhost:1234",
      modelsUrl: "http://localhost:1234/v1/models",
      models: ["local-model"],
      requiresKey: false,
      tips: "LM Studio本地服务，无需API密钥，需要先加载模型。默认端口1234"
    },
    {
      name: "OneAPI/New API",
      value: "oneapi",
      url: "http://localhost:3000",
      modelsUrl: "http://localhost:3000/v1/models",
      models: ["gpt-3.5-turbo", "gpt-4", "claude-3-sonnet"],
      requiresKey: true,
      tips: "OneAPI统一接口，支持多种模型代理。默认端口3000"
    },
    {
      name: "自定义 OpenAI 兼容接口",
      value: "custom",
      url: "",
      modelsUrl: "",
      models: ["gpt-3.5-turbo", "gpt-4"],
      requiresKey: true,
      tips: "自定义OpenAI兼容接口，请手动配置API地址和模型名称"
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

  // 默认模型列表（当无法获取模型列表时使用）
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
        // 如果是不需要密钥的提供商，清空密钥
        apiKey: provider.requiresKey ? prev.apiKey : ""
      }));
      setAvailableModels(provider.models.length > 0 ? provider.models : defaultModels);
    }
  };

  // 智能构建API URL - 针对不同提供商的特殊处理
  const buildApiUrl = (baseUrl: string, provider: string = settings.provider): string => {
    if (!baseUrl) return '';
    
    // 移除末尾的斜杠
    const cleanUrl = baseUrl.replace(/\/+$/, '');
    
    // Ollama特殊处理
    if (provider === 'ollama') {
      if (baseUrl.includes('/v1/chat/completions')) {
        return cleanUrl;
      }
      return `${cleanUrl}/v1/chat/completions`;
    }
    
    // 智谱GLM特殊处理
    if (provider === 'zhipu') {
      if (baseUrl.includes('/chat/completions')) {
        return cleanUrl;
      }
      return `${cleanUrl}/chat/completions`;
    }
    
    // 其他提供商的标准处理
    if (baseUrl.includes('/chat/completions')) {
      return cleanUrl;
    }
    
    // 智能添加端点
    if (cleanUrl.includes('/v1')) {
      return `${cleanUrl}/chat/completions`;
    } else {
      return `${cleanUrl}/v1/chat/completions`;
    }
  };

  // 构建模型API地址
  const buildModelsUrl = (baseUrl: string, provider: string = settings.provider): string => {
    if (!baseUrl) return '';
    
    const cleanUrl = baseUrl.replace(/\/+$/, '');
    
    // Ollama特殊处理
    if (provider === 'ollama') {
      if (baseUrl.includes('/api/tags')) {
        return cleanUrl;
      }
      return `${cleanUrl}/api/tags`;
    }
    
    // 其他提供商
    if (baseUrl.includes('/models')) {
      return cleanUrl;
    }
    
    if (cleanUrl.includes('/v1')) {
      return `${cleanUrl}/models`;
    } else {
      return `${cleanUrl}/v1/models`;
    }
  };

  // 解析API错误信息
  const parseApiError = (error: any, response?: Response): string => {
    try {
      if (typeof error === 'string') {
        // 处理常见错误
        if (error.includes('model') && (error.includes('not found') || error.includes('无效的模型'))) {
          return "模型不存在，请检查模型名称或先下载模型（如Ollama需要执行: ollama pull 模型名）";
        }
        if (error.includes('无可用渠道') || error.includes('no available channels')) {
          return "当前API分组无可用渠道，请检查API配置或联系服务提供商";
        }
        if (error.includes('User location is not supported') || error.includes('location')) {
          return "当前地区不支持此API服务，可能需要使用代理或更换API提供商";
        }
        if (error.includes('Unauthorized') || error.includes('401')) {
          return "API密钥无效或已过期，请检查密钥是否正确";
        }
        if (error.includes('rate limit') || error.includes('429')) {
          return "API调用频率超限，请稍后重试";
        }
        if (error.includes('quota') || error.includes('insufficient')) {
          return "API额度不足，请检查账户余额";
        }
        if (error.includes('Failed to fetch') || error.includes('fetch')) {
          return "网络连接失败，请检查网络或API地址是否正确。对于本地服务，请确保服务已启动";
        }
        if (error.includes('CORS')) {
          return "跨域请求被阻止，请检查API服务的CORS配置";
        }
        return error;
      }
      
      if (error?.error?.message) {
        return error.error.message;
      }
      
      return "未知错误";
    } catch {
      return "解析错误信息失败";
    }
  };

  const testConnection = async () => {
    const currentProvider = apiProviders.find(p => p.value === settings.provider);
    
    // 检查是否需要API密钥
    if (currentProvider?.requiresKey && !settings.apiKey) {
      toast({
        title: "配置缺失",
        description: "请先填写API密钥",
        variant: "destructive"
      });
      return;
    }

    if (!settings.apiUrl) {
      toast({
        title: "配置缺失",
        description: "请先填写API地址",
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
      
      // 使用统一的OpenAI兼容格式
      let headers: any = {
        'Content-Type': 'application/json',
      };

      // 只有需要密钥的提供商才添加Authorization头
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
        signal: AbortSignal.timeout(30000) // 30秒超时
      });

      console.log('Response status:', response.status);

      if (response.ok || response.status === 200) {
        setConnectionStatus('success');
        setLastError("");
        toast({
          title: "连接成功 ✅",
          description: `${settings.provider.toUpperCase()} API连接测试通过`,
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
        
        toast({
          title: "连接失败 ❌",
          description: `${errorMessage}`,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Connection test error:', error);
      
      let errorMessage = "网络连接错误";
      
      if (error.name === 'TimeoutError') {
        errorMessage = "请求超时，请检查网络连接或API地址";
      } else if (error.message?.includes('Failed to fetch')) {
        if (settings.provider === 'ollama') {
          errorMessage = "无法连接到Ollama服务。请确保：\n1. Ollama已启动 (ollama serve)\n2. 服务运行在正确端口 (默认11434)\n3. 防火墙允许访问";
        } else if (settings.provider === 'lmstudio') {
          errorMessage = "无法连接到LM Studio服务。请确保：\n1. LM Studio已启动\n2. 已启用本地服务器\n3. 服务运行在正确端口 (默认1234)";
        } else {
          errorMessage = "网络连接失败，请检查API地址是否正确或服务是否运行";
        }
      } else if (error.message?.includes('CORS')) {
        errorMessage = "跨域请求被阻止，请检查API服务的CORS配置";
      } else if (error.message) {
        errorMessage = parseApiError(error.message);
      }
        
      setConnectionStatus('error');
      setLastError(errorMessage);
      toast({
        title: "连接失败 ❌",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const fetchModels = async () => {
    const currentProvider = apiProviders.find(p => p.value === settings.provider);
    
    // 检查是否需要API密钥
    if (currentProvider?.requiresKey && !settings.apiKey) {
      toast({
        title: "配置缺失",
        description: "请先填写API密钥",
        variant: "destructive"
      });
      return;
    }

    if (!settings.apiUrl) {
      toast({
        title: "配置缺失",
        description: "请先填写API地址",
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

      // 只有需要密钥的提供商才添加Authorization头
      if (currentProvider?.requiresKey && settings.apiKey) {
        headers['Authorization'] = `Bearer ${settings.apiKey}`;
      }

      const response = await fetch(modelsUrl, { 
        headers,
        signal: AbortSignal.timeout(15000) // 15秒超时
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
            title: "获取成功 ✅",
            description: `成功获取 ${modelIds.length} 个模型`,
          });
        } else {
          setAvailableModels(currentProvider?.models || defaultModels);
          toast({
            title: "使用预设列表",
            description: "无法解析模型数据，使用预设模型列表",
          });
        }
      } else {
        setAvailableModels(currentProvider?.models || defaultModels);
        const errorText = await response.text();
        console.log('Models fetch error:', errorText);
        toast({
          title: "获取失败",
          description: `无法获取模型列表: ${response.status}，使用预设模型列表`,
        });
      }
    } catch (error: any) {
      console.error('Models fetch error:', error);
      setAvailableModels(currentProvider?.models || defaultModels);
      
      let errorMessage = "无法连接到API服务器，使用预设模型列表";
      if (settings.provider === 'ollama') {
        errorMessage = "无法连接到Ollama服务获取模型列表，请确保Ollama已启动";
      }
      
      toast({
        title: "获取失败",
        description: errorMessage,
      });
    } finally {
      setIsLoadingModels(false);
    }
  };

  const handleSave = () => {
    const currentProvider = apiProviders.find(p => p.value === settings.provider);
    
    // 检查必要字段
    if (currentProvider?.requiresKey && !settings.apiKey) {
      toast({
        title: "配置缺失",
        description: "请填写API密钥",
        variant: "destructive"
      });
      return;
    }

    if (!settings.apiUrl) {
      toast({
        title: "配置缺失",
        description: "请填写API地址",
        variant: "destructive"
      });
      return;
    }

    // 确保API地址格式正确
    const finalSettings = {
      ...settings,
      apiUrl: buildApiUrl(settings.apiUrl, settings.provider)
    };

    localStorage.setItem('ai-settings', JSON.stringify(finalSettings));
    onSettingsChange(finalSettings);
    setIsOpen(false);
    toast({
      title: "保存成功 ✅",
      description: "AI设置已保存",
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
          AI设置
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>AI设置</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="provider">API提供商</Label>
            <Select value={settings.provider} onValueChange={handleProviderChange}>
              <SelectTrigger>
                <SelectValue placeholder="选择API提供商" />
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
              <Label htmlFor="apiKey">API密钥</Label>
              <Input
                id="apiKey"
                type="password"
                value={settings.apiKey}
                onChange={(e) => setSettings(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder="输入您的API密钥..."
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="apiUrl">API地址</Label>
            <Input
              id="apiUrl"
              value={settings.apiUrl}
              onChange={(e) => setSettings(prev => ({ ...prev, apiUrl: e.target.value }))}
              placeholder="输入API地址，系统会自动补全/v1/chat/completions..."
            />
            <p className="text-xs text-muted-foreground">
              提示：只需输入基础地址，系统会自动添加 /v1/chat/completions 后缀
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
              <span className="ml-2">测试连接</span>
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
              获取模型
            </Button>
          </div>

          {lastError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>连接错误:</strong> {lastError}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="model">模型选择</Label>
            <Select value={settings.model} onValueChange={(value) => setSettings(prev => ({ ...prev, model: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="选择模型" />
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
            保存设置
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AISettings;
