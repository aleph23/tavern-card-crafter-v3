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

// Token calculation function (rough estimation)
export const estimateTokens = (text: string): number => {
  // Press 1 in Chinese characters 5 tokens are calculated, English words are calculated based on average 4 characters
  const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
  const otherChars = text.length - chineseChars - (text.match(/[a-zA-Z]/g) || []).length;

  return Math.ceil(chineseChars * 1.5 + englishWords + otherChars * 0.5);
};

// Intelligently build API URL - consistent with the AISettings component
const buildApiUrl = (baseUrl: string, provider: string): string => {
  if (!baseUrl) { return ''; }

  // Remove the end slash
  const cleanUrl = baseUrl.replace(/\/+$/, '');

  // Ollama special treatment
  if (provider === 'ollama') {
    if (baseUrl.includes('/v1/chat/completions')) {
      return cleanUrl;
    }
    return `${cleanUrl}/v1/chat/completions`;
  }

  // Special processing of Zhipu GLM
  if (provider === 'zhipu') {
    if (baseUrl.includes('/chat/completions')) {
      return cleanUrl;
    }
    return `${cleanUrl}/chat/completions`;
  }

  // Standard processing from other providers
  if (baseUrl.includes('/chat/completions')) {
    return cleanUrl;
  }

  // Smartly add endpoints
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
  // Definition of local services that do not require a key
  const localServices = ['ollama', 'lmstudio'];
  const requiresKey = !localServices.includes(settings.provider.toLowerCase());

  // Only non-local services check the key
  if (requiresKey && !settings.apiKey) {
    throw new Error("Please configure the API key in the AI settings first");
  }

  if (!settings.apiUrl) {
    throw new Error("Please configure the API address in the AI settings first");
  }

  try {
    // Intelligently build API addresses
    const apiUrl = buildApiUrl(settings.apiUrl, settings.provider);

    console.log('Generating with AI using URL:', apiUrl);
    console.log('Provider:', settings.provider);
    console.log('Model:', settings.model);
    console.log('Requires API key:', requiresKey);

    // Use a unified Open AI-compatible format
    let headers: any = {
      'Content-Type': 'application/json',
    };

    // Only services that require a key will add Authorization header
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
      signal: AbortSignal.timeout(60000) // 60 seconds timeout
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);

      let errorMessage = `API request failed: ${response.status} ${response.statusText}`;

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

      // Special error prompts for local services
      if (localServices.includes(settings.provider.toLowerCase())) {
        if (response.status === 400 || errorText.includes('model')) {
          errorMessage = `Model"${settings.model}"Not present or not loaded. Please get a list of available models in the AI settings or make sure it has been downloaded/Load the model.`;
        }
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('API Response:', data);

    // Improved response content analysis - Handle empty responses and multiple response formats
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

    // If there is still no content, try other possible response formats
    if (!content) {
      if (data.response) {
        content = data.response;
      } else if (data.text) {
        content = data.text;
      } else if (data.content) {
        content = data.content;
      }
    }

    // Check whether valid content is obtained
    if (!content || content.trim() === '') {
      console.error('Empty response received:', data);
      throw new Error("The API returns an empty response, which may be due to insufficient quota or overloading of the model. Please try again or replace the model later.");
    }

    // Clean up the format of generated content
    return content.trim().replace(/^\s*\n+/, '');
  } catch (error) {
    console.error('AI generation error:', error);

    if (error instanceof Error) {
      // Handle specific error types
      if (error.name === 'TimeoutError') {
        throw new Error('Request timeout, please check the network connection or API service status');
      }
      if (error.message.includes('Failed to fetch')) {
        if (settings.provider === 'ollama') {
          throw new Error('Unable to connect to the Ollama service, make sure Ollama is up and running on the correct port. Can try to execute: ollama serve');
        } else if (settings.provider === 'lmstudio') {
          throw new Error('Unable to connect to LM Studio service, please make sure LM Studio has started the local server');
        }
        throw new Error('The network connection failed. Please check whether the API address is correct or whether the service is running.');
      }
      throw error;
    }

    throw new Error(`Generation failed: Unknown error`);
  }
};

export const generateDescription = (data: CharacterData): string => {
  const existingDescription = data.description.trim();

  if (existingDescription) {
    return `Based on the following role information, improve and enrich character descriptions and expand on the basis of existing content:

Role name:${data.name}
Existing description:${existingDescription}

Please add descriptive content such as the character's appearance details, body characteristics, clothing style, etc. based on the existing description. Only output the role description content, do not include role names and other information. Please output the description directly, and do not add summary or additional instructions.`;
  } else {
    return `Generate a detailed character appearance description based on the character name:

Role name:${data.name}

Please generate a detailed character appearance description, including the character's physical characteristics, facial features, clothing style, temperament, etc. Only output character description content, do not include character name, background story or other information. Please output the description directly, and do not add summary or additional instructions.`;
  }
};

export const generatePersonality = (data: CharacterData): string => {
  return `Generate detailed character characteristics based on the following information:

Role name: ${data.name}
Role description: ${data.description}

Please generate a detailed character description, including the character's behavioral patterns, habits, emotional characteristics, etc. Please output a description of personality traits directly, and do not include summary paragraphs or additional instructions. The content should be specific and in line with the role settings.`;
};

export const generateScenario = (data: CharacterData): string => {
  return `Generate appropriate scenario settings based on the following information:

Role name: ${data.name}
Role description: ${data.description}
Character traits: ${data.personality}

Please generate a detailed scene setting that describes the environment, background and situation in which the character is located. Please output the scene description directly, do not include summary paragraphs or additional instructions. The content should be specific and in line with the role settings.`;
};

export const generategreeting = (data: CharacterData): string => {
  return `Generate the first message of the character along with scene introductions for the player:

Role name: ${data.name} 
Role description: ${data.description} 
Character traits: ${data.personality} 
Scene settings: ${data.scenario}

Please generate a natural opening remark that reflects the character's personality and the scene in which you are located. Be vivid and interesting.`;
};

export const generatechatEx = (data: CharacterData): string => {
  return `Generate a conversation example of a role based on the following information:

Role name: ${data.name}
Role description: ${data.description}
Character traits: ${data.personality}
Scene setting: ${data.scenario}

Please generate 3-4 conversation examples in standard format, each conversation example must be <START> beginning. The format is as follows:

<START>
{{user}}: User's words
${data.name}: The role's answer
{{user}}: User's words
${data.name}: The role's answer

<START>
{{user}}: User's words
${data.name}: The role's answer

Make sure each conversation example starts with a <START> macro that shows how and style the character speaks. This must be consistent with the character's personality. `;
};

export const generateSystemPrompt = (data: CharacterData): string => {
  return `Generate system prompt words based on the following information:

Role name: ${data.name}
Role description: ${data.description}
Character traits: ${data.personality}
Scene settings: ${data.scenario}

Please generate a system prompt word to guide AI how to play this role. Be concise and clear.`;
};

export const generatePostHistoryInstructions = (data: CharacterData): string => {
  return `Generate historical instructions based on the following information:

Role name: ${data.name}
Role description: ${data.description}
Character traits: ${data.personality}

Please generate post-historical instructions to remind the AI to maintain role consistency during the conversation. Be concise and practical.`;
};

export const generateTags = (data: CharacterData): string => {
  return `Generate appropriate tags based on the following information:

Role name: ${data.name}
Role description: ${data.description}
Character traits: ${data.personality}
Scene setting: ${data.scenario}

Please generate 5-10 related tags, separated by commas. Tags should include character type, personality traits, scene type, etc.`;
};

export const generateAlternateGreeting = (data: CharacterData): string => {
  return `Generate an alternate greeting based on the following information:

Role name: ${data.name} 
Role description: ${data.description} 
Character traits: ${data.personality} 
Scene settings: ${data.scenario} 
First message: ${data.first_mes} 

Please generate an alternate greeting with a different style from the first message to reflect the multifaceted nature of the character. Be natural and vivid。`;
};

export const generateCharacterBookEntry = (data: CharacterData, context?: string): string => {
  return `Generate a role book entry based on the following information:

Role name: ${data.name}
Role description: ${data.description}
Character traits: ${data.personality}
Scene settings: ${data.scenario}
${context ? `Supplementary information: ${context}` : ''}

Please generate a character book entry to supplement the character's background settings or special case descriptions.

Keyword requirements: Use 2-3 related core keywords, separated by commas 
Content requirements: Generate specific setting content, such as the character's special skills, important experiences, interpersonal relationships or items, and other background information. 

The format is as follows: 
Keywords: core keyword 1, core keyword 2 
Content: Detailed settings description 

The content should be rich and helpful for role-playing.`;
};
