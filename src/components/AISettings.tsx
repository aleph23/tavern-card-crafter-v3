
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [settings, setSettings] = useState<AISettings>(
    currentSettings || {
      apiKey: "",
      apiUrl: "https://api.openai.com/v1/chat/completions",
      model: "gpt-3.5-turbo"
    }
  );

  const handleSave = () => {
    localStorage.setItem('ai-settings', JSON.stringify(settings));
    onSettingsChange(settings);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          AI设置
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
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
          
          <div className="space-y-2">
            <Label htmlFor="model">模型选择</Label>
            <Select value={settings.model} onValueChange={(value) => setSettings(prev => ({ ...prev, model: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="选择模型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                <SelectItem value="gpt-4">GPT-4</SelectItem>
                <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
                <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                <SelectItem value="claude-3-5-sonnet">Claude 3.5 Sonnet</SelectItem>
                <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                <SelectItem value="deepseek-chat">DeepSeek Chat</SelectItem>
                <SelectItem value="qwen-turbo">Qwen Turbo</SelectItem>
                <SelectItem value="qwen-plus">Qwen Plus</SelectItem>
                <SelectItem value="qwen-max">Qwen Max</SelectItem>
                <SelectItem value="moonshot-v1-8k">Moonshot v1 8k</SelectItem>
                <SelectItem value="moonshot-v1-32k">Moonshot v1 32k</SelectItem>
                <SelectItem value="moonshot-v1-128k">Moonshot v1 128k</SelectItem>
                <SelectItem value="yi-34b-chat">Yi 34B Chat</SelectItem>
                <SelectItem value="yi-large">Yi Large</SelectItem>
                <SelectItem value="baichuan2-turbo">Baichuan2 Turbo</SelectItem>
                <SelectItem value="chatglm-turbo">ChatGLM Turbo</SelectItem>
                <SelectItem value="llama-2-70b-chat">Llama 2 70B Chat</SelectItem>
                <SelectItem value="llama-3-70b-instruct">Llama 3 70B Instruct</SelectItem>
                <SelectItem value="mistral-7b-instruct">Mistral 7B Instruct</SelectItem>
                <SelectItem value="mixtral-8x7b-instruct">Mixtral 8x7B Instruct</SelectItem>
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
