import { useState, useRef, useEffect } from "react";
import { useFlashcards, useTts } from "../../hooks";
import { AddCardForm } from "./components/AddCardForm";
import { ManageFilters } from "./components/ManageFilters";
import { FlashcardTable } from "./components/FlashcardTable";
import { Pagination } from "../../components/ui/Pagination";
import { Card } from "../../components/ui/Card";
import { invoke } from "@tauri-apps/api/core";
import { useAppStore } from "../../stores";
import type { Flashcard } from "../../types";
import { useDebounce } from "../../hooks";

type SortField = "level" | "date_added";
type SortOrder = "asc" | "desc";

export function ManagePage() {
  const { activeTab } = useAppStore();
  const {
    allCards,
    createFlashcard,
    deleteFlashcard,
    updateFlashcard,
    searchFlashcards,
  } = useFlashcards();
  const { generateAudio, playAudio } = useTts();

  const [search, setSearch] = useState("");
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  const [audioStatus, setAudioStatus] = useState<Record<number, boolean>>({});
  const batchCancelRef = useRef(false);

  const [sortField, setSortField] = useState<SortField>("date_added");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [filterLevel, setFilterLevel] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const pageSize = 50;

  const [loadedCards, setLoadedCards] = useState<Flashcard[]>([]);
  const [totalCards, setTotalCards] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    if (activeTab !== "manage") return;
    let active = true;

    const fetchPage = async () => {
      if (page === 0) {
        setIsSearching(true);
      }
      try {
        const result = await searchFlashcards({
          query: debouncedSearch,
          page,
          page_size: pageSize,
          sort_field: sortField,
          sort_order: sortOrder,
          filter_level: filterLevel,
        });
        if (!active) return;
        setLoadedCards(result.cards);
        setTotalCards(result.total);
      } catch (e) {
        console.error("Search failed:", e);
      } finally {
        if (active) {
          setIsSearching(false);
        }
      }
    };
    fetchPage();

    return () => {
      active = false;
    };
  }, [debouncedSearch, page, sortField, sortOrder, filterLevel, searchFlashcards, refreshTrigger, activeTab]);

  useEffect(() => {
    const checkAudio = async () => {
      const status: Record<number, boolean> = {};
      for (const card of allCards) {
        try {
          const exists = await invoke<boolean>("check_audio_exists", {
            text: card.hanzi,
          });
          status[card.id] = exists;
        } catch {
          status[card.id] = false;
        }
      }
      setAudioStatus(status);
    };
    if (allCards.length > 0) {
      checkAudio();
    }
  }, [allCards]);

  const handleAdd = async (card: { hanzi: string; pinyin?: string; meaning?: string }) => {
    await createFlashcard(card);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleDelete = async (id: number) => {
    await deleteFlashcard(id);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handlePlayAudio = async (cardId: number, text: string) => {
    setPlayingId(cardId);
    try {
      const result = await generateAudio(text);
      if (result.success) {
        setAudioStatus((prev) => ({ ...prev, [cardId]: true }));
        await playAudio(result.audio_path);
      }
    } finally {
      setPlayingId(null);
    }
  };

  const handleBatchAudio = async () => {
    if (allCards.length === 0) return;

    const pendingCards = allCards.filter(c => !audioStatus[c.id]);
    if (pendingCards.length === 0) {
      // All cards already have audio
      return;
    }

    batchCancelRef.current = false;
    setBatchRunning(true);
    setBatchProgress({ current: 0, total: pendingCards.length });

    for (let i = 0; i < pendingCards.length; i++) {
      if (batchCancelRef.current) break;

      const card = pendingCards[i];
      try {
        const result = await generateAudio(card.hanzi);
        if (result.success) {
          setAudioStatus((prev) => ({ ...prev, [card.id]: true }));
        }
      } catch {
        // ignore errors
      }

      // Chờ 500ms để tránh bị edge-tts chặn IP
      await new Promise((res) => setTimeout(res, 500));
      setBatchProgress({ current: i + 1, total: pendingCards.length });
    }

    setBatchRunning(false);
  };

  const handleCancelBatch = () => {
    batchCancelRef.current = true;
  };

  const handleClearCache = async () => {
    try {
      const removed = await invoke<number>("clear_audio_cache");
      setAudioStatus({});
      console.log(`Đã xóa ${removed} file audio thừa`);
    } catch (e) {
      console.error("Lỗi xóa cache:", e);
    }
  };

  const handleDeleteAudio = async (cardId: number, text: string) => {
    try {
      await invoke("delete_single_audio", { text });
      setAudioStatus((prev) => ({ ...prev, [cardId]: false }));
    } catch (e) {
      console.error("Lỗi xóa audio:", e);
    }
  };

  const handleSaveEdit = async (
    id: number,
    data: { hanzi: string; pinyin?: string; meaning?: string }
  ) => {
    await updateFlashcard({
      id,
      ...data,
    });
    setRefreshTrigger((prev) => prev + 1);
  };

  const levelCounts = allCards.reduce<Record<number, number>>((acc, c) => {
    acc[c.level] = (acc[c.level] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden space-y-4">
      <div className="flex items-center justify-between shrink-0 h-14">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Quản lý thẻ từ vựng
        </h2>
      </div>

      <div className="shrink-0">
        <AddCardForm onAdd={handleAdd} />
      </div>

      <Card className="flex-1 flex flex-col min-h-0 p-4 overflow-hidden">
        <ManageFilters
          search={search}
          onSearchChange={(val) => {
            setSearch(val);
            setPage(0);
          }}
          filterLevel={filterLevel}
          onFilterLevelChange={(level) => {
            setFilterLevel(level);
            setPage(0);
          }}
          levelCounts={levelCounts}
          batchRunning={batchRunning}
          batchProgress={batchProgress}
          onBatchAudio={handleBatchAudio}
          onCancelBatch={handleCancelBatch}
          onClearCache={handleClearCache}
        />

        <FlashcardTable
          cards={loadedCards}
          audioStatus={audioStatus}
          playingId={playingId}
          isSearching={isSearching}
          sortField={sortField}
          sortOrder={sortOrder}
          onToggleSort={(field) => {
            if (sortField === field) {
              setSortOrder(sortOrder === "asc" ? "desc" : "asc");
            } else {
              setSortField(field);
              setSortOrder("asc");
            }
            setPage(0);
          }}
          onPlayAudio={handlePlayAudio}
          onDeleteAudio={handleDeleteAudio}
          onDelete={handleDelete}
          onSave={handleSaveEdit}
        />
        <Pagination
          currentPage={page}
          totalPages={Math.ceil(totalCards / pageSize)}
          onPageChange={setPage}
          disabled={isSearching}
        />
      </Card>
    </div>
  );
}
