import React, { useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "../../../components/ui/Input";
import { Card } from "../../../components/ui/Card";
import { cn } from "../../../lib/utils";
import type { DecompositionSearchResponse, DecompositionNode } from "../types";
import { HanziWriterAnimator } from "./HanziWriterAnimator";

const SAMPLE_CHARS = [
  { char: "我", label: "Tôi" },
  { char: "学", label: "Học" },
  { char: "中", label: "Trung" },
  { char: "文", label: "Văn" },
];

interface DecompositionSearchProps {
  query: string;
  setQuery: (q: string) => void;
  suggestions: DecompositionSearchResponse;
  showSuggestions: boolean;
  setShowSuggestions: (show: boolean) => void;
  wordChars: string[];
  setWordChars: (chars: string[]) => void;
  activeChar: string;
  loadDecomposition: (char: string) => void;
  handleWordSelect: (word: string) => void;
  selectedNode: DecompositionNode | null;
}



export function DecompositionSearch({
  query,
  setQuery,
  suggestions,
  showSuggestions,
  setShowSuggestions,
  wordChars,
  setWordChars,
  activeChar,
  loadDecomposition,
  handleWordSelect,
  selectedNode,
}: DecompositionSearchProps) {
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setShowSuggestions]);

  const handleSuggestionClick = (item: { word?: string; character?: string }) => {
    setShowSuggestions(false);
    if (item.character) {
      setQuery(item.character);
      setWordChars([]);
      loadDecomposition(item.character);
    } else if (item.word) {
      setQuery(item.word);
      handleWordSelect(item.word);
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setShowSuggestions(false);
    const trimmed = query.trim();
    if (!trimmed) return;

    if (trimmed.length === 1) {
      setWordChars([]);
      loadDecomposition(trimmed);
    } else {
      handleWordSelect(trimmed);
    }
  };

  return (
    <div className="w-[280px] border rounded-xl flex flex-col p-4 gap-4 shrink-0 overflow-y-auto bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] backdrop-blur-md scrollbar-thin">
      {/* Search container */}
      <div ref={searchContainerRef} className="relative">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <Search className="transform absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <Input
            placeholder="Tra chữ, Pinyin..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            className={cn(
              "pl-10 pr-3 py-3 text-lg bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800/80 focus-visible:ring-fuchsia-500/30 focus-visible:border-fuchsia-500/50 hover:border-zinc-300 dark:hover:border-zinc-700/80 transition-all focus:shadow-[0_0_15px_rgba(217,70,239,0.08)]",
              "font-mixed"
            )}
          />
        </form>

        {/* Suggestions list dropdown */}
        {showSuggestions && (suggestions.vocab.length > 0 || suggestions.characters.length > 0) && (
          <div className="absolute top-full left-0 right-0 border rounded-xl mt-2 max-h-64 overflow-y-auto z-50 shadow-[0_12px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_12px_30px_rgba(0,0,0,0.35)] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-zinc-200 dark:border-zinc-800/85 divide-y divide-zinc-100 dark:divide-zinc-800/50 overflow-hidden animate-slide-up-short">
            {/* Character matches */}
            {suggestions.characters.map((char) => (
              <button
                key={char.character}
                onClick={() => handleSuggestionClick({ character: char.character })}
                className="w-full text-left px-4 py-2.5 flex items-center justify-between transition-all hover:bg-fuchsia-500/5 dark:hover:bg-fuchsia-500/10 group cursor-pointer"
              >
                <span className="text-xl font-medium text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
                  <span className="font-hanzi text-2xl group-hover:scale-110 transition-transform duration-200">{char.character}</span>{" "}
                  <span className="text-xs font-mono font-bold tracking-wider uppercase text-zinc-400 dark:text-zinc-500">(Chữ đơn)</span>
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 group-hover:border-fuchsia-300 dark:group-hover:border-fuchsia-900/50">
                  {char.pinyin || "N/A"}
                </span>
              </button>
            ))}

            {/* Vocabulary matches */}
            {suggestions.vocab.map((item) => (
              <button
                key={item.word}
                onClick={() => handleSuggestionClick({ word: item.word })}
                className="w-full text-left px-4 py-3 flex flex-col transition-all hover:bg-fuchsia-500/5 dark:hover:bg-fuchsia-500/10 group cursor-pointer"
              >
                <span className="font-hanzi text-lg font-semibold text-zinc-950 dark:text-zinc-50 group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-400 transition-colors">
                  {item.word}
                </span>
                <div className="flex justify-between text-xs mt-1 text-zinc-500 dark:text-zinc-400 font-sans">
                  <span>{item.pinyin || ""} | HSK {item.hsk_level || ""}</span>
                  <span className="truncate max-w-[120px] text-right font-medium text-zinc-600 dark:text-zinc-300">{item.meaning_vi || ""}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Character selector grid for multi-character word */}
      {wordChars.length > 0 && (
        <Card className="shrink-0 p-3 bg-cyan-500/5 border border-dashed border-cyan-500/30 dark:border-cyan-500/20 rounded-xl flex flex-col">
          <h4 className="text-xs font-bold mb-2 uppercase tracking-wider text-cyan-600/70 dark:text-cyan-400/70">
            Chọn chữ để chiết tự:
          </h4>
          <div className="flex flex-wrap gap-1.5 overflow-hidden">
            {wordChars.map((char) => (
              <button
                key={char}
                onClick={() => loadDecomposition(char)}
                className={cn(
                  "w-9 h-9 border rounded-lg flex items-center justify-center font-hanzi text-lg font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer",
                  activeChar === char
                    ? "border-cyan-500 bg-cyan-500 text-white shadow-sm"
                    : "hover:border-cyan-500 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-950"
                )}
              >
                {char}
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Quick HSK Characters */}
      <div className="flex flex-col gap-2.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">Chữ Hán tiêu biểu</h4>
        <div className="grid grid-cols-4 gap-1.5">
          {SAMPLE_CHARS.map((item) => (
            <button
              key={item.char}
              onClick={() => {
                setQuery(item.char);
                setWordChars([]);
                loadDecomposition(item.char);
              }}
              className="aspect-square border rounded-xl flex flex-col items-center justify-center border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 hover:bg-white dark:bg-zinc-900/30 dark:hover:bg-zinc-850 hover:border-cyan-500 dark:hover:border-cyan-500 hover:shadow-[0_4px_12px_rgba(6,182,212,0.12)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer p-1"
              title={item.label}
            >
              <span className="font-hanzi text-lg font-bold text-zinc-900 dark:text-zinc-100">{item.char}</span>
              <span className="text-xs font-sans text-zinc-500 dark:text-zinc-500 truncate max-w-full leading-none mt-0.5">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Node Character Hero card & Animator (Redesigned layout) */}
      {selectedNode && (
        <div className="mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800/60 flex flex-col gap-4">
          <HanziWriterAnimator character={selectedNode.character} hex_code={selectedNode.hex_code} />
        </div>
      )}
    </div>
  );
}
