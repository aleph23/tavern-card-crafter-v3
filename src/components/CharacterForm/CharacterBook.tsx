
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, X, Sparkles, Loader2 } from "lucide-react";
import { generateWithAI, generateCharacterBookEntry } from "@/utils/aiGenerator";
import { AISettings } from "@/components/AISettings";
import { useToast } from "@/hooks/use-toast";

interface CharacterBookEntry {
  keys: string[];
  content: string;
  insertion_order: number;
  enabled: boolean;
}

interface CharacterBookProps {
  entries: CharacterBookEntry[];
  updateField: (field: string, value: any) => void;
  aiSettings: AISettings | null;
  characterData: any;
}

const CharacterBook = ({ entries, updateField, aiSettings, characterData }: CharacterBookProps) => {
  const [newEntryKeys, setNewEntryKeys] = useState("");
  const [newEntryContent, setNewEntryContent] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const addBookEntry = () => {
    if (newEntryKeys.trim() && newEntryContent.trim()) {
      const keys = newEntryKeys.split(',').map(k => k.trim()).filter(k => k);
      const entry: CharacterBookEntry = {
        keys,
        content: newEntryContent.trim(),
        insertion_order: 100,
        enabled: true
      };
      
      updateField("character_book", {
        entries: [...entries, entry]
      });
      
      setNewEntryKeys("");
      setNewEntryContent("");
    }
  };

  const removeBookEntry = (index: number) => {
    updateField("character_book", {
      entries: entries.filter((_, i) => i !== index)
    });
  };

  const handleAIGenerateEntry = async () => {
    if (!aiSettings?.apiKey) {
      toast({
        title: "配置错误",
        description: "请先在AI设置中配置API密钥",
        variant: "destructive"
      });
      return;
    }

    if (!characterData.name || !characterData.description) {
      toast({
        title: "信息不完整",
        description: "请先填写角色名称和角色描述",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const prompt = generateCharacterBookEntry(characterData);
      const result = await generateWithAI(aiSettings, prompt);
      
      // 解析AI返回的内容，尝试提取关键词和内容
      const lines = result.split('\n').filter(line => line.trim());
      let keys: string[] = [];
      let content = result;
      
      // 尝试解析格式化的回复
      for (const line of lines) {
        if (line.includes('关键词:') || line.includes('关键词：')) {
          const keywordsMatch = line.match(/关键词[:：]\s*(.+)/);
          if (keywordsMatch) {
            keys = keywordsMatch[1].split(/[,，]/).map(k => k.trim()).filter(k => k);
          }
        } else if (line.includes('内容:') || line.includes('内容：')) {
          const contentMatch = line.match(/内容[:：]\s*(.+)/);
          if (contentMatch) {
            content = lines.slice(lines.indexOf(line)).join('\n').replace(/^内容[:：]\s*/, '');
            break;
          }
        }
      }
      
      // 如果没有解析到关键词，使用角色名作为关键词
      if (keys.length === 0) {
        keys = [characterData.name];
      }
      
      const entry: CharacterBookEntry = {
        keys,
        content: content.trim(),
        insertion_order: 100,
        enabled: true
      };
      
      updateField("character_book", {
        entries: [...entries, entry]
      });
      
      toast({
        title: "生成成功",
        description: "角色书条目已生成完成"
      });
    } catch (error) {
      toast({
        title: "生成失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">角色书</h3>
        <Button
          size="sm"
          variant="outline"
          onClick={handleAIGenerateEntry}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 mr-2" />
          )}
          AI生成条目
        </Button>
      </div>
      
      <div>
        <Label className="text-sm font-medium text-gray-700">添加新条目</Label>
        <div className="space-y-2 mt-2">
          <Input
            value={newEntryKeys}
            onChange={(e) => setNewEntryKeys(e.target.value)}
            placeholder="关键词（用逗号分隔）..."
          />
          <Textarea
            value={newEntryContent}
            onChange={(e) => setNewEntryContent(e.target.value)}
            placeholder="条目内容..."
            className="min-h-[80px]"
          />
          <Button onClick={addBookEntry} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            添加条目
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {entries.map((entry, index) => (
          <div key={index} className="p-3 bg-gray-50 rounded-lg relative">
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-1 right-1"
              onClick={() => removeBookEntry(index)}
            >
              <X className="w-4 h-4" />
            </Button>
            <div className="pr-8">
              <div className="text-sm font-medium text-gray-700 mb-1">
                关键词: {entry.keys.join(', ')}
              </div>
              <p className="text-sm text-gray-600">{entry.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CharacterBook;
