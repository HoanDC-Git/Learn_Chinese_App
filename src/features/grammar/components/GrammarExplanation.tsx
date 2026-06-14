import type { GrammarPoint } from "../../../types";

interface GrammarExplanationProps {
  point: GrammarPoint;
  showEnglish: boolean;
}

export function GrammarExplanation({
  point,
  showEnglish,
}: GrammarExplanationProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
        Giải nghĩa và cách dùng
      </h3>

      <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/30 border border-zinc-100 dark:border-zinc-800 space-y-3">
        {point.explanation_vi && (
          <div className="space-y-1">
            <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500">TIẾNG VIỆT</span>
            <p className="text-base text-zinc-800 dark:text-zinc-200 font-sans leading-relaxed whitespace-pre-wrap">
              {point.explanation_vi}
            </p>
          </div>
        )}

        {showEnglish && point.explanation_en && (
          <div className="space-y-1 border-t border-zinc-100 dark:border-zinc-800/80 pt-3">
            <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500">ENGLISH</span>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
              {point.explanation_en}
            </p>
          </div>
        )}

        {point.explanation_zh && (
          <div className="space-y-1 border-t border-zinc-100 dark:border-zinc-800/80 pt-3">
            <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500">中文解释</span>
            <p className="text-sm font-hanzi text-zinc-500 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
              {point.explanation_zh}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
