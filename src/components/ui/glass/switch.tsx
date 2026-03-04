import * as React from 'react'
import { Switch as BaseSwitch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { glassVariants, type GlassVariantProps } from '@/lib/glass-utils'

export interface SwitchProps extends React.ComponentProps<typeof BaseSwitch> {
  variant?: string
  glow?: boolean
}

/**
 * Glass UI Switch - Enhanced switch with glassy effects
 */
export const Switch = React.forwardRef<React.ComponentRef<typeof BaseSwitch>, SwitchProps>(
  ({ className, variant: _variant = 'glass', glow = false, ...props }, ref) => {
    return (
      <BaseSwitch
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
Switch.displayName = 'Switch'
