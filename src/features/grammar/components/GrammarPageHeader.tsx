import { cn } from "../../../lib/utils";

interface GrammarPageHeaderProps {
  activeLevel: number;
  setActiveLevel: (level: number) => void;
  onResetSelection: () => void;
}

export function GrammarPageHeader({
  activeLevel,
  setActiveLevel,
  onResetSelection,
}: GrammarPageHeaderProps) {
  const levels = [1, 2, 3, 4, 5, 6, 7];

  return (
    <div className="flex items-center justify-between shrink-0 h-14">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-sans">
        Cơ sở dữ liệu Ngữ pháp HSK
      </h2>

      {/* HSK Level Select Tabs */}
      <div className="flex gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800/80 rounded-lg shrink-0 overflow-x-auto scrollbar-none">
        {levels.map((lvl) => (
          <button
            key={lvl}
            onClick={() => {
              setActiveLevel(lvl);
              onResetSelection();
            }}
            className={cn(
              "px-2.5 py-1 text-xs font-semibold rounded-md transition-all duration-200 ease-in-out border whitespace-nowrap cursor-pointer",
              activeLevel === lvl
                ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-sky-400 shadow-sm border-zinc-200/50 dark:border-zinc-800/50"
                : "bg-white/0 dark:bg-zinc-900/0 border-zinc-200/0 dark:border-zinc-800/0 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200/45 dark:hover:bg-zinc-800/45"
            )}
          >
            HSK {lvl === 7 ? "7-9" : lvl}
          </button>
        ))}
      </div>
    </div>
  );
}
