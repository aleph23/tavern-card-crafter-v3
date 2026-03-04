import * as React from 'react'
import {
  NavigationMenu as BaseNavigationMenu,
  NavigationMenuContent as BaseNavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuIndicator,
  NavigationMenuLink,
  NavigationMenuList as BaseNavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport as BaseNavigationMenuViewport,
} from '@/components/ui/navigation-menu'
import { cn } from '@/lib/utils'
import { glassVariants, type GlassVariantProps } from '@/lib/glass-utils'

export interface NavigationMenuListProps extends React.ComponentProps<typeof BaseNavigationMenuList> {
  variant?: string
  glow?: boolean
}

export interface NavigationMenuContentProps extends React.ComponentProps<typeof BaseNavigationMenuContent> {
  variant?: string
  glow?: boolean
}

export interface NavigationMenuViewportProps extends React.ComponentProps<typeof BaseNavigationMenuViewport> {
  variant?: string
  glow?: boolean
}

/**
 * Glass UI Navigation Menu - Enhanced navigation menu with glassy effects
 */
export const NavigationMenuList = React.forwardRef<
  React.ComponentRef<typeof BaseNavigationMenuList>,
  NavigationMenuListProps
>(({ className, variant: _variant = 'glass', glow = false, ...props }, ref) => {
  return (
    <BaseNavigationMenuList
      ref={ref}
      className={cn(
        glassVariants({ variant: _variant as GlassVariantProps['variant'] }),
        glow && 'shadow-md shadow-secondary/20',
        className,
      )}
      {...props}
    />
  )
})
NavigationMenuList.displayName = 'NavigationMenuList'

export const NavigationMenuContent = React.forwardRef<
  React.ComponentRef<typeof BaseNavigationMenuContent>,
  NavigationMenuContentProps
>(({ className, variant: _variant = 'glass', glow = false, ...props }, ref) => {
  return (
    <BaseNavigationMenuContent
      ref={ref}
      className={cn(
        glassVariants({ variant: _variant as GlassVariantProps['variant'] }),
        glow && 'shadow-lg shadow-secondary/30',
        className,
      )}
      {...props}
    />
  )
})
NavigationMenuContent.displayName = 'NavigationMenuContent'

export const NavigationMenuViewport = React.forwardRef<
  React.ComponentRef<typeof BaseNavigationMenuViewport>,
  NavigationMenuViewportProps
>(({ className, variant: _variant = 'glass', glow = false, ...props }, ref) => {
  return (
    <BaseNavigationMenuViewport
      ref={ref}
      className={cn(
        glassVariants({ variant: _variant as GlassVariantProps['variant'] }),
        glow && 'shadow-lg shadow-secondary/30',
        className,
      )}
      {...props}
    />
  )
})
NavigationMenuViewport.displayName = 'NavigationMenuViewport'

export {
  BaseNavigationMenu as NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuTrigger,
}
