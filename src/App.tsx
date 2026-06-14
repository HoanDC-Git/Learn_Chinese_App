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
      <div className={activeTab === "review" ? "flex-1 flex flex-col min-h-0 overflow-hidden" : "hidden"}>
        <ReviewPage />
      </div>
      <div className={activeTab === "dashboard" ? "flex-1 flex flex-col min-h-0 overflow-hidden" : "hidden"}>
        <DashboardPage />
      </div>
      <div className={activeTab === "dictionary" ? "flex-1 flex flex-col min-h-0 overflow-hidden" : "hidden"}>
        <DictionaryPage />
      </div>
      <div className={activeTab === "decomposition" ? "flex-1 flex flex-col min-h-0 overflow-hidden" : "hidden"}>
        <DecompositionPage />
      </div>
      <div className={activeTab === "grammar" ? "flex-1 flex flex-col min-h-0 overflow-hidden" : "hidden"}>
        <GrammarPage />
      </div>
      <div className={activeTab === "manage" ? "flex-1 flex flex-col min-h-0 overflow-hidden" : "hidden"}>
        <ManagePage />
      </div>
      <div className={activeTab === "trash" ? "flex-1 flex flex-col min-h-0 overflow-hidden" : "hidden"}>
        <TrashPage />
      </div>
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
