import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Input } from "../../components/ui/Input";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Pagination } from "../../components/ui/Pagination";
import { Search, ArrowUpDown, Volume2 } from "lucide-react";
import { cn, getHskBadgeColor, getInputFontClass } from "../../lib/utils";
import type { DictionaryEntry } from "../../types";
import { useTts } from "../../hooks";

interface SearchResponse {
  results: DictionaryEntry[];
  total: number;
  page: number;
  page_size: number;
}

export function DictionaryPage() {
  const { speakText } = useTts();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DictionaryEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [sortBy, setSortBy] = useState<"default" | "hsk">("default");
  const [isSearching, setIsSearching] = useState(false);
  const pageSize = 50;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Track scroll range in a state to only trigger re-render on boundary crosses
  const lastRangeRef = useRef({ start: -1, end: -1 });
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 12 });

  // Reset page and clear results when search parameters change
  useEffect(() => {
    setPage(0);
  }, [query, sortBy]);

  useEffect(() => {
    let active = true;

    const runSearch = async () => {
      if (page === 0) {
        setIsSearching(true);
      }
      try {
        const res = await invoke<SearchResponse>("search_dictionary", {
          req: {
            query,
            page,
            page_size: pageSize,
            sort_by: sortBy,
          },
        });
        if (!active) return;
        setResults(res.results);
        setTotal(res.total);
        if (scrollContainerRef.current) {
          const el = scrollContainerRef.current;
          el.style.scrollBehavior = "auto";
          el.scrollTop = 0;
          requestAnimationFrame(() => {
            el.style.scrollBehavior = "";
          });
        }
      } catch (e) {
        console.error("Search error:", e);
      } finally {
        if (active) {
          setIsSearching(false);
          isInitialMount.current = false;
        }
      }
    };

    if (page === 0) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        runSearch();
      }, 300);
    } else {
      runSearch();
    }

    return () => {
      active = false;
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, page, sortBy]);

  // Recalculate range when results list changes
  useEffect(() => {
    const entryHeight = 106;
    const containerHeight = scrollContainerRef.current?.clientHeight || 600;
    
    // Step 1: Render ONLY the visible area (buffer = 0)
    const start = 0;
    const end = Math.min(results.length, Math.ceil(containerHeight / entryHeight));
    
    lastRangeRef.current = { start, end };
    setVisibleRange((prev) => {
      if (prev.start === start && prev.end === end) return prev;
      return { start, end };
    });

    // Step 2: Expand buffer after initial paint
    const timer = setTimeout(() => {
      const fullBuffer = 10;
      const startFull = 0;
      const endFull = Math.min(results.length, Math.ceil(containerHeight / entryHeight) + fullBuffer);
      
      lastRangeRef.current = { start: startFull, end: endFull };
      setVisibleRange({ start: startFull, end: endFull });
    }, 50);

    return () => clearTimeout(timer);
  }, [results]);

  const handleSort = () => {
    setSortBy((prev) => (prev === "default" ? "hsk" : "default"));
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const currentScrollTop = target.scrollTop;

    // Virtualization calculations
    const entryHeight = 106;
    const buffer = 10;
    const containerHeight = target.clientHeight || 600;

    const start = Math.max(0, Math.floor(currentScrollTop / entryHeight) - buffer);
    const end = Math.min(results.length, Math.ceil((currentScrollTop + containerHeight) / entryHeight) + buffer);

    // ONLY trigger state update if the range has actually changed!
    if (start !== lastRangeRef.current.start || end !== lastRangeRef.current.end) {
      lastRangeRef.current = { start, end };
      setVisibleRange({ start, end });
    }
  };

  // Virtualization constants
  const entryHeight = 106;
  const { start, end } = visibleRange;
  const visibleEntries = results.slice(start, end);
  const topSpacerHeight = start * entryHeight;
  const bottomSpacerHeight = (results.length - end) * entryHeight;

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden space-y-4">
      <div className="flex items-center justify-between shrink-0 h-14">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Từ điển Trung - Việt
        </h2>
      </div>

      <Card className="shrink-0 py-4 px-6">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search
              className="transform absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 dark:text-zinc-500"
            />
            <Input
              placeholder="输入中文 hoặc 汉字..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={cn(
                "text-xl pl-10 text-zinc-900 dark:text-zinc-100",
                getInputFontClass(query)
              )}
            />
          </div>
          <button
            onClick={handleSort}
            className={cn(
              "px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 text-sm font-medium",
              sortBy === "hsk"
                ? "bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-sky-950/60 dark:border-sky-800 dark:text-sky-400"
                : "bg-white border-zinc-300 text-zinc-600 hover:bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-700"
            )}
          >
            <ArrowUpDown className="w-4 h-4" />
            {sortBy === "hsk" ? "HSK ↑" : "Mặc định"}
          </button>
        </div>
      </Card>

      <Card className="flex-1 flex flex-col min-h-0 py-4 px-6 overflow-hidden">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {total} kết quả
            {query && ` cho "${query}"`}
          </p>
        </div>

        {isSearching && results.length === 0 ? (
          <p className="text-center py-8 text-zinc-600 dark:text-zinc-400 shrink-0">Đang tìm...</p>
        ) : results.length === 0 ? (
          <p className="text-center py-8 text-zinc-600 dark:text-zinc-400 shrink-0">
            {query
              ? `Không tìm thấy kết quả cho "${query}"`
              : "Chưa có dữ liệu"}
          </p>
        ) : (
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className={cn("flex-1 overflow-y-auto scroll-smooth-gpu scrollbar-thin min-h-0 space-y-2 pr-1 transition-opacity duration-200", isSearching && "opacity-60 pointer-events-none")}
          >
            {topSpacerHeight > 0 && <div style={{ height: topSpacerHeight }} />}
            {visibleEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start justify-between p-4 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/60 transition-colors"
              >
                <div className="flex-1 flex gap-10">
                  <div className="flex-shrink-0 w-56">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-3xl font-hanzi font-light text-zinc-900 dark:text-zinc-100"
                      >
                        {entry.word}
                      </span>
                      <button
                        onClick={() => speakText(entry.word, 300)}
                        title="Phát âm"
                        className="p-1 rounded-full text-zinc-400 hover:text-indigo-600 dark:hover:text-sky-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                    {entry.pinyin && (
                      <p className="text-lg mt-1 text-indigo-600 dark:text-sky-400 font-semibold">
                        {entry.pinyin}
                      </p>
                    )}
                  </div>
                  <div
                    className="flex-1 border-l pl-6 border-zinc-200 dark:border-zinc-800"
                  >
                    {entry.pos && (
                      <p className="text-sm italic mb-1 text-zinc-600 dark:text-zinc-400">
                        {entry.pos}
                      </p>
                    )}
                    {entry.meaning_vi && (
                      <p className="text-base text-zinc-700 dark:text-zinc-300">
                        {entry.meaning_vi}
                      </p>
                    )}
                    {entry.meaning_en && (
                      <p className="text-base mt-0.5 text-zinc-400 dark:text-zinc-500">
                        {entry.meaning_en}
                      </p>
                    )}
                  </div>
                </div>
                {entry.hsk_level && (
                  <Badge
                    className={cn(
                      "shrink-0 ml-4",
                      getHskBadgeColor(entry.hsk_level),
                    )}
                  >
                    HSK {entry.hsk_level}
                  </Badge>
                )}
              </div>
            ))}
            {bottomSpacerHeight > 0 && <div style={{ height: bottomSpacerHeight }} />}
          </div>
        )}
        <Pagination
          currentPage={page}
          totalPages={Math.ceil(total / pageSize)}
          onPageChange={setPage}
          disabled={isSearching}
        />
      </Card>
    </div>
  );
}
