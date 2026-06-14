import { useEffect, useRef } from "react";
import { Info, Network, X } from "lucide-react";
import { Badge } from "../../../components/ui/Badge";
import { cn, getHskBadgeColor } from "../../../lib/utils";
import { parseRadicalMeaning } from "./DecompositionTree";
import type { DecompositionNode } from "../types";
import styles from "../DecompositionPage.module.css";

const formatEtymologyType = (type: string | null) => {
  if (!type) return "Không xác định";
  const mapping: Record<string, string> = {
    pictographic: "Tượng hình (Pictographic)",
    ideographic: "Chỉ sự / Hội ý (Ideographic)",
    pictophonetic: "Hình thanh (Pictophonetic)",
    indicative: "Chỉ sự (Indicative)",
  };
  return mapping[type.toLowerCase()] || type;
};

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
  activeChar,
  setQuery,
  setWordChars,
  loadDecomposition,
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
        "absolute right-4 top-4 bottom-4 w-80 border rounded-2xl flex flex-col z-30 bg-white/90 dark:bg-zinc-900/90 border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_12px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.3)] backdrop-blur-md overflow-y-auto scrollbar-thin",
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
        {/* Analysis navigation */}
        {selectedNode.character !== activeChar && (
          <button
            onClick={() => {
              setQuery(selectedNode.character);
              setWordChars([]);
              loadDecomposition(selectedNode.character);
            }}
            className="py-2.5 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <Network className="w-4 h-4" /> Chiết tự chữ này
          </button>
        )}

        {/* Meanings */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 border-l-2 border-cyan-500 pl-1.5 leading-none">Nghĩa tiếng Việt</span>
            <p className="text-sm p-3 rounded-xl border leading-relaxed bg-zinc-50/50 dark:bg-zinc-950/20 border-zinc-200/50 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium">
              {(() => {
                const isRadicalOrVariant = selectedNode.display_type === "Bộ thủ gốc" || selectedNode.type === "variant";
                const { cleanMeaning } = parseRadicalMeaning(selectedNode.meaning_vi, isRadicalOrVariant);
                return cleanMeaning || "Chưa cập nhật nghĩa tiếng Việt";
              })()}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 border-l-2 border-cyan-500 pl-1.5 leading-none">Nghĩa tiếng Anh</span>
            <p className="text-sm p-3 rounded-xl border leading-relaxed bg-zinc-50/50 dark:bg-zinc-950/20 border-zinc-200/50 dark:border-zinc-800 text-zinc-650 dark:text-zinc-455 font-medium">
              {selectedNode.meaning_en || "No English meaning available"}
            </p>
          </div>
        </div>

        {/* Composite fields (Etymology & IDS) */}
        {selectedNode.type === "composite" && (
          <div className="flex flex-col gap-5 border-t pt-5 border-zinc-200 dark:border-zinc-800/60">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 border-l-2 border-cyan-500 pl-1.5 leading-none">Hạng HSK</span>
                <Badge className={cn("self-start px-2.5 py-0.5 rounded-md", getHskBadgeColor(selectedNode.hsk_level))}>
                  {selectedNode.hsk_level ? `HSK ${selectedNode.hsk_level}` : "Ngoài HSK"}
                </Badge>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 border-l-2 border-cyan-500 pl-1.5 leading-none">Bộ thủ chính</span>
                <span className="text-lg font-hanzi font-bold px-3.5 py-0.5 rounded-lg border border-zinc-200/60 dark:border-zinc-800 self-start text-zinc-900 dark:text-zinc-100 bg-zinc-100/50 dark:bg-zinc-950/40">
                  {selectedNode.radical || "N/A"}
                </span>
              </div>
            </div>

            {/* Etymology details */}
            <div className="p-4 rounded-xl border flex flex-col gap-4 border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-900/50 shadow-sm">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 leading-none">Phân loại chữ</span>
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mt-1">
                    {formatEtymologyType(selectedNode.etymology_type)}
                  </span>
                </div>

                {/* Pictophonetic Visualizer */}
                {selectedNode.etymology_type?.toLowerCase() === "pictophonetic" ? (
                  <div className="grid grid-cols-2 gap-2 p-1.5 bg-zinc-200/50 dark:bg-zinc-950 border border-zinc-300/60 dark:border-zinc-800 rounded-xl">
                    <div className="flex flex-col items-center justify-center py-3 px-2 rounded-lg bg-white dark:bg-zinc-900 shadow-sm">
                      <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest leading-none">
                        Bộ chỉ ý
                      </span>
                      <span className="text-2xl font-hanzi font-bold text-zinc-900 dark:text-zinc-100 mt-2 select-none">
                        {selectedNode.etymology_semantic || "?"}
                      </span>
                    </div>
                    <div className="flex flex-col items-center justify-center py-3 px-2 rounded-lg bg-white dark:bg-zinc-900 shadow-sm">
                      <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest leading-none">
                        Bộ chỉ thanh
                      </span>
                      <span className="text-2xl font-hanzi font-bold text-zinc-900 dark:text-zinc-100 mt-2 select-none">
                        {selectedNode.etymology_phonetic || "?"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {selectedNode.etymology_semantic && (
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 leading-none">Bộ nghĩa</span>
                        <span className="text-lg font-hanzi font-bold text-zinc-900 dark:text-zinc-100 mt-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 py-1 rounded-lg self-start shadow-sm">
                          {selectedNode.etymology_semantic}
                        </span>
                      </div>
                    )}

                    {selectedNode.etymology_phonetic && (
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 leading-none">Bộ âm</span>
                        <span className="text-lg font-hanzi font-bold text-zinc-900 dark:text-zinc-100 mt-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 py-1 rounded-lg self-start shadow-sm">
                          {selectedNode.etymology_phonetic}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {selectedNode.etymology_hint_vi && (
                  <div className="flex flex-col gap-1.5 pt-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 leading-none">
                      Giải nghĩa
                    </span>
                    <p className="text-sm border-l-2 border-cyan-500 dark:border-cyan-500 pl-2.5 leading-relaxed text-zinc-800 dark:text-zinc-200 font-medium bg-cyan-50/30 dark:bg-cyan-950/10 py-1">
                      {selectedNode.etymology_hint_vi}
                    </p>
                  </div>
                )}

                {selectedNode.etymology_hint && (
                  <div className="flex flex-col gap-1.5 pt-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 leading-none">
                      Mnemonic Story
                    </span>
                    <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 mt-1 bg-zinc-200/40 dark:bg-zinc-950/60 px-3 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
                      {selectedNode.etymology_hint}
                    </p>
                  </div>
                )}
              </div>
            </div>
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

            <div className="grid grid-cols-2 gap-4">
              {selectedNode.radical_number && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 border-l-2 border-cyan-500 pl-1.5 leading-none">Số Khang Hy</span>
                  <span className="text-xs font-semibold py-1 px-2.5 rounded-lg self-start text-zinc-500 dark:text-zinc-400 bg-zinc-100/50 dark:bg-zinc-950/40 border border-zinc-200/45 dark:border-zinc-800">
                    #{selectedNode.radical_number}
                  </span>
                </div>
              )}

              {selectedNode.strokecount && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 border-l-2 border-cyan-500 pl-1.5 leading-none">Số nét vẽ</span>
                  <span className="text-xs font-semibold py-1 px-2.5 rounded-lg self-start text-zinc-500 dark:text-zinc-400 bg-zinc-100/50 dark:bg-zinc-950/40 border border-zinc-200/45 dark:border-zinc-800">
                    {selectedNode.strokecount} nét
                  </span>
                </div>
              )}
            </div>

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
