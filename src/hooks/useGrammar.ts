import { invoke } from "@tauri-apps/api/core";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { GrammarNote, CreateGrammarNote, UpdateGrammarNote } from "../types";

export function useGrammar() {
  const queryClient = useQueryClient();

  const { data: notes, isLoading } = useQuery({
    queryKey: ["grammar", "notes"],
    queryFn: () => invoke<GrammarNote[]>("get_all_grammar_notes"),
    staleTime: 1000 * 60,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateGrammarNote) =>
      invoke<GrammarNote>("create_grammar_note", { data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grammar", "notes"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateGrammarNote) =>
      invoke<GrammarNote>("update_grammar_note", { data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grammar", "notes"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => invoke<void>("delete_grammar_note", { id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grammar", "notes"] });
    },
  });

  return {
    notes: notes || [],
    isLoading,
    createNote: createMutation.mutateAsync,
    updateNote: updateMutation.mutateAsync,
    deleteNote: deleteMutation.mutateAsync,
  };
}
