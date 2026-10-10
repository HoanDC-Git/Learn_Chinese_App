import { cn } from "../../lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "neutral" | "subtle";
  level?: number;
}

// Thermal SRS progression: level 0 = unseen (gray dashed), levels 1-8 run cold -> hot
// (sky -> cyan -> teal -> emerald -> yellow -> amber -> orange -> rose) so mastery
// reads at a glance: cool colors = early, warm colors = advanced. Each level gets its
// own hue (-200 fill / -900 text for punch at small sizes). Level 8 (mastered) is a
// solid hot-red pill with a gold ring as the ultimate-tier marker.
const LEVEL_STYLES: Record<number, string> = {
  0: "bg-zinc-100/80 text-zinc-400 border border-dashed border-zinc-300 dark:border-zinc-600 dark:bg-zinc-800/50 dark:text-zinc-500",
  1: "bg-sky-200 text-sky-900 dark:bg-sky-950/60 dark:text-sky-300",
  2: "bg-cyan-200 text-cyan-900 dark:bg-cyan-950/60 dark:text-cyan-300",
  3: "bg-teal-200 text-teal-900 dark:bg-teal-950/60 dark:text-teal-300",
  4: "bg-emerald-200 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300",
  5: "bg-yellow-200 text-yellow-900 dark:bg-yellow-950/60 dark:text-yellow-300",
  6: "bg-amber-300 text-amber-950 dark:bg-amber-900/60 dark:text-amber-200",
  7: "bg-orange-300 text-orange-950 dark:bg-orange-900/60 dark:text-orange-200",
  8: "bg-rose-600 text-white ring-1 ring-amber-300/80 dark:bg-rose-600/80 dark:text-white dark:ring-amber-300/50",
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
