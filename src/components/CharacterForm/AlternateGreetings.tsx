
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, X, Edit2, Check } from "lucide-react";

interface AlternateGreetingsProps {
  greetings: string[];
  updateField: (field: string, value: any) => void;
}

const AlternateGreetings = ({ greetings, updateField }: AlternateGreetingsProps) => {
  const [newGreeting, setNewGreeting] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");

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

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">备用问候语</h3>
      
      <div className="form-group">
        <Label className="text-sm font-medium text-gray-700">添加新问候语</Label>
        <div className="flex gap-2 mt-1">
          <Textarea
            value={newGreeting}
            onChange={(e) => setNewGreeting(e.target.value)}
            placeholder="添加备用问候语..."
            className="min-h-[60px]"
          />
          <Button onClick={addGreeting} size="sm" className="self-end">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {greetings.map((greeting, index) => (
          <div key={index} className="p-4 bg-gray-50 rounded-lg relative">
            <div className="absolute top-2 left-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
              问候语 {index + 1}
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
                    保存
                  </Button>
                  <Button onClick={cancelEdit} size="sm" variant="outline">
                    取消
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
                <p className="text-sm pr-16 pt-6 whitespace-pre-wrap">{greeting}</p>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlternateGreetings;
