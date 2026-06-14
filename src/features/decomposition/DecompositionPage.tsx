import { useState, useEffect, useRef, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { AlertTriangle, HelpCircle, Network, Plus, Minus, RotateCcw } from "lucide-react";
import { DecompositionSearch } from "./components/DecompositionSearch";
import { DecompositionTree } from "./components/DecompositionTree";
import { DecompositionDetails } from "./components/DecompositionDetails";
import type { DecompositionSearchResponse, DecompositionNode } from "./types";
import styles from "./DecompositionPage.module.css";

export function DecompositionPage() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<DecompositionSearchResponse>({ vocab: [], characters: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [wordChars, setWordChars] = useState<string[]>([]);
  const [activeChar, setActiveChar] = useState("");
  const [treeData, setTreeData] = useState<DecompositionNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<DecompositionNode | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isCentering, setIsCentering] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Canvas Pan & Zoom States
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const dragOffsetStartRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Center View logic
  const centerView = useCallback(() => {
    const container = containerRef.current;
    const wrapper = wrapperRef.current;
    if (!container || !wrapper) return;

    const containerRect = container.getBoundingClientRect();
    const unscaledWidth = wrapper.offsetWidth || 400;

    const initialX = (containerRect.width - unscaledWidth) / 2;
    const initialY = 40;

    setTransform({ scale: 1, x: initialX, y: initialY });
    setIsCentering(false);
  }, []);

  // Run decomposition lookup
  const loadDecomposition = useCallback(async (char: string) => {
    if (!char || char.trim().length !== 1) return;
    setIsLoading(true);
    setIsCentering(true);
    setError("");
    setSelectedNode(null);
    try {
      const data = await invoke<DecompositionNode>("lookup_decomposition", { character: char });
      setTreeData(data);
      setSelectedNode(data); // Auto-select root
      setActiveChar(char);
    } catch (err) {
      console.error(err);
      setError(String(err));
      setTreeData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadDecomposition("想");
  }, [loadDecomposition]);

  // Fetch suggestions
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions({ vocab: [], characters: [] });
      return;
    }
    try {
      const res = await invoke<DecompositionSearchResponse>("search_decomposition", { query: searchQuery });
      setSuggestions(res);
    } catch (e) {
      console.error("Suggestions fetch error:", e);
    }
  }, []);

  // Debounce search input
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (query) {
      debounceRef.current = setTimeout(() => {
        fetchSuggestions(query);
      }, 300);
    } else {
      setSuggestions({ vocab: [], characters: [] });
    }
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, fetchSuggestions]);

  // Split Chinese word into single characters
  const handleWordSelect = (word: string) => {
    const parsedChars = [...word].filter((c) => {
      const cp = c.charCodeAt(0);
      return (
        (0x4e00 <= cp && cp <= 0x9fff) ||
        (0x3400 <= cp && cp <= 0x4dbf) ||
        (0x20000 <= cp && cp <= 0x2a6df) ||
        (0xf900 <= cp && cp <= 0xfaff)
      );
    });

    if (parsedChars.length === 0) {
      setError("Không tìm thấy chữ Hán nào.");
      return;
    }

    setWordChars(parsedChars);
    loadDecomposition(parsedChars[0]);
  };

  // Center tree whenever it changes
  useEffect(() => {
    if (treeData) {
      setIsCentering(true);
      const timer = setTimeout(() => {
        centerView();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [treeData, centerView]);

  // Mouse drag event handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    // Only drag when clicking the canvas background, connection lines, or non-interactive elements
    if (target.closest("input") || target.closest("a") || target.closest("button")) {
      return;
    }
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    dragOffsetStartRef.current = { x: transform.x, y: transform.y };
  };

  // Robust window-based dragging effect
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setTransform((prev) => ({
        ...prev,
        x: dragOffsetStartRef.current.x + dx,
        y: dragOffsetStartRef.current.y + dy,
      }));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  // Native wheel listener for zooming
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      // Prevent zooming if the wheel event occurred inside details panel or interactive controls
      if (target.closest("[data-no-zoom]") || target.closest("button") || target.closest("input")) {
        return;
      }
      e.preventDefault();

      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      setTransform((prev) => {
        const delta = -e.deltaY * 0.0015;
        const nextScale = Math.min(Math.max(prev.scale + delta, 0.3), 2.5);

        // Coordinates in canvas space before zoom
        const canvasX = (mouseX - prev.x) / prev.scale;
        const canvasY = (mouseY - prev.y) / prev.scale;

        const nextX = mouseX - canvasX * nextScale;
        const nextY = mouseY - canvasY * nextScale;

        return { scale: nextScale, x: nextX, y: nextY };
      });
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, []);


  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden space-y-4">
      {/* Target header bar */}
      <div className="flex items-center justify-between shrink-0 py-3 px-1 border-b border-zinc-200 dark:border-zinc-800/60">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-fuchsia-500/10 dark:bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-400 shadow-sm">
            <Network className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            Chiết tự chữ Hán
            {activeChar && (
              <span className="text-2xl font-hanzi font-semibold text-cyan-500 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 px-2 py-0.5 rounded-lg border border-cyan-200/40 dark:border-cyan-800/40 shadow-sm">
                {activeChar}
              </span>
            )}
          </h2>
        </div>
        <div className="text-xs font-semibold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-800/50 shadow-2xs">
          Cấu trúc & Tự nguyên
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
        {/* Left Panel - Search */}
        <DecompositionSearch
          query={query}
          setQuery={setQuery}
          suggestions={suggestions}
          showSuggestions={showSuggestions}
          setShowSuggestions={setShowSuggestions}
          wordChars={wordChars}
          setWordChars={setWordChars}
          activeChar={activeChar}
          loadDecomposition={loadDecomposition}
          handleWordSelect={handleWordSelect}
          selectedNode={selectedNode}
        />

        {/* Center Panel - Tree View Canvas */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          className={`${styles.canvasGrid} flex-1 overflow-hidden relative border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 cursor-grab active:cursor-grabbing select-none`}
        >
          {/* Vignette Overlay */}
          <div className="absolute inset-0 pointer-events-none z-10 bg-[radial-gradient(circle,transparent_60%,rgba(250,250,250,0.65)_100%)] dark:bg-[radial-gradient(circle,transparent_60%,rgba(9,9,11,0.8)_100%)]" />

          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-20 backdrop-blur-xs bg-white/60 dark:bg-zinc-950/60 rounded-xl pointer-events-none">
              <span className="text-base font-medium animate-pulse text-zinc-600 dark:text-zinc-300">Đang tải cấu tạo cây...</span>
            </div>
          )}

          {error ? (
            <div className="absolute top-10 left-1/2 -translate-x-1/2 max-w-md p-4 border border-rose-200 dark:border-rose-900 rounded-lg bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 flex gap-3 z-10">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <div>
                <h5 className="font-bold">Lỗi truy xuất dữ liệu</h5>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          ) : treeData ? (
            <div
              ref={wrapperRef}
              style={{
                transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                transformOrigin: "0 0",
                opacity: isCentering || isLoading ? 0 : 1,
                transition: isCentering || isLoading || isDragging ? "none" : "transform 0.15s ease-out, opacity 0.2s ease-in-out",
              }}
              className="absolute w-max origin-top-left"
            >
              <DecompositionTree
                treeData={treeData}
                selectedNode={selectedNode}
                onSelectNode={setSelectedNode}
              />
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-zinc-600 dark:text-zinc-400 pointer-events-none">
              <HelpCircle className="w-10 h-10 text-zinc-300" />
              <p className="text-base">Vui lòng tìm kiếm hoặc chọn chữ Hán để xem chi tiết chiết tự.</p>
            </div>
          )}

          {/* Canvas Help Tip */}
          {treeData && (
            <div className="absolute top-4 left-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400 pointer-events-none select-none z-20">
              Cuộn chuột để Zoom | Kéo chuột để Di chuyển
            </div>
          )}

          {/* Floating Zoom Controls */}
          {treeData && (
            <div 
              onMouseDown={(e) => e.stopPropagation()}
              data-no-zoom
              className="absolute bottom-4 left-4 flex items-center gap-2 bg-white/85 dark:bg-zinc-900/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-zinc-200/80 dark:border-zinc-800/85 shadow-[0_12px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.3)] z-30 select-none"
            >
              <button
                onClick={() => {
                  setTransform((prev) => {
                    const nextScale = Math.min(prev.scale + 0.1, 2.5);
                    const container = containerRef.current;
                    if (!container) return { ...prev, scale: nextScale };
                    const rect = container.getBoundingClientRect();
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    const canvasX = (centerX - prev.x) / prev.scale;
                    const canvasY = (centerY - prev.y) / prev.scale;
                    return {
                      scale: nextScale,
                      x: centerX - canvasX * nextScale,
                      y: centerY - canvasY * nextScale,
                    };
                  });
                }}
                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                title="Phóng to"
              >
                <Plus className="w-4 h-4" />
              </button>

              <span className="text-xs font-semibold min-w-[38px] text-center text-zinc-600 dark:text-zinc-300">
                {Math.round(transform.scale * 100)}%
              </span>

              <button
                onClick={() => {
                  setTransform((prev) => {
                    const nextScale = Math.max(prev.scale - 0.1, 0.3);
                    const container = containerRef.current;
                    if (!container) return { ...prev, scale: nextScale };
                    const rect = container.getBoundingClientRect();
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    const canvasX = (centerX - prev.x) / prev.scale;
                    const canvasY = (centerY - prev.y) / prev.scale;
                    return {
                      scale: nextScale,
                      x: centerX - canvasX * nextScale,
                      y: centerY - canvasY * nextScale,
                    };
                  });
                }}
                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                title="Thu nhỏ"
              >
                <Minus className="w-4 h-4" />
              </button>

              <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800/80 mx-1" />

              <button
                onClick={centerView}
                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                title="Đặt lại góc nhìn"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Right Sidebar - Node Details Drawer (Floating overlay) */}
          <div onMouseDown={(e) => e.stopPropagation()} className="contents">
            <DecompositionDetails
              selectedNode={selectedNode}
              activeChar={activeChar}
              setQuery={setQuery}
              setWordChars={setWordChars}
              loadDecomposition={loadDecomposition}
              onClose={() => setSelectedNode(null)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
