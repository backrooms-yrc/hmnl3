import * as React from "react"

import { cn } from "@/lib/utils"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'filled' | 'outlined' | 'glass' | 'glass-light' | 'glass-heavy'
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'elevated', ...props }, ref) => {
    const variantStyles = {
      elevated: "md-sys-surface md-sys-elevation-1 hover:md-sys-elevation-2",
      filled: "bg-[hsl(var(--md-sys-color-surface-container-highest))]",
      outlined: "md-sys-surface border border-[hsl(var(--md-sys-color-outline-variant))]",
      glass: "glass-card",
      'glass-light': "glass-card-light",
      'glass-heavy': "glass-card-heavy",
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col gap-4 p-4 md-sys-shape-corner-xl md-transition",
          variantStyles[variant],
          className
        )}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col gap-1.5", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("md-sys-typescale-title-large", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("md-sys-typescale-body-medium text-[hsl(var(--md-sys-color-on-surface-variant))]", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardAction = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("self-end", className)}
    {...props}
  />
))
CardAction.displayName = "CardAction"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-2 pt-2", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

const CardMedia = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { aspectRatio?: '16-9' | '3-4' | '1-1' | '4-3' }
>(({ className, aspectRatio = '16-9', ...props }, ref) => {
  const aspectStyles = {
    '16-9': 'aspect-video',
    '3-4': 'aspect-[3/4]',
    '1-1': 'aspect-square',
    '4-3': 'aspect-[4/3]',
  }
  
  return (
    <div
      ref={ref}
      className={cn(
        "w-full overflow-hidden md-sys-shape-corner-md",
        aspectStyles[aspectRatio],
        className
      )}
      {...props}
    />
  )
})
CardMedia.displayName = "CardMedia"

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent, CardMedia }
