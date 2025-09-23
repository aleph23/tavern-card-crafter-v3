
import { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, RefreshCcw, Trash2, X } from "lucide-react";
import { generateWithAI, generateSystemPrompt, generatePostHistoryInstructions } from "@/utils/aiGenerator";
import { AISettings } from "@/components/AISettings";
import { useToast } from "@/hooks/use-toast";

interface PromptsSectionProps {
  data: any;
  updateField: (field: string, value: any) => void;
  aiSettings: AISettings | null;
}

const PromptsSection = ({ data, updateField, aiSettings }: PromptsSectionProps) => {
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const abortControllerRefs = useRef<{ [key: string]: AbortController | null }>({});
  const { toast } = useToast();

  const handleAIGenerate = async (field: string, promptGenerator: (data: any) => string) => {
    if (!aiSettings?.apiKey && !['ollama', 'lmstudio'].includes(aiSettings?.provider?.toLowerCase() || '')) {
      toast({
        title: "Configuration error",
        description: "Please configure the API key in the AI ​​settings first",
        variant: "destructive"
      });
      return;
    }

    if (!data.name || !data.description || !data.personality) {
      toast({
        title: "Incomplete information",
        description: "Please fill in the basic information first",
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
        title: "Generate successfully",
        description: `${field} Generated completed`
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        toast({
          title: "Canceled",
          description: "AI generation has been canceled by the user"
        });
      } else {
        toast({
          title: "Generation failed",
          description: error instanceof Error ? error.message : "Unknown error",
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
        title: "Canceled",
        description: "AI generation has been canceled"
      });
    }
  };

  const handleClearField = (field: string) => {
    updateField(field, "");
    toast({
      title: "Cleared",
      description: `${field} Cleared`
    });
  };

  const renderFieldButtons = (field: string, promptGenerator: (data: any) => string) => {
    const isLoading = loading[field];
    const canGenerate = data.name && data.description && data.personality;

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
            Regenerate
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
              Cancel
            </>
          ) : (
            <>
              <Sparkles className="w-3 h-3 mr-1" />
              AI generation
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
          Clear
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Prompt word settings</h3>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="system_prompt" className="text-sm font-medium text-gray-700">System prompt words</Label>
          {renderFieldButtons('system_prompt', generateSystemPrompt)}
        </div>
        <Textarea
          id="system_prompt"
          value={data.system_prompt}
          onChange={(e) => updateField("system_prompt", e.target.value)}
          placeholder="Give AI System-level instructions..."
          className="mt-1 min-h-[100px]"
          showCounter={true}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="post_history" className="text-sm font-medium text-gray-700">Post-historical instructions</Label>
          {renderFieldButtons('post_history_instructions', generatePostHistoryInstructions)}
        </div>
        <Textarea
          id="post_history"
          value={data.post_history_instructions}
          onChange={(e) => updateField("post_history_instructions", e.target.value)}
          placeholder="Instructions appear after chat history..."
          className="mt-1 min-h-[100px]"
          showCounter={true}
        />
      </div>
    </div>
  );
};

export default PromptsSection;
