/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/glass/card'
import { Button } from '@/components/ui/glass/button'
import { Textarea } from '@/components/ui/glass/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/glass/select'
import { useToast } from '@/hooks/use-toast'
import { useLanguage } from '@/contexts/LanguageContext'
import { Download, RefreshCcw, X } from 'lucide-react'
import { UsedCharacterData } from '@/types/charactercard'
import { generateWithAI } from '@/utils/aiGenerator'
import { InferenceSettings } from '@/types/settings'
import { RouteIcon, RouteIconHandle } from '@/components/ui/route'
import { promptManager } from '@/utils/promptManager'
import defaultPrompts from '@/config/defaultPrompts.json'

interface AIAssistantProps {
  infSettings: InferenceSettings | null
  onInsertField: (field: string, value: string | string[]) => void
}

/**
 * Array of predefined character type options used by the AI assistant form.
 *
 * Each element is an option object with the following properties:
 * - value: string — machine-friendly identifier for the option
 * - label: string — human-facing label shown in the UI
 * - description: string — short description of the option's purpose
 *
 * The array contains these predefined types:
 * - "general": Intelligent sorting (default) — Directly organize the content pasted by users
 * - "anime": anime characters — Character settings based on anime and comics
 * - "game": game character — Character settings from games
 * - "novel": novel — Character settings in literary works
 * - "historical": historical figure — Real historical figure settings
 *
 * Typical usage: populate dropdowns or radio groups, and switch assistant behavior based on the selected type.
 *
 * @constant
 * @readonly
 * @type {{ value: string; label: string; description: string }[]}
 * @default "general"
 */
const CHARACTER_TYPES = [
  {
    value: 'general',
    label: 'Intelligent sorting (default)',
    description: 'Directly organize the content pasted by users',
  },
  { value: 'anime', label: 'anime characters', description: 'character settings based on anime and comics' },
  { value: 'game', label: 'game character', description: 'character settings from the game' },
  { value: 'novel', label: 'novel', description: 'character settings in literary works' },
  { value: 'historical', label: 'historical figure', description: 'real historical figure settings' },
]

/**
 * A component that assists in generating AI character cards based on user-provided content.
 *
 * This component manages the state for input text, character type, and parsed data. It provides functionality to generate character data using AI, handle user interactions for inserting fields, and manage the cancellation of ongoing generation processes. The component also formats prompts based on the selected character type and ensures robust JSON parsing of the AI's response.
 *
 * @param {AIAssistantProps} props - The properties for the AIAssistant component.
 * @param {Object} props.infSettings - The settings for the AI generation.
 * @param {Function} props.onInsertField - Callback function to insert generated fields into a form.
 * @returns {JSX.Element} The rendered AIAssistant component.
 */
const AIAssistant = ({ infSettings, onInsertField }: AIAssistantProps) => {
  const { toast } = useToast()
  const { t } = useLanguage()
  const [inputText, setInputText] = useState('')
  const [characterType, setCharacterType] = useState('general')
  const [parsedData, setParsedData] = useState<Partial<UsedCharacterData> | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const iconRef = useRef<RouteIconHandle>(null)

  // Manage icon animation state based on generation process
  useEffect(() => {
    if (isGenerating) {
      iconRef.current?.startAnimation()
    } else {
      iconRef.current?.stopAnimation()
    }
  }, [isGenerating])

  /**
   * Generates a prompt based on the specified type and content.
   */
  const getPromptByType = (type: string, content: string) => {
    // Limit the length of input content to avoid too long prompt words
    const truncatedContent = content.length > 2000 ? content.substring(0, 2000) + '...' : content

    const promptKey = `assistant_${type}` as keyof typeof defaultPrompts
    const template = promptManager.getPrompt(promptKey) || promptManager.getPrompt('assistant_general')

    return promptManager.interpolatePrompt(template, {
      content: truncatedContent,
    })
  }

  /**
   * Generate character data based on user input and AI settings.
   *
   * This function validates the input text and AI settings, then initiates the character data generation process. It constructs a prompt using the input and character type, invokes the AI generation, and handles the result by attempting to parse it as JSON. If parsing fails, it provides feedback to the user. The function also manages cancellation and error handling throughout the process.
   *
   * @returns {Promise<void>} A promise that resolves when the character data generation is complete.
   * @throws Error If the input text is empty, AI settings are not configured, or if JSON parsing fails.
   */
  const generateCharacterData = async () => {
    if (!inputText.trim()) {
      toast({
        title: 'hint',
        description: 'Please enter the content you want to convert first',
        variant: 'destructive',
      })
      return
    }

    if (!infSettings) {
      toast({ title: 'hint', description: 'Please configure API settings first', variant: 'destructive' })
      return
    }

    // Create a new AbortController and update state at the same time
    const abortController = new AbortController()
    abortControllerRef.current = abortController
    setIsGenerating(true)

    try {
      const prompt = getPromptByType(characterType, inputText)
      console.log('Generated prompt length:', prompt.length)
      console.log('Prompt preview:', prompt.substring(0, 200) + '...')

      const result = await generateWithAI(infSettings, prompt, abortController.signal)
      console.log('AI result:', result)

      // Extract and parse JSON content from the AI response
      let jsonData: any = null
      try {
        // First try direct parse
        jsonData = JSON.parse(result)
      } catch {
        // Fallback to regex extraction
        const jsonMatch = result.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          try {
            jsonData = JSON.parse(jsonMatch[0])
          } catch (e) {
            console.error('Regex match extraction parse failed:', e)
          }
        }
      }

      const errorMsg =
        result === 'null'
          ? 'The AI returned a null result. Please try again with more detailed input.'
          : 'No valid character data could be extracted from the AI response.'

      // Final validation and normalization of result
      if (jsonData && typeof jsonData === 'object' && Object.keys(jsonData).length > 0) {
        // Normalize tags (split by delimiters)
        if (typeof jsonData.tags === 'string') {
          jsonData.tags = jsonData.tags
            .split(/[,\s，]+/)
            .map((s: string) => s.trim().replace(/^["']|["']$/g, ''))
            .filter(Boolean)
        }

        // Normalize alternate_greetings (NO SPLITTING - just wrap in array)
        if (typeof jsonData.alternate_greetings === 'string') {
          jsonData.alternate_greetings = [jsonData.alternate_greetings.trim().replace(/^["']|["']$/g, '')]
        }

        setParsedData(jsonData)
        toast({
          title: 'Generate successfully',
          description:
            'The character information has been successfully parsed and can be inserted into the form with one click.',
        })
      } else {
        throw new Error(errorMsg)
      }
    } catch (error) {
      // Check whether the user actively cancels it
      const isAbortError = error instanceof Error && (error.name === 'AbortError' || error.message.includes('abort'))
      if (!isAbortError) {
        console.error('Generation failed:', error)
        const errorMessage =
          error instanceof Error ? error.message : 'The generated content format is incorrect. Please try again.'
        toast({
          title: 'Analysis failed',
          description: errorMessage,
          variant: 'destructive',
        })
      }
    }
    setIsGenerating(false)
    abortControllerRef.current = null
  }

  /**
   * Cancels the ongoing AI generation process.
   */
  const cancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      // Note: State reset will be handled by finally block in generateCharacterData
      toast({
        title: 'Canceled',
        description:
          'User canceled generation. Depending on the API, you may or may not still be debited for the call.',
      })
    }
  }

  /**
   * Inserts all fields from parsedData into the character card form.
   *
   * The function checks if parsedData is available and iterates over its entries.
   * For each entry, it verifies if the value is valid (non-empty or non-whitespace)
   * before calling onInsertField to insert the field. It tracks the number of
   * successfully inserted fields and displays a toast notification indicating
   * the result of the operation.
   */
  const insertAllFields = () => {
    if (!parsedData) {
      return
    }

    let insertedCount = 0

    // Insert all fields with values
    Object.entries(parsedData).forEach(([key, value]) => {
      // Check if value is string or array and not empty
      const isValidValue = Array.isArray(value)
        ? value.length > 0
        : typeof value === 'string'
          ? value.trim().length > 0
          : value !== null && value !== undefined

      if (isValidValue) {
        onInsertField(key, value as string | string[])
        insertedCount++
      }
    })

    if (insertedCount > 0) {
      toast({
        title: 'Insert successfully',
        description: `Successfully inserted ${insertedCount} Fields into the character card form`,
      })
    } else {
      toast({
        title: 'No data to be inserted',
        description: 'There is no valid data in the parsing result that can be inserted',
        variant: 'destructive',
      })
    }
  }

  // * Retrieves the label for a given field.
  const getFieldLabel = (field: string): string => {
    const labels: Record<string, string> = {
      name: 'Card Name or Character Fullname',
      nickname: 'Character First Name',
      description: 'Character Physical Description',
      personality: 'Character Personality Traits',
      scenario: 'Scene / World Setting',
      first_mes: 'First message / Greeting',
      alternate_greetings: 'Alternate greetings',
      mes_example: 'Conversation Example',
      system_prompt: 'system prompt (not typically set in a character card',
      post_history_instructions: 'Post history instruction (Only used in very exceptional circumstances).',
      tags: 'SEO Keywords',
      creator: 'You, the Author',
      creator_notes: 'Your notes',
    }
    return labels[field] || field
  }

  // * Returns a preview text from the given value, truncating if necessary.
  const getPreviewText = (value: any) => {
    if (Array.isArray(value)) {
      return value.join(', ')
    }
    const text = value.toString()
    return text.length > 150 ? `${text.substring(0, 150)}...` : text
  }

  const selectedType = CHARACTER_TYPES.find((type) => type.value === characterType)

  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle className='text-lg font-semibold text-foreground'>AI character card assistant</CardTitle>
        <p className='text-sm text-muted-foreground'>
          Paste any text content, select the character type, and the AI will intelligently extract and generate detailed
          character information
        </p>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div className='md:col-span-1'>
            <label className='block text-sm font-medium text-foreground/80 mb-2'>Role Type</label>
            <Select value={characterType} onValueChange={setCharacterType}>
              <SelectTrigger className='w-full'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CHARACTER_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div>
                      <div className='font-medium'>{type.label}</div>
                      <div className='text-xs text-muted-foreground'>{type.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='md:col-span-3'>
            <label className='block text-sm font-medium text-foreground/80 mb-2'>Text content</label>
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder='Paste the text content related to the character here:
• Character Introduction Article
• Wikipedia page
• Character description from novels
• Game character information
• Introduction for a cartoon character
etc...'
              className='min-h-[200px] text-sm'
              showCounter={true}
              showTokens={true}
            />
          </div>
        </div>

        <div className='flex gap-2'>
          <Button
            onClick={isGenerating ? cancelGeneration : generateCharacterData}
            disabled={!isGenerating && !inputText.trim()}
            variant={isGenerating ? 'destructive' : 'default'}
            className='flex-1'
          >
            {isGenerating ? (
              <>
                <X className='w-4 h-4 mr-2' />
                Cancel Generation
              </>
            ) : (
              <>
                <RouteIcon ref={iconRef} className='w-4 h-4 mr-2' />
                Extract character info
              </>
            )}
          </Button>

          {parsedData && !isGenerating && (
            <Button onClick={generateCharacterData} variant='outline' title='Regenerate'>
              <RefreshCcw className='w-4 h-4' />
            </Button>
          )}
        </div>

        {parsedData && (
          <div className='space-y-4 border-t pt-4'>
            <div className='flex items-center justify-between'>
              <h4 className='font-medium text-foreground'>AI parsing results</h4>
              <Button
                onClick={insertAllFields}
                size='sm'
                className='bg-success hover:bg-success/90 text-primary-foreground'
              >
                <Download className='w-4 h-4 mr-2' />
                Insert all with one click
              </Button>
            </div>

            <div className='space-y-3 max-h-[400px] overflow-y-auto bg-muted/50 rounded-lg p-3 scrollbar'>
              {Object.entries(parsedData).map(([key, value]) => {
                if (!value || (Array.isArray(value) && value.length === 0)) {
                  return null
                }

                return (
                  <div key={key} className='border-b border-border pb-2 last:border-b-0'>
                    <div className='font-medium text-sm text-foreground/80 mb-1'>{getFieldLabel(key)}</div>
                    <div className='text-sm text-muted-foreground break-words leading-relaxed'>
                      {getPreviewText(value)}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className='text-xs text-muted-foreground bg-accent/10 p-2 rounded'>
              Click "Insert All with One Click" to automatically fill all the parsing results into the corresponding
              form fields. You can further edit and improve them in the form below.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default AIAssistant
