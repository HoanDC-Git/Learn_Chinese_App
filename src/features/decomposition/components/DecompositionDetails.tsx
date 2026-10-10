import { useEffect, useRef } from "react";
import { Info, X } from "lucide-react";
import { cn } from "../../../lib/utils";
import { parseRadicalMeaning } from "./DecompositionTree";
import type { DecompositionNode } from "../types";
import styles from "../DecompositionPage.module.css";

interface DecompositionDetailsProps {
  selectedNode: DecompositionNode | null;
  activeChar: string;
  setQuery: (q: string) => void;
  setWordChars: (chars: string[]) => void;
  loadDecomposition: (char: string) => void;
  onClose?: () => void;
}

export function DecompositionDetails({
  selectedNode,
  onClose,
}: DecompositionDetailsProps) {
  const detailsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = detailsRef.current;
    if (!el) return;
    const stopPropagation = (e: WheelEvent) => {
      e.stopPropagation();
    };
    // Attach listener natively so it intercepts before bubble reaches container
    el.addEventListener("wheel", stopPropagation, { passive: false });
    return () => {
      el.removeEventListener("wheel", stopPropagation);
    };
  }, [selectedNode]);

  if (!selectedNode) {
    return null;
  }

  return (
    <div
      ref={detailsRef}
      data-no-zoom
      className={cn(
        "absolute right-4 top-4 bottom-4 w-72 border rounded-2xl flex flex-col z-30 bg-white/90 dark:bg-zinc-900/90 border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_12px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.3)] backdrop-blur-md overflow-y-auto scrollbar-thin",
        styles.detailsPanel
      )}
    >
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800/60 flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-zinc-500 dark:text-zinc-400 select-none">
          <Info className="w-4 h-4 text-zinc-400" /> Chi tiết thành phần
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer transition-colors"
            title="Đóng chi tiết"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="p-5 flex flex-col gap-6">

        {/* Meanings */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 border-l-2 border-cyan-500 pl-1.5 leading-none">Nghĩa tiếng Việt</span>
          <p className="text-[15px] p-3 rounded-xl border leading-relaxed bg-zinc-50/50 dark:bg-zinc-950/20 border-zinc-200/50 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium">
            {(() => {
              const isRadicalOrVariant = selectedNode.display_type === "Bộ thủ gốc" || selectedNode.type === "variant";
              const { cleanMeaning } = parseRadicalMeaning(selectedNode.meaning_vi, isRadicalOrVariant);
              return cleanMeaning || "Chưa cập nhật nghĩa tiếng Việt";
            })()}
          </p>
        </div>

        {/* Composite fields (Cách nhớ & meta) */}
        {selectedNode.type === "composite" && (
          <div className="flex flex-col gap-5 border-t pt-5 border-zinc-200 dark:border-zinc-800/60">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 border-l-2 border-cyan-500 pl-1.5 leading-none">Bộ thủ (Radical)</span>
                <span className="text-lg font-hanzi font-bold px-3.5 py-0.5 rounded-lg border border-zinc-200/60 dark:border-zinc-800 self-start text-zinc-900 dark:text-zinc-100 bg-zinc-100/50 dark:bg-zinc-950/40">
                  {selectedNode.radical || "N/A"}
                </span>
              </div>

              {selectedNode.stroke_count != null && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 border-l-2 border-cyan-500 pl-1.5 leading-none">Số nét vẽ</span>
                  <span className="text-xs font-semibold py-1 px-2.5 rounded-lg self-start text-zinc-500 dark:text-zinc-400 bg-zinc-100/50 dark:bg-zinc-950/40 border border-zinc-200/45 dark:border-zinc-800">
                    {selectedNode.stroke_count} nét
                  </span>
                </div>
              )}
            </div>

            {/* Cách nhớ — associative learning hint */}
            {selectedNode.hint_vi && (
              <div className="p-4 rounded-xl border flex flex-col gap-2 border-cyan-500/25 dark:border-cyan-500/20 bg-cyan-50/50 dark:bg-cyan-950/15 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 leading-none">
                  Cách nhớ
                </span>
                <p className="text-[15px] border-l-2 border-cyan-500 dark:border-cyan-500 pl-2.5 leading-relaxed text-zinc-800 dark:text-zinc-200 font-medium py-1">
                  {selectedNode.hint_vi}
                </p>
              </div>
            )}

            {selectedNode.hint && (
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 leading-none">
                  Mnemonic Story
                </span>
                <p className="text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300 bg-zinc-200/40 dark:bg-zinc-950/60 px-3 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  {selectedNode.hint}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Basic / Radical character fields */}
        {(selectedNode.type === "basic" || selectedNode.type === "variant") && (
          <div className="flex flex-col gap-5 border-t pt-5 border-zinc-200 dark:border-zinc-800/60">
            {selectedNode.parent_radical && (
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 border-l-2 border-cyan-500 pl-1.5 leading-none">Bộ thủ gốc (Parent Radical)</span>
                <span className="text-xl font-hanzi font-bold px-3.5 py-0.5 rounded-lg border border-zinc-200/60 dark:border-zinc-850 self-start text-zinc-900 dark:text-zinc-100 bg-zinc-100/50 dark:bg-zinc-950/40">
                  {selectedNode.parent_radical}
                </span>
              </div>
            )}

            {selectedNode.radical_number != null && (
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 border-l-2 border-cyan-500 pl-1.5 leading-none">Số Khang Hy</span>
                <span className="text-xs font-semibold py-1 px-2.5 rounded-lg self-start text-zinc-500 dark:text-zinc-400 bg-zinc-100/50 dark:bg-zinc-950/40 border border-zinc-200/45 dark:border-zinc-800">
                  #{selectedNode.radical_number}
                </span>
              </div>
            )}

            {selectedNode.variants && (
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 border-l-2 border-cyan-500 pl-1.5 leading-none">Biến thể chữ (Variants)</span>
                <span className="text-xl font-hanzi font-bold px-3.5 py-0.5 rounded-lg border border-zinc-200/60 dark:border-zinc-850 self-start text-zinc-900 dark:text-zinc-100 bg-zinc-100/50 dark:bg-zinc-950/40">
                  {selectedNode.variants}
                </span>
              </div>
            )}

            {selectedNode.simplified && (
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 border-l-2 border-cyan-500 pl-1.5 leading-none">Giản thể (Simplified)</span>
                <span className="text-xl font-hanzi font-bold px-3.5 py-0.5 rounded-lg border border-zinc-200/60 dark:border-zinc-850 self-start text-zinc-900 dark:text-zinc-100 bg-zinc-100/50 dark:bg-zinc-950/40">
                  {selectedNode.simplified}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
