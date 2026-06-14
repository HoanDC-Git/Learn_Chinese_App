import { Volume2 } from "lucide-react";
import { Badge } from "../../../components/ui/Badge";
import type { GrammarExample } from "../../../types";

interface GrammarExampleCardProps {
  example: GrammarExample;
  index: number;
  showPinyin: boolean;
  showEnglish: boolean;
  speakText: (text: string, rate?: number) => Promise<void>;
}

export function GrammarExampleCard({
  example,
  index,
  showPinyin,
  showEnglish,
  speakText,
}: GrammarExampleCardProps) {
  return (
    <div className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 hover:bg-zinc-100/40 dark:hover:bg-zinc-800/30 transition-colors flex flex-col gap-1.5 relative group">
      {/* Speaker Button on the top right */}
      <button
        onClick={() => speakText(example.sentence_zh, 300)}
        title="Nghe phát âm ví dụ"
        className="absolute right-3 top-3 p-1.5 rounded-full text-zinc-400 hover:text-indigo-600 dark:hover:text-sky-400 hover:bg-white dark:hover:bg-zinc-800 shadow-sm border border-zinc-100 dark:border-zinc-700/50 transition-all opacity-80 group-hover:opacity-100 cursor-pointer"
      >
        <Volume2 className="w-4 h-4" />
      </button>

      <div className="pr-10">
        <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500">VÍ DỤ #{index + 1}</span>
        {example.subgroup_zh && (
          <Badge variant="default" className="ml-2 font-mono text-xs uppercase">
            {example.subgroup_zh}
          </Badge>
        )}

        {/* Chinese Text */}
        <p className="text-xl font-hanzi font-light text-zinc-900 dark:text-zinc-100 mt-1 leading-snug">
          {example.sentence_zh}
        </p>

        {/* Pinyin */}
        {showPinyin && (
          <p className="text-sm text-indigo-600 dark:text-sky-400 font-semibold font-sans mt-0.5">
            {example.sentence_pinyin}
          </p>
        )}

        {/* Translations */}
        <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-1.5 font-sans">
          {example.sentence_vi}
        </p>
        {showEnglish && example.sentence_en && example.sentence_en !== example.sentence_vi && (
          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-sans">
            {example.sentence_en}
          </p>
        )}
      </div>
    </div>
  );
}
