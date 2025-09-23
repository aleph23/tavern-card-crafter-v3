
import { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, RefreshCcw, Trash2, X } from "lucide-react";
import { generateWithAI, generatePersonality, generateScenario, generategreeting, generatechatEx } from "@/utils/aiGenerator";
import { AISettings } from "@/components/AISettings";
import { useToast } from "@/hooks/use-toast";

interface PersonalitySectionProps {
  data: any;
  updateField: (field: string, value: any) => void;
  aiSettings: AISettings | null;
}

const PersonalitySection = ({ data, updateField, aiSettings }: PersonalitySectionProps) => {
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const abortControllerRefs = useRef<{ [key: string]: AbortController | null }>({});
  const { toast } = useToast();

  const handleAIGenerate = async (field: string, promptGenerator: (data: any) => string) => {
    if (!aiSettings?.apiKey && !['ollama', 'lmstudio'].includes(aiSettings?.provider?.toLowerCase() || '')) {
      toast({
        title: "Configuration error",
        description: "Please configure the API key in the AI settings first",
        variant: "destructive"
      });
      return;
    }

    if (!data.name || !data.description) {
      toast({
        title: "Incomplete information",
        description: "Please fill in the role name and role description first",
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

  const renderFieldButtons = (field: string, promptGenerator: (data: any) => string, dependencies?: string[]) => {
    const isLoading = loading[field];
    const canGenerate = dependencies ? dependencies.every(dep => data[dep]) : true;

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
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Character setting</h3>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="personality" className="text-sm font-medium text-gray-300">Character traits *</Label>
          {renderFieldButtons('personality', generatePersonality, ['name', 'description'])}
        </div>
        <Textarea
          id="personality"
          value={data.personality}
          onChange={(e) => updateField("personality", e.target.value)}
          placeholder="Describe character traits, behavior patterns and habits of a character..."
          className="mt-1 min-h-[100px]"
          showCounter={true}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="scenario" className="text-sm font-medium text-gray-300">Scene setting *</Label>
          {renderFieldButtons('scenario', generateScenario, ['name', 'description', 'personality'])}
        </div>
        <Textarea
          id="scenario"
          value={data.scenario}
          onChange={(e) => updateField("scenario", e.target.value)}
          placeholder="Set the interactive scene and background..."
          className="mt-1 min-h-[100px]"
          showCounter={true}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="greeting" className="text-sm font-medium text-gray-300">First message *</Label>
          {renderFieldButtons('greeting', generategreeting, ['name', 'description', 'personality', 'scenario'])}
        </div>
        <Textarea
          id="greeting"
          value={data.greeting}
          onChange={(e) => updateField("greeting", e.target.value)}
          placeholder="The character's opening remarks..."
          className="mt-1 min-h-[100px]"
          showCounter={true}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="exchat" className="text-sm font-medium text-gray-300">Dialogue example</Label>
          {renderFieldButtons('exchat', generatechatEx, ['name', 'description', 'personality', 'greeting'])}
        </div>
        <Textarea
          id="exchat"
          value={data.exchat}
          onChange={(e) => updateField("exchat", e.target.value)}
          placeholder="Sample dialogue that helps define how a character speaks..."
          className="mt-1 min-h-[120px]"
          showCounter={true}
        />
      </div>
    </div>
  );
};

export default PersonalitySection;
