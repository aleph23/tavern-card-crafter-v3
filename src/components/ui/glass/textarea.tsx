import * as React from 'react'
import { Textarea as BaseTextarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { glassVariants, type GlassVariantProps } from '@/lib/glass-utils'

export interface TextareaProps extends React.ComponentProps<typeof BaseTextarea> {
  variant?: string
  icon?: React.ReactNode
  error?: boolean
  showCounter?: boolean
  showTokens?: boolean
}

/**
 * Glass UI Textarea - A beautifully designed textarea component with glassy effects
 * Built on top of the base Textarea component with enhanced visual styling
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      variant: _variant = 'glass',
      icon,
      error,
      showCounter: _showCounter,
      showTokens: _showTokens,
      ...props
    },
    ref,
  ) => {
    return (
      <div className='relative'>
        {icon && <div className='absolute left-3 top-3 text-muted-foreground'>{icon}</div>}
        <BaseTextarea
          ref={ref}
          className={cn(
            glassVariants({ variant: _variant as GlassVariantProps['variant'] }),
            icon && 'pl-10',
            error && 'border-destructive focus-visible:ring-destructive',
            'transition-all duration-200 focus-visible:scale-[1.01]',
            className,
          )}
          {...props}
        />
      </div>
    )
  },
)
Textarea.displayName = 'Textarea'
