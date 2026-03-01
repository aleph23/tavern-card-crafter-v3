/* eslint-disable prefer-const */
import { apiProviders } from '@/config/providers'
import { InferenceSettings } from '@/types/settings'
import { buildApiUrl } from './buildApiUrl'
import { promptManager } from './promptManager'
import { UsedCharacterData } from '@/types/charactercard'

// Helper to ensure prompts are loaded
const ensurePromptsLoaded = async () => {
  await promptManager.loadPrompts()
}
// Kick off loading immediately, but functions should ideally await it if needed.
// Since loadPrompts manages its own state and is likely fast (local file),
// keeping it as a side effect is acceptable but explicit initialization is better.
ensurePromptsLoaded()

// Token calculation function (rough estimation)
export const estimateTokens = (text: string): number => {
  if (!text) return 0

  // Industry standard heuristic for LLM tokens (without importing a heavy tokenizer library)
  // - English/Latin: ~4 characters per token
  // - CJK (Chinese, Japanese, Korean): ~1.5 to 2.5 tokens per character depending on the model
  const cjkMatch = text.match(/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f\uac00-\ud7a3]/g)
  const cjkCount = cjkMatch ? cjkMatch.length : 0

  // Remaining characters (Latin, spaces, punctuation, numbers)
  const otherCount = text.length - cjkCount

  return Math.ceil(cjkCount * 2 + otherCount / 4)
}

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
  settings: InferenceSettings,
  prompt: string,
  signal?: AbortSignal,
): Promise<string> => {
  const provider = settings.endpoint?.provider || ''
  const currentProvider = apiProviders.find((p) => p.value === provider)
  const requiresKey = currentProvider?.requiresKey ?? true

  // Validation: Block if required but missing
  if (requiresKey && !settings.endpoint?.apiKey) {
    throw new Error(
      `Please configure the API key in the settings first${currentProvider ? ` for ${currentProvider.name}` : ''}`,
    )
  }

  if (!settings.endpoint?.apiUrl) {
    throw new Error('Please configure the API URL in the settings first')
  }

  try {
    // Intelligently build API addresses
    const apiUrl = buildApiUrl(settings.endpoint.apiUrl, provider)

    console.log('Generating with AI using URL:', apiUrl)
    console.log('Provider:', provider)
    console.log('Model:', settings.endpoint?.model)

    // eslint-disable-next-line prefer-const
    let headers: Record<string, string> = { 'Content-Type': 'application/json' }

    if (provider === 'openrouter') {
      headers['HTTP-Referer'] = 'https://github.com/aleph23/tavern-card-creator-v3'
      headers['X-Title'] = 'CharaCardCreator'
    }

    // Execution: Send key if present regardless of requirement
    if (settings.endpoint?.apiKey) {
      headers['Authorization'] = `Bearer ${settings.endpoint.apiKey}`
    }

    const requestBody = {
      model: settings.endpoint?.model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: settings.maxTokens,
      temperature: settings.temp,
    }

    console.log('Request body:', requestBody)

    // Combine passed signal with timeout if available
    let combinedSignal = AbortSignal.timeout(120000)
    if (signal) {
      combinedSignal = AbortSignal.any([combinedSignal, signal])
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
      signal: combinedSignal,
    })

    console.log('Response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error Response:', errorText)

      let errorMessage = `API request failed: ${response.status} ${response.statusText}`

      try {
        const errorData = JSON.parse(errorText)
        if (errorData.error?.message) {
          errorMessage += ` - ${errorData.error.message}`
        } else if (errorData.detail) {
          errorMessage += ` - ${errorData.detail}`
        }
      } catch {
        if (errorText) {
          errorMessage += ` - ${errorText}`
        }
      }

      // Special error prompts for local services (Ollama level check)
      const isLocal = currentProvider && !currentProvider.requiresKey
      if (isLocal && (response.status === 400 || errorText.includes('model'))) {
        errorMessage = `Model "${settings.endpoint?.model}" not present or not loaded. Please fetch the list of available models in AI settings or make sure it has been downloaded/loaded.`
      }

      throw new Error(errorMessage)
    }

    const data = await response.json()
    console.log('API Response:', data)

    // Improved response content analysis - Handle empty responses and multiple response formats
    let content = ''

    if (data.choices && data.choices.length > 0) {
      const choice = data.choices[0]
      if (choice.message && choice.message.content) {
        content = choice.message.content
      } else if (choice.delta && choice.delta.content) {
        content = choice.delta.content
      } else if (choice.text) {
        content = choice.text
      }
    }

    // If there is still no content, try other possible response formats
    if (!content) {
      if (data.response) {
        content = data.response
      } else if (data.text) {
        content = data.text
      } else if (data.content) {
        content = data.content
      }
    }

    // Check whether valid content is obtained
    if (!content || content.trim() === '') {
      console.error('Empty response received:', data)
      throw new Error(
        'The API returned an empty response, which may be due to insufficient quota, funds, or overloading of the model, or using its entire allowed token length in the Chain-of-Thought before it could formulate a response. Try again, increase the allowed token length in the maximum tokens setting, or switch models.',
      )
    }

    // Clean up the format of generated content
    return content.trim().replace(/^\s*\n+/, '')
  } catch (error) {
    console.error('AI generation error:', error)

    if (error instanceof Error) {
      // Handle specific error types
      if (error.name === 'TimeoutError') {
        throw new Error('Request timeout, please check the network connection or API service status')
      }
      if (error.message.includes('Failed to fetch')) {
        if (provider === 'ollama') {
          throw new Error(
            'Unable to connect to the Ollama service, make sure Ollama is up and running on the correct port.',
          )
        } else if (provider === 'lmstudio') {
          throw new Error(
            'Unable to connect to LM Studio service, please make sure LM Studio has started the local server',
          )
        }
        throw new Error(
          'The network connection failed. Please check whether the API address is correct and that the service is up.',
        )
      }
      throw error
    }

    throw new Error(`Generation failed: Unknown error`)
  }
}

/**
 * Formats a standardized instruction for the AI when regenerating a field.
 * This tells the AI to treat the existing content as potential feedback, notation,
 * or a base that should be evolved without being repetitive.
 */
const getRegenerateInstruction = (fieldName: string, existingContent: string): string => {
  return `\n\nAdditionally, this is the text from the ${fieldName} field that you are replacing. It may have comments or notation to address. It may just have special instruction. If it appears to be an unnotated ${fieldName} then attempt an unguided regeneration being sure to not repeat the old data:\n${existingContent}`
}

/**
 * Generates a character description based on provided data.
 */
export const generateDescription = (data: UsedCharacterData, isRegenerate: boolean = false): string => {
  const existingDescription = data.description.trim()

  // Only use enhance mode if we are explicitly regenerating and have existing content
  if (isRegenerate && existingDescription) {
    const template = promptManager.getPrompt('description_enhance')
    let prompt = promptManager.interpolatePrompt(template, { ...data, description: existingDescription })
    prompt += getRegenerateInstruction('description', existingDescription)
    return prompt
  } else {
    const template = promptManager.getPrompt('description_create')
    return promptManager.interpolatePrompt(template, data)
  }
}

/**
 * Generates a personality description based on character data.
 */
export const generatePersonality = (data: UsedCharacterData, isRegenerate: boolean = false): string => {
  const existing = data.personality?.trim()
  const template = promptManager.getPrompt('personality')
  let prompt = promptManager.interpolatePrompt(template, data)

  if (isRegenerate && existing) {
    prompt += getRegenerateInstruction('personality', existing)
  }
  return prompt
}

/**
 * Generates a meta-scenario based on character data.
 */
export const generateScenario = (data: UsedCharacterData, isRegenerate: boolean = false): string => {
  const existing = data.scenario?.trim()
  const template = promptManager.getPrompt('scenario')
  let prompt = promptManager.interpolatePrompt(template, data)

  if (isRegenerate && existing) {
    prompt += getRegenerateInstruction('scenario', existing)
  }
  return prompt
}

export const generateFirstMes = (data: UsedCharacterData, isRegenerate: boolean = false): string => {
  const existing = data.first_mes?.trim()
  const template = promptManager.getPrompt('firstMessage')
  let prompt = promptManager.interpolatePrompt(template, data)

  if (isRegenerate && existing) {
    prompt += getRegenerateInstruction('first message', existing)
  }
  return prompt
}

/**
 * Generates a conversational example based on character data.
 */
export const generateMesExample = (data: UsedCharacterData, isRegenerate: boolean = false): string => {
  const existing = data.mes_example?.trim()
  const template = promptManager.getPrompt('messageExample')
  let prompt = promptManager.interpolatePrompt(template, data)

  if (isRegenerate && existing) {
    prompt += getRegenerateInstruction('dialogue examples', existing)
  }
  return prompt
}

/**
 * Generates a system prompt based on character data.
 */
export const generateSystemPrompt = (data: UsedCharacterData, isRegenerate: boolean = false): string => {
  const existing = data.system_prompt?.trim()
  const template = promptManager.getPrompt('systemPrompt')
  let prompt = promptManager.interpolatePrompt(template, data)

  if (isRegenerate && existing) {
    prompt += getRegenerateInstruction('system prompt', existing)
  }
  return prompt
}

/**
 * Generates brief instructions for the AI based on character data.
 */
export const generatePostHistoryInstructions = (data: UsedCharacterData, isRegenerate: boolean = false): string => {
  const existing = data.post_history_instructions?.trim()
  const template = promptManager.getPrompt('postHistoryInstructions')
  let prompt = promptManager.interpolatePrompt(template, data)

  if (isRegenerate && existing) {
    prompt += getRegenerateInstruction('AI instructions', existing)
  }
  return prompt
}

export const generateTags = (data: UsedCharacterData, isRegenerate: boolean = false): string => {
  const existing = data.tags && data.tags.length > 0 ? data.tags.join(', ') : ''
  const template = promptManager.getPrompt('tags')
  let prompt = promptManager.interpolatePrompt(template, data)

  if (isRegenerate && existing) {
    prompt += getRegenerateInstruction('tags', existing)
  }
  return prompt
}

/**
 * Generates an alternate greeting based on character data.
 */
export const generateAlternateGreeting = (data: UsedCharacterData, isRegenerate: boolean = false): string => {
  const template = promptManager.getPrompt('alternateGreeting')
  let prompt = promptManager.interpolatePrompt(template, data)

  if (isRegenerate && data.alternate_greetings && data.alternate_greetings.length > 0) {
    const existing = data.alternate_greetings[data.alternate_greetings.length - 1]
    prompt += getRegenerateInstruction('alternate greeting', existing)
  }
  return prompt
}

/**
 * Generates a character book entry based on character data and optional context.
 */
export const generateCharacterBookEntry = (
  data: {
    name: string
    description: string
    personality?: string
    scenario?: string
    content?: string
    keys?: string[]
  },
  isRegenerate: boolean = false,
): string => {
  const existing = data.content?.trim()
  const template = promptManager.getPrompt('characterBookEntry')
  let prompt = promptManager.interpolatePrompt(template, data)

  if (isRegenerate && (existing || (data.keys && data.keys.length > 0))) {
    const keysStr = data.keys?.join(', ') || ''
    const baseText = [keysStr ? `Keywords: ${keysStr}` : '', existing ? `Content: ${existing}` : '']
      .filter(Boolean)
      .join('\n')

    prompt += getRegenerateInstruction('lorebook entry', baseText)
  }
  return prompt
}
