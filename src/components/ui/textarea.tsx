import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'default' | 'glass' | 'filled' | 'outlined'
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variantStyles = {
      default: "border-input bg-background shadow-sm focus-visible:border-ring focus-visible:ring-ring/50",
      glass: "glass-input border-transparent focus-visible:border-primary",
      filled: "bg-muted border-transparent hover:bg-muted/80 focus-visible:bg-background focus-visible:border-ring",
      outlined: "bg-transparent border-2 hover:border-primary/50 focus-visible:border-primary",
    }
    
    return (
      <textarea
        className={cn(
          "flex min-h-[100px] w-full rounded-mdui-lg border px-3 py-2 text-base ring-offset-background transition-all duration-300",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "md:text-sm resize-none",
          variantStyles[variant],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
