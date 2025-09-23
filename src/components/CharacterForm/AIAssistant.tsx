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

/**
 * Array of predefined character type options used by the AI assistant form.
 *
 * Each element is an option object with the following properties:
 * - value: string — machine-friendly identifier for the option
 * - label: string — human-facing label shown in the UI
 * - description: string — short description of the option's purpose
 *
 * The array contains these predefined types:
 * - "general": Intelligent sorting (default) — Directly organize the content pasted by users
 * - "anime": anime characters — Character settings based on anime and comics
 * - "game": game character — Character settings from games
 * - "novel": novel — Character settings in literary works
 * - "historical": historical figure — Real historical figure settings
 *
 * Typical usage: populate dropdowns or radio groups, and switch assistant behavior based on the selected type.
 *
 * @constant
 * @readonly
 * @type {{ value: string; label: string; description: string }[]}
 * @default "general"
 */
const CHARACTER_TYPES = [
  { value: "general", label: "Intelligent sorting (default)", description: "Directly organize the content pasted by users" },
  { value: "anime", label: "anime characters", description: "character settings based on anime and comics" },
  { value: "game", label: "game character", description: "character settings from the game" },
  { value: "novel", label: "novel", description: "character settings in literary works" },
  { value: "historical", label: "historical figure", description: "real historical figure settings" }
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
    // Limit the length of input content to avoid too long prompt words
    const truncatedContent = content.length > 2000 ? content.substring(0, 2000) + "..." : content;

    const baseInstructions = `Please generate role card information based on the following content.

Enter content:
${truncatedContent}

Please output strictly in JSON format and do not add any other text:`;

    const jsonFormat = `
{
"name": "role name",
"description": "Detailed character appearance description",
"personality": "Detailed description of personality traits",
"scenario": "Detailed scene setting description",
"first mes": "The character's opening remark",
"mes example": "Dialogue example, format: <START>\\n{{user}}: User Discourse\\nRole name: Role answer",
"system prompt": "System prompt word to guide AI how to play this role",
"post history instructions": "post history instructions",
"tags": ["Related tags"],
"creator notes": "creator notes"
}`;

    const typeSpecificPrompts = {
      general: `${baseInstructions}

Intelligent analysis and extract role information based on the content.${jsonFormat}`,

      anime: `${baseInstructions}

This is an anime character, please generate:
- description: Describe the appearance, clothing, and body characteristics in detail
- personality: Detailed personality traits and speaking habits
- scenario: Anime world background settings
- first mes: Opening remarks that fit the anime character style
- mes example: A dialogue example that reflects the character's speaking style ${jsonFormat
    }`,

      game: `${ baseInstructions }

This is the game character, please generate:
- description: Character appearance, equipment, special ability description
- personality: personality traits, combat style, values
- scenario: Game world background settings
- first mes: Opening remarks that match the identity of the game character
- mes example: A dialogue example containing multiple scenarios ${jsonFormat } `,

      novel: `${ baseInstructions }

This is the novel character, please generate:
- description: detailed appearance description
- personality: Deep psychological characteristics and personality complexity
- scenario: The background and environment setting of novel era
- first mes: Literary opening remarks
- mes example: dialogue that reflects the depth of the character's thoughts ${jsonFormat}`,

    historical: `${baseInstructions}

This is a historical figure, please generate: 
- description: Appearance and clothing description based on historical materials 
- personality: Character traits based on history 
- scenario: Detailed historical context 
- first mes: Opening remarks that match the identity of historical figures 
- mes example: A dialogue that embodies the wisdom of historical figures ${jsonFormat
  }` 
};

    return typeSpecificPrompts[type as keyof typeof typeSpecificPrompts] || typeSpecificPrompts.general;
  };

  const generateCharacterData = async () => {
    if (!inputText.trim()) {
      toast({
        title: "hint",
        description: "Please enter the content you want to convert first",
        variant: "destructive"
      });
      return;
    }

    if (!aiSettings) {
      toast({
        title: "hint",
        description: "Please configure AI settings first",
        variant: "destructive"
      });
      return;
    }

    // Create a new one AbortController
    abortControllerRef.current = new AbortController();
    setIsGenerating(true);

    try {
      const prompt = getPromptByType(characterType, inputText);
      console.log('Generated prompt length:', prompt.length);
      console.log('Prompt preview:', prompt.substring(0, 200) + '...');

      const result = await generateWithAI(aiSettings, prompt);
      console.log('AI result:', result);

      // More robust JSON parsing
      try {
        // First try to parse the entire result directly
        let jsonData;
        try {
          jsonData = JSON.parse(result);
        } catch {
          // If it fails, try to extract the JSON part
          const jsonMatch = result.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            jsonData = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error("No valid JSON format found");
          }
        }

        // Verify that the parsing results contain basic fields
        if (typeof jsonData === 'object' && jsonData !== null) {
          setParsedData(jsonData);
          toast({
            title: "Generate successfully",
            description: "The role information has been successfully parsed and can be inserted into the form with one click."
          });
        } else {
          throw new Error("The parsing result is incorrect format");
        }
      } catch (parseError) {
        console.error('JSON parsing failed:', parseError);
        console.error('Original results:', result);
        toast({
          title: "Analysis failed",
          description: "The generated content format is incorrect. Please try again or check the AI ​​settings.",
          variant: "destructive"
        });
      }
    } catch (error) {
      // Check whether the user actively cancels it
      if (error instanceof Error && error.name === 'AbortError') {
        toast({
          title: "Canceled",
          description: "AI generation has been canceled by the user"
        });
      } else {
        console.error('Generation failed:', error);
        toast({
          title: "Generation failed",
          description: error instanceof Error ? error.message : "Unknown error, please check AI settings or network connection",
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
        title: "Canceled",
        description: "AI generation has been canceled"
      });
    }
  };

  const insertAllFields = () => {
    if (!parsedData) return;

    let insertedCount = 0;

    // Insert all fields with values
    Object.entries(parsedData).forEach(([key, value]) => {
      if (value && (Array.isArray(value) ? value.length > 0 : value.trim())) {
        onInsertField(key, value);
        insertedCount++;
      }
    });

    if (insertedCount > 0) {
      toast({
        title: "Insert successfully",
        description: `Successfully inserted ${ insertedCount } Fields into the role card form`
      });
    } else {
      toast({
        title: "No data to be inserted",
        description: "There is no valid data in the parsing result that can be inserted",
        variant: "destructive"
      });
    }
  };

  const getFieldLabel = (field: string): string => {
    const labels: Record<string, string> = {
      name: "role name",
      description: "Role description",
      personality: "character traits",
      scenario: "Scene Setting",
      first_mes: "First message",
      mes_example: "Conversation Example",
      system_prompt: "system prompt word",
      post_history_instructions: "Post history instructions",
      tags: "tag",
      creator_notes: "Creator notes"
    };
    return labels[field] || field;
  };

  const getPreviewText = (value: any) => {
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    const text = value.toString();
    return text.length > 150 ? `${ text.substring(0, 150) }...` : text;
  };

  const selectedType = CHARACTER_TYPES.find(type => type.value === characterType);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          AI character card assistant
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Paste any text content, select the role type, and the AI ​​will intelligently extract and generate detailed role information
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Role Type
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
              Text content
            </label>
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste the text content related to the role here:
• Role Introduction Article 
• Wikipedia page 
• Character description of novels 
• Game character information 
• Introduction to cartoon characters 
etc..."
              className="min-h-[200px] text-sm"
              showCounter={true}
              showTokens={true}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={isGenerating ? cancelGeneration : generateCharacterData}
            disabled={!isGenerating && !inputText.trim()}
            variant={isGenerating ? "destructive" : "default"}
            className="flex-1"
          >
            {isGenerating ? (
              <>
                <X className="w-4 h-4 mr-2" />
                Cancel Generate
              </>
            ) : (
              <>
                <Wand className="w-4 h-4 mr-2" />
                {`AI analysis generation(${ selectedType?.label })`}
              </>
            )}
          </Button>

          {parsedData && !isGenerating && (
            <Button
              onClick={generateCharacterData}
              variant="outline"
              title="Regenerate"
            >
              <RefreshCcw className="w-4 h-4" />
            </Button>
          )}
        </div>

        {parsedData && (
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-800 dark:text-gray-200">AI parsing results</h4>
              <Button
                onClick={insertAllFields}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Insert all with one click
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
              Click "Insert All with One Click" to automatically fill all the parsing results into the corresponding form fields. You can further edit and improve them in the form below.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIAssistant;
