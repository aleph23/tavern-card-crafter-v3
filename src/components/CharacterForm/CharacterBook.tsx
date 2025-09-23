
import { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, X, Sparkles, Loader2, RefreshCcw, Trash2 } from "lucide-react";
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
  const abortControllerRef = useRef<AbortController | null>(null);
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
    if (!aiSettings?.apiKey && !['ollama', 'lmstudio'].includes(aiSettings?.provider?.toLowerCase() || '')) {
      toast({
        title: "Configuration error",
        description: "Please configure the API key in the AI ​​settings first",
        variant: "destructive"
      });
      return;
    }

    if (!characterData.name || !characterData.description) {
      toast({
        title: "Incomplete information",
        description: "Please fill in the role name and role description first",
        variant: "destructive"
      });
      return;
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);

    try {
      const prompt = generateCharacterBookEntry(characterData);
      const result = await generateWithAI(aiSettings, prompt);

      // Analyze the content returned by AI and try to extract keywords and content
      const lines = result.split('\n').filter(line => line.trim());
      let keys: string[] = [];
      let content = result;

      // Try to parse formatted reply
      for (const line of lines) {
        if (line.includes('Keywords:') || line.includes('Keywords:')) {
          const keywordsMatch = line.match(/Keywords[:：]\s*(.+)/);
          if (keywordsMatch) {
            keys = keywordsMatch[1].split(/[,，]/).map(k => k.trim()).filter(k => k);
          }
        } else if (line.includes('content:') || line.includes('content:')) {
          const contentMatch = line.match(/content[:：]\s*(.+)/);
          if (contentMatch) {
            content = lines.slice(lines.indexOf(line)).join('\n').replace(/^content[:：]\s*/, '');
            break;
          }
        }
      }

      // If the keyword is not parsed, use the role name as the keyword
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
        title: "Generate successfully",
        description: "The character book entry has been generated"
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
    updateField("character_book", { entries: [] });
    toast({
      title: "Cleared",
      description: "All character book entries have been cleared"
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">角色书</h3>
        <div className="flex gap-1">
          {!loading && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleAIGenerateEntry}
              className="h-8 px-2 text-xs"
            >
              <RefreshCcw className="w-3 h-3 mr-1" />
              Regenerate
            </Button>
          )}
          <Button
            size="sm"
            variant={loading ? "destructive" : "outline"}
            onClick={loading ? cancelGeneration : handleAIGenerateEntry}
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
                AI generates entries
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

      <div>
        <Label className="text-sm font-medium text-gray-700">Add a new entry</Label>
        <div className="space-y-2 mt-2">
          <Input
            value={newEntryKeys}
            onChange={(e) => setNewEntryKeys(e.target.value)}
            placeholder="Keywords (separated by commas)..."
          />
          <Textarea
            value={newEntryContent}
            onChange={(e) => setNewEntryContent(e.target.value)}
            placeholder="Entry content..."
            className="min-h-[80px]"
            showCounter={true}
          />
          <Button onClick={addBookEntry} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add an entry
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
                Keywords: {entry.keys.join(', ')}
              </div>
              <p className="text-sm text-gray-600 mb-2">{entry.content}</p>
              <div className="text-xs text-gray-400">
                character: {entry.content.length} | Token: {Math.ceil(entry.content.length * 0.75)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CharacterBook;
