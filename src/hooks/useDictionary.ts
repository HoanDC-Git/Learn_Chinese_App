import { invoke } from "@tauri-apps/api/core";
import { useQuery } from "@tanstack/react-query";
import type { DictionaryEntry, HoverResult } from "../types";

export function useDictionary() {
  const { data: wordEntry, isLoading: isLookingUp } = useQuery({
    queryKey: ["dictionary", "lookup"],
    queryFn: () => invoke<DictionaryEntry | null>("lookup_word", { word: "" }),
    enabled: false,
    staleTime: 1000 * 60 * 5,
  });

  const lookupWord = async (word: string) => {
    return invoke<DictionaryEntry | null>("lookup_word", { word });
  };

  const lookupHover = async (text: string, cursorIndex: number) => {
    return invoke<HoverResult[]>("lookup_hover", { text, cursorIndex });
  };

  return {
    wordEntry,
    isLookingUp,
    lookupWord,
    lookupHover,
  };
}
