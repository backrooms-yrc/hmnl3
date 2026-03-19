import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center border px-2.5 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] transition-all duration-300 overflow-hidden select-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-sm hover:shadow-md [a&]:hover:bg-primary/90 rounded-mdui-lg",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground shadow-sm hover:shadow-md [a&]:hover:bg-secondary/90 rounded-mdui-lg",
        destructive:
          "border-transparent bg-destructive text-white shadow-sm hover:shadow-md [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 rounded-mdui-lg",
        outline:
          "text-foreground hover:bg-accent hover:text-accent-foreground rounded-mdui-lg",
        success:
          "border-transparent bg-green-500/90 text-white shadow-sm hover:shadow-md hover:bg-green-600 rounded-mdui-lg",
        warning:
          "border-transparent bg-amber-500/90 text-white shadow-sm hover:shadow-md hover:bg-amber-600 rounded-mdui-lg",
        info:
          "border-transparent bg-blue-500/90 text-white shadow-sm hover:shadow-md hover:bg-blue-600 rounded-mdui-lg",
        glass:
          "glass border-primary/20 text-foreground rounded-mdui-lg",
        gradient:
          "border-transparent bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md hover:shadow-lg rounded-mdui-lg",
        dot:
          "border-transparent bg-transparent text-foreground pl-1.5 before:content-[''] before:inline-block before:w-2 before:h-2 before:rounded-full before:mr-1.5",
      },
      size: {
        default: "text-xs h-5",
        sm: "text-[10px] h-4 px-2",
        lg: "text-sm h-6 px-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Badge({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
