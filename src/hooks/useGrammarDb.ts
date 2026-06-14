import { invoke } from "@tauri-apps/api/core";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import type { GrammarCategory, GrammarPoint, GrammarPointDetails } from "../types";

export function useGrammarCategories(level?: number) {
  return useQuery({
    queryKey: ["grammar", "categories", level],
    queryFn: () =>
      invoke<GrammarCategory[]>("get_grammar_categories", {
        level: level ?? null,
      }),
    staleTime: 1000 * 60 * 10, // 10 minutes
    placeholderData: keepPreviousData,
  });
}

export function useGrammarPoints(
  level?: number,
  categoryId?: number | null,
  searchQuery?: string
) {
  return useQuery({
    queryKey: ["grammar", "points", level, categoryId, searchQuery],
    queryFn: () =>
      invoke<GrammarPoint[]>("get_grammar_points", {
        level: level ?? null,
        categoryId: categoryId ?? null,
        searchQuery: searchQuery || null,
      }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    placeholderData: keepPreviousData,
  });
}

export function useGrammarPointDetails(id: number | null) {
  return useQuery({
    queryKey: ["grammar", "details", id],
    queryFn: () =>
      invoke<GrammarPointDetails>("get_grammar_point_details", { id }),
    enabled: id !== null && id !== undefined && id > 0,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useLearnedGrammarPoints() {
  return useQuery({
    queryKey: ["grammar", "learned"],
    queryFn: () => invoke<number[]>("get_learned_grammar_points"),
    staleTime: 1000 * 60 * 60, // Keep in cache
  });
}

export function useToggleGrammarPointLearned() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => invoke<boolean>("toggle_grammar_point_learned", { id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grammar", "learned"] });
    },
  });
}
