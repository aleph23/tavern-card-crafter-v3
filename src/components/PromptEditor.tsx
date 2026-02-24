import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/glass/button'
import { Textarea } from '@/components/ui/glass/textarea'
import { Input } from '@/components/ui/glass/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/glass/dialog'
import { useToast } from '@/hooks/use-toast'
import { ScrollArea } from '@/components/ui/glass/scroll-area'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/glass/card'
import { Label } from '@/components/ui/glass/label'
import { FileText } from 'lucide-react'
import { promptManager } from '@/utils/promptManager'
import { PromptCollection } from '@/types/prompts'

export const PromptEditor: React.FC = () => {
  const [prompts, setPrompts] = useState<PromptCollection>({})
  const [activeTab, setActiveTab] = useState<string>('description_enhance')
  const [hasChanges, setHasChanges] = useState(false)
  const { toast } = useToast()

  const loadPrompts = async () => {
    await promptManager.loadPrompts()
    setPrompts(promptManager.getAllPrompts())
    setHasChanges(false)
  }

  useEffect(() => {
    loadPrompts()
  }, [])

  const handlePromptChange = (key: string, newValue: string) => {
    setPrompts((prev) => ({ ...prev, [key]: { ...prev[key], template: newValue } }))
    setHasChanges(true)
  }
  // Save handler with improved error message handling
  const handleSave = async () => {
    try {
      await promptManager.savePrompts(prompts)
      setHasChanges(false)
      toast({ title: 'Success', description: 'Prompts saved successfully' })
    } catch (error: unknown) {
      console.error('Save error:', error)

      // Clean up the error message from Electron's IPC wrapper
      // This removes the "Error invoking remote method..." prefix so the user sees just your message
      const cleanMessage =
        error instanceof Error
          ? error.message.replace(/Error invoking remote method '[^']+': /, '')
          : 'Failed to save prompts'

      toast({ title: 'Save Failed', description: cleanMessage, variant: 'destructive' })
    }
  }

  const handleResetAll = async () => {
    if (!confirm('Are you sure you want to reset all prompts to default values? This cannot be undone.')) {
      return
    }

    try {
      await promptManager.resetPrompts()
      setPrompts(promptManager.getAllPrompts())
      setHasChanges(false)
      toast({ title: 'Success', description: 'Prompts reset to defaults' })
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to reset prompts', variant: 'destructive' })
    }
  }

  // Preview state
  const [previewData, setPreviewData] = useState<Record<string, string>>({
    name: 'Alice',
    description: 'A young woman with blonde hair and blue eyes, wearing a frilly blue and white dress.',
    personality: 'Innocent, curious, sometimes reckless.',
    scenario: 'Alice follows a bunny into its hole. Surrealist adventure ensues.',
    first_mes:
      'The fall seems endless. Alice passes by shelves of books, floating teacups, and curious creatures. When she finally lands, she finds herself in a strange hallway with many doors.',
    mes_example:
      '<START>\nWhite Rabbit: "Mary Ann! Mary Ann! Fetch me a pair of gloves and a fan! Quick, now!"\nAlice: "Oh dear, I seem to have fallen down a rabbit hole. Where am I?"\nWhite Rabbit: "No time to explain! Hurry!"',
    system_prompt: 'You are Alice.',
  })
  const [showPreview, setShowPreview] = useState(false)

  const getInterpolatedPreview = (key: string) => {
    const template = prompts[key]?.template || ''
    return promptManager.interpolatePrompt(template, previewData)
  }

  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-center mb-4'>
        <div>
          <h2 className='text-lg font-semibold'>Prompt Templates</h2>
          <p className='text-sm text-muted-foreground'>Customize the prompts used for AI generation.</p>
        </div>
        <div className='space-x-2'>
          <Dialog open={showPreview} onOpenChange={setShowPreview}>
            <DialogTrigger asChild>
              <Button variant='outline' size='sm'>
                Preview Interpolation
              </Button>
            </DialogTrigger>
            <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
              <DialogHeader>
                <DialogTitle>Preview Interpolation</DialogTitle>
                <DialogDescription>See how the current prompt looks with sample data.</DialogDescription>
              </DialogHeader>
              <div className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label>Sample Name</Label>
                    <Input
                      value={previewData.name}
                      onChange={(e) => setPreviewData({ ...previewData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Sample Description</Label>
                    <Input
                      value={previewData.description}
                      onChange={(e) => setPreviewData({ ...previewData, description: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label className='font-bold'>Result:</Label>
                  <div className='bg-muted p-4 rounded-md whitespace-pre-wrap text-sm mt-2'>
                    {getInterpolatedPreview(activeTab)}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant='outline'
            size='sm'
            onClick={handleResetAll}
            className='text-destructive hover:text-destructive'
          >
            Reset All
          </Button>
          <Button size='sm' onClick={handleSave} disabled={!hasChanges}>
            Save Changes
          </Button>
        </div>
      </div>

      <div className='flex flex-col md:flex-row gap-4 h-[600px]'>
        {/* Left sidebar - styled like Index.tsx */}
        <div className='w-full md:w-1/4 h-full bg-card/80 backdrop-blur-sm border rounded-lg overflow-hidden'>
          <div className='p-3 border-b border-border'>
            <h3 className='text-sm font-semibold text-foreground/90'>Prompt Templates</h3>
          </div>
          <ScrollArea className='h-[calc(100%-48px)]'>
            <nav className='p-2'>
              <div className='space-y-1'>
                {Object.entries(prompts).map(([key, prompt]) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm rounded-lg transition-all duration-200 ${
                      activeTab === key
                        ? 'cta-button-gradient text-white shadow-md'
                        : 'text-foreground/70 hover:bg-muted'
                    }`}
                  >
                    <FileText className='w-4 h-4 flex-shrink-0' />
                    <span className='font-medium truncate'>{prompt.name}</span>
                  </button>
                ))}
              </div>
            </nav>
          </ScrollArea>
        </div>

        <Card className='flex-1 flex flex-col'>
          <CardHeader className='py-4'>
            <CardTitle className='text-foreground'>{prompts[activeTab]?.name}</CardTitle>
            <CardDescription className='text-muted-foreground'>{prompts[activeTab]?.description}</CardDescription>
          </CardHeader>
          <CardContent className='flex-1 p-4 pt-0'>
            <Textarea
              className='h-full min-h-[400px] font-mono text-sm resize-none'
              value={prompts[activeTab]?.template || ''}
              onChange={(e) => handlePromptChange(activeTab, e.target.value)}
            />
            <div className='mt-2 text-xs text-muted-foreground text-right'>
              Length: {prompts[activeTab]?.template?.length || 0} chars
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
