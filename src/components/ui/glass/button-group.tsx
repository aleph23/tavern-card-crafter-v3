import * as React from 'react'
import { ButtonGroup as BaseButtonGroup } from '@/components/ui/button-group'
import { cn } from '@/lib/utils'
import type { GlassCustomization } from '@/lib/glass-utils'
import { getGlassStyles } from '@/lib/glass-utils'
import { hoverEffects, type HoverEffect } from '@/lib/hover-effects'

export interface ButtonGroupProps extends React.ComponentProps<typeof BaseButtonGroup> {
  variant?: string
  effect?: HoverEffect
  glass?: GlassCustomization
}

/**
 * Glass UI Button Group - A beautifully designed button group with glassy effects
 * Built on top of the base ButtonGroup component with enhanced visual styling
 */
export const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, variant: _variant = 'glass', effect = 'none', glass, ...props }, ref) => {
    return (
      <BaseButtonGroup
        ref={ref}
        className={cn(hoverEffects({ hover: effect }), className)}
        style={{ ...getGlassStyles(glass), ...props.style }}
        {...props}
      />
    )
  },
)
ButtonGroup.displayName = 'ButtonGroup'
