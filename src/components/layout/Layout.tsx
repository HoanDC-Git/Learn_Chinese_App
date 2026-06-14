import { Sidebar } from "./Sidebar";
import { TitleBar } from "./TitleBar";
import { DictionaryPopover } from "../../features/dictionary/components/DictionaryPopover";
import { useUiStore } from "../../stores";
import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { hoverEnabled, hoverWords, hoverPosition } = useUiStore();

  return (
    <div className="flex flex-col h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden p-6 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
          {children}
        </main>
      </div>
      {hoverEnabled && hoverWords && hoverWords.length > 0 && hoverPosition && (
        <DictionaryPopover
          results={hoverWords}
          position={hoverPosition}
        />
      )}
    </div>
  );
}
