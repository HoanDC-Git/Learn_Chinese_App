import { useEffect, useState, useRef } from "react";
import { cn, getMasteryLabel } from "../../../lib/utils";
import { Badge } from "../../../components/ui/Badge";
import type { Flashcard as FlashcardType } from "../../../types";
import { HanziHover } from "../../dictionary/components/HanziHover";
import { Trash2, Volume2 } from "lucide-react";
import { useAppStore } from "../../../stores";
import { invoke } from "@tauri-apps/api/core";

interface FlashcardProps {
  card: FlashcardType;
  revealStep: "meaning" | "pinyin" | "hanzi";
  onRemember: () => void;
  onForget: () => void;
  onNext: () => void;
  onPlayAudio?: () => void;
  canUndo?: boolean;
  onUndo?: () => void;
}

interface CustomIconProps {
  name: "arrow_left" | "arrow_right" | "undo";
  className?: string;
}

const ICON_PATHS = {
  arrow_left:
    "M400-240 160-480l240-240 56 58-142 142h486v80H314l142 142-56 58Z",
  arrow_right:
    "m560-240-56-58 142-142H160v-80h486L504-662l56-58 240 240-240 240Z",
  undo: "M280-200v-80h284q63 0 109.5-40T720-420q0-60-46.5-100T564-560H312l104 104-56 56-200-200 200-200 56 56-104 104h252q97 0 166.5 63T800-420q0 94-69.5 157T564-200H280Z",
};

function CustomIcon({ name, className }: CustomIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 -960 960 960"
      className={cn("w-3 h-3 fill-current inline-block", className)}
    >
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}

// Single-accent desaturated badges representing progression
const badgeClasses: Record<number, string> = {
  0: "bg-zinc-50/50 dark:bg-zinc-800/20 text-zinc-500 dark:text-zinc-500 border border-dashed border-zinc-300 dark:border-zinc-700",
  1: "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30",
  2: "badge-bronze",
  3: "badge-silver",
  4: "badge-gold",
  5: "badge-diamond",
  6: "badge-mythic",
  7: "badge-fire",
  8: "badge-ultimate",
};

export function Flashcard({
  card,
  revealStep,
  onRemember,
  onForget,
  onNext,
  onPlayAudio,
  canUndo = false,
  onUndo,
}: FlashcardProps) {
  const handleDeleteAudio = async () => {
    try {
      await invoke("delete_single_audio", { text: card.hanzi });
    } catch (e) {
      console.error("Failed to delete audio:", e);
    }
  };

  const contentContainerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const activeTab = useAppStore((state) => state.activeTab);

  const [meaningFontSizeStep1, setMeaningFontSizeStep1] = useState(20);
  const [meaningFontSizeStep2, setMeaningFontSizeStep2] = useState(16);
  const [meaningFontSizeStep3, setMeaningFontSizeStep3] = useState(16);
  const [pinyinFontSizeStep2, setPinyinFontSizeStep2] = useState(16);
  const [pinyinFontSizeStep3, setPinyinFontSizeStep3] = useState(12);
  const [hanziFontSize, setHanziFontSize] = useState(32);

  // Track previous prop values to reset state immediately during render phase
  const [prevCardId, setPrevCardId] = useState(card.id);
  const [prevRevealStep, setPrevRevealStep] = useState(revealStep);

  if (card.id !== prevCardId || revealStep !== prevRevealStep) {
    setPrevCardId(card.id);
    setPrevRevealStep(revealStep);
    setIsReady(false);
    setMeaningFontSizeStep1(20);
    setMeaningFontSizeStep2(16);
    setMeaningFontSizeStep3(16);
    setPinyinFontSizeStep2(16);
    setPinyinFontSizeStep3(12);
    setHanziFontSize(32);
  }

  useEffect(() => {
    if (!contentContainerRef.current) return;

    const containerWidth = Math.min(
      672,
      contentContainerRef.current.offsetWidth || 672,
    );

    if (revealStep === "meaning") {
      const charCount = card.meaning?.length || 1;
      const fontSize = Math.max(
        20,
        Math.min(36, Math.floor(containerWidth / (charCount * 0.35))),
      );
      setMeaningFontSizeStep1(fontSize);
    } else if (revealStep === "pinyin") {
      const meaningCharCount = card.meaning?.length || 1;
      const meaningFontSize = Math.max(
        16,
        Math.min(24, Math.floor(containerWidth / (meaningCharCount * 0.35))),
      );
      setMeaningFontSizeStep2(meaningFontSize);

      const pinyinCharCount = card.pinyin?.length || 1;
      const pinyinFontSize = Math.max(
        16,
        Math.min(32, Math.floor(containerWidth / (pinyinCharCount * 0.52))),
      );
      setPinyinFontSizeStep2(pinyinFontSize);
    } else if (revealStep === "hanzi") {
      const meaningCharCount = card.meaning?.length || 1;
      const meaningFontSize = Math.max(
        16,
        Math.min(20, Math.floor(containerWidth / (meaningCharCount * 0.35))),
      );
      setMeaningFontSizeStep3(meaningFontSize);

      const pinyinCharCount = card.pinyin?.length || 1;
      const pinyinFontSize = Math.max(
        12,
        Math.min(20, Math.floor(containerWidth / (pinyinCharCount * 0.52))),
      );
      setPinyinFontSizeStep3(pinyinFontSize);

      const hanziCharCount = card.hanzi.length;
      const hanziFontSizeCalculated = Math.max(
        32,
        Math.min(96, Math.floor((containerWidth / hanziCharCount) * 0.8)),
      );
      setHanziFontSize(hanziFontSizeCalculated);
    }

    const rafId = requestAnimationFrame(() => {
      setIsReady(true);
    });

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [card.id, card.meaning, card.pinyin, card.hanzi, revealStep]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent handling keys if the Review tab is not active
      if (activeTab !== "review") return;

      // Do not intercept if the user is typing in an input field
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        if (revealStep !== "hanzi") {
          onNext();
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (revealStep === "hanzi") {
          onForget();
        }
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (revealStep === "hanzi") {
          onRemember();
        }
      } else if ((e.key === "z" && e.ctrlKey) || e.key === "Backspace") {
        if (canUndo && onUndo) {
          e.preventDefault();
          onUndo();
        }
      } else if (e.key.toLowerCase() === "v") {
        e.preventDefault();
        if (onPlayAudio) {
          onPlayAudio();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [revealStep, onNext, onRemember, onForget, canUndo, onUndo, activeTab]);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-4xl mx-auto animate-slide-up">
      {/* Flashcard Sheet */}
      <div className="w-full rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] border p-8 md:p-12 min-h-[440px] md:min-h-[460px] flex items-center justify-center relative bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800/80 hover:border-indigo-200/80 dark:hover:border-indigo-900/40 hover:shadow-[0_12px_40px_rgba(99,102,241,0.03)] dark:hover:shadow-[0_12px_40px_rgba(99,102,241,0.02)] transition-all duration-300">
        {/* Top Header Row of Card */}
        <div className="absolute top-6 left-8 right-8 flex items-center justify-between">
          {onPlayAudio ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPlayAudio();
              }}
              title="Phát âm thanh"
              className="flex items-center gap-1.5 px-3 py-1.5 -ml-3 text-zinc-400 dark:text-zinc-500 hover:text-indigo-600 dark:hover:text-sky-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <Volume2 className="w-4 h-4" />
              <span className="text-xs font-bold tracking-wider">(V)</span>
            </button>
          ) : (
            <div /> /* Spacer */
          )}
          <Badge
            className={cn(
              "px-2.5 py-0.5 text-[11px]",
              badgeClasses[card.level] || badgeClasses[0]
            )}
          >
            {card.level === 8 ? (
              <span className="badge-ultimate-text">{getMasteryLabel(card.level)}</span>
            ) : (
              getMasteryLabel(card.level)
            )}
          </Badge>
        </div>

        {/* Card Content Prompts */}
        <div
          ref={contentContainerRef}
          className={cn(
            "w-full flex flex-col items-center justify-center transition-opacity duration-75 ease-out",
            isReady ? "opacity-100" : "opacity-0",
          )}
        >
          {revealStep === "meaning" && (
            <div className="text-center space-y-2">
              <p
                style={{ fontSize: `${meaningFontSizeStep1}px` }}
                className="font-sans text-zinc-900 dark:text-zinc-100 tracking-tight leading-relaxed max-w-2xl mx-auto text-wrap-balance"
              >
                {card.meaning || "Chưa có nghĩa"}
              </p>
            </div>
          )}

          {revealStep === "pinyin" && (
            <div className="text-center space-y-6 w-full px-4">
              <p
                style={{ fontSize: `${meaningFontSizeStep2}px` }}
                className="font-sans text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto text-wrap-balance leading-relaxed"
              >
                {card.meaning || "Chưa có nghĩa"}
              </p>

              <div className="border-t border-zinc-100 dark:border-zinc-800/60 pt-6 max-w-2xl mx-auto w-full">
                <div className="flex items-center justify-center gap-2.5">
                  <p
                    style={{ fontSize: `${pinyinFontSizeStep2}px` }}
                    className="font-semibold text-indigo-600 dark:text-indigo-400 tracking-wide font-sans leading-snug whitespace-nowrap"
                  >
                    {card.pinyin || "—"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {revealStep === "hanzi" && (
            <div className="text-center w-full flex flex-col items-center space-y-6">
              <div className="text-center max-w-2xl px-4 space-y-2 pb-4 border-b border-zinc-100 dark:border-zinc-800/60">
                <p
                  style={{ fontSize: `${meaningFontSizeStep3}px` }}
                  className="font-sans text-zinc-600 dark:text-zinc-400 leading-relaxed text-wrap-balance"
                >
                  {card.meaning || "Chưa có nghĩa"}
                </p>
                <div className="flex items-center justify-center gap-2 w-full">
                  <p
                    style={{ fontSize: `${pinyinFontSizeStep3}px` }}
                    className="font-semibold text-indigo-600 dark:text-indigo-400 font-sans whitespace-nowrap"
                  >
                    {card.pinyin || "—"}
                  </p>
                </div>
              </div>

              <div className="w-full flex justify-center overflow-hidden py-2">
                <HanziHover
                  text={card.hanzi}
                  className="font-hanzi text-center text-zinc-900 dark:text-zinc-100 tracking-wider font-light"
                  style={{ fontSize: `${hanziFontSize}px` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Quiet Subtle Delete Audio Option */}
        {revealStep === "hanzi" && (
          <div className="absolute bottom-4 right-4 z-20">
            <button
              onClick={handleDeleteAudio}
              className="p-1.5 rounded-lg opacity-35 hover:opacity-100 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95"
              title="Xóa âm thanh"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Action Buttons Row */}
      <div className="flex justify-center w-full">
        {revealStep === "hanzi" ? (
          <div className="flex gap-4 animate-fade-in">
            <button
              onClick={onForget}
              className="relative px-8 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-3 text-base bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100/80 dark:hover:bg-rose-950/40 hover:scale-[1.02] active:scale-[0.98] hover:shadow-md hover:border-rose-300 dark:hover:border-rose-800 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/30 shadow-sm cursor-pointer group"
            >
              Quên
              <kbd className="inline-flex items-center px-1.5 py-0.5 rounded bg-rose-300 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-400 shadow-sm select-none transition-transform duration-200 group-hover:-translate-x-0.5">
                <CustomIcon
                  name="arrow_left"
                  className="text-rose-700 dark:text-rose-400"
                />
              </kbd>
            </button>

            <button
              onClick={onRemember}
              className="relative px-8 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-3 text-base bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100/80 dark:hover:bg-emerald-950/40 hover:scale-[1.02] active:scale-[0.98] hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-800 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30 shadow-sm cursor-pointer group"
            >
              Nhớ
              <kbd className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-300 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-400 shadow-sm select-none transition-transform duration-200 group-hover:translate-x-0.5">
                <CustomIcon
                  name="arrow_right"
                  className="text-emerald-700 dark:text-emerald-400"
                />
              </kbd>
            </button>
          </div>
        ) : (
          <div className="flex gap-4 animate-fade-in">
            {canUndo && onUndo && (
              <button
                onClick={onUndo}
                className="px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2.5 text-base bg-zinc-50 hover:bg-zinc-100/80 hover:scale-[1.02] active:scale-[0.98] hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 border border-zinc-200 dark:bg-zinc-850 dark:hover:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-800 shadow-sm cursor-pointer group"
                title="Quay lại thẻ trước"
              >
                <CustomIcon
                  name="undo"
                  className="w-4 h-4 text-zinc-500 dark:text-zinc-400 transition-transform duration-300 group-hover:-rotate-45"
                />
                Hoàn tác
                <kbd className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono rounded bg-white/60 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 shadow-sm select-none">
                  Ctrl+Z
                </kbd>
              </button>
            )}

            <button
              onClick={onNext}
              className="px-8 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2.5 text-base bg-emerald-700/80 dark:bg-emerald-800/60 text-white dark:text-zinc-100 hover:bg-emerald-700 dark:hover:bg-emerald-800 hover:scale-[1.02] active:scale-[0.98] hover:shadow-md shadow-sm border border-transparent dark:border-indigo-500/30 cursor-pointer group"
            >
              Bước tiếp
              <kbd className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono rounded bg-emerald-700/50 dark:bg-emerald-950/40 border border-emerald-500/30 dark:border-emerald-900/40 text-indigo-100 dark:text-indigo-200 shadow-sm select-none transition-all duration-200 group-hover:scale-105">
                Space
              </kbd>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
