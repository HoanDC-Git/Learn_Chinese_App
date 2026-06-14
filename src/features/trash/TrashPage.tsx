import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useQueryClient } from "@tanstack/react-query";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { getMasteryLabel } from "../../lib/utils";
import { RotateCcw, Trash2, AlertTriangle } from "lucide-react";
import { useAppStore } from "../../stores";
import type { TrashItem } from "../../types";

const badgeClasses: Record<number, string> = {
  0: "bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-400 border border-sky-300 dark:border-sky-900/50",
  1: "bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-400 border border-cyan-300 dark:border-cyan-900/50",
  2: "bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-400 border border-teal-300 dark:border-teal-900/50",
  3: "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-900/50",
  4: "bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-400 border border-orange-300 dark:border-orange-900/50",
  5: "bg-lime-100 dark:bg-lime-950/60 text-lime-800 dark:text-lime-400 border border-lime-300 dark:border-lime-900/50",
  6: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-900/50",
  7: "bg-violet-100 dark:bg-violet-950/60 text-violet-800 dark:text-violet-400 border border-violet-200/10 dark:border-violet-900/50",
  8: "bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-400 border border-purple-200/10 dark:border-purple-900/50",
};

export function TrashPage() {
  const { activeTab } = useAppStore();
  const queryClient = useQueryClient();
  const [items, setItems] = useState<TrashItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTrash = async () => {
    try {
      const result = await invoke<TrashItem[]>("get_trash_items");
      setItems(result);
    } catch (e) {
      console.error("Failed to load trash:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "trash") {
      loadTrash();
    }
  }, [activeTab]);

  const handleRestore = async (trashId: number) => {
    try {
      await invoke("restore_from_trash", { trashId });
      setItems((prev) => prev.filter((item) => item.id !== trashId));
      queryClient.invalidateQueries({ queryKey: ["flashcards"] });
      queryClient.invalidateQueries({ queryKey: ["srs"] });
    } catch (e) {
      console.error("Failed to restore:", e);
    }
  };

  const handlePermanentDelete = async (trashId: number) => {
    try {
      await invoke("permanent_delete", { trashId });
      setItems((prev) => prev.filter((item) => item.id !== trashId));
      queryClient.invalidateQueries({ queryKey: ["flashcards"] });
      queryClient.invalidateQueries({ queryKey: ["srs"] });
    } catch (e) {
      console.error("Failed to delete:", e);
    }
  };

  const daysUntilDelete = (autoDeleteAt: string | null) => {
    if (!autoDeleteAt) return "—";
    const deleteDate = new Date(autoDeleteAt);
    const now = new Date();
    const diff = Math.ceil((deleteDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? `${diff} ngày` : "Sắp xóa";
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden space-y-4">
      <div className="flex items-center justify-between shrink-0 h-14">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Thùng rác</h2>
        <Badge className="bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50">
          Tự động xóa sau 10 ngày
        </Badge>
      </div>

      <Card className="flex-1 flex flex-col min-h-0 py-4 px-6 overflow-hidden">
        {isLoading ? (
          <p className="text-center py-8 text-zinc-500 dark:text-zinc-400 shrink-0">Đang tải...</p>
        ) : items.length === 0 ? (
          <p className="text-center py-8 text-zinc-500 dark:text-zinc-400 shrink-0">Thùng rác trống</p>
        ) : (
          <div className="flex-1 overflow-y-auto scroll-smooth-gpu scrollbar-thin min-h-0 pr-1">
            <table className="w-full text-sm border-collapse">
              <thead className="sticky top-0 bg-white dark:bg-zinc-900 z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.05)]">
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                  <th className="text-left py-3 px-3 font-semibold text-zinc-600 dark:text-zinc-300">Chữ Hán</th>
                  <th className="text-left py-3 px-3 font-semibold text-zinc-600 dark:text-zinc-300">Pinyin</th>
                  <th className="text-left py-3 px-3 font-semibold text-zinc-600 dark:text-zinc-300">Nghĩa</th>
                  <th className="text-center py-3 px-3 font-semibold text-zinc-600 dark:text-zinc-300 w-32">Cấp độ</th>
                  <th className="text-left py-3 px-3 font-semibold text-zinc-600 dark:text-zinc-300">Ngày xóa</th>
                  <th className="text-left py-3 px-3 font-semibold text-zinc-600 dark:text-zinc-300">Còn lại</th>
                  <th className="text-center py-3 px-3 font-semibold text-zinc-600 dark:text-zinc-300 w-32">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/40">
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b transition-colors border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                  >
                    <td className="py-2.5 px-3 font-hanzi text-lg text-zinc-900 dark:text-zinc-100">{item.hanzi}</td>
                    <td className="py-2.5 px-3 text-indigo-600 dark:text-sky-400 font-semibold">{item.pinyin || <span className="text-zinc-400 dark:text-zinc-600">—</span>}</td>
                    <td className="py-2.5 px-3 max-w-xs truncate text-zinc-700 dark:text-zinc-300">
                      {item.meaning || <span className="text-zinc-400 dark:text-zinc-600">—</span>}
                    </td>
                    <td className="py-2.5 px-3 flex justify-center">
                      <Badge className={`w-24 justify-center whitespace-nowrap ${badgeClasses[item.level] || badgeClasses[0]}`}>
                        {getMasteryLabel(item.level)}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-zinc-600 dark:text-zinc-400">
                      {item.deleted_at ? new Date(item.deleted_at).toLocaleDateString("vi-VN") : "—"}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-xs flex items-center gap-1 text-amber-500 font-semibold select-none">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {daysUntilDelete(item.auto_delete_at)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleRestore(item.id)}
                          className="p-1.5 rounded-lg transition-colors hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                          title="Khôi phục"
                        >
                          <RotateCcw className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(item.id)}
                          className="p-1.5 rounded-lg transition-colors hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Xóa vĩnh viễn"
                        >
                          <Trash2 className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
