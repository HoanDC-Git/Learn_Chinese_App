import { cn } from "../../lib/utils";
import { useAppStore, useUiStore } from "../../stores";
import { BookOpen, Layers, BarChart3, Notebook, Book, Eye, EyeOff, Trash2, Sun, Moon, GitMerge } from "lucide-react";
import type { TabId } from "../../types";

const tabs: { id: TabId; label: string; icon: typeof BookOpen }[] = [
  { id: "review", label: "Ôn tập", icon: BookOpen },
  { id: "manage", label: "Quản lý", icon: Layers },
  { id: "dashboard", label: "Thống kê", icon: BarChart3 },
  { id: "grammar", label: "Ngữ pháp", icon: Notebook },
  { id: "dictionary", label: "Từ điển", icon: Book },
  { id: "decomposition", label: "Chiết tự", icon: GitMerge },
  { id: "trash", label: "Thùng rác", icon: Trash2 },
];

function RailButton({
  label,
  isActive,
  onClick,
  children,
}: {
  label: string;
  isActive?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        "group relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer",
        // hover:z-50 keeps the tooltip above page layers: the hover translate
        // creates a stacking context that would otherwise trap the tooltip
        // below page panels (canvas z-10/20/30).
        "hover:-translate-y-0.5 hover:z-50 focus-visible:z-50 active:scale-95",
        isActive
          ? "bg-zinc-800 text-white shadow-[0_4px_16px_rgba(0,0,0,0.25)]"
          : "text-zinc-500 hover:bg-zinc-800/60 hover:text-zinc-200"
      )}
    >
      {isActive && (
        <span className="absolute -left-[13px] top-1/2 -translate-y-1/2 w-1 h-6 rounded-full bg-cyan-400" />
      )}
      {children}
      <span className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 whitespace-nowrap text-sm font-medium px-2.5 py-1.5 rounded-lg bg-zinc-800 text-zinc-100 border border-zinc-700/60 shadow-lg opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 z-50">
        {label}
      </span>
    </button>
  );
}

export function Sidebar() {
  const { activeTab, setActiveTab } = useAppStore();
  const { hoverEnabled, toggleHover, theme, setTheme } = useUiStore();

  return (
    <aside className="w-[76px] flex flex-col items-center border-r bg-zinc-900 border-zinc-800 py-4 gap-1 shrink-0">
      <div
        className="w-11 h-11 rounded-xl bg-accent text-white flex items-center justify-center text-xl font-bold select-none shrink-0 font-hanzi"
        title="Learn Chinese — 学中文"
      >
        中
      </div>

      <nav className="flex-1 flex flex-col items-center gap-1 mt-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <RailButton
              key={tab.id}
              label={tab.label}
              isActive={isActive}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className={cn("w-5 h-5 transition-colors", isActive ? "text-accent-light" : "")} />
            </RailButton>
          );
        })}
      </nav>

      <div className="flex flex-col items-center gap-1 pt-3 border-t border-zinc-800 w-full">
        <RailButton
          label={theme === "dark" ? "Chế độ tối" : "Chế độ sáng"}
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-zinc-500" />
          )}
        </RailButton>

        <RailButton
          label="Tra từ khi di chuột"
          isActive={hoverEnabled}
          onClick={toggleHover}
        >
          <span className="relative">
            {hoverEnabled ? (
              <Eye className="w-5 h-5 text-emerald-400" />
            ) : (
              <EyeOff className="w-5 h-5 text-zinc-500" />
            )}
            <span
              className={cn(
                "absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-zinc-900",
                hoverEnabled ? "bg-emerald-400" : "bg-zinc-600"
              )}
            />
          </span>
        </RailButton>
      </div>
    </aside>
  );
}
