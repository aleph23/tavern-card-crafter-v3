/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useRef, memo } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, RefreshCcw, Trash2, X } from "lucide-react";
import { generateWithAI, generatePersonality, generateScenario, generateFirstMes, generateMesExample } from "@/utils/aiGenerator";
import { AISettings } from "@/types/aisettings";
import { useToast } from "@/hooks/use-toast";

interface PersonalitySectionProps {
  data: any;
  updateField: (field: string, value: any) => void;
  aiSettings: AISettings | null;
}

/**
 * Renders the personality section of a character setting interface.
 *
 * This component manages the state of various fields related to character traits, scene settings, and dialogue examples. It provides functionality to generate content using AI based on user input, handle loading states, and clear fields. The component also ensures that necessary dependencies are met before allowing AI generation and displays appropriate toast notifications for user feedback.
 *
 * @param {Object} props - The properties for the PersonalitySection component.
 * @param {Object} props.data - The current data for the personality section.
 * @param {Function} props.updateField - Function to update a specific field in the data.
 * @param {Object} props.aiSettings - Configuration settings for AI generation.
 */
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
        description: "Please fill in the Card name and role description first",
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

  /**
   * Cancels the AI generation process for the specified field.
   */
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

  /**
   * Clears the specified field and shows a toast notification.
   */
  const handleClearField = (field: string) => {
    updateField(field, "");
    toast({
      title: "Cleared",
      description: `${field} Cleared`
    });
  };

  /**
   * Renders a set of buttons for field actions including regeneration, cancellation, and clearing.
   * The function checks the loading state of the field and whether all dependencies are satisfied
   * before enabling the respective buttons. It utilizes the promptGenerator to handle AI generation
   * and manages the loading state to provide user feedback through button variants and labels.
   *
   * @param field - The identifier for the field being rendered.
   * @param promptGenerator - A function that generates a prompt based on the provided data.
   * @param dependencies - An optional array of dependencies that must be satisfied for button actions.
   */
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
      <h3 className="text-lg font-semibold text-gray-400 mb-4">Character setting</h3>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="personality" className="text-sm font-medium text-gray-300">Character traits *</Label>
          {renderFieldButtons('personality', generatePersonality, ['name', 'description'])}
        </div>
        <Textarea
          id="personality"
          value={data.personality}
          onChange={(e) => updateField("personality", e.target.value)}
          placeholder="In a succinct, non-prosaic list, describe the character's traits, behavior, idiosyncracies, likes/dislikes, strengths/weaknesses, backstory"
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
          placeholder="Describe the backstory and meta-environment..."
          className="mt-1 min-h-[100px]"
          showCounter={true}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="first_mes" className="text-sm font-medium text-gray-300">First message *</Label>
          {renderFieldButtons('first_mes', generateFirstMes, ['name', 'description', 'personality', 'scenario'])}
        </div>
        <Textarea
          id="first_mes"
          value={data.first_mes}
          onChange={(e) => updateField("first_mes", e.target.value)}
          placeholder="This is the first outward facing component and should be written in the style of a great literary master. It is a long paragraph portraying how this character first meets the user/player in this game..."
          className="mt-1 min-h-[100px]"
          showCounter={true}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="mes_example" className="text-sm font-medium text-gray-300">Dialogue example</Label>
          {renderFieldButtons('mes_example', generateMesExample, ['name', 'description', 'personality', 'first_mes'])}
        </div>
        <Textarea
          id="mes_example"
          value={data.mes_example}
          onChange={(e) => updateField("mes_example", e.target.value)}
          placeholder="Sample dialogue that helps define how a character speaks..."
          className="mt-1 min-h-[120px]"
          showCounter={true}
        />
      </div>
    </div>
  );
};

export default memo(PersonalitySection, (prevProps, nextProps) => {
  return (
    prevProps.data.name === nextProps.data.name &&
    prevProps.data.description === nextProps.data.description &&
    prevProps.data.personality === nextProps.data.personality &&
    prevProps.data.scenario === nextProps.data.scenario &&
    prevProps.data.first_mes === nextProps.data.first_mes &&
    prevProps.data.mes_example === nextProps.data.mes_example &&
    prevProps.aiSettings === nextProps.aiSettings &&
    prevProps.updateField === nextProps.updateField
  );
});
