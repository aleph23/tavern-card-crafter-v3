import * as React from 'react'
import { Sidebar as BaseSidebar, SidebarContent, SidebarFooter, SidebarHeader } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { glassVariants, type GlassVariantProps } from '@/lib/glass-utils'

export interface SidebarProps extends Omit<React.ComponentProps<typeof BaseSidebar>, 'variant'> {
  variant?: string
  glow?: boolean
}

/**
 * Glass UI Sidebar - Enhanced sidebar with glassy effects
 */
export const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, variant: _variant = 'glass', glow = false, ...props }, ref) => {
    return (
      <BaseSidebar
        ref={ref}
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
Sidebar.displayName = 'Sidebar'

export { SidebarHeader, SidebarContent, SidebarFooter }
