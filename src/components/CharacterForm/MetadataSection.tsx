
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
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Creative information</h3>
      
      {/* Creator */}
      <div className="form-group">
        <Label htmlFor="creator" className="text-sm font-medium text-gray-300">Creator</Label>
        <Input
          id="creator"
          value={data.creator}
          onChange={(e) => updateField("creator", e.target.value)}
          placeholder="Enter the creator name..."
          className="mt-1 w-full max-w-none"
        />
      </div>

      {/* Role Version */}
      <div className="form-group">
        <Label htmlFor="character_version" className="text-sm font-medium text-gray-300">Role Version</Label>
        <Input
          id="character_version"
          value={data.character_version}
          onChange={(e) => updateField("character_version", e.target.value)}
          placeholder="For example: 1.0"
          className="mt-1 w-full max-w-none"
        />
      </div>

      {/* Source link */}
      <div className="form-group">
        <Label htmlFor="source" className="text-sm font-medium text-gray-300">Source link</Label>
        <Input
          id="source"
          value={data.source || ""}
          onChange={(e) => updateField("source", e.target.value)}
          placeholder="Enter the source link..."
          className="mt-1 w-full max-w-none"
        />
      </div>

      {/* Creation Notes */}
      <div className="form-group">
        <Label htmlFor="creator_notes" className="text-sm font-medium text-gray-300">Creation Notes</Label>
        <Textarea
          id="creator_notes"
          value={data.creator_notes}
          onChange={(e) => updateField("creator_notes", e.target.value)}
          placeholder="Add notes about character creation..."
          className="mt-1 min-h-[80px] w-full max-w-none"
        />
      </div>
    </div>
  );
};

export default MetadataSection;
