import * as React from 'react'
import { Button as BaseButton, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { GlassCustomization } from '@/lib/glass-utils'
import { getGlassStyles, glassVariants, type GlassVariantProps } from '@/lib/glass-utils'
import { hoverEffects, type HoverEffect } from '@/lib/hover-effects'

export interface ButtonProps extends Omit<React.ComponentProps<typeof BaseButton>, 'variant'> {
  variant?: string
  effect?: HoverEffect
  glass?: GlassCustomization
}

/**
 * Glass UI Button - A beautifully designed button component with glassy effects
 * Built on top of the base Button component with enhanced visual effects
 *
 * @example
 * ```tsx
 * <Button
 *   glass={{
 *     color: "rgba(59, 130, 246, 0.2)",
 *     blur: 25,
 *     outline: "rgba(59, 130, 246, 0.4)"
 *   }}
 * >
 *   Click me
 * </Button>
 * ```
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, effect = 'glow', variant: _variant = 'glass', glass, ...props }, ref) => {
    return (
      <BaseButton
        ref={ref}
        className={cn(
          glassVariants({ variant: _variant as GlassVariantProps['variant'] }),
          'relative overflow-hidden',
          hoverEffects({ hover: effect }),
          className,
        )}
        style={{ ...getGlassStyles(glass), ...props.style }}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { buttonVariants }
