import { invoke } from "@tauri-apps/api/core";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import type { Flashcard, CreateFlashcard, UpdateFlashcard, ReviewResult } from "../types";

export interface FlashcardSearchRequest {
  query: string;
  page: number;
  page_size: number;
  sort_field: string;
  sort_order: string;
  filter_level: number | null;
}

export interface FlashcardSearchResult {
  cards: Flashcard[];
  total: number;
  page: number;
  page_size: number;
}

export function useFlashcards() {
  const queryClient = useQueryClient();

  const { data: dueCards, isLoading: isLoadingDue } = useQuery({
    queryKey: ["flashcards", "due"],
    queryFn: () => invoke<Flashcard[]>("get_due_flashcards"),
    staleTime: 1000 * 60,
  });

  const { data: allCards, isLoading: isLoadingAll } = useQuery({
    queryKey: ["flashcards", "all"],
    queryFn: () => invoke<Flashcard[]>("get_all_flashcards"),
    staleTime: 0,
  });

  const fetchRandomCards = async (limit: number) => {
    return invoke<Flashcard[]>("get_random_flashcards", { limit });
  };

  const searchFlashcards = useCallback(async (req: FlashcardSearchRequest) => {
    return invoke<FlashcardSearchResult>("search_flashcards", { req });
  }, []);

  const createMutation = useMutation({
    mutationFn: (data: CreateFlashcard) =>
      invoke<Flashcard>("create_flashcard", { data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flashcards"] });
      queryClient.invalidateQueries({ queryKey: ["srs"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateFlashcard) =>
      invoke<Flashcard>("update_flashcard", { data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flashcards"] });
      queryClient.invalidateQueries({ queryKey: ["srs"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => invoke<void>("delete_flashcard", { id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flashcards"] });
      queryClient.invalidateQueries({ queryKey: ["srs"] });
    },
  });

  const reviewMutation = useMutation({
    mutationFn: ({ cardId, remembered }: { cardId: number; remembered: boolean }) =>
      invoke<ReviewResult>("record_review_result", { cardId, remembered }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flashcards"] });
      queryClient.invalidateQueries({ queryKey: ["srs"] });
    },
  });

  return {
    dueCards: dueCards || [],
    allCards: allCards || [],
    isLoadingDue,
    isLoadingAll,
    fetchRandomCards,
    searchFlashcards,
    createFlashcard: createMutation.mutateAsync,
    updateFlashcard: updateMutation.mutateAsync,
    deleteFlashcard: deleteMutation.mutateAsync,
    recordReview: reviewMutation.mutateAsync,
  };
}
