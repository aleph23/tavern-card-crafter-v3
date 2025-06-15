
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
}

const AISettings = ({ onSettingsChange, currentSettings }: AISettingsProps) => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AISettings>(
    currentSettings || {
      apiKey: "",
      apiUrl: "https://api.openai.com/v1/chat/completions",
      model: "gpt-3.5-turbo"
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
    "gemini-pro", "gemini-1.5-pro", "deepseek-chat",
    "qwen-turbo", "qwen-plus", "qwen-max",
    "moonshot-v1-8k", "moonshot-v1-32k", "moonshot-v1-128k",
    "yi-34b-chat", "yi-large", "baichuan2-turbo", "chatglm-turbo",
    "llama-2-70b-chat", "llama-3-70b-instruct",
    "mistral-7b-instruct", "mixtral-8x7b-instruct"
  ];

  useEffect(() => {
    if (availableModels.length === 0) {
      setAvailableModels(defaultModels);
    }
  }, []);

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
      const response = await fetch(settings.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.apiKey}`
        },
        body: JSON.stringify({
          model: settings.model || "gpt-3.5-turbo",
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 1
        })
      });

      if (response.ok) {
        setConnectionStatus('success');
        toast({
          title: "连接成功",
          description: "API连接测试通过",
        });
      } else {
        setConnectionStatus('error');
        toast({
          title: "连接失败",
          description: `API请求失败: ${response.status} ${response.statusText}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      setConnectionStatus('error');
      toast({
        title: "连接失败",
        description: "无法连接到API服务器",
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
      // 尝试获取模型列表（适用于OpenAI兼容接口）
      const modelsUrl = settings.apiUrl.replace('/chat/completions', '/models');
      const response = await fetch(modelsUrl, {
        headers: {
          'Authorization': `Bearer ${settings.apiKey}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data && Array.isArray(data.data)) {
          const modelIds = data.data.map((model: any) => model.id);
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>AI设置</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
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
