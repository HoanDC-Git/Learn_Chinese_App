import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { cn } from "../../../lib/utils";
import { FlashcardRow } from "./FlashcardRow";
import type { Flashcard } from "../../../types";

type SortField = "level" | "date_added";
type SortOrder = "asc" | "desc";

interface FlashcardTableProps {
  cards: Flashcard[];
  audioStatus: Record<number, boolean>;
  playingId: number | null;
  isSearching: boolean;
  sortField: SortField;
  sortOrder: SortOrder;
  onToggleSort: (field: SortField) => void;
  onPlayAudio: (cardId: number, text: string) => Promise<void>;
  onDeleteAudio: (cardId: number, text: string) => Promise<void>;
  onDelete: (cardId: number) => Promise<void>;
  onSave: (
    cardId: number,
    data: { hanzi: string; pinyin?: string; meaning?: string },
  ) => Promise<void>;
  scrollResetTrigger: number;
}

export function FlashcardTable({
  cards,
  audioStatus,
  playingId,
  isSearching,
  sortField,
  sortOrder,
  onToggleSort,
  onPlayAudio,
  onDeleteAudio,
  onDelete,
  onSave,
  scrollResetTrigger,
}: FlashcardTableProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track scroll range in a state to only trigger re-render on row boundary crosses
  const lastRangeRef = useRef({ start: -1, end: -1 });
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 15 });

  // Reset scroll ONLY when sorting changes or a fresh search starts
  useLayoutEffect(() => {
    if (scrollResetTrigger > 0 && containerRef.current) {
      const el = containerRef.current;
      // Force instant scroll bypassing CSS scroll-behavior: smooth
      el.style.scrollBehavior = "auto";
      el.scrollTop = 0;
      requestAnimationFrame(() => {
        el.style.scrollBehavior = "";
      });
    }
  }, [scrollResetTrigger]);

  // Recalculate range when cards list changes (Progressive Rendering)
  useEffect(() => {
    if (!containerRef.current) return;
    
    const rowHeight = 76;
    const containerHeight = containerRef.current.clientHeight || 600;
    const currentScrollTop = containerRef.current.scrollTop;
    
    // Step 1: Render ONLY the visible area (buffer = 0) for instant transition
    const start = Math.max(0, Math.floor(currentScrollTop / rowHeight));
    const end = Math.min(cards.length, Math.ceil((currentScrollTop + containerHeight) / rowHeight));
    
    lastRangeRef.current = { start, end };
    setVisibleRange((prev) => {
      if (prev.start === start && prev.end === end) return prev;
      return { start, end };
    });

    // Step 2: Expand the buffer in the background after the fast initial paint
    const timer = setTimeout(() => {
      if (!containerRef.current) return;
      const fullBuffer = 25;
      const newScrollTop = containerRef.current.scrollTop;
      const startFull = Math.max(0, Math.floor(newScrollTop / rowHeight) - fullBuffer);
      const endFull = Math.min(cards.length, Math.ceil((newScrollTop + containerHeight) / rowHeight) + fullBuffer);
      
      lastRangeRef.current = { start: startFull, end: endFull };
      setVisibleRange({ start: startFull, end: endFull });
    }, 50);

    return () => clearTimeout(timer);
  }, [cards]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const currentScrollTop = target.scrollTop;

    // Virtualization check: calculate start and end index
    const rowHeight = 76;
    const buffer = 25; // Increased buffer
    const containerHeight = target.clientHeight || 600;

    const start = Math.max(0, Math.floor(currentScrollTop / rowHeight) - buffer);
    const end = Math.min(cards.length, Math.ceil((currentScrollTop + containerHeight) / rowHeight) + buffer);

    // ONLY trigger state update if the range has actually changed!
    if (start !== lastRangeRef.current.start || end !== lastRangeRef.current.end) {
      lastRangeRef.current = { start, end };
      setVisibleRange((prev) => {
        if (prev.start === start && prev.end === end) return prev;
        return { start, end };
      });
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 inline ml-1 text-zinc-400 dark:text-zinc-500" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5 inline ml-1 text-indigo-500" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 inline ml-1 text-indigo-500" />
    );
  };

  // Virtualization calculations
  const rowHeight = 76;
  const { start, end } = visibleRange;
  const visibleCards = cards.slice(start, end);
  const topSpacerHeight = start * rowHeight;
  const bottomSpacerHeight = (cards.length - end) * rowHeight;

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={cn("flex-1 overflow-y-auto scroll-smooth-gpu scrollbar-thin min-h-0 pr-1 transition-opacity duration-200", isSearching && "opacity-60 pointer-events-none")}
    >
      <table className="w-full text-left border-collapse table-fixed select-none">
        <thead className="sticky top-0 bg-white dark:bg-zinc-900 z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.05)]">
          <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <th className="py-3.5 px-1 font-bold text-[11px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 w-14 text-center">
            </th>
            <th className="py-3.5 px-4 font-bold text-[11px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 w-[30%]">
              Chữ Hán / Pinyin
            </th>
            <th className="py-3.5 px-4 font-bold text-[11px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 w-[40%]">
              Nghĩa tiếng Việt
            </th>
            <th
              className="py-3.5 px-2 font-bold text-[11px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 cursor-pointer select-none hover:text-indigo-600 dark:hover:text-sky-400 transition-colors duration-200 w-28 text-center"
              onClick={() => onToggleSort("level")}
            >
              Cấp độ{getSortIcon("level")}
            </th>
            <th
              className="py-3.5 px-2 font-bold text-[11px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 cursor-pointer select-none hover:text-indigo-600 dark:hover:text-sky-400 transition-colors duration-200 w-32 text-center"
              onClick={() => onToggleSort("date_added")}
            >
              Ngày thêm{getSortIcon("date_added")}
            </th>
            <th className="py-3.5 px-2 font-bold text-[11px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 w-32 text-center">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/40">
          {isSearching && cards.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                Đang tải...
              </td>
            </tr>
          ) : cards.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                Không tìm thấy thẻ nào
              </td>
            </tr>
          ) : (
            <>
              {topSpacerHeight > 0 && (
                <tr>
                  <td colSpan={6} style={{ height: topSpacerHeight, padding: 0, border: 0 }} />
                </tr>
              )}
              {visibleCards.map((card) => (
                <FlashcardRow
                  key={card.id}
                  card={card}
                  hasAudio={audioStatus[card.id] === true}
                  isGenerating={playingId === card.id}
                  onPlayAudio={onPlayAudio}
                  onDeleteAudio={onDeleteAudio}
                  onDelete={onDelete}
                  onSave={onSave}
                />
              ))}
              {bottomSpacerHeight > 0 && (
                <tr>
                  <td colSpan={6} style={{ height: bottomSpacerHeight, padding: 0, border: 0 }} />
                </tr>
              )}
            </>
          )}
        </tbody>
      </table>
    </div>
  );
}
