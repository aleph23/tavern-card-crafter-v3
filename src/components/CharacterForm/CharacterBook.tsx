
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

interface CharacterBookEntry {
  keys: string[];
  content: string;
  insertion_order: number;
  enabled: boolean;
}

interface CharacterBookProps {
  entries: CharacterBookEntry[];
  updateField: (field: string, value: any) => void;
}

const CharacterBook = ({ entries, updateField }: CharacterBookProps) => {
  const [newEntryKeys, setNewEntryKeys] = useState("");
  const [newEntryContent, setNewEntryContent] = useState("");

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

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">角色书</h3>
      
      <div>
        <Label className="text-sm font-medium text-gray-700">添加新条目</Label>
        <div className="space-y-2 mt-2">
          <Input
            value={newEntryKeys}
            onChange={(e) => setNewEntryKeys(e.target.value)}
            placeholder="关键词（用逗号分隔）..."
          />
          <Textarea
            value={newEntryContent}
            onChange={(e) => setNewEntryContent(e.target.value)}
            placeholder="条目内容..."
            className="min-h-[80px]"
          />
          <Button onClick={addBookEntry} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            添加条目
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
                关键词: {entry.keys.join(', ')}
              </div>
              <p className="text-sm text-gray-600">{entry.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CharacterBook;
