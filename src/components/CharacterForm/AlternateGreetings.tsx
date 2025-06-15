
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, X, Edit2, Check, Sparkles, Loader2 } from "lucide-react";
import { generateWithAI, generateAlternateGreeting } from "@/utils/aiGenerator";
import { AISettings } from "@/components/AISettings";
import { useToast } from "@/hooks/use-toast";

interface AlternateGreetingsProps {
  greetings: string[];
  updateField: (field: string, value: any) => void;
  aiSettings: AISettings | null;
  characterData: any;
}

const AlternateGreetings = ({ greetings, updateField, aiSettings, characterData }: AlternateGreetingsProps) => {
  const [newGreeting, setNewGreeting] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const addGreeting = () => {
    if (newGreeting.trim()) {
      updateField("alternate_greetings", [...greetings, newGreeting.trim()]);
      setNewGreeting("");
    }
  };

  const removeGreeting = (index: number) => {
    updateField("alternate_greetings", greetings.filter((_, i) => i !== index));
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditingText(greetings[index]);
  };

  const saveEdit = () => {
    if (editingIndex !== null) {
      const updatedGreetings = [...greetings];
      updatedGreetings[editingIndex] = editingText;
      updateField("alternate_greetings", updatedGreetings);
      setEditingIndex(null);
      setEditingText("");
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditingText("");
  };

  const handleAIGenerateGreeting = async () => {
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
      const prompt = generateAlternateGreeting(characterData);
      const result = await generateWithAI(aiSettings, prompt);
      updateField("alternate_greetings", [...greetings, result]);
      toast({
        title: "生成成功",
        description: "备用问候语已生成完成"
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
        <h3 className="text-lg font-semibold text-gray-800 mb-4">备用问候语</h3>
        <Button
          size="sm"
          variant="outline"
          onClick={handleAIGenerateGreeting}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 mr-2" />
          )}
          AI生成问候语
        </Button>
      </div>
      
      <div className="form-group">
        <Label className="text-sm font-medium text-gray-700">添加新问候语</Label>
        <div className="flex gap-2 mt-1">
          <Textarea
            value={newGreeting}
            onChange={(e) => setNewGreeting(e.target.value)}
            placeholder="添加备用问候语..."
            className="min-h-[60px]"
          />
          <Button onClick={addGreeting} size="sm" className="self-end">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {greetings.map((greeting, index) => (
          <div key={index} className="p-4 bg-gray-50 rounded-lg relative">
            <div className="absolute top-2 left-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
              问候语 {index + 1}
            </div>
            {editingIndex === index ? (
              <div className="space-y-2 pt-6">
                <Textarea
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  className="min-h-[80px]"
                />
                <div className="flex gap-2">
                  <Button onClick={saveEdit} size="sm" variant="default">
                    <Check className="w-4 h-4 mr-1" />
                    保存
                  </Button>
                  <Button onClick={cancelEdit} size="sm" variant="outline">
                    取消
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="absolute top-2 right-2 flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => startEditing(index)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeGreeting(index)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm pr-16 pt-6 whitespace-pre-wrap">{greeting}</p>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlternateGreetings;
