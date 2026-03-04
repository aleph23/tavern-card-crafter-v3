import * as React from 'react'
import { Alert as BaseAlert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import { glassVariants, type GlassVariantProps } from '@/lib/glass-utils'
import { hoverEffects, type HoverEffect } from '@/lib/hover-effects'

export interface AlertProps extends Omit<React.ComponentProps<typeof BaseAlert>, 'variant'> {
  variant?: string
  glow?: boolean
  hover?: HoverEffect
}

/**
 * Glass UI Alert - Enhanced alert with glassy effects and hover animations
 *
 * @example
 * ```tsx
 * <Alert variant="glass" hover="glow">
 *   <AlertTitle>Heads up!</AlertTitle>
 *   <AlertDescription>You have new notifications</AlertDescription>
 * </Alert>
 * ```
 */
export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant: _variant = 'glass', glow = false, hover = 'none', ...props }, ref) => {
    return (
      <BaseAlert
        ref={ref}
        className={cn(
          glassVariants({ variant: _variant as GlassVariantProps['variant'] }),
          'relative overflow-hidden',
          glow && 'shadow-lg shadow-secondary/20',
          'transition-all duration-200',
          hoverEffects({ hover }),
          className,
        )}
        {...props}
      />
    )
  },
)
Alert.displayName = 'Alert'

export { AlertDescription, AlertTitle }
