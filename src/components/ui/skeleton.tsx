import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "relative overflow-hidden rounded-md",
        "bg-gradient-to-r from-muted/50 via-muted/80 to-muted/50",
        "dark:from-muted/30 dark:via-muted/50 dark:to-muted/30",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 skeleton-shimmer" />
    </div>
  );
}

export { Skeleton };
