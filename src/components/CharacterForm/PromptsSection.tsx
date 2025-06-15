
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { generateWithAI, generateSystemPrompt, generatePostHistoryInstructions } from "@/utils/aiGenerator";
import { AISettings } from "@/components/AISettings";
import { useToast } from "@/hooks/use-toast";

interface PromptsSectionProps {
  data: any;
  updateField: (field: string, value: any) => void;
  aiSettings: AISettings | null;
}

const PromptsSection = ({ data, updateField, aiSettings }: PromptsSectionProps) => {
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const { toast } = useToast();

  const handleAIGenerate = async (field: string, promptGenerator: (data: any) => string) => {
    if (!aiSettings?.apiKey) {
      toast({
        title: "配置错误",
        description: "请先在AI设置中配置API密钥",
        variant: "destructive"
      });
      return;
    }

    if (!data.name || !data.description || !data.personality) {
      toast({
        title: "信息不完整",
        description: "请先填写前面的基本信息",
        variant: "destructive"
      });
      return;
    }

    setLoading(prev => ({ ...prev, [field]: true }));
    
    try {
      const prompt = promptGenerator(data);
      const result = await generateWithAI(aiSettings, prompt);
      updateField(field, result);
      toast({
        title: "生成成功",
        description: `${field} 已生成完成`
      });
    } catch (error) {
      toast({
        title: "生成失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive"
      });
    } finally {
      setLoading(prev => ({ ...prev, [field]: false }));
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">提示词设置</h3>
      
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="system_prompt" className="text-sm font-medium text-gray-700">系统提示词</Label>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAIGenerate('system_prompt', generateSystemPrompt)}
            disabled={loading.system_prompt}
          >
            {loading.system_prompt ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            AI生成
          </Button>
        </div>
        <Textarea
          id="system_prompt"
          value={data.system_prompt}
          onChange={(e) => updateField("system_prompt", e.target.value)}
          placeholder="给 AI 的系统级指令..."
          className="mt-1 min-h-[100px]"
          showCounter={true}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="post_history" className="text-sm font-medium text-gray-700">历史后指令</Label>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAIGenerate('post_history_instructions', generatePostHistoryInstructions)}
            disabled={loading.post_history_instructions}
          >
            {loading.post_history_instructions ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            AI生成
          </Button>
        </div>
        <Textarea
          id="post_history"
          value={data.post_history_instructions}
          onChange={(e) => updateField("post_history_instructions", e.target.value)}
          placeholder="在聊天历史后出现的指令..."
          className="mt-1 min-h-[100px]"
          showCounter={true}
        />
      </div>

      <div>
        <Label htmlFor="creator_notes" className="text-sm font-medium text-gray-700">创作者备注</Label>
        <Textarea
          id="creator_notes"
          value={data.creator_notes}
          onChange={(e) => updateField("creator_notes", e.target.value)}
          placeholder="给其他用户的关于角色的说明..."
          className="mt-1 min-h-[100px]"
          showCounter={true}
        />
      </div>
    </div>
  );
};

export default PromptsSection;
