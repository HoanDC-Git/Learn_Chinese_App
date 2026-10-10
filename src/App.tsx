import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Layout } from "./components/layout/Layout";
import { useAppStore } from "./stores";
import type { TabId } from "./types";
import { ReviewPage } from "./features/review/ReviewPage";
import { ManagePage } from "./features/manage/ManagePage";
import { DashboardPage } from "./features/dashboard/DashboardPage";
import { GrammarPage } from "./features/grammar/GrammarPage";
import { DictionaryPage } from "./features/dictionary/DictionaryPage";
import { TrashPage } from "./features/trash/TrashPage";
import { DecompositionPage } from "./features/decomposition/DecompositionPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const { activeTab } = useAppStore();
  // Mount each page lazily on first visit, then keep it mounted (hidden).
  // This preserves scroll/search state and avoids reload flashes on tab switch.
  const [visited, setVisited] = useState<TabId[]>(["review"]);
  useEffect(() => {
    setVisited((prev) => (prev.includes(activeTab) ? prev : [...prev, activeTab]));
  }, [activeTab]);

  const wrapClass = (tab: TabId) =>
    activeTab === tab
      ? "flex-1 flex flex-col min-h-0 overflow-hidden page-enter"
      : "hidden";

  return (
    <Layout>
      {/* Review stays mounted (hidden) so an in-progress SRS session is never lost on tab switch */}
      <div className={wrapClass("review")}>
        <ReviewPage />
      </div>
      {visited.includes("dashboard") && (
        <div className={wrapClass("dashboard")}>
          <DashboardPage />
        </div>
      )}
      {visited.includes("dictionary") && (
        <div className={wrapClass("dictionary")}>
          <DictionaryPage />
        </div>
      )}
      {visited.includes("decomposition") && (
        <div className={wrapClass("decomposition")}>
          <DecompositionPage />
        </div>
      )}
      {visited.includes("grammar") && (
        <div className={wrapClass("grammar")}>
          <GrammarPage />
        </div>
      )}
      {visited.includes("manage") && (
        <div className={wrapClass("manage")}>
          <ManagePage />
        </div>
      )}
      {visited.includes("trash") && (
        <div className={wrapClass("trash")}>
          <TrashPage />
        </div>
      )}
    </Layout>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
