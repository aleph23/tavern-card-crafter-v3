
import * as React from "react"
import { cn } from "@/lib/utils"
import TextCounter from "./text-counter"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  showCounter?: boolean;
  showTokens?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, showCounter = false, showTokens = true, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          className={cn(
            "flex min-h-[80px] w-full max-w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 relative z-1",
            className
          )}
          ref={ref}
          {...props}
        />
        {showCounter && (
          <TextCounter 
            text={props.value?.toString() || ""} 
            className="mt-1" 
            showTokens={showTokens}
          />
        )}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
