import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'filled' | 'outlined' | 'glass'
  label?: string
  error?: boolean
  supportingText?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = 'filled', label, error, supportingText, ...props }, ref) => {
    const [focused, setFocused] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(Boolean(props.value || props.defaultValue))
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(Boolean(e.target.value))
      props.onChange?.(e)
    }
    
    const variantStyles = {
      filled: cn(
        "h-14 w-full bg-[hsl(var(--md-sys-color-surface-container-highest))] rounded-mdui-lg rounded-b-mdui-xs",
        "border-b-2 border-[hsl(var(--md-sys-color-on-surface-variant))]",
        "focus:border-[hsl(var(--md-sys-color-primary))] focus:bg-[hsl(var(--md-sys-color-surface-container-highest)/0.9)]",
        error && "border-[hsl(var(--md-sys-color-error))]",
        "pt-6 pb-2 px-4",
        "transition-all duration-200"
      ),
      outlined: cn(
        "h-14 w-full bg-transparent rounded-mdui-lg",
        "border-2 border-[hsl(var(--md-sys-color-outline))]",
        "focus:border-[hsl(var(--md-sys-color-primary))] focus:bg-[hsl(var(--md-sys-color-primary)/0.05)]",
        error && "border-[hsl(var(--md-sys-color-error))]",
        "pt-3 pb-3 px-4",
        "transition-all duration-200"
      ),
      glass: cn(
        "h-14 w-full rounded-mdui-lg",
        "glass-input",
        "pt-3 pb-3 px-4",
      ),
    }
    
    return (
      <div className="relative w-full">
        {label && (variant === 'filled' || variant === 'glass') && (
          <label
            className={cn(
              "absolute left-4 transition-all duration-200 pointer-events-none",
              "md-sys-typescale-body-medium",
              focused || hasValue
                ? "top-2 md-sys-typescale-label-small text-[hsl(var(--md-sys-color-primary))]"
                : "top-4 text-[hsl(var(--md-sys-color-on-surface-variant))]",
              error && "text-[hsl(var(--md-sys-color-error))]"
            )}
          >
            {label}
          </label>
        )}
        {label && variant === 'outlined' && (
          <label
            className={cn(
              "absolute left-4 -top-3 bg-[hsl(var(--md-sys-color-surface))] px-1 rounded-mdui-sm",
              "md-sys-typescale-label-small",
              focused
                ? "text-[hsl(var(--md-sys-color-primary))]"
                : "text-[hsl(var(--md-sys-color-on-surface-variant))]",
              error && "text-[hsl(var(--md-sys-color-error))]"
            )}
          >
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            "md-sys-typescale-body-large text-[hsl(var(--md-sys-color-on-surface))]",
            "placeholder:text-[hsl(var(--md-sys-color-on-surface-variant))]",
            "focus:outline-none",
            "disabled:opacity-38 disabled:cursor-not-allowed",
            "hover:shadow-sm focus:shadow-md",
            variantStyles[variant],
            className
          )}
          ref={ref}
          onFocus={(e) => {
            setFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            setFocused(false)
            props.onBlur?.(e)
          }}
          onChange={handleChange}
          placeholder={variant === 'filled' ? undefined : props.placeholder}
          {...props}
        />
        {supportingText && (
          <p
            className={cn(
              "mt-2 px-4 md-sys-typescale-body-small",
              error
                ? "text-[hsl(var(--md-sys-color-error))]"
                : "text-[hsl(var(--md-sys-color-on-surface-variant))]"
            )}
          >
            {supportingText}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
