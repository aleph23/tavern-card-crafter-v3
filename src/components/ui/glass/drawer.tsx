import * as React from 'react'
import {
  Drawer as BaseDrawer,
  DrawerClose,
  DrawerContent as BaseDrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { cn } from '@/lib/utils'
import { glassVariants, type GlassVariantProps } from '@/lib/glass-utils'

export interface DrawerContentProps extends React.ComponentProps<typeof BaseDrawerContent> {
  variant?: string
  glow?: boolean
  direction?: 'top' | 'bottom' | 'left' | 'right'
}

/**
 * Glass UI Drawer - Enhanced drawer with glassy effects
 */
export const DrawerContent = React.forwardRef<React.ComponentRef<typeof BaseDrawerContent>, DrawerContentProps>(
  ({ className, variant: _variant = 'glass', glow = false, direction = 'bottom', ...props }, ref) => {
    return (
      <BaseDrawerContent
        ref={ref}
        direction={direction}
        className={cn(
          glassVariants({ variant: _variant as GlassVariantProps['variant'] }),
          glow && 'shadow-lg shadow-secondary/20',
          className,
        )}
        {...props}
      />
    )
  },
)
DrawerContent.displayName = 'DrawerContent'

export {
  BaseDrawer as Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}
