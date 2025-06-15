
import { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Sparkles, Loader2, RefreshCcw, Trash2 } from "lucide-react";
import { generateWithAI, generateTags } from "@/utils/aiGenerator";
import { AISettings } from "@/components/AISettings";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface TagsSectionProps {
  tags: string[];
  updateField: (field: string, value: any) => void;
  aiSettings: AISettings | null;
  characterData: any;
}

const TagsSection = ({ tags, updateField, aiSettings, characterData }: TagsSectionProps) => {
  const [newTag, setNewTag] = useState("");
  const [loading, setLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      updateField("tags", [...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateField("tags", tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleAIGenerateTags = async () => {
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

    abortControllerRef.current = new AbortController();
    setLoading(true);
    
    try {
      const prompt = generateTags(characterData);
      const result = await generateWithAI(aiSettings, prompt);
      
      // 解析AI返回的标签字符串
      const newTags = result.split(/[,，]/).map(tag => tag.trim()).filter(tag => tag);
      const uniqueTags = [...new Set([...tags, ...newTags])];
      
      updateField("tags", uniqueTags);
      toast({
        title: t('generateSuccess') || "生成成功",
        description: t('tagsGenerated') || "标签已生成完成"
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        toast({
          title: "已取消",
          description: "AI生成已被用户取消"
        });
      } else {
        toast({
          title: t('generateError') || "生成失败",
          description: error instanceof Error ? error.message : t('unknownError') || "未知错误",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const cancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setLoading(false);
      abortControllerRef.current = null;
      toast({
        title: "已取消",
        description: "AI生成已取消"
      });
    }
  };

  const handleClearAll = () => {
    updateField("tags", []);
    toast({
      title: "已清空",
      description: "所有标签已清空"
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{t('tags')}</h3>
        <div className="flex gap-1">
          {!loading && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleAIGenerateTags}
              className="h-8 px-2 text-xs"
            >
              <RefreshCcw className="w-3 h-3 mr-1" />
              重新生成
            </Button>
          )}
          <Button
            size="sm"
            variant={loading ? "destructive" : "outline"}
            onClick={loading ? cancelGeneration : handleAIGenerateTags}
            disabled={!loading && (!characterData.name || !characterData.description)}
            className="h-8 px-2 text-xs"
          >
            {loading ? (
              <>
                <X className="w-3 h-3 mr-1" />
                取消
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3 mr-1" />
                AI生成标签
              </>
            )}
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
      
      <div className="flex gap-2">
        <Input
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={t('enterTag') || "输入标签..."}
          className="flex-1"
        />
        <Button onClick={addTag} size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <Badge key={index} variant="secondary" className="flex items-center gap-1">
            {tag}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => removeTag(tag)}
              className="h-auto p-0 w-4 h-4 hover:bg-transparent"
            >
              <X className="w-3 h-3" />
            </Button>
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default TagsSection;
