
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, X, Edit2, Check, Sparkles, Loader2, RefreshCcw, Trash2 } from "lucide-react";
import { generateWithAI, generateAlternateGreeting } from "@/utils/aiGenerator";
import { AISettings } from "@/components/AISettings";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { t } = useLanguage();

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
    if (!aiSettings?.apiKey && !['ollama', 'lmstudio'].includes(aiSettings?.provider?.toLowerCase() || '')) {
      toast({
        title: t('configError') || "配置错误",
        description: t('configApiKey') || "请先在AI设置中配置API密钥",
        variant: "destructive"
      });
      return;
    }

    if (!characterData.name || !characterData.description) {
      toast({
        title: t('incompleteInfo') || "信息不完整",
        description: t('fillNameDesc') || "请先填写角色名称和角色描述",
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
        title: t('generateSuccess') || "生成成功",
        description: t('alternateGreetingGenerated') || "备用问候语已生成完成"
      });
    } catch (error) {
      toast({
        title: t('generateError') || "生成失败",
        description: error instanceof Error ? error.message : t('unknownError') || "未知错误",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = () => {
    updateField("alternate_greetings", []);
    toast({
      title: "已清空",
      description: "所有备选问候语已清空"
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">{t('alternateGreetings')}</h3>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={handleAIGenerateGreeting}
            disabled={loading}
            className="h-8 px-2 text-xs"
          >
            {loading ? (
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            ) : (
              <RefreshCcw className="w-3 h-3 mr-1" />
            )}
            重新生成
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleAIGenerateGreeting}
            disabled={loading}
            className="h-8 px-2 text-xs"
          >
            {loading ? (
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            ) : (
              <Sparkles className="w-3 h-3 mr-1" />
            )}
            AI生成
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleClearAll}
            className="h-8 px-2 text-xs"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            清空
          </Button>
        </div>
      </div>
      
      <div className="form-group">
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">{t('addNewGreeting') || '添加新问候语'}</Label>
        <div className="flex gap-2 mt-1">
          <Textarea
            value={newGreeting}
            onChange={(e) => setNewGreeting(e.target.value)}
            placeholder={t('addAlternateGreetingPlaceholder') || "添加备用问候语..."}
            className="min-h-[60px]"
          />
          <Button onClick={addGreeting} size="sm" className="self-end bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {greetings.map((greeting, index) => (
          <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg relative">
            <div className="absolute top-2 left-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2 py-1 rounded-full">
              {t('greeting') || '问候语'} {index + 1}
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
                    {t('save') || '保存'}
                  </Button>
                  <Button onClick={cancelEdit} size="sm" variant="outline">
                    {t('cancel') || '取消'}
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
                <p className="text-sm pr-16 pt-6 whitespace-pre-wrap text-gray-700 dark:text-gray-200">{greeting}</p>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlternateGreetings;
