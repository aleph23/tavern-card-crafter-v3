import * as React from 'react'
import { Badge as BaseBadge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { glassVariants, type GlassVariantProps } from '@/lib/glass-utils'
import { hoverEffects, type HoverEffect } from '@/lib/hover-effects'

export interface BadgeProps extends Omit<React.ComponentProps<typeof BaseBadge>, 'variant'> {
  variant?: string
  glow?: boolean
  hover?: HoverEffect
}

/**
 * Glass UI Badge - Enhanced badge with glassy effects and glow option
 */
export function Badge({ className, variant: _variant = 'glass', glow = false, hover = 'none', ...props }: BadgeProps) {
  return (
    <BaseBadge
      className={cn(
        glassVariants({ variant: _variant as GlassVariantProps['variant'] }),
        'relative overflow-hidden',
        glow && 'shadow-lg shadow-secondary/30',
        'transition-all duration-200',
        hoverEffects({ hover }),
        className,
      )}
      {...props}
    />
  )
}
