import { cn } from "../../lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info";
}

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  const badgeMap: Record<string, string> = {
    default: "bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-400 border border-sky-300 dark:border-sky-900/50",
    success: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-900/50",
    warning: "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-900/50",
    error: "bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-400 border border-purple-300 dark:border-purple-200/10",
    info: "bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-400 border border-sky-300 dark:border-sky-900/50",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold",
        badgeMap[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
