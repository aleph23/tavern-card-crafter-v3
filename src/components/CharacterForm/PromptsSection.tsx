import { useState, useRef } from 'react'
import { Label } from '@/components/ui/glass/label'
import { Textarea } from '@/components/ui/glass/textarea'
import { Button } from '@/components/ui/glass/button'
import { Sparkles, Loader2, RefreshCcw, Trash2, X } from 'lucide-react'
import { generateWithAI, generateSystemPrompt, generatePostHistoryInstructions } from '@/utils/aiGenerator'
import { Settings } from '@/types/settings'
import { useToast } from '@/hooks/use-toast'
import { CharacterDataV3, UsedCharacterData } from '@/types/charactercard'

interface PromptsSectionProps {
  data: CharacterDataV3
  updateField: (field: string, value: any) => void
  aiSettings: Settings | null
}

/**
 * Renders a section for managing AI prompt settings with various functionalities.
 *
 * This component handles the generation of prompts using AI, manages loading states, and provides options to clear or cancel ongoing operations. It validates the necessary fields before generating prompts and displays appropriate toast notifications based on the operation's success or failure. The component also includes buttons for regenerating prompts and clearing fields, ensuring a user-friendly interface for prompt management.
 *
 * @param data - An object containing the current prompt data.
 * @param updateField - A function to update the specific field in the prompt data.
 * @param aiSettings - An object containing the AI configuration settings, including the API key and provider.
 * @returns A JSX element representing the prompts section.
 */
const PromptsSection = ({ data, updateField, aiSettings }: PromptsSectionProps) => {
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({})
  const abortControllerRefs = useRef<{ [key: string]: AbortController | null }>({})
  const { toast } = useToast()

  /**
   * Handles the AI generation process for a specified field.
   *
   * This function checks for the necessary API key and required data fields before proceeding with the AI generation.
   * It utilizes a prompt generator to create a prompt based on the provided data, then calls the generateWithAI function.
   * It manages loading states and handles errors, including user cancellations and other exceptions, while providing feedback via toast notifications.
   *
   * @param field - The field for which AI generation is to be handled.
   * @param promptGenerator - A function that generates a prompt string based on the provided data.
   */
  const handleAIGenerate = async (field: string, promptGenerator: (data: UsedCharacterData) => string) => {
    if (!aiSettings?.apiKey && !['ollama', 'lmstudio'].includes(aiSettings?.provider?.toLowerCase() || '')) {
      toast({
        title: 'Configuration error',
        description: 'Please configure the API key in the AI settings first',
        variant: 'destructive',
      })
      return
    }

    if (!data.name || !data.description || !data.personality) {
      toast({
        title: 'Incomplete information',
        description: 'Please fill in the basic information first',
        variant: 'destructive',
      })
      return
    }

    abortControllerRefs.current[field] = new AbortController()
    setLoading((prev) => ({ ...prev, [field]: true }))

    try {
      const prompt = promptGenerator(data as unknown as UsedCharacterData)
      const result = await generateWithAI(aiSettings, prompt)
      updateField(field, result)
      toast({ title: 'Generate successfully', description: `${field} Generated completed` })
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        toast({ title: 'Canceled', description: 'AI generation has been canceled by the user' })
      } else {
        toast({
          title: 'Generation failed',
          description: error instanceof Error ? error.message : 'Unknown error',
          variant: 'destructive',
        })
      }
    } finally {
      setLoading((prev) => ({ ...prev, [field]: false }))
      abortControllerRefs.current[field] = null
    }
  }

  /**
   * Cancels the AI generation process for the specified field.
   */
  const cancelGeneration = (field: string) => {
    if (abortControllerRefs.current[field]) {
      abortControllerRefs.current[field]!.abort()
      setLoading((prev) => ({ ...prev, [field]: false }))
      abortControllerRefs.current[field] = null
      toast({ title: 'Canceled', description: 'AI generation has been canceled' })
    }
  }

  /**
   * Clears the specified field and shows a toast notification.
   */
  const handleClearField = (field: string) => {
    updateField(field, '')
    toast({ title: 'Cleared', description: `${field} Cleared` })
  }

  /**
   * Renders a set of buttons for field actions including regeneration, AI generation, and clearing the field.
   * The function checks the loading state of the field and whether the necessary data is available to enable the buttons.
   * It utilizes the `handleAIGenerate`, `cancelGeneration`, and `handleClearField` functions to manage the respective actions.
   *
   * @param {string} field - The identifier for the field being rendered.
   * @param {(data: any) => string} promptGenerator - A function that generates a prompt based on the provided data.
   */
  const renderFieldButtons = (field: string, promptGenerator: (data: UsedCharacterData) => string) => {
    const isLoading = loading[field]
    const canGenerate = data.name && data.description && data.personality

    return (
      <div className='flex gap-1'>
        {!isLoading && (
          <Button
            size='sm'
            variant='outline'
            onClick={() => handleAIGenerate(field, promptGenerator)}
            disabled={!canGenerate}
            className='h-8 px-2 text-xs'
          >
            <RefreshCcw className='w-3 h-3 mr-1' />
            Regenerate
          </Button>
        )}
        <Button
          size='sm'
          variant={isLoading ? 'destructive' : 'outline'}
          onClick={isLoading ? () => cancelGeneration(field) : () => handleAIGenerate(field, promptGenerator)}
          disabled={!isLoading && !canGenerate}
          className='h-8 px-2 text-xs'
        >
          {isLoading ? (
            <>
              <X className='w-3 h-3 mr-1' />
              Cancel
            </>
          ) : (
            <>
              <Sparkles className='w-3 h-3 mr-1' />
              AI generation
            </>
          )}
        </Button>
        <Button size='sm' variant='outline' onClick={() => handleClearField(field)} className='h-8 px-2 text-xs'>
          <Trash2 className='w-3 h-3 mr-1' />
          Clear
        </Button>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <h3 className='text-lg font-semibold text-foreground mb-4'>Prompt word settings</h3>

      <div>
        <div className='flex items-center justify-between mb-2'>
          <Label htmlFor='system_prompt' className='text-sm font-medium text-foreground/80'>
            System prompt words
          </Label>
          {renderFieldButtons('system_prompt', generateSystemPrompt)}
        </div>
        <Textarea
          id='system_prompt'
          value={data.system_prompt}
          onChange={(e) => updateField('system_prompt', e.target.value)}
          placeholder='Give AI System-level instructions...'
          className='mt-1 min-h-[100px]'
          showCounter={true}
        />
      </div>

      <div>
        <div className='flex items-center justify-between mb-2'>
          <Label htmlFor='post_history' className='text-sm font-medium text-foreground/80'>
            Post-historical instructions
          </Label>
          {renderFieldButtons('post_history_instructions', generatePostHistoryInstructions)}
        </div>
        <Textarea
          id='post_history'
          value={data.post_history_instructions}
          onChange={(e) => updateField('post_history_instructions', e.target.value)}
          placeholder='Instructions appear after chat history...'
          className='mt-1 min-h-[100px]'
          showCounter={true}
        />
      </div>
    </div>
  )
}

export default PromptsSection
