import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getMasteryLabel(level: number): string {
  const labels: Record<number, string> = {
    0: "Làm quen",
    1: "Sơ cấp",
    2: "Cơ bản",
    3: "Trung cấp",
    4: "Tiến bộ",
    5: "Cao cấp",
    6: "Thành thạo",
    7: "Điêu luyện",
    8: "Tinh thông",
  };
  return labels[level] ?? `Lvl ${level}`;
}

export function getMasteryColor(level: number): string {
  if (level === 0) return "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300";
  if (level === 1) return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300";
  if (level === 2) return "bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300";
  if (level === 3) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300";
  if (level === 4) return "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300";
  if (level === 5) return "bg-lime-100 text-lime-800 dark:bg-lime-900/50 dark:text-lime-300";
  if (level === 6) return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300";
  if (level === 7) return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300";
  return "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300";
}

export function getHskBadgeColor(hskLevel: string | null | undefined): string {
  if (!hskLevel) return "bg-zinc-100 text-zinc-800 border border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700/60";
  const level = parseInt(hskLevel, 10);
  if (isNaN(level)) return "bg-zinc-100 text-zinc-800 border border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700/60";
  if (level <= 2) return "bg-green-100 text-green-800 border border-green-300 dark:bg-green-950/60 dark:text-green-400 dark:border-green-900/50";
  if (level <= 4) return "bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-900/50";
  return "bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-900/50";
}

export function isHanzi(char: string): boolean {
  const code = char.charCodeAt(0);
  return (
    (code >= 0x4E00 && code <= 0x9FFF) ||
    (code >= 0x3400 && code <= 0x4DBF) ||
    (code >= 0x20000 && code <= 0x2A6DF)
  );
}

export function filterHanziInput(text: string): string {
  return text.split("").filter((char) => {
    const code = char.charCodeAt(0);
    const isHanziChar =
      (code >= 0x4E00 && code <= 0x9FFF) ||
      (code >= 0x3400 && code <= 0x4DBF) ||
      (code >= 0x20000 && code <= 0x2A6DF);
    const isNumber = code >= 0x30 && code <= 0x39;
    const isPunctuation =
      code === 0x3001 || code === 0x3002 || code === 0xFF0C || code === 0xFF0E ||
      code === 0x300A || code === 0x300B || code === 0x300C || code === 0x300D ||
      code === 0x2018 || code === 0x2019 || code === 0x201C || code === 0x201D ||
      code === 0x2014 || code === 0x2013 || code === 0x2026 ||
      code === 0x3000 || code === 0x0020 || code === 0x003F || code === 0x0021;
    const isSpecial =
      code === 0x3008 || code === 0x3009 || code === 0xFF08 || code === 0xFF09 ||
      code === 0x3010 || code === 0x3011 || code === 0x00B7;
    return isHanziChar || isNumber || isPunctuation || isSpecial;
  }).join("");
}

export function getInputFontClass(text: string): string {
  const hasVietnameseAccents = /[ăâêôơưđảãạẻẽẹỉĩịỏõọủũụýỳỷỹỵĂÂÊÔƠƯĐẢÃẠẺẼẸỈĨỊỎÕỌỦŨỤÝỲỶỸỴ]/.test(text);
  return (!text || hasVietnameseAccents) ? "font-mixed" : "font-hanzi";
}
