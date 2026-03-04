import * as React from 'react'
import { Checkbox as BaseCheckbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { glassVariants, type GlassVariantProps } from '@/lib/glass-utils'

export interface CheckboxProps extends React.ComponentProps<typeof BaseCheckbox> {
  variant?: string
  glow?: boolean
}

/**
 * Glass UI Checkbox - Enhanced checkbox with glassy effects
 */
export const Checkbox = React.forwardRef<React.ComponentRef<typeof BaseCheckbox>, CheckboxProps>(
  ({ className, variant: _variant = 'glass', glow = false, ...props }, ref) => {
    return (
      <BaseCheckbox
        ref={ref}
        className={cn(
          glassVariants({ variant: _variant as GlassVariantProps['variant'] }),
          glow && 'data-[state=checked]:shadow-lg data-[state=checked]:shadow-secondary/30',
          'transition-all duration-200',
          className,
        )}
        {...props}
      />
    )
  },
)
Checkbox.displayName = 'Checkbox'
