
import { AISettings } from "@/components/AISettings";
import { buildApiUrl } from "./buildApiUrl";
import { promptManager } from "./promptManager";

// Initialize prompts
promptManager.loadPrompts();

export interface CharacterData {
  name: string;
  nickname?: string;
  description: string;
  personality?: string;
  scenario?: string;
  first_mes?: string;
  mes_example?: string;
  alternate_greetings?: string[];
  system_prompt?: string;
  post_history_instructions?: string;
  character_book?: string[];
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

/**
 * Generate a response from an AI service based on the provided settings and prompt.
 *
 * This function checks if the AI service requires an API key and validates the settings. It constructs the API URL, prepares the request body, and handles the response, including error management for various scenarios. The function ensures that the response content is properly extracted and formatted before returning it, while also managing specific error cases for local services and network issues.
 *
 * @param settings - The configuration settings for the AI service, including provider, model, API key, and API URL.
 * @param prompt - The input prompt to be sent to the AI service for generating a response.
 * @returns A promise that resolves to the generated response content from the AI service.
 * @throws Error If the API key is missing for a non-local service, if the API URL is not configured, if the API request fails, or if the response is empty.
 */
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
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Only services that require a key will add an Authorization header
    if (requiresKey && settings.apiKey) {
      headers['Authorization'] = `Bearer ${settings.apiKey}`;
    }

    const requestBody = {
      model: settings.model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: settings.maxTokens || 800,
      temperature: settings.infTemp ?? 0.7,
    };

    console.log('Request body:', requestBody);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(120000) // 120 seconds timeout
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
      if (localServices.includes(settings.provider.toLowerCase()) && (response.status === 400 || errorText.includes('model'))) {
        errorMessage = `Model "${settings.model}" not present or not loaded. Please fetch the list of available models in AI settings or make sure it has been downloaded/loaded.`;
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

/**
 * Generates a character description based on provided data.
 */
export const generateDescription = (data: CharacterData): string => {
  const existingDescription = data.description.trim();

  if (existingDescription) {
    const template = promptManager.getPrompt('description_enhance');
    return promptManager.interpolatePrompt(template, { ...data, description: existingDescription });
  } else {
    const template = promptManager.getPrompt('description_create');
    return promptManager.interpolatePrompt(template, data);
  }
};

/**
 * Generates a personality description based on character data.
 */
export const generatePersonality = (data: CharacterData): string => {
  const template = promptManager.getPrompt('personality');
  return promptManager.interpolatePrompt(template, data);
};

/**
 * Generates a meta-scenario based on character data.
 */
export const generateScenario = (data: CharacterData): string => {
  const template = promptManager.getPrompt('scenario');
  return promptManager.interpolatePrompt(template, data);
};

export const generateFirstMes = (data: CharacterData): string => {
  const template = promptManager.getPrompt('firstMessage');
  return promptManager.interpolatePrompt(template, data);
};

/**
 * Generates a conversational example based on character data.
 */
export const generateMesExample = (data: CharacterData): string => {
  const template = promptManager.getPrompt('messageExample');
  // Pass {{user}} as user_placeholder if needed, but since we rely on unknown keys staying as placeholders,
  // and {{user}} is in the template as {{user}}, and data probably doesn't have "user" key, it should be fine.
  // We can pass user_placeholder if we want to be explicit, but the template has {{user}}.
  return promptManager.interpolatePrompt(template, data);
};

/**
 * Generates a system prompt based on character data.
 */
export const generateSystemPrompt = (data: CharacterData): string => {
  const template = promptManager.getPrompt('systemPrompt');
  return promptManager.interpolatePrompt(template, data);
};

/**
 * Generates brief instructions for the AI based on character data.
 */
export const generatePostHistoryInstructions = (data: CharacterData): string => {
  const template = promptManager.getPrompt('postHistoryInstructions');
  return promptManager.interpolatePrompt(template, data);
};

export const generateTags = (data: CharacterData): string => {
  const template = promptManager.getPrompt('tags');
  return promptManager.interpolatePrompt(template, data);
};

/**
 * Generates an alternate greeting based on character data.
 */
export const generateAlternateGreeting = (data: CharacterData): string => {
  const template = promptManager.getPrompt('alternateGreeting');
  return promptManager.interpolatePrompt(template, data);
};

/**
 * Generates a character book entry based on character data and optional context.
 */
export const generateCharacterBookEntry = (data: CharacterData): string => {
  const template = promptManager.getPrompt('characterBookEntry');
  return promptManager.interpolatePrompt(template, data);
};
