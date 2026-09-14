import { cn } from "../../lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: "elevated" | "flat" | "outlined";
}

export function Card({ className, children, variant = "flat", ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl transition-all duration-200",
        {
          flat: "bg-zinc-50 dark:bg-zinc-900",
          elevated: "bg-white dark:bg-zinc-900 shadow-lg shadow-zinc-200/50 dark:shadow-black/20",
          outlined: "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800",
        }[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
