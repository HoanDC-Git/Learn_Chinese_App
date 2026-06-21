import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Input } from "../../components/ui/Input";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";

import { Search, ArrowUpDown, Volume2 } from "lucide-react";
import { cn, getHskBadgeColor } from "../../lib/utils";
import type { DictionaryEntry } from "../../types";
import { useTts, useDebounce } from "../../hooks";
import { Virtuoso } from "react-virtuoso";

interface SearchResponse {
  results: DictionaryEntry[];
  total: number;
  page: number;
  page_size: number;
}

export function DictionaryPage() {
  const { speakText } = useTts();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const [results, setResults] = useState<DictionaryEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [sortBy, setSortBy] = useState<"default" | "hsk">("default");
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const pageSize = 200;
  const isInitialMount = useRef(true);

  // Reset page and clear results when search parameters change
  useEffect(() => {
    setPage(0);
    setResults([]);
  }, [debouncedQuery, sortBy]);

  useEffect(() => {
    let active = true;

    const runSearch = async () => {
      if (page === 0) {
        setIsSearching(true);
      } else {
        setIsLoadingMore(true);
      }
      try {
        const res = await invoke<SearchResponse>("search_dictionary", {
          req: {
            query: debouncedQuery,
            page,
            page_size: pageSize,
            sort_by: sortBy,
          },
        });
        if (!active) return;
        if (page === 0) {
          setResults(res.results);
        } else {
          setResults((prev) => {
            // Prevent duplicates if React StrictMode fires twice
            const newResults = res.results.filter(
              (newEntry) => !prev.some((oldEntry) => oldEntry.id === newEntry.id)
            );
            return [...prev, ...newResults];
          });
        }
        setTotal(res.total);
      } catch (e) {
        console.error("Search error:", e);
      } finally {
        if (active) {
          setIsSearching(false);
          setIsLoadingMore(false);
          isInitialMount.current = false;
        }
      }
    };

    runSearch();

    return () => {
      active = false;
    };
  }, [debouncedQuery, page, sortBy]);

  const handleSort = () => {
    setSortBy((prev) => (prev === "default" ? "hsk" : "default"));
  };

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
                "text-xl pl-10 text-zinc-900 dark:text-zinc-100 font-mixed"
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
            {debouncedQuery && ` cho "${debouncedQuery}"`}
          </p>
        </div>

        {isSearching && results.length === 0 ? (
          <p className="text-center py-8 text-zinc-600 dark:text-zinc-400 shrink-0">Đang tìm...</p>
        ) : results.length === 0 ? (
          <p className="text-center py-8 text-zinc-600 dark:text-zinc-400 shrink-0">
            {debouncedQuery
              ? `Không tìm thấy kết quả cho "${debouncedQuery}"`
              : "Chưa có dữ liệu"}
          </p>
        ) : (
          <div className={cn("flex-1 min-h-0 transition-opacity duration-200", isSearching && "opacity-60 pointer-events-none")}>
            <Virtuoso
              data={results}
              className="h-full w-full scrollbar-thin"
              increaseViewportBy={800}
              endReached={() => {
                if (!isSearching && !isLoadingMore && results.length < total) {
                  setPage((p) => p + 1);
                }
              }}
              components={{
                Footer: () => (
                  <div className="h-16 flex items-center justify-center">
                    {isLoadingMore && <span className="text-sm text-zinc-500 dark:text-zinc-400">Đang tải thêm...</span>}
                    {!isLoadingMore && results.length > 0 && results.length >= total && (
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">Đã hiển thị hết kết quả</span>
                    )}
                  </div>
                )
              }}
              itemContent={(_index, entry) => (
                <div
                  className="flex items-start justify-between p-4 mb-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/60 transition-colors"
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
              )}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
