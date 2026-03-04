import { useState, useRef } from 'react'
import { Label } from '@/components/ui/glass/label'
import { Input } from '@/components/ui/glass/input'
import { Textarea } from '@/components/ui/glass/textarea'
import { Button } from '@/components/ui/glass/button'
import { Plus, X, Sparkles, Loader2, RefreshCcw, Trash2 } from 'lucide-react'
import { generateWithAI, generateCharacterBookEntry } from '@/utils/aiGenerator'
import { InferenceSettings } from '@/types/settings'
import { useToast } from '@/hooks/use-toast'
import { CharacterBookEntry, UsedCharacterData, createCharacterBookEntry } from '@/types/charactercard'

interface CharacterBookProps {
  entries: CharacterBookEntry[]
  updateField: (field: string, value: { entries: CharacterBookEntry[] }) => void
  infSettings: InferenceSettings | null
  charaData: UsedCharacterData
}

const CharacterBook = ({ entries, updateField, infSettings, charaData }: CharacterBookProps) => {
  const [newEntryKeys, setNewEntryKeys] = useState('')
  const [newEntryContent, setNewEntryContent] = useState('')
  const [loading, setLoading] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const { toast } = useToast()

  /**
   * Adds a new book entry if both keys and content are provided.
   */
  const addBookEntry = () => {
    if (newEntryKeys.trim() && newEntryContent.trim()) {
      const keys = newEntryKeys.split(',').map((k) => k.trim())
      const entry = createCharacterBookEntry({
        keys,
        content: newEntryContent.trim(),
        insertion_order: 100,
        enabled: true,
      })

      updateField('character_book', { entries: [...entries, entry] })

      setNewEntryKeys('')
      setNewEntryContent('')
    }
  }

  /**
   * Removes a book entry at the specified index.
   */
  const removeBookEntry = (index: number) => {
    updateField('character_book', { entries: entries.filter((_, i) => i !== index) })
  }

  const handleAIGenerateEntry = async (isRegenerate: boolean = false) => {
    if (
      !infSettings?.endpoint?.apiKey &&
      !['ollama', 'lmstudio'].includes(infSettings?.endpoint?.provider?.toLowerCase() || '')
    ) {
      toast({
        title: 'Configuration error',
        description: 'Please configure the API key in the AI settings first',
        variant: 'destructive',
      })
      return
    }

    if (!charaData.name || !charaData.description) {
      toast({
        title: 'Incomplete information',
        description: 'Please fill in the Card name and role description first',
        variant: 'destructive',
      })
      return
    }

    abortControllerRef.current = new AbortController()
    setLoading(true)

    try {
      const payload = {
        ...charaData,
        keys: newEntryKeys
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean),
        content: newEntryContent,
      }
      const prompt = generateCharacterBookEntry(payload, isRegenerate)
      const result = await generateWithAI(infSettings, prompt, abortControllerRef.current.signal)

      // Analyze the content returned by AI and try to extract keywords and content
      const splitLines = result.split('\n')
      const lines = splitLines.filter((line) => line.trim())
      let keys: string[] = []
      let content = result

      // Try to parse formatted reply
      for (const line of lines) {
        const lowerLine = line.toLowerCase()
        if (lowerLine.includes('keywords:')) {
          const keywordsMatch = line.match(/keywords[: ]+\s*(.+)/i)
          if (keywordsMatch) {
            const rawKeywords = keywordsMatch[1].split(/[,\s]+/)
            keys = rawKeywords.map((k) => k.trim().replace(/^["']|["']$/g, '')).filter(Boolean)
          }
        } else if (lowerLine.includes('content:')) {
          const contentMatch = line.match(/content[: ]+\s*(.+)/i)
          if (contentMatch) {
            const lineIndex = lines.indexOf(line)
            content = lines
              .slice(lineIndex)
              .join('\n')
              .replace(/^content[: ]+\s*/i, '')
            break
          }
        }
      }

      // If the keyword is not parsed, use the Card name as the keyword
      if (keys.length === 0) {
        keys = [charaData.name]
      }

      const entry = createCharacterBookEntry({ keys, content: content.trim(), insertion_order: 100, enabled: true })

      updateField('character_book', { entries: [...entries, entry] })

      toast({ title: 'Generate successfully', description: 'The character book entry has been generated' })
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        toast({ title: 'Canceled', description: 'AI generation has been canceled by the user' })
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        toast({
          title: 'Generation failed',
          description: errorMessage,
          variant: 'destructive',
        })
      }
    }
    setLoading(false)
    abortControllerRef.current = null
  }

  /**
   * Cancels the ongoing AI generation process.
   */
  const cancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }

  const handleClearAll = () => {
    updateField('character_book', { entries: [] })
    toast({ title: 'Cleared', description: 'All character book entries have been cleared' })
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold text-foreground mb-4'>Character Book</h3>
        <div className='flex gap-1'>
          {!loading && (
            <Button
              size='sm'
              variant='outline'
              onClick={() => handleAIGenerateEntry(true)}
              className='h-8 px-2 text-xs'
            >
              <RefreshCcw className='w-3 h-3 mr-1' />
              Regenerate
            </Button>
          )}
          <Button
            size='sm'
            variant={loading ? 'destructive' : 'outline'}
            onClick={loading ? cancelGeneration : () => handleAIGenerateEntry(false)}
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
                AI generates entries
              </>
            )}
          </Button>
          <Button size='sm' variant='outline' onClick={handleClearAll} className='h-8 px-2 text-xs'>
            <Trash2 className='w-3 h-3 mr-1' />
            Clear
          </Button>
        </div>
      </div>

      <div>
        <Label className='text-sm font-medium text-foreground/80'>Add a new entry</Label>
        <div className='space-y-2 mt-2'>
          <Input
            value={newEntryKeys}
            onChange={(e) => setNewEntryKeys(e.target.value)}
            placeholder='Keywords (separated by commas)...'
          />
          <Textarea
            value={newEntryContent}
            onChange={(e) => setNewEntryContent(e.target.value)}
            placeholder='Entry content...'
            className='min-h-[80px]'
            showCounter={true}
          />
          <Button onClick={addBookEntry} size='sm'>
            <Plus className='w-4 h-4 mr-2' />
            Add an entry
          </Button>
        </div>
      </div>

      <div className='space-y-2'>
        {entries.map((entry, index) => (
          <div key={index} className='p-3 bg-muted/50 rounded-lg relative'>
            <Button size='sm' variant='ghost' className='absolute top-1 right-1' onClick={() => removeBookEntry(index)}>
              <X className='w-4 h-4' />
            </Button>
            <div className='pr-8'>
              <div className='text-sm font-medium text-foreground/80 mb-1'>Keywords: {entry.keys.join(', ')}</div>
              <p className='text-sm text-muted-foreground mb-2'>{entry.content}</p>
              <div className='text-xs text-muted-foreground'>
                character: {entry.content.length} | Token: {Math.ceil(entry.content.length * 0.75)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CharacterBook
