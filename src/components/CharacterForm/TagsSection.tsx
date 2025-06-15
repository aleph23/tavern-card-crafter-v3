
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";

interface TagsSectionProps {
  tags: string[];
  updateField: (field: string, value: any) => void;
}

const TagsSection = ({ tags, updateField }: TagsSectionProps) => {
  const [newTag, setNewTag] = useState("");

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      updateField("tags", [...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateField("tags", tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">标签</h3>
      
      <div className="flex gap-2">
        <Input
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="添加标签..."
          onKeyPress={(e) => e.key === 'Enter' && addTag()}
        />
        <Button onClick={addTag} size="sm">
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <Badge key={index} variant="secondary" className="cursor-pointer">
            {tag}
            <X className="w-3 h-3 ml-1" onClick={() => removeTag(tag)} />
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default TagsSection;
