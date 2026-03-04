import * as React from 'react'
import {
  Accordion as BaseAccordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger as BaseAccordionTrigger,
} from '@/components/ui/accordion'
import { cn } from '@/lib/utils'
import { glassVariants, type GlassVariantProps } from '@/lib/glass-utils'

export interface AccordionTriggerProps extends React.ComponentProps<typeof BaseAccordionTrigger> {
  variant?: string
  glow?: boolean
}

/**
 * Glass UI Accordion - Enhanced accordion with glassy effects
 */
export const AccordionTrigger = React.forwardRef<
  React.ComponentRef<typeof BaseAccordionTrigger>,
  AccordionTriggerProps
>(({ className, variant: _variant = 'glass', glow = false, ...props }, ref) => {
  return (
    <BaseAccordionTrigger
      ref={ref}
      className={cn(
        glassVariants({ variant: _variant as GlassVariantProps['variant'] }),
        glow && 'data-[state=open]:shadow-md data-[state=open]:shadow-secondary/20',
        className,
      )}
      {...props}
    />
  )
})
AccordionTrigger.displayName = 'AccordionTrigger'

export { BaseAccordion as Accordion, AccordionItem, AccordionContent }
