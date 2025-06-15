
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
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

    if (!data.name || !data.description) {
      toast({
        title: "信息不完整",
        description: "请先填写角色名称和角色描述",
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
      <h3 className="text-lg font-semibold text-gray-800 mb-4">性格设定</h3>
      
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="personality" className="text-sm font-medium text-gray-700">性格特征 *</Label>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAIGenerate('personality', generatePersonality)}
            disabled={loading.personality}
          >
            {loading.personality ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            AI生成
          </Button>
        </div>
        <Textarea
          id="personality"
          value={data.personality}
          onChange={(e) => updateField("personality", e.target.value)}
          placeholder="描述角色的性格特点、行为模式和习惯..."
          className="mt-1 min-h-[100px]"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="scenario" className="text-sm font-medium text-gray-700">场景设定 *</Label>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAIGenerate('scenario', generateScenario)}
            disabled={loading.scenario || !data.personality}
          >
            {loading.scenario ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            AI生成
          </Button>
        </div>
        <Textarea
          id="scenario"
          value={data.scenario}
          onChange={(e) => updateField("scenario", e.target.value)}
          placeholder="设定交互的场景和背景..."
          className="mt-1 min-h-[100px]"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="first_mes" className="text-sm font-medium text-gray-700">首条消息 *</Label>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAIGenerate('first_mes', generateFirstMessage)}
            disabled={loading.first_mes || !data.scenario}
          >
            {loading.first_mes ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            AI生成
          </Button>
        </div>
        <Textarea
          id="first_mes"
          value={data.first_mes}
          onChange={(e) => updateField("first_mes", e.target.value)}
          placeholder="角色的开场白..."
          className="mt-1 min-h-[100px]"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="mes_example" className="text-sm font-medium text-gray-700">对话示例</Label>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAIGenerate('mes_example', generateMessageExample)}
            disabled={loading.mes_example || !data.first_mes}
          >
            {loading.mes_example ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            AI生成
          </Button>
        </div>
        <Textarea
          id="mes_example"
          value={data.mes_example}
          onChange={(e) => updateField("mes_example", e.target.value)}
          placeholder="示例对话，帮助定义角色的说话方式..."
          className="mt-1 min-h-[120px]"
        />
      </div>
    </div>
  );
};

export default PersonalitySection;
