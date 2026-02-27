/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/glass/card'
import { Button } from '@/components/ui/glass/button'
import { Textarea } from '@/components/ui/glass/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/glass/select'
import { useToast } from '@/hooks/use-toast'
import { useLanguage } from '@/contexts/LanguageContext'
import { Download, RefreshCcw, Wand, X } from 'lucide-react'
import { CharacterDataV3 } from '@/types/charactercard'
import { generateWithAI } from '@/utils/aiGenerator'
import { InferenceSettings } from '@/types/settings'

interface AIAssistantProps {
  aiSettings: InferenceSettings | null
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
 * @param {Object} props.aiSettings - The settings for the AI generation.
 * @param {Function} props.onInsertField - Callback function to insert generated fields into a form.
 * @returns {JSX.Element} The rendered AIAssistant component.
 */
const AIAssistant = ({ aiSettings, onInsertField }: AIAssistantProps) => {
  const { toast } = useToast()
  const { t } = useLanguage()
  const [inputText, setInputText] = useState('')
  const [characterType, setCharacterType] = useState('general')
  const [parsedData, setParsedData] = useState<CharacterDataV3 | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  /**
   * Generates a prompt based on the specified type and content.
   */
  const getPromptByType = (type: string, content: string) => {
    // Limit the length of input content to avoid too long prompt words
    const truncatedContent = content.length > 2000 ? content.substring(0, 2000) + '...' : content

    const baseInstructions = `Please generate role card information based on the following content.

Enter content:
${truncatedContent}

Output strictly in JSON format and do not add any other text:`

    const jsonFormat = `
{
"name": "Character and scene name",
"nickname": "Primary Character's First Name",
"description": "Detailed character appearance description",
"personality": "Detailed description of personality traits. Lists are okay, but should be a single string response per key",
"scenario": "Detailed scene setting description",
"first_mes": "The first events that start game play. Must include both the character and the user, referenced as {{user}}.",
"mes_example": "<START>\\n{{user}}: User Discourse\\n{{char}}: The Character's example answer",
"creator_notes": "Any notes you have about the character"
}`

    const typeSpecificPrompts = {
      general: `${baseInstructions}

Intelligent analysis and extract role information based on the content.${jsonFormat}`,

      anime: `${baseInstructions}

This is an anime character, please generate:
- description: List the appearance, clothing, and body characteristics in a detailed, non-prosaic list. Body, clothing, general appearance.
- personality: Detailed personality traits, idiosyncrasies and mannerisms in a non-prosaic list.
- scenario: The back story.
- first_mes: How character and player/user meet. This is a public part of the card and should read like a superb piece of professional fiction.
- mes_example: A dialogue example that reflects the character's speaking style and personality ${jsonFormat}`,

      game: `${baseInstructions}

This is a personified game character, please generate:
- description: Character appearance, equipment, special ability description in a detailed, non-prosaic list. Body, clothing, general appearance.
- personality: personality traits, combat style, values, back story in a non-prosaic list.
- scenario: The over-arching mythos.
- first_mes: How character and player/user meet. This is a public part of the card and should read like a superb piece of professional fiction.
- mes_example: A dialogue example that reflects the character's speaking style and personality ${jsonFormat} `,

      novel: `${baseInstructions}

This character stepped right out of a timeless classic, maybe Rabelais, maybe Joyce. Please generate:
- description: The character's appearance in a detailed, non-prosaic list. Body, clothing, general appearance.
- personality: Deep psychological characteristics and personality complexity
- scenario: The background and environment setting of novel era
- first mes: This is the first outward facing component and should be written in the style of a great literary master. It is a long paragraph portraying how this character first meets the user/player in this game.
- mes example: Monologue or dialogue that captures the character's quintessence. ${jsonFormat}`,

      historical: `${baseInstructions}

This is a historic character (real or fictional), please generate:
- description: List the appearance, clothing, and body characteristics in a detailed, non-prosaic list. Body, clothing, general appearance.
- personality: Detailed personality traits, idiosyncrasies and back story in a non-prosaic list.
- scenario: The back story.
- first_mes: How character and player/user meet. This is a public part of the card and should read like a superb piece of professional fiction.
- mes example: Monologue or dialogue that captures the character's quintessence. ${jsonFormat}`,
    }

    return typeSpecificPrompts[type as keyof typeof typeSpecificPrompts] || typeSpecificPrompts.general
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

    if (!aiSettings) {
      toast({ title: 'hint', description: 'Please configure API settings first', variant: 'destructive' })
      return
    }

    // Create a new AbortController
    abortControllerRef.current = new AbortController()
    setIsGenerating(true)

    try {
      const prompt = getPromptByType(characterType, inputText)
      console.log('Generated prompt length:', prompt.length)
      console.log('Prompt preview:', prompt.substring(0, 200) + '...')

      const result = await generateWithAI(aiSettings, prompt)
      console.log('AI result:', result)

      // More robust JSON parsing
      try {
        // First try to parse the entire result directly
        let jsonData
        try {
          jsonData = JSON.parse(result)
        } catch {
          // If it fails, try to extract the JSON part
          const jsonMatch = result.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            jsonData = JSON.parse(jsonMatch[0])
          } else {
            throw new Error('No valid JSON format found')
          }
        }

        // Verify that the parsing results contain basic fields
        if (typeof jsonData === 'object' && jsonData !== null) {
          setParsedData(jsonData)
          toast({
            title: 'Generate successfully',
            description:
              'The role information has been successfully parsed and can be inserted into the form with one click.',
          })
        } else {
          throw new Error('The API response did not parse correctly.')
        }
      } catch (parseError) {
        console.error('JSON parsing failed:', parseError)
        console.error('Original results:', result)
        toast({
          title: 'Analysis failed',
          description: 'The generated content format is incorrect. Please try again or check the AI settings.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      // Check whether the user actively cancels it
      if (error instanceof Error && error.name === 'AbortError') {
        toast({ title: 'Canceled', description: 'AI generation was canceled by the user' })
      } else {
        console.error('Generation failed:', error)
        toast({
          title: 'Generation failed',
          description:
            error instanceof Error ? error.message : 'Unknown error, please check AI settings or network connection',
          variant: 'destructive',
        })
      }
    } finally {
      setIsGenerating(false)
      abortControllerRef.current = null
    }
  }

  /**
   * Cancels the ongoing AI generation process.
   */
  const cancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setIsGenerating(false)
      abortControllerRef.current = null
      toast({ title: 'Canceled', description: 'AI generation has been canceled' })
    }
  }

  /**
   * Inserts all fields from parsedData into the role card form.
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
      if (value && (Array.isArray(value) ? value.length > 0 : value.trim())) {
        onInsertField(key, value)
        insertedCount++
      }
    })

    if (insertedCount > 0) {
      toast({
        title: 'Insert successfully',
        description: `Successfully inserted ${insertedCount} Fields into the role card form`,
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
          Paste any text content, select the role type, and the AI will intelligently extract and generate detailed role
          information
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
              placeholder='Paste the text content related to the role here:
• Role Introduction Article
• Wikipedia page
• Character description of novels
• Game character information
• Introduction to cartoon characters
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
          ></Button>

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
