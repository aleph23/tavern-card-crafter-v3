
import { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, RefreshCcw, Trash2, X } from "lucide-react";
import { generateWithAI, generatePersonality, generateScenario, generateFirstMessage, generateMessageExample } from "@/utils/aiGenerator";
import { AISettings } from "@/components/AISettings";
import { useToast } from "@/hooks/use-toast";

interface PersonalitySectionProps {
  data: any;
  updateField: (field: string, value: any) => void;
  aiSettings: AISettings | null;
}

const PersonalitySection = ({ data, updateField, aiSettings }: PersonalitySectionProps) => {
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

    if (!data.name || !data.description) {
      toast({
        title: "信息不完整",
        description: "请先填写角色名称和角色描述",
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

  const renderFieldButtons = (field: string, promptGenerator: (data: any) => string, dependencies?: string[]) => {
    const isLoading = loading[field];
    const canGenerate = dependencies ? dependencies.every(dep => data[dep]) : true;

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
      <h3 className="text-lg font-semibold text-gray-800 mb-4">性格设定</h3>
      
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="personality" className="text-sm font-medium text-gray-700">性格特征 *</Label>
          {renderFieldButtons('personality', generatePersonality, ['name', 'description'])}
        </div>
        <Textarea
          id="personality"
          value={data.personality}
          onChange={(e) => updateField("personality", e.target.value)}
          placeholder="描述角色的性格特点、行为模式和习惯..."
          className="mt-1 min-h-[100px]"
          showCounter={true}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="scenario" className="text-sm font-medium text-gray-700">场景设定 *</Label>
          {renderFieldButtons('scenario', generateScenario, ['name', 'description', 'personality'])}
        </div>
        <Textarea
          id="scenario"
          value={data.scenario}
          onChange={(e) => updateField("scenario", e.target.value)}
          placeholder="设定交互的场景和背景..."
          className="mt-1 min-h-[100px]"
          showCounter={true}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="first_mes" className="text-sm font-medium text-gray-700">首条消息 *</Label>
          {renderFieldButtons('first_mes', generateFirstMessage, ['name', 'description', 'personality', 'scenario'])}
        </div>
        <Textarea
          id="first_mes"
          value={data.first_mes}
          onChange={(e) => updateField("first_mes", e.target.value)}
          placeholder="角色的开场白..."
          className="mt-1 min-h-[100px]"
          showCounter={true}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="mes_example" className="text-sm font-medium text-gray-700">对话示例</Label>
          {renderFieldButtons('mes_example', generateMessageExample, ['name', 'description', 'personality', 'first_mes'])}
        </div>
        <Textarea
          id="mes_example"
          value={data.mes_example}
          onChange={(e) => updateField("mes_example", e.target.value)}
          placeholder="示例对话，帮助定义角色的说话方式..."
          className="mt-1 min-h-[120px]"
          showCounter={true}
        />
      </div>
    </div>
  );
};

export default PersonalitySection;
