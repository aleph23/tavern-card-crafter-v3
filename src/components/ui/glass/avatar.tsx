import * as React from 'react'
import { Avatar as BaseAvatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { glassVariants, type GlassVariantProps } from '@/lib/glass-utils'

export interface AvatarProps extends React.ComponentProps<typeof BaseAvatar> {
  glow?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: string
}

/**
 * Glass UI Avatar - Enhanced avatar with glassy effects
 */
export const Avatar = React.forwardRef<React.ComponentRef<typeof BaseAvatar>, AvatarProps>(
  ({ className, glow = false, size = 'md', variant: _variant = 'glass', ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-8 w-8',
      md: 'h-10 w-10',
      lg: 'h-16 w-16',
    }

    return (
      <BaseAvatar
        ref={ref}
        className={cn(
          glassVariants({ variant: _variant as GlassVariantProps['variant'] }),
          sizeClasses[size],
          glow && 'ring-2 ring-secondary/30 shadow-lg shadow-secondary/20',
          'transition-all duration-200',
          className,
        )}
        {...props}
      />
    )
  },
)
Avatar.displayName = 'Avatar'

export { AvatarImage, AvatarFallback }
