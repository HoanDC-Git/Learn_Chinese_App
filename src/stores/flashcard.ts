import { create } from "zustand";
import type { Flashcard, FlashcardRevealStep } from "../types";

interface FlashcardStore {
  sessionCards: Flashcard[];
  initialTotal: number;
  currentIndex: number;
  revealStep: FlashcardRevealStep;
  sessionActive: boolean;
  cramMode: boolean;
  rememberedCount: number;
  forgottenCount: number;
  completedIds: Set<number>;
  lastReview: {
    cardId: number;
    oldLevel: number;
    oldNextReview: string | null;
    remembered: boolean;
  } | null;

  startSession: (cards: Flashcard[], cramMode?: boolean) => void;
  endSession: () => void;
  nextStep: () => void;
  recordResult: (remembered: boolean) => void;
  advanceAfterReview: () => void;
  undoResult: () => void;
}

export const useFlashcardStore = create<FlashcardStore>((set) => ({
  sessionCards: [],
  initialTotal: 0,
  currentIndex: 0,
  revealStep: "meaning",
  sessionActive: false,
  cramMode: false,
  rememberedCount: 0,
  forgottenCount: 0,
  completedIds: new Set(),
  lastReview: null,

  startSession: (cards, cramMode = false) =>
    set({
      sessionCards: cards,
      initialTotal: cards.length,
      currentIndex: 0,
      revealStep: "meaning",
      sessionActive: true,
      cramMode,
      rememberedCount: 0,
      forgottenCount: 0,
      completedIds: new Set(),
      lastReview: null,
    }),

  endSession: () =>
    set({
      sessionCards: [],
      initialTotal: 0,
      currentIndex: 0,
      revealStep: "meaning",
      sessionActive: false,
      cramMode: false,
      rememberedCount: 0,
      forgottenCount: 0,
      completedIds: new Set(),
      lastReview: null,
    }),

  nextStep: () =>
    set((state) => ({
      revealStep:
        state.revealStep === "meaning"
          ? "pinyin"
          : state.revealStep === "pinyin"
            ? "hanzi"
            : "hanzi",
      lastReview: null,
    })),

  recordResult: (remembered) =>
    set((state) => {
      const card = state.sessionCards[state.currentIndex];
      const newCompleted = new Set(state.completedIds);
      newCompleted.add(card.id);
      return {
        rememberedCount: remembered ? state.rememberedCount + 1 : state.rememberedCount,
        forgottenCount: remembered ? state.forgottenCount : state.forgottenCount + 1,
        completedIds: newCompleted,
        lastReview: {
          cardId: card.id,
          oldLevel: card.level,
          oldNextReview: card.next_review || null,
          remembered,
        },
      };
    }),

  advanceAfterReview: () =>
    set((state) => {
      const nextIdx = state.currentIndex + 1;
      if (nextIdx >= state.sessionCards.length) {
        return {
          sessionActive: false,
          sessionCards: [],
          currentIndex: 0,
          lastReview: null,
        };
      }
      return {
        currentIndex: nextIdx,
        revealStep: "meaning",
      };
    }),

  undoResult: () =>
    set((state) => {
      if (!state.lastReview) return {};
      const { cardId, oldLevel, oldNextReview, remembered } = state.lastReview;
      
      const newCompleted = new Set(state.completedIds);
      newCompleted.delete(cardId);

      const prevIdx = state.currentIndex - 1;
      
      const updatedSessionCards = [...state.sessionCards];
      if (updatedSessionCards[prevIdx]) {
        updatedSessionCards[prevIdx] = {
          ...updatedSessionCards[prevIdx],
          level: oldLevel,
          next_review: oldNextReview,
        };
      }

      return {
        currentIndex: prevIdx,
        revealStep: "hanzi",
        rememberedCount: remembered ? Math.max(0, state.rememberedCount - 1) : state.rememberedCount,
        forgottenCount: remembered ? state.forgottenCount : Math.max(0, state.forgottenCount - 1),
        completedIds: newCompleted,
        sessionCards: updatedSessionCards,
        lastReview: null,
      };
    }),
}));
