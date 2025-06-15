
import { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, RefreshCcw, Trash2, X } from "lucide-react";
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
  const abortControllerRefs = useRef<{ [key: string]: AbortController | null }>({});
  const { toast } = useToast();

  const handleAIGenerate = async (field: string, promptGenerator: (data: any) => string) => {
    if (!aiSettings?.apiKey && !['ollama', 'lmstudio'].includes(aiSettings?.provider?.toLowerCase() || '')) {
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

    abortControllerRefs.current[field] = new AbortController();
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
      if (error instanceof Error && error.name === 'AbortError') {
        toast({
          title: "已取消",
          description: "AI生成已被用户取消"
        });
      } else {
        toast({
          title: "生成失败",
          description: error instanceof Error ? error.message : "未知错误",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(prev => ({ ...prev, [field]: false }));
      abortControllerRefs.current[field] = null;
    }
  };

  const cancelGeneration = (field: string) => {
    if (abortControllerRefs.current[field]) {
      abortControllerRefs.current[field]!.abort();
      setLoading(prev => ({ ...prev, [field]: false }));
      abortControllerRefs.current[field] = null;
      toast({
        title: "已取消",
        description: "AI生成已取消"
      });
    }
  };

  const handleClearField = (field: string) => {
    updateField(field, "");
    toast({
      title: "已清空",
      description: `${field} 已清空`
    });
  };

  const renderFieldButtons = (field: string, promptGenerator: (data: any) => string) => {
    const isLoading = loading[field];
    const canGenerate = data.name && data.description && data.personality;

    return (
      <div className="flex gap-1">
        {!isLoading && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAIGenerate(field, promptGenerator)}
            disabled={!canGenerate}
            className="h-8 px-2 text-xs"
          >
            <RefreshCcw className="w-3 h-3 mr-1" />
            重新生成
          </Button>
        )}
        <Button
          size="sm"
          variant={isLoading ? "destructive" : "outline"}
          onClick={isLoading ? () => cancelGeneration(field) : () => handleAIGenerate(field, promptGenerator)}
          disabled={!isLoading && !canGenerate}
          className="h-8 px-2 text-xs"
        >
          {isLoading ? (
            <>
              <X className="w-3 h-3 mr-1" />
              取消
            </>
          ) : (
            <>
              <Sparkles className="w-3 h-3 mr-1" />
              AI生成
            </>
          )}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleClearField(field)}
          className="h-8 px-2 text-xs"
        >
          <Trash2 className="w-3 h-3 mr-1" />
          清空
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">提示词设置</h3>
      
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="system_prompt" className="text-sm font-medium text-gray-700">系统提示词</Label>
          {renderFieldButtons('system_prompt', generateSystemPrompt)}
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
          {renderFieldButtons('post_history_instructions', generatePostHistoryInstructions)}
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
