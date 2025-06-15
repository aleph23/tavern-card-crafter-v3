
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface PromptsSectionProps {
  data: any;
  updateField: (field: string, value: any) => void;
}

const PromptsSection = ({ data, updateField }: PromptsSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">提示词设置</h3>
      
      <div>
        <Label htmlFor="system_prompt" className="text-sm font-medium text-gray-700">系统提示词</Label>
        <Textarea
          id="system_prompt"
          value={data.system_prompt}
          onChange={(e) => updateField("system_prompt", e.target.value)}
          placeholder="给 AI 的系统级指令..."
          className="mt-1 min-h-[100px]"
        />
      </div>

      <div>
        <Label htmlFor="post_history" className="text-sm font-medium text-gray-700">历史后指令</Label>
        <Textarea
          id="post_history"
          value={data.post_history_instructions}
          onChange={(e) => updateField("post_history_instructions", e.target.value)}
          placeholder="在聊天历史后出现的指令..."
          className="mt-1 min-h-[100px]"
        />
      </div>

      <div>
        <Label htmlFor="creator_notes" className="text-sm font-medium text-gray-700">创作者备注</Label>
        <Textarea
          id="creator_notes"
          value={data.creator_notes}
          onChange={(e) => updateField("creator_notes", e.target.value)}
          placeholder="给其他用户的关于角色的说明..."
          className="mt-1 min-h-[100px]"
        />
      </div>
    </div>
  );
};

export default PromptsSection;
