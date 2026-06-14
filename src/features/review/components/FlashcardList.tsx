import { Flashcard } from "./Flashcard";
import { useFlashcardStore } from "../../../stores";
import type { Flashcard as FlashcardType } from "../../../types";
import { useTts } from "../../../hooks";
import { useFlashcards } from "../../../hooks";
import { invoke } from "@tauri-apps/api/core";
import { useQueryClient } from "@tanstack/react-query";

interface FlashcardListProps {
  cards: FlashcardType[];
}

export function FlashcardList({ cards }: FlashcardListProps) {
  const {
    currentIndex,
    revealStep,
    sessionActive,
    cramMode,
    nextStep,
    recordResult,
    advanceAfterReview,
    lastReview,
    undoResult,
  } = useFlashcardStore();

  const { recordReview } = useFlashcards();
  const { generateAudio, playAudio } = useTts();
  const queryClient = useQueryClient();

  const currentCard = cards[currentIndex];
  if (!currentCard || !sessionActive) return null;

  const handleRemember = async () => {
    recordResult(true);
    if (!cramMode) {
      await recordReview({ cardId: currentCard.id, remembered: true });
    }
    advanceAfterReview();
  };

  const handleForget = async () => {
    recordResult(false);
    if (!cramMode) {
      await recordReview({ cardId: currentCard.id, remembered: false });
    }
    advanceAfterReview();
  };

  const handleUndo = async () => {
    if (!lastReview) return;
    try {
      if (!cramMode) {
        await invoke("undo_review_result", {
          cardId: lastReview.cardId,
          oldLevel: lastReview.oldLevel,
          oldNextReview: lastReview.oldNextReview,
        });
        queryClient.invalidateQueries({ queryKey: ["flashcards"] });
        queryClient.invalidateQueries({ queryKey: ["srs", "statistics"] });
      }
      undoResult();
    } catch (e) {
      console.error("Failed to undo review:", e);
    }
  };

  const handlePlayAudio = async () => {
    const result = await generateAudio(currentCard.hanzi);
    if (result.success) {
      await playAudio(result.audio_path, 300);
    }
  };

  const canUndo = lastReview !== null && revealStep === "meaning";

  return (
    <Flashcard
      card={currentCard}
      revealStep={revealStep}
      onRemember={handleRemember}
      onForget={handleForget}
      onNext={nextStep}
      onPlayAudio={handlePlayAudio}
      canUndo={canUndo}
      onUndo={handleUndo}
    />
  );
}
