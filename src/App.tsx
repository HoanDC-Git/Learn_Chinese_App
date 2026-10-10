import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Layout } from "./components/layout/Layout";
import { useAppStore } from "./stores";
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

  return (
    <Layout>
      {/* Review stays mounted (hidden) so an in-progress SRS session is never lost on tab switch */}
      <div className={activeTab === "review" ? "flex-1 flex flex-col min-h-0 overflow-hidden" : "hidden"}>
        <ReviewPage />
      </div>
      {activeTab === "dashboard" && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <DashboardPage />
        </div>
      )}
      {activeTab === "dictionary" && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <DictionaryPage />
        </div>
      )}
      {activeTab === "decomposition" && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <DecompositionPage />
        </div>
      )}
      {activeTab === "grammar" && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <GrammarPage />
        </div>
      )}
      {activeTab === "manage" && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <ManagePage />
        </div>
      )}
      {activeTab === "trash" && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
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
