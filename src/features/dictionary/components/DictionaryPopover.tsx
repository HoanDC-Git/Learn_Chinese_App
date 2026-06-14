import { useEffect, useRef, useState } from "react";
import { cn, getHskBadgeColor } from "../../../lib/utils";
import { useUiStore } from "../../../stores";
import type { HoverResult } from "../../../types";

interface DictionaryPopoverProps {
  results: HoverResult[];
  position: { x: number; y: number; height?: number };
}

export function DictionaryPopover({
  results,
  position,
}: DictionaryPopoverProps) {
  const { setHoverWordsDeferred, clearHideTimer } = useUiStore();

  const popoverRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: position.x, y: position.y });
  const [maxHeight, setMaxHeight] = useState(320);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    if (popoverRef.current) {
      const rect = popoverRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      let newX = position.x;
      const charHeight = position.height || 28;
      const rectBottom = position.height ? position.y : position.y - 8;
      const rectTop = rectBottom - charHeight;

      let newY = rectBottom + 8;

      const popoverWidth = 320;
      if (newX + popoverWidth > viewportWidth) {
        newX = viewportWidth - popoverWidth - 16;
      }
      if (newX < 16) {
        newX = 16;
      }

      const spaceBelow = viewportHeight - (rectBottom + 8) - 16;
      const spaceAbove = rectTop - 8 - 16;

      let flipped = false;
      const popoverHeight = rect.height || 320;

      if (rectBottom + 8 + popoverHeight > viewportHeight - 16) {
        if (spaceAbove > spaceBelow && spaceBelow < 150) {
          flipped = true;
          const limitHeight = Math.min(320, popoverHeight);
          newY = rectTop - limitHeight - 8;

          if (newY < 16) {
            newY = 16;
            setMaxHeight(Math.max(120, rectTop - 8 - 24));
          } else {
            setMaxHeight(limitHeight);
          }
        } else {
          newY = rectBottom + 8;
          setMaxHeight(Math.max(120, spaceBelow));
        }
      } else {
        newY = rectBottom + 8;
        setMaxHeight(320);
      }

      setCoords({ x: newX, y: newY });
      setIsFlipped(flipped);
    }
  }, [position, results]);

  useEffect(() => {
    const handleGlobalWheel = (e: WheelEvent) => {
      if (!popoverRef.current) return;

      const container = popoverRef.current.querySelector(".overflow-y-auto");
      if (container) {
        if (popoverRef.current.contains(e.target as Node)) {
          return;
        }

        e.preventDefault();
        container.scrollBy({
          top: e.deltaY,
          behavior: "smooth",
        });

        if (useUiStore.getState().isHideTimerActive) {
          setHoverWordsDeferred(null, undefined, undefined, 100);
        }
      }
    };

    window.addEventListener("wheel", handleGlobalWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", handleGlobalWheel);
    };
  }, [results, setHoverWordsDeferred]);

  if (results.length === 0) return null;

  return (
    <div
      ref={popoverRef}
      className="fixed z-[9999] rounded-xl shadow-2xl border p-0 w-80 animate-slide-up overflow-visible bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm border-zinc-200 dark:border-zinc-800"
      style={{
        left: `${coords.x}px`,
        top: `${coords.y}px`,
      }}
      onMouseEnter={clearHideTimer}
      onMouseLeave={() =>
        setHoverWordsDeferred(null, undefined, undefined, 100)
      }
    >
      {/* Invisible bridge to prevent mouseleave when moving mouse between trigger and popover */}
      {isFlipped ? (
        <div className="absolute -bottom-3 left-0 right-0 h-3 bg-transparent pointer-events-auto" />
      ) : (
        <div className="absolute -top-3 left-0 right-0 h-3 bg-transparent pointer-events-auto" />
      )}
      <div
        style={{ maxHeight: `${maxHeight}px` }}
        className="scroll-smooth overflow-y-auto custom-scrollbar rounded-xl"
      >
        {results.map((result, index) => (
          <div
            key={`${result.word}-${index}`}
            className={cn(
              "p-4",
              index > 0 && "border-t border-zinc-100 dark:border-zinc-800",
              index === 0 && "bg-indigo-50/50 dark:bg-sky-950/40",
            )}
          >
            <div className="flex items-start justify-between mb-1">
              <h3
                className={cn(
                  "font-hanzi font-bold text-zinc-900 dark:text-zinc-100",
                  index === 0 ? "text-2xl" : "text-lg",
                )}
              >
                {result.word}
              </h3>
              {result.hsk_level && (
                <span
                  className={cn(
                    "px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0",
                    getHskBadgeColor(result.hsk_level),
                  )}
                >
                  HSK {result.hsk_level}
                </span>
              )}
            </div>

            <p className="text-sm mb-1 text-indigo-600 dark:text-sky-400 font-semibold">
              {result.pinyin}
            </p>

            {result.pos && (
              <p className="text-xs mb-2 italic text-zinc-400 dark:text-zinc-500">
                {result.pos}
              </p>
            )}

            {result.meaning_vi && (
              <div className="mb-0.5">
                <span className="text-xs text-zinc-400 dark:text-zinc-500">
                  VI{" "}
                </span>
                <span className="text-sm text-zinc-700 dark:text-zinc-300">
                  {result.meaning_vi}
                </span>
              </div>
            )}

            {result.meaning_en && (
              <div>
                <span className="text-xs text-zinc-400 dark:text-zinc-500">
                  EN{" "}
                </span>
                <span className="text-sm text-zinc-700 dark:text-zinc-300">
                  {result.meaning_en}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
