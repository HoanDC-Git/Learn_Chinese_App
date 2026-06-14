import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal } from "lucide-react";
import { cn } from "../../lib/utils";

interface PaginationProps {
  currentPage: number; // 0-indexed
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
}: PaginationProps) {
  // If no pages or only 1 page, we can just hide it or show a simple state
  if (totalPages <= 1) return null;

  // Convert to 1-indexed for display logic
  const current = currentPage + 1;
  const total = totalPages;

  const handlePageClick = (page: number) => {
    if (!disabled && page !== current && page >= 1 && page <= total) {
      onPageChange(page - 1); // convert back to 0-indexed
    }
  };

  const renderPageItems = () => {
    const items: (number | string)[] = [];

    // Always keep exactly 7 items if totalPages >= 7 to prevent layout shift
    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        items.push(i);
      }
    } else {
      if (current <= 4) {
        // Near start: 1, 2, 3, 4, 5, ..., total
        items.push(1, 2, 3, 4, 5, "...", total);
      } else if (current >= total - 3) {
        // Near end: 1, ..., total-4, total-3, total-2, total-1, total
        items.push(1, "...", total - 4, total - 3, total - 2, total - 1, total);
      } else {
        // Middle: 1, ..., current-1, current, current+1, ..., total
        items.push(1, "...", current - 1, current, current + 1, "...", total);
      }
    }

    return items.map((item, index) => {
      if (item === "...") {
        return (
          <div
            key={`ellipsis-${index}`}
            className="w-9 h-9 flex items-center justify-center text-zinc-400 dark:text-zinc-600 select-none"
          >
            <MoreHorizontal className="w-4 h-4" />
          </div>
        );
      }

      const pageNum = item as number;
      const isActive = pageNum === current;

      return (
        <button
          key={`page-${pageNum}`}
          disabled={disabled || isActive}
          onClick={() => handlePageClick(pageNum)}
          className={cn(
            "w-9 h-9 rounded-md flex items-center justify-center text-sm font-medium select-none",
            isActive
              ? "bg-indigo-50 border border-indigo-200 text-indigo-700 shadow-sm dark:bg-indigo-500/10 dark:border-indigo-500/30 dark:text-indigo-400"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors",
            disabled && !isActive && "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-zinc-600 dark:hover:text-zinc-400"
          )}
        >
          {pageNum}
        </button>
      );
    });
  };

  return (
    <div className="flex items-center justify-center gap-1.5 w-full py-4 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-t border-zinc-200/50 dark:border-zinc-800/50">
      <button
        disabled={disabled || current === 1}
        onClick={() => handlePageClick(1)}
        className={cn(
          "w-9 h-9 rounded-md flex items-center justify-center transition-colors select-none text-zinc-500 dark:text-zinc-400",
          !disabled && current > 1
            ? "hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
            : "opacity-50 cursor-not-allowed"
        )}
        title="Trang đầu"
      >
        <ChevronsLeft className="w-4 h-4" />
      </button>

      <button
        disabled={disabled || current === 1}
        onClick={() => handlePageClick(current - 1)}
        className={cn(
          "w-9 h-9 rounded-md flex items-center justify-center transition-colors select-none text-zinc-500 dark:text-zinc-400",
          !disabled && current > 1
            ? "hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
            : "opacity-50 cursor-not-allowed"
        )}
        title="Trang trước"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-1 font-sans">{renderPageItems()}</div>

      <button
        disabled={disabled || current === total}
        onClick={() => handlePageClick(current + 1)}
        className={cn(
          "w-9 h-9 rounded-md flex items-center justify-center transition-colors select-none text-zinc-500 dark:text-zinc-400",
          !disabled && current < total
            ? "hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
            : "opacity-50 cursor-not-allowed"
        )}
        title="Trang sau"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      <button
        disabled={disabled || current === total}
        onClick={() => handlePageClick(total)}
        className={cn(
          "w-9 h-9 rounded-md flex items-center justify-center transition-colors select-none text-zinc-500 dark:text-zinc-400",
          !disabled && current < total
            ? "hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
            : "opacity-50 cursor-not-allowed"
        )}
        title="Trang cuối"
      >
        <ChevronsRight className="w-4 h-4" />
      </button>
    </div>
  );
}
