
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings, Loader2, Check, X, RefreshCw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

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
      name: "OpenAI",
      value: "openai",
      url: "https://api.openai.com/v1/chat/completions",
      models: ["gpt-3.5-turbo", "gpt-4", "gpt-4-turbo", "gpt-4o", "gpt-4o-mini"]
    },
    {
      name: "Anthropic Claude",
      value: "anthropic",
      url: "https://api.anthropic.com/v1/messages",
      models: ["claude-3-sonnet-20240229", "claude-3-opus-20240229", "claude-3-haiku-20240307", "claude-3-5-sonnet-20241022"]
    },
    {
      name: "DeepSeek",
      value: "deepseek",
      url: "https://api.deepseek.com/v1/chat/completions",
      models: ["deepseek-chat", "deepseek-coder"]
    },
    {
      name: "月之暗面 Moonshot",
      value: "moonshot",
      url: "https://api.moonshot.cn/v1/chat/completions",
      models: ["moonshot-v1-8k", "moonshot-v1-32k", "moonshot-v1-128k"]
    },
    {
      name: "智谱 GLM",
      value: "zhipu",
      url: "https://open.bigmodel.cn/api/paas/v4/chat/completions",
      models: ["glm-4", "glm-4-turbo", "glm-3-turbo"]
    },
    {
      name: "阿里云 通义千问",
      value: "qwen",
      url: "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation",
      models: ["qwen-turbo", "qwen-plus", "qwen-max", "qwen-max-longcontext"]
    },
    {
      name: "百度 文心一言",
      value: "ernie",
      url: "https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions",
      models: ["ernie-4.0-8k", "ernie-3.5-8k", "ernie-turbo-8k"]
    },
    {
      name: "零一万物 Yi",
      value: "yi",
      url: "https://api.lingyiwanwu.com/v1/chat/completions",
      models: ["yi-34b-chat-0205", "yi-34b-chat-200k", "yi-vl-plus"]
    },
    {
      name: "Ollama (本地)",
      value: "ollama",
      url: "http://localhost:11434/api/chat",
      models: ["llama2", "llama3", "qwen", "yi", "mistral", "codellama"]
    },
    {
      name: "LM Studio (本地)",
      value: "lmstudio",
      url: "http://localhost:1234/v1/chat/completions",
      models: ["local-model"]
    },
    {
      name: "自定义",
      value: "custom",
      url: "",
      models: []
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

  // 默认模型列表（当无法获取模型列表时使用）
  const defaultModels = [
    "gpt-3.5-turbo", "gpt-4", "gpt-4-turbo", "gpt-4o", "gpt-4o-mini",
    "claude-3-sonnet", "claude-3-haiku", "claude-3-opus", "claude-3-5-sonnet",
    "deepseek-chat", "deepseek-coder",
    "moonshot-v1-8k", "moonshot-v1-32k", "moonshot-v1-128k",
    "glm-4", "glm-4-turbo", "glm-3-turbo",
    "qwen-turbo", "qwen-plus", "qwen-max",
    "ernie-4.0-8k", "ernie-3.5-8k", "ernie-turbo-8k",
    "yi-34b-chat", "yi-large", "yi-vl-plus"
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

  const testConnection = async () => {
    if (!settings.apiKey || !settings.apiUrl) {
      toast({
        title: "错误",
        description: "请先填写API密钥和API地址",
        variant: "destructive"
      });
      return;
    }

    setIsTestingConnection(true);
    setConnectionStatus('idle');

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
          requestBody = {
            messages: [{ role: 'user', content: 'test' }],
            max_output_tokens: 10
          };
          break;
        case 'ollama':
          requestBody = {
            model: settings.model,
            messages: [{ role: 'user', content: 'test' }],
            stream: false
          };
          break;
        default:
          // OpenAI兼容格式
          headers['Authorization'] = `Bearer ${settings.apiKey}`;
          requestBody = {
            model: settings.model,
            messages: [{ role: 'user', content: 'test' }],
            max_tokens: 10
          };
      }

      const response = await fetch(settings.apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      if (response.ok || response.status === 200) {
        setConnectionStatus('success');
        toast({
          title: "连接成功",
          description: "API连接测试通过",
        });
      } else {
        const errorText = await response.text();
        setConnectionStatus('error');
        toast({
          title: "连接失败",
          description: `API请求失败: ${response.status} - ${errorText.substring(0, 100)}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      setConnectionStatus('error');
      toast({
        title: "连接失败",
        description: `网络错误: ${error instanceof Error ? error.message : '未知错误'}`,
        variant: "destructive"
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const fetchModels = async () => {
    if (!settings.apiKey || !settings.apiUrl) {
      toast({
        title: "错误",
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
          // Anthropic 不提供模型列表API，使用预设
          setAvailableModels(apiProviders.find(p => p.value === 'anthropic')?.models || defaultModels);
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
            title: "获取成功",
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
        title: "错误",
        description: "请填写完整的API信息",
        variant: "destructive"
      });
      return;
    }

    localStorage.setItem('ai-settings', JSON.stringify(settings));
    onSettingsChange(settings);
    setIsOpen(false);
    toast({
      title: "保存成功",
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          AI设置
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
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
