import { Folder, FileText, ChevronRight, ChevronDown, Check } from "lucide-react";
import { cn } from "../../../lib/utils";
import type { CategoryNode } from "../types";
import type { GrammarPoint } from "../../../types";

interface GrammarTreeNodeProps {
  node: CategoryNode;
  depth?: number;
  selectedPoint: GrammarPoint | null;
  onSelectPoint: (pt: GrammarPoint) => void;
  expandedCategories: Record<number, boolean>;
  onToggleCategory: (id: number) => void;
  learnedIds: Set<number>;
  searchQuery: string;
}

export function GrammarTreeNode({
  node,
  depth = 0,
  selectedPoint,
  onSelectPoint,
  expandedCategories,
  onToggleCategory,
  learnedIds,
  searchQuery,
}: GrammarTreeNodeProps) {
  const isSingle = node.children.length === 0 && node.points.length === 1;

  if (isSingle) {
    const pt = node.points[0];
    const isSelected = selectedPoint?.id === pt.id;
    const isLearned = learnedIds.has(pt.id);

    return (
      <button
        onClick={() => onSelectPoint(pt)}
        className={cn(
          "w-full flex items-start gap-2 p-2 text-left rounded-lg transition-colors text-sm my-0.5 cursor-pointer",
          isSelected
            ? "bg-indigo-50 border border-indigo-100 text-indigo-700 dark:bg-sky-950/60 dark:border-sky-900/40 dark:text-sky-400 font-medium shadow-sm"
            : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-transparent"
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {isLearned ? (
          <Check className="w-4 h-4 mt-0.5 shrink-0 text-emerald-500 dark:text-emerald-400" />
        ) : (
          <FileText className="w-4 h-4 mt-0.5 shrink-0 text-indigo-500/80 dark:text-sky-500/80" />
        )}
        <span className="line-clamp-2">
          {node.category.title_vi} ({pt.title_vi})
        </span>
      </button>
    );
  }

  const isExpanded = !!expandedCategories[node.id] || searchQuery.trim().length > 0;

  return (
    <div className="space-y-0.5">
      <button
        onClick={() => onToggleCategory(node.id)}
        className="w-full flex items-center gap-2 p-2 text-left rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold text-sm transition-colors cursor-pointer"
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-zinc-400 dark:text-zinc-500 shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-zinc-400 dark:text-zinc-500 shrink-0" />
        )}
        <Folder className="w-4 h-4 text-indigo-500 dark:text-sky-500 shrink-0" />
        <span className="truncate">{node.category.title_vi}</span>
      </button>

      {isExpanded && (
        <div className="space-y-0.5">
          {node.children.map((child) => (
            <GrammarTreeNode
              key={`folder-${child.id}`}
              node={child}
              depth={depth + 1}
              selectedPoint={selectedPoint}
              onSelectPoint={onSelectPoint}
              expandedCategories={expandedCategories}
              onToggleCategory={onToggleCategory}
              learnedIds={learnedIds}
              searchQuery={searchQuery}
            />
          ))}
          {node.points.map((pt) => {
            const isSelected = selectedPoint?.id === pt.id;
            const isLearned = learnedIds.has(pt.id);
            return (
              <button
                key={`pt-${pt.id}`}
                onClick={() => onSelectPoint(pt)}
                className={cn(
                  "w-full flex items-start gap-2 p-2 text-left rounded-lg transition-colors text-sm my-0.5 cursor-pointer",
                  isSelected
                    ? "bg-indigo-50 border border-indigo-100 text-indigo-700 dark:bg-sky-950/60 dark:border-sky-900/40 dark:text-sky-400 font-medium shadow-sm"
                    : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-transparent"
                )}
                style={{ paddingLeft: `${(depth + 1) * 12 + 8}px` }}
              >
                {isLearned ? (
                  <Check className="w-4 h-4 mt-0.5 shrink-0 text-emerald-500 dark:text-emerald-400" />
                ) : (
                  <FileText className="w-4 h-4 mt-0.5 shrink-0 text-zinc-400 dark:text-zinc-500" />
                )}
                <span className="line-clamp-2">{pt.title_vi}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
