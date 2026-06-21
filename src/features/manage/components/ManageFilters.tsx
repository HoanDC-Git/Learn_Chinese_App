import { Search, ChevronDown, Volume2, StopCircle, Trash } from "lucide-react";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { getMasteryLabel, cn } from "../../../lib/utils";

interface ManageFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  filterLevel: number | null;
  onFilterLevelChange: (val: number | null) => void;
  levelCounts: Record<number, number>;
  batchRunning: boolean;
  batchProgress: { current: number; total: number };
  onBatchAudio: () => void;
  onCancelBatch: () => void;
  onClearCache: () => void;
}

export function ManageFilters({
  search,
  onSearchChange,
  filterLevel,
  onFilterLevelChange,
  levelCounts,
  batchRunning,
  batchProgress,
  onBatchAudio,
  onCancelBatch,
  onClearCache,
}: ManageFiltersProps) {
  return (
    <div className="flex items-center justify-between mb-4 gap-4 select-none">
      <div className="flex items-center gap-3 flex-1">
        <Search className="w-5 h-5 shrink-0 text-zinc-400 dark:text-zinc-500" />
        <Input
          placeholder="搜索卡片..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className={cn(
            "text-zinc-900 dark:text-zinc-100",
            "font-mixed"
          )}
        />
      </div>

      <div className="relative">
        <select
          className="appearance-none w-48 px-3 py-2 border rounded-lg text-sm pr-8 bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans transition-colors duration-200 cursor-pointer"
          value={filterLevel === null ? "" : filterLevel}
          onChange={(e) => {
            onFilterLevelChange(e.target.value === "" ? null : Number(e.target.value));
          }}
        >
          <option value="">Tất cả cấp độ</option>
          {Object.keys(levelCounts)
            .map(Number)
            .sort((a, b) => a - b)
            .map((lvl) => (
              <option key={lvl} value={lvl}>
                {getMasteryLabel(lvl)} ({levelCounts[lvl] || 0})
              </option>
            ))}
        </select>
        <ChevronDown className="transform absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-zinc-400 dark:text-zinc-500" />
      </div>

      <div className="flex gap-2">
        {batchRunning ? (
          <div className="flex items-center gap-2">
            <span className="text-sm self-center text-zinc-600 dark:text-zinc-300">
              {batchProgress.current} / {batchProgress.total}
            </span>
            <Button variant="danger" size="sm" onClick={onCancelBatch} className="hover:scale-102 active:scale-98 transition-all duration-200">
              <StopCircle className="w-4 h-4 mr-1 animate-pulse" />
              Hủy
            </Button>
          </div>
        ) : (
          <Button variant="secondary" size="sm" onClick={onBatchAudio} className="hover:scale-102 active:scale-98 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200 group">
            <Volume2 className="w-4 h-4 mr-1 transition-transform duration-200 group-hover:scale-110" />
            Tạo âm thanh
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={onClearCache} className="hover:scale-102 active:scale-98 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20 dark:hover:text-rose-400 transition-all duration-200 group">
          <Trash className="w-4 h-4 mr-1 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-12" />
          Dọn cache
        </Button>
      </div>
    </div>
  );
}
