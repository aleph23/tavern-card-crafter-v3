
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface MetadataSectionProps {
  data: any;
  updateField: (field: string, value: any) => void;
}

const MetadataSection = ({ data, updateField }: MetadataSectionProps) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">创作信息</h3>
      
      {/* 创作者 */}
      <div className="form-group">
        <Label htmlFor="creator" className="text-sm font-medium text-gray-700">创作者</Label>
        <Input
          id="creator"
          value={data.creator}
          onChange={(e) => updateField("creator", e.target.value)}
          placeholder="输入创作者名称..."
          className="mt-1 w-full max-w-none"
        />
      </div>

      {/* 角色版本 */}
      <div className="form-group">
        <Label htmlFor="character_version" className="text-sm font-medium text-gray-700">角色版本</Label>
        <Input
          id="character_version"
          value={data.character_version}
          onChange={(e) => updateField("character_version", e.target.value)}
          placeholder="例如: 1.0"
          className="mt-1 w-full max-w-none"
        />
      </div>

      {/* 来源链接 */}
      <div className="form-group">
        <Label htmlFor="source" className="text-sm font-medium text-gray-700">来源链接</Label>
        <Input
          id="source"
          value={data.source || ""}
          onChange={(e) => updateField("source", e.target.value)}
          placeholder="输入来源链接..."
          className="mt-1 w-full max-w-none"
        />
      </div>

      {/* 创作备注 */}
      <div className="form-group">
        <Label htmlFor="creator_notes" className="text-sm font-medium text-gray-700">创作备注</Label>
        <Textarea
          id="creator_notes"
          value={data.creator_notes}
          onChange={(e) => updateField("creator_notes", e.target.value)}
          placeholder="添加关于角色创作的备注..."
          className="mt-1 min-h-[80px] w-full max-w-none"
        />
      </div>
    </div>
  );
};

export default MetadataSection;
