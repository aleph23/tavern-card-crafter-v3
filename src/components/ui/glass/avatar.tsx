import * as React from "react"
import { Avatar as BaseAvatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

export interface AvatarProps extends React.ComponentProps<typeof BaseAvatar> {
  glow?: boolean
  size?: "sm" | "md" | "lg"
}

/**
 * Glass UI Avatar - Enhanced avatar with glassy effects
 */
export const Avatar = React.forwardRef<
  React.ElementRef<typeof BaseAvatar>,
  AvatarProps
>(({ className, glow = false, size = "md", ...props }, ref) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-16 w-16",
  }
  
  return (
    <BaseAvatar
      ref={ref}
      className={cn(
        sizeClasses[size],
        glow && "ring-2 ring-purple-500/30 shadow-lg shadow-purple-500/20",
        "transition-all duration-200",
        className
      )}
      {...props}
    />
  )
})
Avatar.displayName = "Avatar"

export { AvatarImage, AvatarFallback }

