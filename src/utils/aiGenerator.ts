
import { AISettings } from "@/components/AISettings";

export interface CharacterData {
  name: string;
  description: string;
  personality?: string;
  scenario?: string;
  first_mes?: string;
  mes_example?: string;
  system_prompt?: string;
  post_history_instructions?: string;
  tags?: string[];
}

export const generateWithAI = async (
  settings: AISettings,
  prompt: string
): Promise<string> => {
  if (!settings.apiKey) {
    throw new Error("请先在AI设置中配置API密钥");
  }

  const response = await fetch(settings.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.apiKey}`
    },
    body: JSON.stringify({
      model: settings.model,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "生成失败，请重试";
};

export const generatePersonality = (data: CharacterData): string => {
  return `根据以下信息生成详细的角色性格特征：

角色名称：${data.name}
角色描述：${data.description}

请生成一个详细的性格描述，包括角色的行为模式、习惯、情感特征等。请用中文回答，内容要具体且符合角色设定。`;
};

export const generateScenario = (data: CharacterData): string => {
  return `根据以下信息生成合适的场景设定：

角色名称：${data.name}
角色描述：${data.description}
性格特征：${data.personality}

请生成一个详细的场景设定，描述角色所处的环境、背景和情境。请用中文回答，内容要具体且符合角色设定。`;
};

export const generateFirstMessage = (data: CharacterData): string => {
  return `根据以下信息生成角色的首条消息（开场白）：

角色名称：${data.name}
角色描述：${data.description}
性格特征：${data.personality}
场景设定：${data.scenario}

请生成一个自然的开场白，体现角色的性格和所处的场景。请用中文回答，要生动有趣。`;
};

export const generateMessageExample = (data: CharacterData): string => {
  return `根据以下信息生成角色的对话示例：

角色名称：${data.name}
角色描述：${data.description}
性格特征：${data.personality}
场景设定：${data.scenario}

请生成几段示例对话，展示角色的说话方式和风格。格式如下：
{{user}}: 用户的话
${data.name}: 角色的回答

请用中文回答，要符合角色性格。`;
};

export const generateSystemPrompt = (data: CharacterData): string => {
  return `根据以下信息生成系统提示词：

角色名称：${data.name}
角色描述：${data.description}
性格特征：${data.personality}
场景设定：${data.scenario}

请生成一个系统提示词，指导AI如何扮演这个角色。请用中文回答，要简洁明确。`;
};

export const generatePostHistoryInstructions = (data: CharacterData): string => {
  return `根据以下信息生成历史后指令：

角色名称：${data.name}
角色描述：${data.description}
性格特征：${data.personality}

请生成历史后指令，提醒AI在对话过程中保持角色一致性。请用中文回答，要简洁实用。`;
};

export const generateTags = (data: CharacterData): string => {
  return `根据以下信息生成合适的标签：

角色名称：${data.name}
角色描述：${data.description}
性格特征：${data.personality}
场景设定：${data.scenario}

请生成5-10个相关标签，用逗号分隔。标签应该包括角色类型、性格特点、场景类型等。请用中文回答。`;
};
