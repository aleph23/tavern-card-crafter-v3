import * as React from 'react'
import {
  Dialog as BaseDialog,
  DialogContent as BaseDialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { GlassCustomization } from '@/lib/glass-utils'
import { getGlassStyles, glassVariants, type GlassVariantProps } from '@/lib/glass-utils'
import { hoverEffects, type HoverEffect } from '@/lib/hover-effects'

export interface DialogContentProps extends React.ComponentProps<typeof BaseDialogContent> {
  variant?: string
  animated?: boolean
  hover?: HoverEffect
  glass?: GlassCustomization
}

/**
 * Glass UI Dialog - Enhanced dialog with glassy effects and animations
 *
 * @example
 * ```tsx
 * <DialogContent
 *   glass={{
 *     color: "rgba(139, 92, 246, 0.15)",
 *     blur: 40,
 *     outline: "rgba(139, 92, 246, 0.3)"
 *   }}
 * >
 *   Dialog content
 * </DialogContent>
 * ```
 */
export const DialogContent = React.forwardRef<React.ComponentRef<typeof BaseDialogContent>, DialogContentProps>(
  ({ className, variant: _variant = 'glass', animated = true, hover = 'none', glass, children, ...props }, ref) => {
    return (
      <BaseDialogContent
        ref={ref}
        className={cn(
          glassVariants({ variant: _variant as GlassVariantProps['variant'] }),
          'relative overflow-hidden',
          animated && 'backdrop-blur-lg',
          hoverEffects({ hover }),
          className,
        )}
        {...props}
        style={{ ...getGlassStyles(glass), ...props.style }}
      >
        {children}
      </BaseDialogContent>
    )
  },
)
DialogContent.displayName = 'DialogContent'

export { BaseDialog as Dialog, DialogTrigger, DialogHeader, DialogFooter, DialogTitle, DialogDescription }
