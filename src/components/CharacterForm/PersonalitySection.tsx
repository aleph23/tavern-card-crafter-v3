
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface PersonalitySectionProps {
  data: any;
  updateField: (field: string, value: any) => void;
}

const PersonalitySection = ({ data, updateField }: PersonalitySectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">性格设定</h3>
      
      <div>
        <Label htmlFor="personality" className="text-sm font-medium text-gray-700">性格特征 *</Label>
        <Textarea
          id="personality"
          value={data.personality}
          onChange={(e) => updateField("personality", e.target.value)}
          placeholder="描述角色的性格特点、行为模式和习惯..."
          className="mt-1 min-h-[100px]"
        />
      </div>

      <div>
        <Label htmlFor="scenario" className="text-sm font-medium text-gray-700">场景设定 *</Label>
        <Textarea
          id="scenario"
          value={data.scenario}
          onChange={(e) => updateField("scenario", e.target.value)}
          placeholder="设定交互的场景和背景..."
          className="mt-1 min-h-[100px]"
        />
      </div>

      <div>
        <Label htmlFor="first_mes" className="text-sm font-medium text-gray-700">首条消息 *</Label>
        <Textarea
          id="first_mes"
          value={data.first_mes}
          onChange={(e) => updateField("first_mes", e.target.value)}
          placeholder="角色的开场白..."
          className="mt-1 min-h-[100px]"
        />
      </div>

      <div>
        <Label htmlFor="mes_example" className="text-sm font-medium text-gray-700">对话示例</Label>
        <Textarea
          id="mes_example"
          value={data.mes_example}
          onChange={(e) => updateField("mes_example", e.target.value)}
          placeholder="示例对话，帮助定义角色的说话方式..."
          className="mt-1 min-h-[120px]"
        />
      </div>
    </div>
  );
};

export default PersonalitySection;
