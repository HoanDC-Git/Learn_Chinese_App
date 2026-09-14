import React from "react";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { cn } from "../../../lib/utils";
import { FlashcardRow } from "./FlashcardRow";
import type { Flashcard } from "../../../types";
import { TableVirtuoso } from "react-virtuoso";

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
}

const VirtuosoTableComponents = {
  Table: (props: any) => <table {...props} className="w-full text-left border-collapse table-fixed select-none" />,
  TableBody: React.forwardRef<HTMLTableSectionElement, any>((props, ref) => <tbody {...props} ref={ref} className="divide-y divide-zinc-100 dark:divide-zinc-800/40" />),
  TableRow: (props: any) => <tr {...props} className="border-b transition-colors border-zinc-100 dark:border-zinc-800/60 hover:bg-zinc-50 dark:hover:bg-zinc-800/40" />,
};

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
}: FlashcardTableProps) {
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 inline ml-1 text-zinc-400 dark:text-zinc-500" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5 inline ml-1 text-accent" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 inline ml-1 text-accent" />
    );
  };

  return (
    <div
      className={cn("flex-1 overflow-y-auto scroll-smooth-gpu scrollbar-thin min-h-0 pr-1 transition-opacity duration-200 mt-2", isSearching && "opacity-60 pointer-events-none")}
    >
      <TableVirtuoso
        className="h-full w-full"
        data={cards}
        fixedHeaderContent={() => (
          <tr className="relative z-10 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-[0_1px_0_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.05)]">
            <th className="bg-white dark:bg-zinc-900 py-3.5 px-1 font-bold text-[11px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 w-14 text-center">
            </th>
            <th className="bg-white dark:bg-zinc-900 py-3.5 px-4 font-bold text-[11px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 w-[30%]">
              Chữ Hán / Pinyin
            </th>
            <th className="bg-white dark:bg-zinc-900 py-3.5 px-4 font-bold text-[11px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 w-[40%]">
              Nghĩa tiếng Việt
            </th>
            <th
              className="bg-white dark:bg-zinc-900 py-3.5 px-2 font-bold text-[11px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 cursor-pointer select-none hover:text-accent dark:hover:text-accent-light transition-colors duration-200 w-28 text-center"
              onClick={() => onToggleSort("level")}
            >
              Cấp độ{getSortIcon("level")}
            </th>
            <th
              className="bg-white dark:bg-zinc-900 py-3.5 px-2 font-bold text-[11px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 cursor-pointer select-none hover:text-accent dark:hover:text-accent-light transition-colors duration-200 w-32 text-center"
              onClick={() => onToggleSort("date_added")}
            >
              Ngày thêm{getSortIcon("date_added")}
            </th>
            <th className="bg-white dark:bg-zinc-900 py-3.5 px-2 font-bold text-[11px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 w-32 text-center">
              Thao tác
            </th>
          </tr>
        )}
        components={VirtuosoTableComponents}
        itemContent={(_index, card) => (
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
        )}
      />
    </div>
  );
}
