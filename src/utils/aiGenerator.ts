/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { AISettings } from '@/components/AISettings';

export interface CharacterData {
  name: string;
  nickname?: string;
  description: string;
  personality?: string;
  scenario?: string;
  first_mes?: string;
  mes_example?: string;
  alternative_greetings?: string[];
  system_prompt?: string;
  post_history_instructions?: string;
  character_book?: string[];
  tags?: string[];
}

// Token calculation function (rough estimation)
/**
 * Estimates the number of tokens in a given text based on character types.
 */
export const estimateTokens = (text: string): number => {
  // Press 1 in Chinese characters 5 tokens are calculated, English words are calculated based on average 4 characters
  const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
  const otherChars = text.length - chineseChars - (text.match(/[a-zA-Z]/g) || []).length;

  return Math.ceil(chineseChars * 1.5 + englishWords + otherChars * 0.5);
};

// Intelligently build API URL - consistent with the AISettings component
/**
 * Build a complete API URL based on the base URL and provider type.
 *
 * The function first checks if the base URL is provided and cleans it by removing any trailing slashes.
 * It then applies specific logic for the 'ollama' and 'zhipu' providers to determine if an endpoint should be appended.
 * For other providers, it checks for existing endpoints and appends them accordingly, ensuring a valid API URL is returned.
 *
 * @param baseUrl - The base URL to be processed.
 * @param provider - The provider type which influences the URL structure.
 * @returns The constructed API URL based on the provided base URL and provider.
 */
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
    let headers: Record<string, string> = {
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
        errorMessage = `Model"${settings.model}"Not present or not loaded. Please get a list of available models in the AI settings or make sure it has been downloaded/Load the model.`;
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
    return `Based on the following role information, enchance the descriptions, while remaining succinct:

Card name:${data.name}
Existing description:${existingDescription}

Embellish, making sure to describe all physical qualities of the character -- body, attire and how they compose themself. This should be in non-prosaic list format.`;
  } else {
    return `Generate a list of all the physical qualities of the character -- body, attire and how they compose themself. This should be in non-prosaic CSV format riffing off of the character name:

Card name:${data.name}

Please generate a detailed character appearance description, including the character's physical characteristics, facial features, clothing style, temperament, etc. Only output character description content, do not include character name, background story or other information. Please output the description directly, and do not add summary or additional instructions.`;
  }
};

/**
 * Generates a personality description based on character data.
 */
export const generatePersonality = (data: CharacterData): string => {
  return `Based on the following role information, enchance the character's persona, while remaining succinct.

Card name: ${data.name}
Physical Description: ${data.description}

A non-prosaic list, describing the character's traits, behavior, idiosyncracies, likes/dislikes, strengths/weaknesses, backstory.`;
};

/**
 * Generates a meta-scenario based on character data.
 */
export const generateScenario = (data: CharacterData): string => {
  return `Generate an appropriate meta-scenario based on the following information:

Card name: ${data.name}
Physical Description: ${data.description}
Character Personality: ${data.personality}

Generate the backstory and meta-environment in acclaimed historian's prose.`;
};

export const generateFirstMes = (data: CharacterData): string => {
  return `Generate the first message of the game, introducing the character to the player/user:

Card name: ${data.name}
Physical Description: ${data.description}
Character Personality: ${data.personality}
Scene settings: ${data.scenario}

This will be the first outward facing text, the first thing the player/user encounters when playing with the character.Somehow the character must meet the player/user. The writing should be a perfect combination of Douglas Adams, Ursula K. Le Guin, James Joyce, Anais Nin, and Philip K. Dick.`;
};

/**
 * Generates a conversational example based on character data.
 */
export const generateMesExample = (data: CharacterData): string => {
  return `Generate a conversational example to help establish the character:

Card name: ${data.name}
Physical Description: ${data.description}
Character Personality: ${data.personality}
Scene setting: ${data.scenario}

Please generate 2 to 3 dialogues or monologues that truly capture the spirit of the character. The format is as follows:

<START>
{{user}}: User's words
${data.name}: The character's answer
${data.name}: *The character's actions.*

<START>
${data.name}: The character talks to themself and acts on their own.

Make sure each conversation example starts with a <START> macro. Do not include it if it doesn't help to develop the character's actions and speaking behavior. . `;
};

/**
 * Generates a system prompt based on character data.
 */
export const generateSystemPrompt = (data: CharacterData): string => {
  return `Generate System Prompt based on the following information:

Card name: ${data.name}
Physical Description: ${data.description}
Character Personality: ${data.personality}
Scene settings: ${data.scenario}
Example Character Actions: ${data.mes_example}
Story introduction: ${data.first_mes}

Write the System Prompt to instruct the AI how to accurately play the character. Be concise and clear.`;
};

/**
 * Generates brief instructions for the AI based on character data.
 */
export const generatePostHistoryInstructions = (data: CharacterData): string => {
  return `Generate the most important instructions for the AI based on the following information:
  Card name: ${data.name}
  Physical Description: ${data.description}
  Character Personality: ${data.personality}
  Scene settings: ${data.scenario}
  Example Character Actions: ${data.mes_example}
  Story introduction: ${data.first_mes}
  SYSTEM PROMPT: ${data.system_prompt}

  THIS MUST BE EXTREMELY BRIEF!.`;
};

export const generateTags = (data: CharacterData): string => {
  return `Generate appropriate keywords based on the following information:

Card name: ${data.name}
Physical Description: ${data.description}
Character Personality: ${data.personality}
Example actions: ${data.mes_example}
Scene setting: ${data.scenario}

Please generate 5-10 related keywords or single-word tags, separated by commas. Tags should include character type, personality traits, scene type, etc.`;
};

/**
 * Generates an alternate greeting based on character data.
 *
 * This function constructs a detailed greeting string using various attributes from the provided
 * CharacterData object. It includes the character's name, physical description, personality traits,
 * scene settings, and examples of dialogue. The output is designed to facilitate the writing of
 * a new chapter that incorporates the character and their interactions with the player/user.
 *
 * @param {CharacterData} data - The character data used to generate the greeting.
 */
/**
 * Generates an alternate greeting based on character data.
 */
export const generateAlternateGreeting = (data: CharacterData): string => {
  return `Generate the start of the next chapter of the story based on the following information:

Card name: ${data.name}
Physical Description: ${data.description}
Character Personality: ${data.personality}
Scene settings: ${data.scenario}
First message: ${data.first_mes}
Dialogue example: ${data.mes_example}

The chapters that have already been written: 

First Chapter Beginning: ${data.first_mes}
Subsequent chapters(if any): ${data.alternative_greetings}

Write the beginning of a new chapter.It must include the character and some encounter with the player / user and must be at least one day after any prior chapters.Merge the writing styles of James Joyce, Philip K. Dick, Francois Rabelais, and Anais Nin.`;
};

/**
 * Generates a character book entry based on character data and optional context.
 */
export const generateCharacterBookEntry = (data: CharacterData): string => {
  return `Generate specific important character information entries based on the following information:

Card name: ${data.name}
Physical Description: ${data.description}
Character Personality: ${data.personality}
Scene settings: ${data.scenario}

You are constructing what is referred to as a lorebook. When certain keywords are mentioned in the chat, it triggers a longer definition to be sent to the AI and considered in it's response. It can work like an important memory of the character's or an important fact about the character. It should be something quite unique and important to be worth including. 

The parameters are:
Keyword requirements: Use at least 2 - 3 related core keywords/synonyms, separated by commas.
Content requirements: Generate specific setting content, such as the character's special skills, important experiences, interpersonal relationships or items, and other background information.

The format is as follows:
  Keywords: keyword1, keyword2, keyword3, keyword4, ...
  Content: The detailed description.

The content should be rich and helpful for role-playing.`;
};

