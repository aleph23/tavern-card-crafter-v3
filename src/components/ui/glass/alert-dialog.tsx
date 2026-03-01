import * as React from 'react'
import {
  AlertDialog as BaseAlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent as BaseAlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'

export interface AlertDialogContentProps extends React.ComponentProps<typeof BaseAlertDialogContent> {
  variant?: string
  animated?: boolean
}

/**
 * Glass UI Alert Dialog - Enhanced alert dialog with glassy effects
 */
export const AlertDialogContent = React.forwardRef<
  React.ComponentRef<typeof BaseAlertDialogContent>,
  AlertDialogContentProps
>(({ className, variant: _variant = 'glass', animated = true, ...props }, ref) => {
  return (
    <BaseAlertDialogContent
      ref={ref}
      className={cn(animated && 'backdrop-blur-[var(--blur-lg)]', className)}
      {...props}
    />
  )
})
AlertDialogContent.displayName = 'AlertDialogContent'

export {
  BaseAlertDialog as AlertDialog,
  AlertDialogTrigger,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
