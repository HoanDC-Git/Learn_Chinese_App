import { cn } from "../../lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-600 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none",
        {
          primary: "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-sm shadow-zinc-900/10 dark:shadow-zinc-100/10",
          secondary: "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700",
          ghost: "bg-transparent text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800",
          danger: "bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/20",
        }[variant],
        {
          sm: "px-3 py-1.5 text-sm gap-1.5",
          md: "px-4 py-2 text-sm gap-2",
          lg: "px-6 py-3 text-base gap-2.5",
        }[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
