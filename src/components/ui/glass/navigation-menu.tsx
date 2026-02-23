import * as React from "react"
import {
  NavigationMenu as BaseNavigationMenu,
  NavigationMenuContent as BaseNavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuIndicator,
  NavigationMenuLink,
  NavigationMenuList as BaseNavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport as BaseNavigationMenuViewport,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"

export interface NavigationMenuListProps extends React.ComponentProps<typeof BaseNavigationMenuList> {
  glow?: boolean
}

export interface NavigationMenuContentProps extends React.ComponentProps<typeof BaseNavigationMenuContent> {
  glow?: boolean
}

export interface NavigationMenuViewportProps extends React.ComponentProps<typeof BaseNavigationMenuViewport> {
  glow?: boolean
}

/**
 * Glass UI Navigation Menu - Enhanced navigation menu with glassy effects
 */
export const NavigationMenuList = React.forwardRef<
  React.ElementRef<typeof BaseNavigationMenuList>,
  NavigationMenuListProps
>(({ className, variant = "glass", glow = false, ...props }, ref) => {
  return (
    <BaseNavigationMenuList
      ref={ref}
      variant={variant}
      className={cn(
        glow && "shadow-md shadow-purple-500/20",
        className
      )}
      {...props}
    />
  )
})
NavigationMenuList.displayName = "NavigationMenuList"

export const NavigationMenuContent = React.forwardRef<
  React.ElementRef<typeof BaseNavigationMenuContent>,
  NavigationMenuContentProps
>(({ className, variant = "glass", glow = false, ...props }, ref) => {
  return (
    <BaseNavigationMenuContent
      ref={ref}
      variant={variant}
      className={cn(
        glow && "shadow-lg shadow-purple-500/30",
        className
      )}
      {...props}
    />
  )
})
NavigationMenuContent.displayName = "NavigationMenuContent"

export const NavigationMenuViewport = React.forwardRef<
  React.ElementRef<typeof BaseNavigationMenuViewport>,
  NavigationMenuViewportProps
>(({ className, variant = "glass", glow = false, ...props }, ref) => {
  return (
    <BaseNavigationMenuViewport
      ref={ref}
      variant={variant}
      className={cn(
        glow && "shadow-lg shadow-purple-500/30",
        className
      )}
      {...props}
    />
  )
})
NavigationMenuViewport.displayName = "NavigationMenuViewport"

export {
  BaseNavigationMenu as NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuTrigger,
}

