import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap md-sys-typescale-label-large relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-38 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0 select-none",
  {
    variants: {
      variant: {
        filled:
          "bg-[hsl(var(--md-sys-color-primary))] text-[hsl(var(--md-sys-color-on-primary))] md-sys-state-layer hover:shadow-lg active:shadow-md rounded-mdui-lg",
        filledTonal:
          "bg-[hsl(var(--md-sys-color-secondary-container))] text-[hsl(var(--md-sys-color-on-secondary-container))] md-sys-state-layer hover:shadow-md active:shadow-sm rounded-mdui-lg",
        filledError:
          "bg-[hsl(var(--md-sys-color-error))] text-[hsl(var(--md-sys-color-on-error))] md-sys-state-layer hover:shadow-lg active:shadow-md rounded-mdui-lg",
        outlined:
          "border-2 border-[hsl(var(--md-sys-color-outline))] text-[hsl(var(--md-sys-color-primary))] bg-transparent md-sys-state-layer hover:bg-[hsl(var(--md-sys-color-primary)/0.08)] rounded-mdui-lg",
        outlinedError:
          "border-2 border-[hsl(var(--md-sys-color-error))] text-[hsl(var(--md-sys-color-error))] bg-transparent md-sys-state-layer hover:bg-[hsl(var(--md-sys-color-error)/0.08)] rounded-mdui-lg",
        text:
          "text-[hsl(var(--md-sys-color-primary))] bg-transparent md-sys-state-layer hover:bg-[hsl(var(--md-sys-color-primary)/0.08)] rounded-mdui-lg",
        textError:
          "text-[hsl(var(--md-sys-color-error))] bg-transparent md-sys-state-layer hover:bg-[hsl(var(--md-sys-color-error)/0.08)] rounded-mdui-lg",
        elevated:
          "bg-[hsl(var(--md-sys-color-surface-container-low))] text-[hsl(var(--md-sys-color-primary))] md-sys-elevation-1 md-sys-state-layer hover:md-sys-elevation-2 active:shadow-sm rounded-mdui-lg",
        tonal:
          "bg-[hsl(var(--md-sys-color-secondary-container))] text-[hsl(var(--md-sys-color-on-secondary-container))] md-sys-state-layer hover:bg-[hsl(var(--md-sys-color-secondary-container)/0.9)] rounded-mdui-lg",
        icon:
          "text-[hsl(var(--md-sys-color-on-surface-variant))] bg-transparent md-sys-state-layer hover:bg-[hsl(var(--md-sys-color-on-surface-variant)/0.08)] rounded-mdui-full",
        iconFilled:
          "bg-[hsl(var(--md-sys-color-primary-container))] text-[hsl(var(--md-sys-color-on-primary-container))] md-sys-state-layer hover:bg-[hsl(var(--md-sys-color-primary-container)/0.9)] rounded-mdui-full",
        iconTonal:
          "bg-[hsl(var(--md-sys-color-secondary-container))] text-[hsl(var(--md-sys-color-on-secondary-container))] md-sys-state-layer hover:bg-[hsl(var(--md-sys-color-secondary-container)/0.9)] rounded-mdui-full",
        iconOutlined:
          "border-2 border-[hsl(var(--md-sys-color-outline))] text-[hsl(var(--md-sys-color-on-surface-variant))] bg-transparent md-sys-state-layer hover:bg-[hsl(var(--md-sys-color-on-surface-variant)/0.08)] rounded-mdui-full",
        fab:
          "bg-[hsl(var(--md-sys-color-primary-container))] text-[hsl(var(--md-sys-color-on-primary-container))] md-sys-elevation-3 md-sys-state-layer hover:md-sys-elevation-4 active:shadow-md rounded-mdui-lg",
        fabExtended:
          "bg-[hsl(var(--md-sys-color-primary-container))] text-[hsl(var(--md-sys-color-on-primary-container))] md-sys-elevation-3 md-sys-state-layer hover:md-sys-elevation-4 active:shadow-md pl-4 pr-6 rounded-mdui-lg",
        fabLowered:
          "bg-[hsl(var(--md-sys-color-secondary-container))] text-[hsl(var(--md-sys-color-on-secondary-container))] md-sys-elevation-1 md-sys-state-layer hover:md-sys-elevation-2 rounded-mdui-lg",
        fabSurface:
          "bg-[hsl(var(--md-sys-color-surface-container-high))] text-[hsl(var(--md-sys-color-primary))] md-sys-elevation-3 md-sys-state-layer hover:md-sys-elevation-4 rounded-mdui-lg",
        segmented:
          "bg-transparent text-[hsl(var(--md-sys-color-on-surface))] border-2 border-[hsl(var(--md-sys-color-outline))] md-sys-state-layer hover:bg-[hsl(var(--md-sys-color-on-surface)/0.08)] rounded-mdui-lg",
        glass:
          "glass-button text-[hsl(var(--md-sys-color-primary))]",
      },
      size: {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 px-4 py-1.5 md-sys-typescale-label-medium",
        lg: "h-14 px-8 py-4",
        xl: "h-16 px-10 py-5",
        icon: "h-11 w-11",
        "icon-sm": "h-9 w-9",
        "icon-lg": "h-14 w-14",
        "icon-xl": "h-16 w-16",
        fab: "h-14 w-14",
        "fab-extended": "h-14",
        "fab-large": "h-24 w-24",
        "fab-small": "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "filled",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
