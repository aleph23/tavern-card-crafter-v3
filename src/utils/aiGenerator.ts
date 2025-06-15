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

// Token计算函数（粗略估算）
export const estimateTokens = (text: string): number => {
  // 中文字符按1.5个token计算，英文单词按平均4个字符计算
  const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
  const otherChars = text.length - chineseChars - (text.match(/[a-zA-Z]/g) || []).length;
  
  return Math.ceil(chineseChars * 1.5 + englishWords + otherChars * 0.5);
};

export const generateWithAI = async (
  settings: AISettings,
  prompt: string
): Promise<string> => {
  // 检查是否需要API密钥
  const requiresKey = !['ollama', 'lmstudio'].includes(settings.provider);
  
  if (requiresKey && !settings.apiKey) {
    throw new Error("请先在AI设置中配置API密钥");
  }

  if (!settings.apiUrl) {
    throw new Error("请先在AI设置中配置API地址");
  }

  try {
    // 使用统一的OpenAI兼容格式
    let headers: any = {
      'Content-Type': 'application/json',
    };

    // 只有需要密钥的服务才添加Authorization头
    if (requiresKey && settings.apiKey) {
      headers['Authorization'] = `Bearer ${settings.apiKey}`;
    }

    const requestBody = {
      model: settings.model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
      temperature: 0.7
    };

    const response = await fetch(settings.apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API请求失败: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    // 使用统一的OpenAI兼容响应格式解析
    const content = data.choices?.[0]?.message?.content || "生成失败，请重试";
    
    // 清理生成内容的格式问题
    return content.trim().replace(/^\s*\n+/, '');
  } catch (error) {
    console.error('AI生成错误:', error);
    throw new Error(`生成失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
};

export const generateDescription = (data: CharacterData): string => {
  const existingDescription = data.description.trim();
  
  if (existingDescription) {
    return `根据以下角色信息，完善和丰富角色描述，保持现有内容的基础上进行扩展：

角色名称：${data.name}
现有描述：${existingDescription}

请在现有描述的基础上，补充角色的外观细节、身体特征、服装风格等描述性内容。只输出角色描述内容，不要包含角色名称和其他信息。请直接输出描述内容，不要添加总结或额外说明。请用中文回答。`;
  } else {
    return `根据角色名称生成详细的角色外观描述：

角色名称：${data.name}

请生成一个详细的角色外观描述，包括角色的身体特征、面部特征、服装风格、气质等。只输出角色描述内容，不要包含角色名称、背景故事或其他信息。请直接输出描述内容，不要添加总结或额外说明。请用中文回答。`;
  }
};

export const generatePersonality = (data: CharacterData): string => {
  return `根据以下信息生成详细的角色性格特征：

角色名称：${data.name}
角色描述：${data.description}

请生成一个详细的性格描述，包括角色的行为模式、习惯、情感特征等。请直接输出性格特征描述，不要包含总结段落或额外说明。请用中文回答，内容要具体且符合角色设定。`;
};

export const generateScenario = (data: CharacterData): string => {
  return `根据以下信息生成合适的场景设定：

角色名称：${data.name}
角色描述：${data.description}
性格特征：${data.personality}

请生成一个详细的场景设定，描述角色所处的环境、背景和情境。请直接输出场景描述，不要包含总结段落或额外说明。请用中文回答，内容要具体且符合角色设定。`;
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

请生成3-4段标准格式的对话示例，每个对话示例都必须以 <START> 开头。格式如下：

<START>
{{user}}: 用户的话
${data.name}: 角色的回答
{{user}}: 用户的话
${data.name}: 角色的回答

<START>
{{user}}: 用户的话
${data.name}: 角色的回答

请确保每个对话示例都以 <START> 宏开头，展示角色的说话方式和风格。请用中文回答，要符合角色性格。`;
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

export const generateAlternateGreeting = (data: CharacterData): string => {
  return `根据以下信息生成一个备用问候语：

角色名称：${data.name}
角色描述：${data.description}
性格特征：${data.personality}
场景设定：${data.scenario}
首条消息：${data.first_mes}

请生成一个与首条消息不同风格的备用问候语，体现角色的多面性。请用中文回答，要自然生动。`;
};

export const generateCharacterBookEntry = (data: CharacterData, context?: string): string => {
  return `根据以下信息生成一个角色书条目：

角色名称：${data.name}
角色描述：${data.description}
性格特征：${data.personality}
场景设定：${data.scenario}
${context ? `补充信息：${context}` : ''}

请生成一个角色书条目，用于补充角色的背景设定或特殊情况说明。

关键词要求：使用2-3个相关的核心关键词，用逗号分隔
内容要求：生成具体的设定内容，如角色的特殊技能、重要经历、人际关系或物品等背景信息

格式如下：
关键词: 核心关键词1,核心关键词2
内容: 详细的设定内容描述

请用中文回答，内容要丰富且有助于角色扮演。`;
};
