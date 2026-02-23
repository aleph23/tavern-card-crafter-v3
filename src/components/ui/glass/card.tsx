import * as React from 'react'
import { Card as BaseCard, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { GlassCustomization } from '@/lib/glass-utils'
import { hoverEffects, type HoverEffect } from '@/lib/hover-effects'

export interface CardProps extends React.ComponentProps<typeof BaseCard> {
  gradient?: boolean
  animated?: boolean
  hover?: HoverEffect
  glass?: GlassCustomization
}

/**
 * Glass UI Card - A beautifully designed card component with glassy effects
 * Built on top of the base Card component with enhanced visual styling
 *
 * @example
 * ```tsx
 * // Standard glass variant (default)
 * <Card variant="glass">
 *   Content
 * </Card>
 *
 * // Frosted glass variant - enhanced blur and opacity
 * <Card variant="frosted">
 *   Content
 * </Card>
 *
 * // Fluted glass variant - vertical ridges texture
 * <Card variant="fluted">
 *   Content
 * </Card>
 *
 * // Crystal glass variant - clear with highlights and glow
 * <Card variant="crystal">
 *   Content
 * </Card>
 *
 * // Custom glass properties
 * <Card
 *   variant="glass"
 *   glass={{
 *     color: "rgba(139, 92, 246, 0.2)",
 *     blur: 30,
 *     transparency: 0.3,
 *     outline: "rgba(139, 92, 246, 0.5)",
 *     innerGlow: "rgba(255, 255, 255, 0.3)",
 *     innerGlowBlur: 25
 *   }}
 *   gradient
 *   animated
 * >
 *   Content
 * </Card>
 * ```
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    { className, variant = 'glass', gradient = false, animated = false, hover = 'none', glass, children, ...props },
    ref
  ) => {
    return (
      <BaseCard
        ref={ref}
        variant={variant}
        glass={glass}
        className={cn(
          'relative overflow-hidden',
          gradient && 'bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-pink-500/10',
          animated && 'transition-all duration-300 hover:scale-[1.02] hover:shadow-[var(--glass-shadow-lg)]',
          hoverEffects({ hover }),
          className
        )}
        {...props}
      >
        {children}
      </BaseCard>
    )
  }
)
Card.displayName = 'Card'

export { CardContent, CardDescription, CardFooter, CardHeader, CardTitle }
