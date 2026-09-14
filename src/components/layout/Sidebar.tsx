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

export function Sidebar() {
  const { activeTab, setActiveTab } = useAppStore();
  const { hoverEnabled, toggleHover, theme, setTheme } = useUiStore();

  return (
    <aside className="w-64 flex flex-col border-r bg-zinc-900 border-zinc-800">
      <div className="p-6 border-b flex items-center gap-3 border-zinc-800">
        <div className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center text-lg font-bold select-none flex-shrink-0">
          中
        </div>
        <div>
          <h1 className="text-base font-bold text-white flex items-center gap-1 leading-tight select-none">
            Learn Chinese
            <span className="text-accent-light text-xs">✦</span>
          </h1>
          <p className="text-xs text-zinc-400 leading-tight mt-0.5 select-none">学中文</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 text-left",
                isActive
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
              )}
            >
              <Icon className={cn("w-5 h-5 transition-colors", isActive ? "text-accent-light" : "text-zinc-500 group-hover:text-zinc-400")} />
              {tab.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t space-y-3 border-zinc-800">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 bg-zinc-800 text-zinc-400 hover:bg-zinc-700/60 hover:text-zinc-200"
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-zinc-500" />
          )}
          <span>{theme === "dark" ? "Tối" : "Sáng"}</span>
        </button>

        <button
          onClick={toggleHover}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
            hoverEnabled
              ? "bg-zinc-800 text-white"
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700/60 hover:text-zinc-200"
          )}
        >
          {hoverEnabled ? (
            <Eye className="w-5 h-5 text-emerald-400" />
          ) : (
            <EyeOff className="w-5 h-5 text-zinc-500" />
          )}
          <span>Tra từ khi di chuột</span>
          <span
            className={cn(
              "ml-auto text-xs px-2 py-0.5 rounded-md font-medium",
              hoverEnabled
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-zinc-700 text-zinc-500"
            )}
          >
            {hoverEnabled ? "ON" : "OFF"}
          </span>
        </button>

        <div className="text-xs text-center text-zinc-600">v1.0.0</div>
      </div>
    </aside>
  );
}
