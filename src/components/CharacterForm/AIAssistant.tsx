
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Wand, RefreshCcw, Download } from "lucide-react";
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
  onInsertField: (field: string, value: string | string[]) => void;
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
      const prompt = `请仔细分析以下内容，从中提取角色相关信息并整理成角色卡格式。内容可能来自文章、维基百科、小说片段或其他文本。请根据内容智能提取和推理角色信息：

输入内容：
${inputText}

请严格按照以下JSON格式输出，如果某个字段无法从内容中直接提取，请根据上下文合理推理或留空。注意事项：
1. name: 角色的主要名称
2. description: 角色的外观、身材、服装等物理描述
3. personality: 性格特征、行为模式、说话风格等
4. scenario: 角色所在的世界背景、环境设定、时代背景等
5. first_mes: 角色的开场白或第一次见面时会说的话（用第一人称）
6. mes_example: 对话示例，展示角色的说话风格（格式：<START>\\n{{user}}: 用户话语\\n角色名: 角色回答）
7. system_prompt: 系统提示词，指导AI如何扮演这个角色
8. post_history_instructions: 历史后指令，对话中的额外指导
9. tags: 相关标签数组，如["奇幻", "女性", "法师"]等
10. creator_notes: 创作者备注或额外说明

只输出JSON格式，不要其他说明：
{
  "name": "角色名称",
  "description": "角色外观描述",
  "personality": "性格特征",
  "scenario": "场景设定",
  "first_mes": "首条消息/开场白",
  "mes_example": "对话示例",
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
            description: "角色信息已成功解析，可以一键插入到表单中"
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

  const insertAllFields = () => {
    if (!parsedData) return;

    let insertedCount = 0;
    const fieldLabels: Record<string, string> = {
      name: "角色名称",
      description: "角色描述",
      personality: "性格特征",
      scenario: "场景设定",
      first_mes: "首条消息",
      mes_example: "对话示例",
      system_prompt: "系统提示词",
      post_history_instructions: "历史后指令",
      tags: "标签",
      creator_notes: "创作者备注"
    };

    // 插入所有有值的字段
    Object.entries(parsedData).forEach(([key, value]) => {
      if (value && (Array.isArray(value) ? value.length > 0 : value.trim())) {
        onInsertField(key, value);
        insertedCount++;
      }
    });

    if (insertedCount > 0) {
      toast({
        title: "插入成功",
        description: `已成功插入 ${insertedCount} 个字段到角色卡表单中`
      });
    } else {
      toast({
        title: "没有可插入的数据",
        description: "解析结果中没有有效的数据可以插入",
        variant: "destructive"
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
      tags: "标签",
      creator_notes: "创作者备注"
    };
    return labels[field] || field;
  };

  const getPreviewText = (value: any) => {
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    const text = value.toString();
    return text.length > 150 ? `${text.substring(0, 150)}...` : text;
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          AI角色卡助手
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          粘贴任意文本内容（文章、维基百科、小说片段等），AI将自动提取角色信息
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            文本内容
          </label>
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="在此粘贴任意包含角色信息的文本内容：
• 角色介绍文章
• 维基百科页面
• 小说人物描述
• 游戏角色资料
• 动漫人物介绍
等等..."
            className="min-h-[200px] text-sm"
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
            {isGenerating ? "AI分析中..." : "AI分析生成"}
          </Button>
          {parsedData && (
            <Button
              onClick={generateCharacterData}
              disabled={isGenerating}
              variant="outline"
              title="重新生成"
            >
              <RefreshCcw className="w-4 h-4" />
            </Button>
          )}
        </div>

        {parsedData && (
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-800 dark:text-gray-200">AI解析结果</h4>
              <Button
                onClick={insertAllFields}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <Download className="w-4 h-4 mr-2" />
                一键插入全部
              </Button>
            </div>
            
            <div className="space-y-3 max-h-[400px] overflow-y-auto bg-gray-50 dark:bg-gray-800 rounded-lg p-3 custom-scrollbar">
              {Object.entries(parsedData).map(([key, value]) => {
                if (!value || (Array.isArray(value) && value.length === 0)) return null;
                
                return (
                  <div key={key} className="border-b border-gray-200 dark:border-gray-700 pb-2 last:border-b-0">
                    <div className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-1">
                      {getFieldLabel(key)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 break-words leading-relaxed">
                      {getPreviewText(value)}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
              💡 点击"一键插入全部"将所有解析结果自动填入对应的表单字段中，您可以在左侧表单中进一步编辑和完善。
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIAssistant;
