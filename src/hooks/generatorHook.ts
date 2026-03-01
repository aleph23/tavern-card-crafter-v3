import { useState, useRef } from 'react'
import { generateWithAI } from '@/utils/aiGenerator'
import { InferenceSettings } from '@/types/settings'
import { useToast } from '@/hooks/use-toast'

// Optional: Define types for generation result/error callbacks for flexibility
type GenerateCallbacks = {
  onSuccess?: (result: string) => void
  onError?: (error: string) => void
  onCancel?: () => void
}

export const useAIGeneration = (aiSettings: InferenceSettings | null, callbacks?: GenerateCallbacks) => {
  const [loading, setLoading] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const { toast } = useToast()

  const generate = async (prompt: string) => {
    if (!aiSettings) {
      toast({ title: 'Configuration error', description: 'AI settings are not configured', variant: 'destructive' })
      return
    }

    setLoading(true)
    abortControllerRef.current = new AbortController()

    try {
      const result = await generateWithAI(aiSettings, prompt, abortControllerRef.current.signal)
      if (callbacks && callbacks.onSuccess) {
        callbacks.onSuccess(result)
      }
      toast({ title: 'Generate successfully', description: 'AI generation completed' })
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        callbacks?.onCancel?.()
        toast({ title: 'Canceled', description: 'AI generation has been canceled by the user' })
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        callbacks?.onError?.(errorMessage)
        toast({ title: 'Generation failed', description: errorMessage, variant: 'destructive' })
      }
    }
    setLoading(false)
    abortControllerRef.current = null
  }

  const cancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }

  return { loading, generate, cancel }
}
