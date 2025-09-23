
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
        title: t('configError') || "Configuration error",
        description: t('configApiKey') || "Please configure the API key in the AI settings first",
        variant: "destructive"
      });
      return;
    }

    if (!characterData.name || !characterData.description) {
      toast({
        title: t('incompleteInfo') || "Incomplete information",
        description: t('fillNameDesc') || "Please fill in the role name and role description first",
        variant: "destructive"
      });
      return;
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);

    try {
      const prompt = generateTags(characterData);
      const result = await generateWithAI(aiSettings, prompt);

      // Parses tag strings returned by AI
      const newTags = result.split(/[,，]/).map(tag => tag.trim()).filter(tag => tag);
      const uniqueTags = [...new Set([...tags, ...newTags])];

      updateField("tags", uniqueTags);
      toast({
        title: t('generateSuccess') || "Generate successfully",
        description: t('tagsGenerated') || "Tag generation completed"
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        toast({
          title: "Canceled",
          description: "AI generation has been canceled by the user"
        });
      } else {
        toast({
          title: t('generateError') || "Generation failed",
          description: error instanceof Error ? error.message : t('unknownError') || "Unknown error",
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
        title: "Canceled",
        description: "AI generation has been canceled"
      });
    }
  };

  const handleClearAll = () => {
    updateField("tags", []);
    toast({
      title: "Cleared",
      description: "All tags have been cleared"
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
              Regenerate
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
                Cancel
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3 mr-1" />
                AI Generate Tags
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
            Clear
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
