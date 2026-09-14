import { cn } from "../../lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "neutral" | "subtle";
  level?: number;
}

const LEVEL_STYLES: Record<number, string> = {
  0: "bg-zinc-100/80 text-zinc-400 border border-dashed border-zinc-300 dark:border-zinc-600 dark:bg-zinc-800/50 dark:text-zinc-500",
  1: "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
  2: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
  3: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
  4: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/60 dark:text-yellow-300",
  5: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  6: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
  7: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
  8: "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300",
};

export function Badge({ className, variant = "default", children, level, ...props }: BadgeProps) {
  const levelStyle = level !== undefined ? LEVEL_STYLES[level] : undefined;
  
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap min-w-[80px]",
        levelStyle,
        !levelStyle && {
          default: "bg-accent/10 text-accent dark:bg-accent/20 dark:text-accent-light",
          success: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400",
          warning: "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400",
          error: "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400",
          neutral: "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400",
          subtle: "bg-transparent text-zinc-400 dark:text-zinc-500 border border-dashed border-zinc-300 dark:border-zinc-700",
        }[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
