import { invoke } from "@tauri-apps/api/core";
import { useQuery } from "@tanstack/react-query";
import type { SrsStatistics } from "../types";

interface DailyPlan {
  date: string;
  day_label: string;
  count: number;
}

export function useSrs() {
  const { data: statistics, isLoading } = useQuery({
    queryKey: ["srs", "statistics"],
    queryFn: () => invoke<SrsStatistics>("get_statistics"),
    staleTime: 1000 * 60,
    refetchOnWindowFocus: true,
  });

  const { data: reviewPlan } = useQuery({
    queryKey: ["srs", "reviewPlan"],
    queryFn: () => invoke<DailyPlan[]>("get_review_plan"),
    staleTime: 1000 * 60 * 5,
  });

  return {
    statistics: statistics || {
      total_cards: 0,
      new_cards: 0,
      learning_cards: 0,
      familiar_cards: 0,
      proficient_cards: 0,
      mastered_cards: 0,
      due_today: 0,
      accuracy_rate: 0,
      total_cards_trend: 0,
      mastered_cards_trend: 0,
      accuracy_rate_trend: 0,
    },
    reviewPlan: reviewPlan || [],
    isLoading,
  };
}
