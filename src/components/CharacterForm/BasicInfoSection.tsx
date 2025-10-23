/* eslint-disable @typescript-eslint/no-explicit-any */

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Upload, X, Sparkles, Loader2, RefreshCcw, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { generateWithAI, generateDescription } from "@/utils/aiGenerator";
import { AISettings } from "@/components/AISettings";
import { useToast } from "@/hooks/use-toast";

interface BasicInfoSectionProps {
  data: any;
  updateField: (field: string, value: any) => void;
  characterImage: string | null;
  setCharacterImage: (image: string | null) => void;
  aiSettings: AISettings | null;
}

/**
 * Renders the Basic Information section for a character, including image upload, name, nickname, and description.
 *
 * This component manages the state for loading, image upload, and AI-generated descriptions. It validates the AI settings and character name before generating a description. The component also provides functionality to clear the description and cancel ongoing AI generation requests.
 *
 * @param {Object} props - The properties for the BasicInfoSection component.
 * @param {Object} props.data - The character data including name, nickname, and description.
 * @param {Function} props.updateField - Function to update a specific field in the character data.
 * @param {string} props.characterImage - The URL of the character's avatar image.
 * @param {Function} props.setCharacterImage - Function to set the character's avatar image.
 * @param {Object} props.aiSettings - The settings for AI generation, including API key and provider.
 * @returns {JSX.Element} The rendered Basic Information section.
 */
const BasicInfoSection = ({ data, updateField, characterImage, setCharacterImage, aiSettings }: BasicInfoSectionProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { toast } = useToast();

  /**
   * Handles the image upload from an input element.
   *
   * This function retrieves the first file from the input event, reads it as a data URL using a FileReader,
   * and sets the character image with the result once the file is successfully loaded.
   * It ensures that the file exists before attempting to read it, preventing potential errors.
   *
   * @param event - The change event from the input element containing the uploaded file.
   */
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCharacterImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Handles the AI generation of a description based on provided data.
   *
   * The function first checks for the presence of an API key and the provider's validity.
   * It then verifies that the card name is filled in before proceeding to generate a description using AI.
   * If successful, it updates the description field and displays a success message; otherwise, it handles errors appropriately.
   *
   * @param {Object} aiSettings - The settings for the AI generation, including the API key and provider.
   * @param {Object} data - The data object containing the card information, including the name.
   * @param {Function} setLoading - A function to set the loading state.
   * @param {Function} updateField - A function to update a specific field in the data.
   * @param {Function} toast - A function to display messages to the user.
   * @param {Object} abortControllerRef - A reference to an AbortController for managing request cancellation.
   * @returns {Promise<void>} A promise that resolves when the description generation process is complete.
   * @throws {Error} If the generation fails or is canceled.
   */
  const handleAIGenerateDescription = async () => {
    if (!aiSettings?.apiKey && !['ollama', 'lmstudio'].includes(aiSettings?.provider?.toLowerCase() || '')) {
      toast({
        title: "Configuration error",
        description: "Please configure the API key in the AI settings first",
        variant: "destructive"
      });
      return;
    }

    if (!data.name) {
      toast({
        title: "Incomplete information",
        description: "Please fill in the Card name first",
        variant: "destructive"
      });
      return;
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);

    try {
      const prompt = generateDescription(data);
      const result = await generateWithAI(aiSettings, prompt);
      updateField("description", result);
      toast({
        title: "Generate successfully",
        description: "Role description has been generated"
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
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  /**
   * Cancels the ongoing AI generation process.
   */
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

  /**
   * Clears the character description and shows a toast notification.
   */
  const handleClearDescription = () => {
    updateField("description", "");
    toast({
      title: "Cleared",
      description: "Character description has been cleared"
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic information</h3>

      {/* Character avatar */}
      <div className="form-group">
        <Label className="text-sm font-medium text-gray-300">Character avatar</Label>
        <div className="flex items-center gap-4 mt-2">
          {characterImage && (
            <div className="relative">
              <img
                src={characterImage}
                alt="Character avatar"
                className="w-20 h-20 rounded-lg object-cover border-2 border-gray-200"
              />
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setCharacterImage(null)}
                className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              size="sm"
            >
              <Upload className="w-4 h-4 mr-2" />
              {characterImage ? 'Change avatar' : 'Upload avatar'}
            </Button>
          </div>
        </div>
      </div>

      {/* Card name */}
      <div className="form-group">
        <Label htmlFor="name" className="text-sm font-medium text-gray-300">Card name *</Label>
        <Input
          id="name"
          value={data.name}
          onChange={(e) => updateField("name", e.target.value)}
          placeholder="Enter a card formal name..."
          className="mt-1 w-full max-w-none"
        />
      </div>

      {/* Nickname */}
      <div className="form-group">
        <Label htmlFor="nickname" className="text-sm font-medium text-gray-300">Nickname</Label>
        <Input
          id="nickname"
          value={data.nickname || ""}
          onChange={(e) => updateField("nickname", e.target.value)}
          placeholder="Enter the card informal nickname..."
          className="mt-1 w-full max-w-none"
        />
      </div>

      {/* Role description */}
      <div className="form-group">
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="description" className="text-sm font-medium text-gray-300">Description *</Label>
          <div className="flex gap-1">
            {!loading && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleAIGenerateDescription}
                className="h-8 px-2 text-xs"
              >
                <RefreshCcw className="w-3 h-3 mr-1" />
                Regenerate
              </Button>
            )}
            <Button
              size="sm"
              variant={loading ? "destructive" : "outline"}
              onClick={loading ? cancelGeneration : handleAIGenerateDescription}
              disabled={!loading && !data.name}
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
                  AI generation
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleClearDescription}
              className="h-8 px-2 text-xs"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Clear
            </Button>
          </div>
        </div>
        <Textarea
          id="description"
          value={data.description}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder="Description: List the appearance, clothing, and body characteristics in a detailed, non-prosaic list. Body, clothing, general appearance."
          className="mt-1 min-h-[120px] w-full max-w-none"
          showCounter={true}
        />
      </div>
    </div>
  );
};

export default BasicInfoSection;
