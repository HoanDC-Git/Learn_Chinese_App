import { Award } from "lucide-react";
import { Badge } from "../../../components/ui/Badge";
import { cn } from "../../../lib/utils";
import type { GrammarPoint } from "../../../types";

interface GrammarDetailsHeaderProps {
  point: GrammarPoint;
  showPinyin: boolean;
  setShowPinyin: (show: boolean) => void;
  showEnglish: boolean;
  setShowEnglish: (show: boolean) => void;
  isLearned: boolean;
  onToggleLearned: () => void;
}

export function GrammarDetailsHeader({
  point,
  showPinyin,
  setShowPinyin,
  showEnglish,
  setShowEnglish,
  isLearned,
  onToggleLearned,
}: GrammarDetailsHeaderProps) {
  return (
    <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4 shrink-0 flex items-start justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Badge variant="default" className="font-mono text-xs uppercase tracking-wide">
            {point.code}
          </Badge>
          <Badge className="bg-indigo-50 dark:bg-sky-950/60 text-indigo-700 dark:text-sky-400 border border-indigo-100 dark:border-sky-900/40">
            HSK {point.level === 7 ? "7-9" : point.level}
          </Badge>
        </div>
        <h1 className="text-2xl font-bold font-hanzi text-zinc-900 dark:text-zinc-100">
          {point.title_zh}
        </h1>
        <p className="text-lg font-semibold text-indigo-600 dark:text-sky-400">
          {point.title_vi}
        </p>
        {showEnglish && point.title_en && point.title_en !== point.title_vi && (
          <p className="text-sm text-zinc-500 dark:text-zinc-500">
            {point.title_en}
          </p>
        )}
      </div>
      <div className="shrink-0 flex items-center gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg border border-zinc-200/60 dark:border-zinc-800/80">
          <button
            onClick={() => setShowPinyin(!showPinyin)}
            className={cn(
              "px-2.5 py-1 text-xs font-semibold rounded-md transition-all whitespace-nowrap cursor-pointer",
              showPinyin
                ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-sky-400 shadow-sm border border-zinc-200/50 dark:border-zinc-800/50"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            )}
          >
            Pinyin
          </button>
          <button
            onClick={() => setShowEnglish(!showEnglish)}
            className={cn(
              "px-2.5 py-1 text-xs font-semibold rounded-md transition-all whitespace-nowrap cursor-pointer",
              showEnglish
                ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-sky-400 shadow-sm border border-zinc-200/50 dark:border-zinc-800/50"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            )}
          >
            English
          </button>
        </div>
        <button
          onClick={onToggleLearned}
          title={isLearned ? "Đã học. Click để hủy đánh dấu" : "Đánh dấu đã học"}
          className={cn(
            "p-3 rounded-lg border transition-all duration-200 shadow-sm cursor-pointer",
            isLearned
              ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400"
              : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-indigo-600 dark:hover:text-sky-400 hover:bg-indigo-50/50 dark:hover:bg-sky-950/20 hover:border-indigo-100/50 dark:hover:border-sky-900/20"
          )}
        >
          <Award className={cn("w-8 h-8 transition-transform duration-200 active:scale-95", isLearned && "fill-current")} />
        </button>
      </div>
    </div>
  );
}
