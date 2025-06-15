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

// 智能构建API URL - 与AISettings组件保持一致
const buildApiUrl = (baseUrl: string, provider: string): string => {
  if (!baseUrl) return '';
  
  // 移除末尾的斜杠
  const cleanUrl = baseUrl.replace(/\/+$/, '');
  
  // Ollama特殊处理
  if (provider === 'ollama') {
    if (baseUrl.includes('/v1/chat/completions')) {
      return cleanUrl;
    }
    return `${cleanUrl}/v1/chat/completions`;
  }
  
  // 智谱GLM特殊处理
  if (provider === 'zhipu') {
    if (baseUrl.includes('/chat/completions')) {
      return cleanUrl;
    }
    return `${cleanUrl}/chat/completions`;
  }
  
  // 其他提供商的标准处理
  if (baseUrl.includes('/chat/completions')) {
    return cleanUrl;
  }
  
  // 智能添加端点
  if (cleanUrl.includes('/v1')) {
    return `${cleanUrl}/chat/completions`;
  } else {
    return `${cleanUrl}/v1/chat/completions`;
  }
};

export const generateWithAI = async (
  settings: AISettings,
  prompt: string
): Promise<string> => {
  // 明定定义不需要密钥的本地服务
  const localServices = ['ollama', 'lmstudio'];
  const requiresKey = !localServices.includes(settings.provider.toLowerCase());
  
  // 只有非本地服务才检查密钥
  if (requiresKey && !settings.apiKey) {
    throw new Error("请先在AI设置中配置API密钥");
  }

  if (!settings.apiUrl) {
    throw new Error("请先在AI设置中配置API地址");
  }

  try {
    // 智能构建API地址
    const apiUrl = buildApiUrl(settings.apiUrl, settings.provider);
    
    console.log('Generating with AI using URL:', apiUrl);
    console.log('Provider:', settings.provider);
    console.log('Model:', settings.model);
    console.log('Requires API key:', requiresKey);

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

    console.log('Request body:', requestBody);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(60000) // 60秒超时
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      
      let errorMessage = `API请求失败: ${response.status} ${response.statusText}`;
      
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error?.message) {
          errorMessage += ` - ${errorData.error.message}`;
        } else if (errorData.detail) {
          errorMessage += ` - ${errorData.detail}`;
        }
      } catch {
        if (errorText) {
          errorMessage += ` - ${errorText}`;
        }
      }
      
      // 针对本地服务的特殊错误提示
      if (localServices.includes(settings.provider.toLowerCase())) {
        if (response.status === 400 || errorText.includes('model')) {
          errorMessage = `模型"${settings.model}"不存在或未加载。请在AI设置中获取可用模型列表，或确保已下载/加载该模型。`;
        }
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('API Response:', data);
    
    // 改进的响应内容解析 - 处理空响应和多种响应格式
    let content = '';
    
    if (data.choices && data.choices.length > 0) {
      const choice = data.choices[0];
      if (choice.message && choice.message.content) {
        content = choice.message.content;
      } else if (choice.delta && choice.delta.content) {
        content = choice.delta.content;
      } else if (choice.text) {
        content = choice.text;
      }
    }
    
    // 如果仍然没有内容，尝试其他可能的响应格式
    if (!content) {
      if (data.response) {
        content = data.response;
      } else if (data.text) {
        content = data.text;
      } else if (data.content) {
        content = data.content;
      }
    }
    
    // 检查是否获取到有效内容
    if (!content || content.trim() === '') {
      console.error('Empty response received:', data);
      throw new Error("API返回空响应，可能是配额不足或模型过载，请稍后重试或更换模型");
    }
    
    // 清理生成内容的格式问题
    return content.trim().replace(/^\s*\n+/, '');
  } catch (error) {
    console.error('AI生成错误:', error);
    
    if (error instanceof Error) {
      // 处理特定错误类型
      if (error.name === 'TimeoutError') {
        throw new Error('请求超时，请检查网络连接或API服务状态');
      }
      if (error.message.includes('Failed to fetch')) {
        if (settings.provider === 'ollama') {
          throw new Error('无法连接到Ollama服务，请确保Ollama已启动并运行在正确端口。可尝试执行: ollama serve');
        } else if (settings.provider === 'lmstudio') {
          throw new Error('无法连接到LM Studio服务，请确保LM Studio已启动本地服务器');
        }
        throw new Error('网络连接失败，请检查API地址是否正确或服务是否运行');
      }
      throw error;
    }
    
    throw new Error(`生成失败: 未知错误`);
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
