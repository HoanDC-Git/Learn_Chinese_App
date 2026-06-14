import { useState, useCallback, useEffect, CSSProperties } from "react";
import { useDictionary } from "../../../hooks";
import { useUiStore } from "../../../stores";
import { cn } from "../../../lib/utils";

interface HanziHoverProps {
  text: string;
  className?: string;
  style?: CSSProperties;
}

export function HanziHover({ text, className, style }: HanziHoverProps) {
  const { lookupHover } = useDictionary();
  const {
    hoverEnabled,
    setHoverWords,
    setHoverWordsDeferred,
    clearHideTimer,
    hoverHighlightRange,
  } = useUiStore();
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  const handleCharHover = useCallback(
    async (charIndex: number, e: React.MouseEvent) => {
      e.stopPropagation();

      if (!hoverEnabled) return;

      clearHideTimer();

      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      const timer = setTimeout(async () => {
        const results = await lookupHover(text, charIndex);
        if (results.length > 0) {
          const rect = (e.target as HTMLElement).getBoundingClientRect();
          const longestWord = results[0].word;
          const longestLength = [...longestWord].length;

          setHoverWords(
            results,
            {
              x: rect.left,
              y: rect.bottom,
              height: rect.height,
            },
            {
              start: charIndex,
              length: longestLength,
            },
          );
        }
      }, 80);

      setDebounceTimer(timer);
    },
    [
      text,
      lookupHover,
      setHoverWords,
      clearHideTimer,
      debounceTimer,
      hoverEnabled,
    ],
  );

  const handleMouseLeave = useCallback(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      setDebounceTimer(null);
    }
    setHoverWordsDeferred(null, undefined, undefined, 200);
  }, [debounceTimer, setHoverWordsDeferred]);

  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  // Split the text into parts containing normal text and clause delimiters (， , ； ;)
  const parts = text.split(/([，,；;])/);
  const groupedChars: {
    id: number;
    chars: { char: string; index: number }[];
  }[] = [];
  let currentChars: { char: string; index: number }[] = [];
  let globalIndex = 0;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue; // Skip empty matches

    if (part === "，" || part === "," || part === "；" || part === ";") {
      // Append the delimiter to the current clause group and then finalize the group
      currentChars.push({ char: part, index: globalIndex });
      globalIndex++;
      groupedChars.push({ id: groupedChars.length, chars: currentChars });
      currentChars = [];
    } else {
      // It's normal text, break it down into characters
      const chars = [...part];
      for (const char of chars) {
        currentChars.push({ char, index: globalIndex });
        globalIndex++;
      }
    }
  }
  // Flush any remaining characters into the final group
  if (currentChars.length > 0) {
    groupedChars.push({ id: groupedChars.length, chars: currentChars });
  }

  return (
    <span
      className={cn(
        "cursor-help select-none inline-flex flex-wrap justify-center",
        className,
      )}
      style={style}
      onMouseLeave={handleMouseLeave}
    >
      {groupedChars.map((group) => (
        <span key={group.id} className="inline-flex whitespace-nowrap">
          {group.chars.map(({ char, index }) => {
            const isHighlighted =
              hoverHighlightRange !== null &&
              index >= hoverHighlightRange.start &&
              index < hoverHighlightRange.start + hoverHighlightRange.length;

            return (
              <span
                key={index}
                className={cn(
                  "rounded transition-colors",
                  hoverEnabled &&
                    "hover:bg-indigo-50 dark:hover:bg-sky-900/60 hover:text-indigo-600 dark:hover:text-sky-400 transition-all rounded px-1",
                  isHighlighted &&
                    "bg-indigo-50 dark:bg-sky-900/60 text-indigo-700 dark:text-sky-300 rounded px-1",
                )}
                onMouseEnter={(e) => handleCharHover(index, e)}
              >
                {char}
              </span>
            );
          })}
        </span>
      ))}
    </span>
  );
}
