
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ImageIcon } from "lucide-react";
import { useRef } from "react";

interface BasicInfoSectionProps {
  data: any;
  updateField: (field: string, value: any) => void;
  characterImage: string | null;
  setCharacterImage: (image: string | null) => void;
}

const BasicInfoSection = ({ data, updateField, characterImage, setCharacterImage }: BasicInfoSectionProps) => {
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCharacterImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">基础信息</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name" className="text-sm font-medium text-gray-700">角色名称 *</Label>
          <Input
            id="name"
            value={data.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="输入角色名称..."
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="nickname" className="text-sm font-medium text-gray-700">昵称</Label>
          <Input
            id="nickname"
            value={data.nickname || ""}
            onChange={(e) => updateField("nickname", e.target.value)}
            placeholder="输入昵称..."
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium text-gray-700">角色头像</Label>
        <div className="mt-2 flex items-center gap-4">
          <input
            type="file"
            ref={imageInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
          <Button onClick={() => imageInputRef.current?.click()} size="sm" variant="outline">
            <ImageIcon className="w-4 h-4 mr-2" />
            上传头像
          </Button>
          {characterImage && (
            <img src={characterImage} alt="角色头像" className="w-16 h-16 rounded-lg object-cover" />
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="description" className="text-sm font-medium text-gray-700">角色描述 *</Label>
        <Textarea
          id="description"
          value={data.description}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder="描述角色的外观、背景和主要特征..."
          className="mt-1 min-h-[120px]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="creator" className="text-sm font-medium text-gray-700">创作者</Label>
          <Input
            id="creator"
            value={data.creator}
            onChange={(e) => updateField("creator", e.target.value)}
            placeholder="您的名字或用户名..."
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="version" className="text-sm font-medium text-gray-700">角色版本</Label>
          <Input
            id="version"
            value={data.character_version}
            onChange={(e) => updateField("character_version", e.target.value)}
            placeholder="1.0"
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="source" className="text-sm font-medium text-gray-700">来源链接</Label>
        <Input
          id="source"
          value={data.source || ""}
          onChange={(e) => updateField("source", e.target.value)}
          placeholder="https://example.com/characters/..."
          className="mt-1"
        />
      </div>
    </div>
  );
};

export default BasicInfoSection;
