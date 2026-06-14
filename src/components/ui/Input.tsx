import { cn } from "../../lib/utils";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 placeholder-zinc-400 dark:placeholder-zinc-500 text-zinc-900 dark:text-zinc-100",
        className
      )}
      {...props}
    />
  );
}
