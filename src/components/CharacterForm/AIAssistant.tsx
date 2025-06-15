import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Wand, RefreshCcw, Download, X } from "lucide-react";
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

const CHARACTER_TYPES = [
  { value: "general", label: "智能整理（默认）", description: "直接整理用户粘贴的内容" },
  { value: "anime", label: "动漫角色", description: "基于动漫、漫画的角色设定" },
  { value: "game", label: "游戏角色", description: "来自游戏的角色设定" },
  { value: "novel", label: "小说角色", description: "文学作品中的角色设定" },
  { value: "historical", label: "历史人物", description: "真实的历史人物设定" }
];

const AIAssistant = ({ aiSettings, onInsertField }: AIAssistantProps) => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [inputText, setInputText] = useState("");
  const [characterType, setCharacterType] = useState("general");
  const [parsedData, setParsedData] = useState<ParsedCharacterData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const getPromptByType = (type: string, content: string) => {
    // 限制输入内容长度，避免提示词过长
    const truncatedContent = content.length > 2000 ? content.substring(0, 2000) + "..." : content;
    
    const baseInstructions = `请根据以下内容生成角色卡信息。

输入内容：
${truncatedContent}

请严格按照JSON格式输出，不要添加任何其他文字：`;

    const jsonFormat = `
{
  "name": "角色名称",
  "description": "详细的角色外观描述",
  "personality": "详细的性格特征描述",
  "scenario": "详细的场景设定描述",
  "first_mes": "角色的开场白",
  "mes_example": "对话示例，格式：<START>\\n{{user}}: 用户话语\\n角色名: 角色回答",
  "system_prompt": "系统提示词，指导AI如何扮演这个角色",
  "post_history_instructions": "历史后指令",
  "tags": ["相关标签"],
  "creator_notes": "创作者备注"
}`;

    const typeSpecificPrompts = {
      general: `${baseInstructions}

根据内容智能分析并提取角色信息。${jsonFormat}`,

      anime: `${baseInstructions}

这是动漫角色，请生成：
- description: 详细描述外观、服装、身材特征
- personality: 详细的性格特征和说话习惯
- scenario: 动漫世界背景设定
- first_mes: 符合动漫角色风格的开场白
- mes_example: 体现角色说话风格的对话示例${jsonFormat}`,

      game: `${baseInstructions}

这是游戏角色，请生成：
- description: 角色外观、装备、特殊能力描述
- personality: 性格特征、战斗风格、价值观念
- scenario: 游戏世界背景设定
- first_mes: 符合游戏角色身份的开场白
- mes_example: 包含多种场景的对话示例${jsonFormat}`,

      novel: `${baseInstructions}

这是小说角色，请生成：
- description: 细致的外貌描写
- personality: 深层心理特征、性格复杂性
- scenario: 小说时代背景、环境设定
- first_mes: 富有文学色彩的开场白
- mes_example: 体现角色思想深度的对话${jsonFormat}`,

      historical: `${baseInstructions}

这是历史人物，请生成：
- description: 基于史料的外貌和服饰描述
- personality: 基于历史记录的性格特征
- scenario: 详细的历史背景环境
- first_mes: 符合历史人物身份的开场白
- mes_example: 体现历史人物智慧的对话${jsonFormat}`
    };

    return typeSpecificPrompts[type as keyof typeof typeSpecificPrompts] || typeSpecificPrompts.general;
  };

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

    // 创建新的 AbortController
    abortControllerRef.current = new AbortController();
    setIsGenerating(true);
    
    try {
      const prompt = getPromptByType(characterType, inputText);
      console.log('Generated prompt length:', prompt.length);
      console.log('Prompt preview:', prompt.substring(0, 200) + '...');
      
      const result = await generateWithAI(aiSettings, prompt);
      console.log('AI result:', result);
      
      // 更强健的JSON解析
      try {
        // 首先尝试直接解析整个结果
        let jsonData;
        try {
          jsonData = JSON.parse(result);
        } catch {
          // 如果失败，尝试提取JSON部分
          const jsonMatch = result.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            jsonData = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error("未找到有效的JSON格式");
          }
        }
        
        // 验证解析结果是否包含基本字段
        if (typeof jsonData === 'object' && jsonData !== null) {
          setParsedData(jsonData);
          toast({
            title: "生成成功",
            description: "角色信息已成功解析，可以一键插入到表单中"
          });
        } else {
          throw new Error("解析结果格式不正确");
        }
      } catch (parseError) {
        console.error('JSON解析失败:', parseError);
        console.error('原始结果:', result);
        toast({
          title: "解析失败",
          description: "生成的内容格式有误，请重试或检查AI设置",
          variant: "destructive"
        });
      }
    } catch (error) {
      // 检查是否是用户主动取消
      if (error instanceof Error && error.name === 'AbortError') {
        toast({
          title: "已取消",
          description: "AI生成已被用户取消"
        });
      } else {
        console.error('生成失败:', error);
        toast({
          title: "生成失败",
          description: error instanceof Error ? error.message : "未知错误，请检查AI设置或网络连接",
          variant: "destructive"
        });
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const cancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
      abortControllerRef.current = null;
      toast({
        title: "已取消",
        description: "AI生成已取消"
      });
    }
  };

  const insertAllFields = () => {
    if (!parsedData) return;

    let insertedCount = 0;

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

  const selectedType = CHARACTER_TYPES.find(type => type.value === characterType);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          AI角色卡助手
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          粘贴任意文本内容，选择角色类型，AI将智能提取并生成详细的角色信息
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              角色类型
            </label>
            <Select value={characterType} onValueChange={setCharacterType}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CHARACTER_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-xs text-gray-500">{type.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              文本内容
            </label>
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="在此粘贴角色相关的文本内容：
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
        </div>

        <div className="flex gap-2">
          {!isGenerating ? (
            <Button
              onClick={generateCharacterData}
              disabled={!inputText.trim()}
              className="flex-1"
            >
              <Wand className="w-4 h-4 mr-2" />
              {`AI分析生成 (${selectedType?.label})`}
            </Button>
          ) : (
            <Button
              onClick={cancelGeneration}
              variant="destructive"
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              取消生成
            </Button>
          )}
          
          {parsedData && (
            <Button
              onClick={generateCharacterData}
              disabled={isGenerating}
              variant="outline"
              title="重新生成"
            >
              <RefreshCcw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
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
            
            <div className="space-y-3 max-h-[400px] overflow-y-auto bg-gray-50 dark:bg-gray-800 rounded-lg p-3 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 dark:scrollbar-track-gray-700 dark:scrollbar-thumb-gray-600 hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500">
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
              💡 点击"一键插入全部"将所有解析结果自动填入对应的表单字段中，您可以在下方表单中进一步编辑和完善。
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIAssistant;
