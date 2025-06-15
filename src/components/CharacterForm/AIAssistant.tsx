
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Wand, RefreshCcw, ArrowRight } from "lucide-react";
import { generateWithAI } from "@/utils/aiGenerator";
import { AISettings } from "@/components/AISettings";

interface ParsedCharacterData {
  name?: string;
  description?: string;
  personality?: string;
  scenario?: string;
  first_mes?: string;
  mes_example?: string;
  system_prompt?: string;
  post_history_instructions?: string;
  tags?: string[];
  creator_notes?: string;
}

interface AIAssistantProps {
  aiSettings: AISettings | null;
  onInsertField: (field: string, value: string) => void;
}

const AIAssistant = ({ aiSettings, onInsertField }: AIAssistantProps) => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [inputText, setInputText] = useState("");
  const [parsedData, setParsedData] = useState<ParsedCharacterData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateCharacterData = async () => {
    if (!inputText.trim()) {
      toast({
        title: "提示",
        description: "请先输入要转换的内容",
        variant: "destructive"
      });
      return;
    }

    if (!aiSettings) {
      toast({
        title: "提示",
        description: "请先配置AI设置",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `请将以下内容整理成角色卡格式的JSON数据。请严格按照以下JSON格式输出，如果某个字段无法从内容中提取，则留空：

输入内容：
${inputText}

请输出以下格式的JSON（只输出JSON，不要其他说明）：
{
  "name": "角色名称",
  "description": "角色外观描述",
  "personality": "性格特征",
  "scenario": "场景设定",
  "first_mes": "首条消息/开场白",
  "mes_example": "对话示例（格式：<START>\\n{{user}}: 用户话\\n角色名: 角色回答）",
  "system_prompt": "系统提示词",
  "post_history_instructions": "历史后指令",
  "tags": ["标签1", "标签2"],
  "creator_notes": "创作者备注"
}`;

      const result = await generateWithAI(aiSettings, prompt);
      
      // 尝试解析JSON
      try {
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          setParsedData(parsed);
          toast({
            title: "生成成功",
            description: "角色信息已成功解析"
          });
        } else {
          throw new Error("未找到有效的JSON格式");
        }
      } catch (parseError) {
        console.error('JSON解析失败:', parseError);
        toast({
          title: "解析失败",
          description: "生成的内容格式有误，请重试",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('生成失败:', error);
      toast({
        title: "生成失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const insertField = (field: string, value: string) => {
    if (value && value.trim()) {
      onInsertField(field, value);
      toast({
        title: "插入成功",
        description: `已插入到${getFieldLabel(field)}字段`
      });
    }
  };

  const getFieldLabel = (field: string): string => {
    const labels: Record<string, string> = {
      name: "角色名称",
      description: "角色描述",
      personality: "性格特征",
      scenario: "场景设定",
      first_mes: "首条消息",
      mes_example: "对话示例",
      system_prompt: "系统提示词",
      post_history_instructions: "历史后指令",
      creator_notes: "创作者备注"
    };
    return labels[field] || field;
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          AI角色卡助手
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            粘贴角色信息内容
          </label>
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="在此粘贴任意角色相关信息，AI将帮助您整理成角色卡格式..."
            className="min-h-[120px]"
            showCounter={true}
            showTokens={true}
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={generateCharacterData}
            disabled={isGenerating || !inputText.trim()}
            className="flex-1"
          >
            <Wand className="w-4 h-4 mr-2" />
            {isGenerating ? "生成中..." : "AI生成"}
          </Button>
          {parsedData && (
            <Button
              onClick={generateCharacterData}
              disabled={isGenerating}
              variant="outline"
            >
              <RefreshCcw className="w-4 h-4" />
            </Button>
          )}
        </div>

        {parsedData && (
          <div className="space-y-3 border-t pt-4">
            <h4 className="font-medium text-gray-800 dark:text-gray-200">解析结果</h4>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {Object.entries(parsedData).map(([key, value]) => {
                if (!value || (Array.isArray(value) && value.length === 0)) return null;
                
                const displayValue = Array.isArray(value) ? value.join(", ") : value;
                
                return (
                  <div key={key} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-1">
                          {getFieldLabel(key)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 break-words">
                          {displayValue.length > 100 
                            ? `${displayValue.substring(0, 100)}...` 
                            : displayValue
                          }
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => insertField(key, Array.isArray(value) ? value : value)}
                        className="shrink-0"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIAssistant;
