import { useState } from "react";
import { useFlashcards } from "../../hooks";
import { useFlashcardStore } from "../../stores";
import { FlashcardList } from "./components/FlashcardList";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Play, Zap } from "lucide-react";


export function ReviewPage() {
  const { dueCards, allCards, isLoadingDue, fetchRandomCards } = useFlashcards();
  const {
    startSession,
    sessionActive,
    sessionCards,
    rememberedCount,
    forgottenCount,
    initialTotal,
    cramMode,
  } = useFlashcardStore();
  const [loading, setLoading] = useState(false);

  const handleStartReview = () => {
    startSession(dueCards);
  };

  const handleCramMode = async () => {
    if (allCards.length === 0) return;
    setLoading(true);
    const randomCards = await fetchRandomCards(allCards.length);
    startSession(randomCards, true);
    setLoading(false);
  };

  // Active Session rendering
  if (sessionActive) {
    const total = initialTotal;
    const progress = total > 0 ? ((rememberedCount + forgottenCount) / total) * 100 : 0;

    return (
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden space-y-4">
        {/* Session Header */}
        <div className="flex items-center justify-between shrink-0 border-b border-zinc-100 dark:border-zinc-800/80 py-3">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 font-sans">
              Phiên ôn tập
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {cramMode ? "Chế độ ôn cấp tốc" : "Chế độ lặp lại ngắt quãng"}
            </p>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
              Tiến trình: <span className="font-semibold text-zinc-800 dark:text-zinc-200">{rememberedCount + forgottenCount} / {total}</span>
            </span>
            <div className="flex gap-3">
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 font-semibold border border-emerald-100/80 dark:border-emerald-900/30">
                {rememberedCount} Nhớ
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 font-semibold border border-rose-100/80 dark:border-rose-900/30">
                {forgottenCount} Quên
              </span>
            </div>
          </div>
        </div>

        {/* 1px elegant progress line */}
        <div className="w-full bg-zinc-100 dark:bg-zinc-800/80 h-1 shrink-0 overflow-hidden rounded-full">
          <div
            className="bg-indigo-600 dark:bg-indigo-400 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Flashcard container */}
        <div className="flex-1 flex items-center justify-center min-h-0 py-4 pr-1 overflow-y-auto">
          <FlashcardList cards={sessionCards} />
        </div>
      </div>
    );
  }

  // Inactive Launcher screen rendering
  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden space-y-6">
      <div className="flex items-center justify-between shrink-0 border-b border-zinc-100 dark:border-zinc-800/80 py-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-sans">
            Ôn tập thẻ từ vựng
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Luyện tập từ vựng bằng thuật toán lặp lại ngắt quãng (SRS)
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center min-h-0 overflow-y-auto pr-1">
        {/* Centered Session Launcher */}
        <Card className="w-full max-w-2xl flex flex-col items-center justify-center p-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-2xl hover:border-indigo-200/80 dark:hover:border-indigo-900/40 hover:shadow-[0_12px_40px_rgba(99,102,241,0.03)] dark:hover:shadow-[0_12px_40px_rgba(99,102,241,0.02)] transition-all duration-300 group">
          <div className="text-center max-w-md">
            <div className="text-8xl font-hanzi mb-6 text-indigo-600 dark:text-indigo-400 select-none transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
              学
            </div>
            
            <h3 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              Bắt đầu phiên ôn tập
            </h3>
            
            <p className="text-base text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
              {isLoadingDue 
                ? "Đang tải dữ liệu từ bộ nhớ..." 
                : dueCards.length > 0 
                  ? `Hôm nay bạn có ${dueCards.length} từ vựng cần ôn tập. Hãy dành vài phút ôn lại để duy trì trí nhớ.`
                  : "Tuyệt vời! Bạn đã hoàn thành tất cả các thẻ cần ôn hôm nay. Hãy học thêm thẻ mới hoặc ôn tập cấp tốc."
              }
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={handleStartReview}
                disabled={dueCards.length === 0}
                className="flex items-center justify-center gap-2.5 px-6 py-3 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 hover:scale-[1.02] active:scale-[0.98] hover:shadow-md transition-all duration-200"
              >
                <Play className="w-5 h-5 fill-current" />
                Ôn tập thông minh
              </Button>
              
              <Button
                variant="secondary"
                size="lg"
                onClick={handleCramMode}
                disabled={allCards.length === 0 || loading}
                className="flex items-center justify-center gap-2.5 px-6 py-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-850 hover:scale-[1.02] active:scale-[0.98] hover:shadow-sm transition-all duration-200"
              >
                <Zap className="w-5 h-5 text-amber-500 fill-current" />
                Ôn cấp tốc
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
