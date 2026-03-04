import * as React from 'react'
import { ScrollArea as BaseScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { glassVariants, type GlassVariantProps } from '@/lib/glass-utils'

export interface ScrollAreaProps extends React.ComponentProps<typeof BaseScrollArea> {
  variant?: string
  glow?: boolean
}

/**
 * Glass UI Scroll Area - Enhanced scroll area with glassy effects
 */
export const ScrollArea = React.forwardRef<React.ComponentRef<typeof BaseScrollArea>, ScrollAreaProps>(
  ({ className, variant: _variant = 'glass', glow = false, ...props }, ref) => {
    return (
      <BaseScrollArea
        ref={ref}
        className={cn(
          glassVariants({ variant: _variant as GlassVariantProps['variant'] }),
          glow && 'shadow-md shadow-secondary/20',
          className,
        )}
        {...props}
      />
    )
  },
)
ScrollArea.displayName = 'ScrollArea'

export { ScrollBar }
