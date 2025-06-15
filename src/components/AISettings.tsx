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
      url: "https://api.openai.com/v1/chat/completions",
      models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-4", "gpt-3.5-turbo"],
      tips: "需要海外网络环境和有效的OpenAI API密钥"
    },
    {
      name: "Anthropic Claude",
      value: "anthropic",
      url: "https://api.anthropic.com/v1/messages",
      models: ["claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022", "claude-3-opus-20240229", "claude-3-sonnet-20240229"],
      tips: "Claude API，需要海外网络环境"
    },
    {
      name: "DeepSeek 深度求索",
      value: "deepseek",
      url: "https://api.deepseek.com/v1/chat/completions",
      models: ["deepseek-chat", "deepseek-coder"],
      tips: "国内可直接访问，性价比高"
    },
    {
      name: "月之暗面 Moonshot",
      value: "moonshot", 
      url: "https://api.moonshot.cn/v1/chat/completions",
      models: ["moonshot-v1-8k", "moonshot-v1-32k", "moonshot-v1-128k"],
      tips: "国内API，支持长上下文"
    },
    {
      name: "智谱 GLM",
      value: "zhipu",
      url: "https://open.bigmodel.cn/api/paas/v4/chat/completions", 
      models: ["glm-4-plus", "glm-4-0520", "glm-4", "glm-4-air", "glm-4-airx", "glm-4-flash"],
      tips: "智谱清言API，国内服务"
    },
    {
      name: "阿里云 通义千问",
      value: "qwen",
      url: "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation",
      models: ["qwen-plus", "qwen-turbo", "qwen-max", "qwen-max-longcontext"],
      tips: "阿里云API，需要阿里云账号"
    },
    {
      name: "百度 文心一言",
      value: "ernie",
      url: "https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions",
      models: ["ernie-4.0-8k", "ernie-3.5-8k", "ernie-turbo-8k"],
      tips: "百度API，需要百度云账号和access_token"
    },
    {
      name: "零一万物 Yi",
      value: "yi",
      url: "https://api.lingyiwanwu.com/v1/chat/completions",
      models: ["yi-large", "yi-medium", "yi-spark", "yi-large-rag"],
      tips: "零一万物API"
    },
    {
      name: "字节跳动 豆包",
      value: "doubao",
      url: "https://ark.cn-beijing.volces.com/api/v3/chat/completions",
      models: ["doubao-lite-4k", "doubao-lite-32k", "doubao-lite-128k", "doubao-pro-4k", "doubao-pro-32k", "doubao-pro-128k"],
      tips: "字节跳动API，需要配置正确的endpoint"
    },
    {
      name: "腾讯 混元",
      value: "hunyuan",
      url: "https://hunyuan.tencentcloudapi.com/v1/chat/completions",
      models: ["hunyuan-lite", "hunyuan-standard", "hunyuan-pro"],
      tips: "腾讯云API"
    },
    {
      name: "讯飞星火",
      value: "spark",
      url: "https://spark-api-open.xf-yun.com/v1/chat/completions",
      models: ["spark-lite", "spark-pro", "spark-pro-128k", "spark-max"],
      tips: "讯飞API"
    },
    {
      name: "MiniMax",
      value: "minimax",
      url: "https://api.minimax.chat/v1/text/chatcompletion_pro",
      models: ["abab6.5s-chat", "abab6.5-chat", "abab5.5s-chat", "abab5.5-chat"],
      tips: "MiniMax API"
    },
    {
      name: "Ollama (本地)",
      value: "ollama",
      url: "http://localhost:11434/api/chat",
      models: ["llama3.2", "llama3.1", "qwen2.5", "deepseek-coder", "codegemma", "mistral"],
      tips: "本地Ollama服务，需要先下载模型：ollama pull 模型名"
    },
    {
      name: "LM Studio (本地)",
      value: "lmstudio",
      url: "http://localhost:1234/v1/chat/completions",
      models: ["local-model"],
      tips: "LM Studio本地服务，需要先加载模型"
    },
    {
      name: "OneAPI/New API",
      value: "oneapi",
      url: "http://localhost:3000/v1/chat/completions",
      models: ["gpt-3.5-turbo", "gpt-4", "claude-3-sonnet"],
      tips: "OneAPI统一接口，支持多种模型代理"
    },
    {
      name: "FastGPT",
      value: "fastgpt",
      url: "https://api.fastgpt.in/api/v1/chat/completions",
      models: ["gpt-3.5-turbo", "gpt-4"],
      tips: "FastGPT代理服务"
    },
    {
      name: "自定义接口",
      value: "custom",
      url: "",
      models: [],
      tips: "请手动配置API地址和模型名称"
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
    "claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022", "claude-3-opus-20240229",
    "deepseek-chat", "deepseek-coder",
    "moonshot-v1-8k", "moonshot-v1-32k", "moonshot-v1-128k",
    "glm-4-plus", "glm-4", "glm-4-air", "glm-4-flash",
    "qwen-plus", "qwen-turbo", "qwen-max",
    "ernie-4.0-8k", "ernie-3.5-8k", "ernie-turbo-8k",
    "yi-large", "yi-medium", "doubao-pro-32k", "hunyuan-pro"
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
        model: provider.models[0] || prev.model
      }));
      setAvailableModels(provider.models.length > 0 ? provider.models : defaultModels);
    }
  };

  // 解析API错误信息
  const parseApiError = (error: any, response?: Response): string => {
    try {
      if (typeof error === 'string') {
        // 处理常见错误
        if (error.includes('model') && error.includes('not found')) {
          return "模型不存在，请检查模型名称或先下载模型（如Ollama需要执行: ollama pull 模型名）";
        }
        if (error.includes('无可用渠道')) {
          return "当前API分组无可用渠道，请检查API配置或联系服务提供商";
        }
        if (error.includes('User location is not supported')) {
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
    if (!settings.apiKey || !settings.apiUrl) {
      toast({
        title: "配置缺失",
        description: "请先填写API密钥和API地址",
        variant: "destructive"
      });
      return;
    }

    setIsTestingConnection(true);
    setConnectionStatus('idle');
    setLastError("");

    try {
      let requestBody: any;
      let headers: any = {
        'Content-Type': 'application/json',
      };

      // 根据不同的API提供商构造请求
      switch (settings.provider) {
        case 'anthropic':
          headers['x-api-key'] = settings.apiKey;
          headers['anthropic-version'] = '2023-06-01';
          requestBody = {
            model: settings.model,
            max_tokens: 10,
            messages: [{ role: 'user', content: 'test' }]
          };
          break;
        case 'qwen':
          headers['Authorization'] = `Bearer ${settings.apiKey}`;
          requestBody = {
            model: settings.model,
            input: { messages: [{ role: 'user', content: 'test' }] },
            parameters: { max_tokens: 10 }
          };
          break;
        case 'ernie':
          // 百度API需要access_token
          const urlWithToken = settings.apiUrl.includes('?') 
            ? `${settings.apiUrl}&access_token=${settings.apiKey}`
            : `${settings.apiUrl}?access_token=${settings.apiKey}`;
          requestBody = {
            messages: [{ role: 'user', content: 'test' }],
            max_output_tokens: 10
          };
          break;
        case 'ollama':
          requestBody = {
            model: settings.model,
            messages: [{ role: 'user', content: 'test' }],
            stream: false,
            options: { num_predict: 10 }
          };
          break;
        default:
          // OpenAI兼容格式
          headers['Authorization'] = `Bearer ${settings.apiKey}`;
          requestBody = {
            model: settings.model,
            messages: [{ role: 'user', content: 'test' }],
            max_tokens: 10,
            temperature: 0.1
          };
      }

      let apiUrl = settings.apiUrl;
      if (settings.provider === 'ernie' && !apiUrl.includes('access_token')) {
        apiUrl = apiUrl.includes('?') 
          ? `${apiUrl}&access_token=${settings.apiKey}`
          : `${apiUrl}?access_token=${settings.apiKey}`;
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(30000) // 30秒超时
      });

      if (response.ok || response.status === 200) {
        setConnectionStatus('success');
        setLastError("");
        toast({
          title: "连接成功 ✅",
          description: `${settings.provider.toUpperCase()} API连接测试通过`,
        });
      } else {
        const errorText = await response.text();
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
      const errorMessage = error.name === 'TimeoutError' 
        ? "请求超时，请检查网络连接或API地址"
        : error.message || "网络连接错误";
        
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
    if (!settings.apiKey || !settings.apiUrl) {
      toast({
        title: "配置缺失",
        description: "请先填写API密钥和API地址",
        variant: "destructive"
      });
      return;
    }

    setIsLoadingModels(true);

    try {
      let modelsUrl = settings.apiUrl.replace('/chat/completions', '/models');
      let headers: any = {};

      switch (settings.provider) {
        case 'anthropic':
        case 'qwen':
        case 'ernie':
          // 这些提供商不提供模型列表API或格式特殊，使用预设
          const provider = apiProviders.find(p => p.value === settings.provider);
          setAvailableModels(provider?.models || defaultModels);
          toast({
            title: "使用预设模型",
            description: "该提供商使用预设模型列表",
          });
          return;
        case 'ollama':
          modelsUrl = settings.apiUrl.replace('/api/chat', '/api/tags');
          break;
        default:
          headers['Authorization'] = `Bearer ${settings.apiKey}`;
      }

      const response = await fetch(modelsUrl, { headers });

      if (response.ok) {
        const data = await response.json();
        let modelIds: string[] = [];

        if (settings.provider === 'ollama' && data.models) {
          modelIds = data.models.map((model: any) => model.name);
        } else if (data.data && Array.isArray(data.data)) {
          modelIds = data.data.map((model: any) => model.id);
        }

        if (modelIds.length > 0) {
          setAvailableModels(modelIds);
          toast({
            title: "获取成功 ✅",
            description: `成功获取 ${modelIds.length} 个模型`,
          });
        } else {
          setAvailableModels(defaultModels);
          toast({
            title: "使用默认列表",
            description: "无法解析模型数据，使用默认模型列表",
          });
        }
      } else {
        setAvailableModels(defaultModels);
        toast({
          title: "获取失败",
          description: "无法获取模型列表，使用默认模型列表",
        });
      }
    } catch (error) {
      setAvailableModels(defaultModels);
      toast({
        title: "获取失败",
        description: "无法连接到API服务器，使用默认模型列表",
      });
    } finally {
      setIsLoadingModels(false);
    }
  };

  const handleSave = () => {
    if (!settings.apiKey || !settings.apiUrl) {
      toast({
        title: "配置缺失",
        description: "请填写完整的API信息",
        variant: "destructive"
      });
      return;
    }

    localStorage.setItem('ai-settings', JSON.stringify(settings));
    onSettingsChange(settings);
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
          
          <div className="space-y-2">
            <Label htmlFor="apiUrl">API地址</Label>
            <Input
              id="apiUrl"
              value={settings.apiUrl}
              onChange={(e) => setSettings(prev => ({ ...prev, apiUrl: e.target.value }))}
              placeholder="输入API地址..."
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={testConnection} 
              disabled={isTestingConnection || !settings.apiKey || !settings.apiUrl}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              {getConnectionIcon()}
              <span className="ml-2">测试连接</span>
            </Button>
            <Button 
              onClick={fetchModels} 
              disabled={isLoadingModels || !settings.apiKey || !settings.apiUrl}
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
                {availableModels.map((model) => (
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
