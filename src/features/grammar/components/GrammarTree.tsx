import { Search, Loader2, BookOpen, User, Plus, FileText } from "lucide-react";
import { cn } from "../../../lib/utils";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { GrammarTreeNode } from "./GrammarTreeNode";
import type { CategoryNode } from "../types";
import type { GrammarPoint, GrammarNote } from "../../../types";
import { useMemo } from "react";

interface GrammarTreeProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isCategoriesLoading: boolean;
  isPointsLoading: boolean;
  filteredTree: CategoryNode[];
  selectedPoint: GrammarPoint | null;
  onSelectPoint: (pt: GrammarPoint) => void;
  expandedCategories: Record<number, boolean>;
  onToggleCategory: (id: number) => void;
  learnedIds: Set<number>;
  
  // New props
  activeTab: "hsk" | "personal";
  setActiveTab: (tab: "hsk" | "personal") => void;
  notes: GrammarNote[];
  isNotesLoading: boolean;
  selectedNote: GrammarNote | null;
  onSelectNote: (note: GrammarNote | null) => void;
  onCreateNoteClick: () => void;
  isFetching?: boolean;
}

export function GrammarTree({
  searchQuery,
  setSearchQuery,
  isCategoriesLoading,
  isPointsLoading,
  filteredTree,
  selectedPoint,
  onSelectPoint,
  expandedCategories,
  onToggleCategory,
  learnedIds,
  activeTab,
  setActiveTab,
  notes,
  isNotesLoading,
  selectedNote,
  onSelectNote,
  onCreateNoteClick,
  isFetching = false,
}: GrammarTreeProps) {
  // Filter personal notes based on search query
  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const clean = searchQuery.trim().toLowerCase();
    return notes.filter(
      (note) =>
        (note.title && note.title.toLowerCase().includes(clean)) ||
        (note.formula && note.formula.toLowerCase().includes(clean)) ||
        (note.explanation && note.explanation.toLowerCase().includes(clean))
    );
  }, [notes, searchQuery]);

  return (
    <Card className="w-80 flex flex-col min-h-0 overflow-hidden bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl p-0">
      {/* Tabs Selector */}
      <div className="flex p-1 bg-zinc-50/80 dark:bg-zinc-950/60 border-b border-zinc-200 dark:border-zinc-800 rounded-t-xl shrink-0">
        <button
          onClick={() => setActiveTab("hsk")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 border cursor-pointer",
            activeTab === "hsk"
              ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-sky-400 shadow-sm border-zinc-200/50 dark:border-zinc-800/50"
              : "bg-transparent border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
          )}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Tra cứu HSK
        </button>
        <button
          onClick={() => setActiveTab("personal")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 border cursor-pointer",
            activeTab === "personal"
              ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-sky-400 shadow-sm border border-zinc-200/50 dark:border-zinc-800/50"
              : "bg-transparent border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
          )}
        >
          <User className="w-3.5 h-3.5" />
          Vở ghi của tôi
        </button>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
        <div className="relative">
          <Search className="transform absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
          <Input
            placeholder={activeTab === "hsk" ? "Tìm điểm ngữ pháp..." : "Tìm vở ghi cá nhân..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 text-sm"
          />
        </div>
      </div>

      {/* Create note button for personal notebook */}
      {activeTab === "personal" && (
        <div className="px-3 pt-2 shrink-0">
          <Button
            onClick={onCreateNoteClick}
            variant="secondary"
            size="sm"
            className="w-full flex items-center justify-center gap-1 text-xs border-dashed border-indigo-200 dark:border-zinc-800 hover:border-indigo-400 dark:hover:border-sky-500 hover:text-indigo-600 dark:hover:text-sky-400 py-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Tạo vở ghi mới
          </Button>
        </div>
      )}

      {/* Content Area */}
      <div className={cn("flex-1 overflow-y-auto min-h-0 p-2 space-y-1 scrollbar-thin transition-opacity duration-200", isFetching && "opacity-60 pointer-events-none")}>
        {activeTab === "hsk" ? (
          isCategoriesLoading || isPointsLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-500 dark:text-zinc-500 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500 dark:text-sky-500" />
              <span className="text-xs">Đang tải danh mục...</span>
            </div>
          ) : filteredTree.length === 0 ? (
            <div className="text-center py-12 text-xs text-zinc-400 dark:text-zinc-500">
              {searchQuery ? "Không tìm thấy kết quả" : "Không có dữ liệu cho cấp độ này"}
            </div>
          ) : (
            filteredTree.map((node) => (
              <GrammarTreeNode
                key={node.id}
                node={node}
                selectedPoint={selectedPoint}
                onSelectPoint={onSelectPoint}
                expandedCategories={expandedCategories}
                onToggleCategory={onToggleCategory}
                learnedIds={learnedIds}
                searchQuery={searchQuery}
              />
            ))
          )
        ) : isNotesLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-zinc-500 dark:text-zinc-500 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500 dark:text-sky-500" />
            <span className="text-xs">Đang tải vở ghi...</span>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-12 text-xs text-zinc-500 dark:text-zinc-500">
            {searchQuery ? "Không tìm thấy vở ghi nào" : "Chưa có vở ghi nào. Hãy tạo vở ghi mới hoặc thêm ghi chú từ các bài học HSK."}
          </div>
        ) : (
          filteredNotes.map((note) => {
            const isSelected = selectedNote?.id === note.id;
            return (
              <button
                key={`note-${note.id}`}
                onClick={() => onSelectNote(note)}
                className={cn(
                  "w-full flex flex-col items-start gap-1 p-2.5 text-left rounded-lg transition-all text-xs border my-0.5 cursor-pointer",
                  isSelected
                    ? "bg-indigo-50/80 border-indigo-150 text-indigo-850 dark:bg-sky-950/40 dark:border-sky-900/40 dark:text-sky-400 shadow-sm font-medium"
                    : "bg-white dark:bg-zinc-900 border-transparent hover:bg-zinc-55 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                )}
              >
                <div className="w-full flex items-center justify-between gap-2">
                  <span className="font-semibold truncate flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-500 dark:text-sky-500 shrink-0" />
                    {note.title || "Vở ghi không tiêu đề"}
                  </span>
                  
                  {note.grammar_point_id ? (
                    <span className="text-xs px-1 py-0.5 rounded font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/30">
                      HSK {note.level || "?"}
                    </span>
                  ) : (
                    <span className="text-xs px-1 py-0.5 rounded font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                      Tự do
                    </span>
                  )}
                </div>
                {note.formula && (
                  <p className="w-full text-xs text-zinc-500 dark:text-zinc-500 font-mono truncate mt-0.5 pl-5">
                    {note.formula}
                  </p>
                )}
              </button>
            );
          })
        )}
      </div>
    </Card>
  );
}
