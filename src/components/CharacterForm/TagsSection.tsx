/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useRef } from 'react'
import { Label } from '@/components/ui/glass/label'
import { Input } from '@/components/ui/glass/input'
import { Button } from '@/components/ui/glass/button'
import { Badge } from '@/components/ui/glass/badge'
import { X, Plus, Sparkles, Loader2, RefreshCcw, Trash2 } from 'lucide-react'
import { generateWithAI, generateTags } from '@/utils/aiGenerator'
import { InferenceSettings } from '@/types/settings'
import { useToast } from '@/hooks/use-toast'
import { useLanguage } from '@/contexts/LanguageContext'
import { UsedCharacterData } from '@/types/charactercard'

interface TagsSectionProps {
  tags: string[]
  updateField: (field: string, value: any) => void
  infSettings: InferenceSettings | null
  charaData: UsedCharacterData
}

const TagsSection = ({ tags, updateField, infSettings, charaData }: TagsSectionProps) => {
  const [newTag, setNewTag] = useState('')
  const [loading, setLoading] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const { toast } = useToast()
  const { t } = useLanguage()

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      updateField('tags', [...tags, newTag.trim()])
      setNewTag('')
    }
  }

  /**
   * Removes a specified tag from the tags list.
   */
  const removeTag = (tagToRemove: string) => {
    updateField(
      'tags',
      tags.filter((tag) => tag !== tagToRemove),
    )
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  /**
   * Handles the generation of tags using AI based on character data.
   *
   * The function first checks for the presence of an API key and required character information. If any checks fail, it displays an error message.
   * It then initiates an AI request to generate tags, processes the response to ensure uniqueness, and updates the tags field accordingly.
   * Error handling is implemented to manage both cancellation and other potential errors during the AI generation process.
   *
   * @returns {Promise<void>} A promise that resolves when the tag generation process is complete.
   */
  const handleAIGenerate = async (isRegenerate: boolean = false) => {
    if (
      !infSettings?.endpoint?.apiKey &&
      !['ollama', 'lmstudio'].includes(infSettings?.endpoint?.provider?.toLowerCase() || '')
    ) {
      toast({
        title: t('configError') || 'Configuration error',
        description: t('configApiKey') || 'Please configure the API key in the AI settings first',
        variant: 'destructive',
      })
      return
    }

    if (!charaData.name || !charaData.description) {
      toast({
        title: t('incompleteInfo') || 'Incomplete information',
        description: t('fillNameDesc') || 'Please fill in the Card name and role description first',
        variant: 'destructive',
      })
      return
    }

    const successTitle = t('generateSuccess') || 'Generate successfully'
    const successDesc = t('tagsGenerated') || 'Tag generation completed'
    const errorTitle = t('generateError') || 'Generation failed'
    const unknownError = t('unknownError') || 'Unknown error'

    abortControllerRef.current = new AbortController()
    setLoading(true)

    try {
      const prompt = generateTags(charaData, isRegenerate)
      const result = await generateWithAI(infSettings, prompt, abortControllerRef.current.signal)

      // Parses tag strings returned by AI
      const rawTags = result.split(/[,，]/)
      const newTags = rawTags.map((tag) => tag.trim()).filter((tag) => tag)
      const uniqueTags = [...new Set([...tags, ...newTags])]

      updateField('tags', uniqueTags)
      toast({
        title: successTitle,
        description: successDesc,
      })
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        toast({ title: 'Canceled', description: 'AI generation has been canceled by the user' })
      } else {
        const errorMessage = error instanceof Error ? error.message : unknownError
        toast({
          title: errorTitle,
          description: errorMessage,
          variant: 'destructive',
        })
      }
    }
    setLoading(false)
    abortControllerRef.current = null
  }

  /**
   * Cancels the AI generation process if it is currently active.
   */
  const cancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }

  /**
   * Clears all tags and displays a notification.
   */
  const handleClearAll = () => {
    updateField('tags', [])
    toast({ title: 'Cleared', description: 'All tags have been cleared' })
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold text-foreground'>{t('tags')}</h3>
        <div className='flex gap-1'>
          {!loading && (
            <Button size='sm' variant='outline' onClick={() => handleAIGenerate(true)} className='h-8 px-2 text-xs'>
              <RefreshCcw className='w-3 h-3 mr-1' />
              Regenerate
            </Button>
          )}
          <Button
            size='sm'
            variant={loading ? 'destructive' : 'outline'}
            onClick={loading ? cancelGeneration : () => handleAIGenerate(false)}
            disabled={!loading && (!charaData.name || !charaData.description)}
            className='h-8 px-2 text-xs'
          >
            {loading ? (
              <>
                <X className='w-3 h-3 mr-1' />
                Cancel
              </>
            ) : (
              <>
                <Sparkles className='w-3 h-3 mr-1' />
                AI Generate Tags
              </>
            )}
          </Button>
          <Button size='sm' variant='outline' onClick={handleClearAll} className='h-8 px-2 text-xs'>
            <Trash2 className='w-3 h-3 mr-1' />
            Clear
          </Button>
        </div>
      </div>

      <div className='flex gap-2'>
        <Input
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={t('enterTag') || 'Enter a tag...'}
          className='flex-1'
        />
        <Button onClick={addTag} size='sm' className='bg-primary hover:bg-primary/90 text-primary-foreground'>
          <Plus className='w-4 h-4' />
        </Button>
      </div>

      <div className='flex flex-wrap gap-2'>
        {tags.map((tag, index) => (
          <Badge key={index} variant='secondary' className='flex items-center gap-1'>
            {tag}
            <Button
              size='sm'
              variant='ghost'
              onClick={() => removeTag(tag)}
              className='h-auto p-0 w-4 h-4 hover:bg-transparent'
            >
              <X className='w-3 h-3' />
            </Button>
          </Badge>
        ))}
      </div>
    </div>
  )
}

export default TagsSection
