import { useState, memo } from "react";
import { Input } from "../../../components/ui/Input";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import {
  Wand2,
  Check,
  X,
  Pencil,
  Trash2,
  Loader2,
  FileAudio,
  Volume2,
  VolumeX,
} from "lucide-react";
import { getMasteryLabel, filterHanziInput, isHanzi } from "../../../lib/utils";
import { convertPinyin } from "../../../lib/pinyin";
import type { Flashcard } from "../../../types";


const badgeClasses: Record<number, string> = {
  0: "bg-zinc-50/50 dark:bg-zinc-800/20 text-zinc-500 dark:text-zinc-500 border border-dashed border-zinc-300 dark:border-zinc-700",
  1: "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30",
  2: "badge-bronze",
  3: "badge-silver",
  4: "badge-gold",
  5: "badge-diamond",
  6: "badge-mythic",
  7: "badge-fire",
  8: "badge-ultimate",
};

interface FlashcardRowProps {
  card: Flashcard;
  hasAudio: boolean;
  isGenerating: boolean;
  onPlayAudio: (cardId: number, text: string) => Promise<void>;
  onDeleteAudio: (cardId: number, text: string) => Promise<void>;
  onDelete: (cardId: number) => Promise<void>;
  onSave: (
    cardId: number,
    data: { hanzi: string; pinyin?: string; meaning?: string },
  ) => Promise<void>;
}

export const FlashcardRow = memo(function FlashcardRow({
  card,
  hasAudio,
  isGenerating,
  onPlayAudio,
  onDeleteAudio,
  onDelete,
  onSave,
}: FlashcardRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editHanzi, setEditHanzi] = useState("");
  const [editPinyin, setEditPinyin] = useState("");
  const [editMeaning, setEditMeaning] = useState("");

  const startEdit = () => {
    setEditHanzi(card.hanzi);
    setEditPinyin(card.pinyin || "");
    setEditMeaning(card.meaning || "");
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!editHanzi) return;
    await onSave(card.id, {
      hanzi: editHanzi,
      pinyin: editPinyin || undefined,
      meaning: editMeaning || undefined,
    });
    setIsEditing(false);
  };

  const handleEditAutoPinyin = () => {
    if (!editHanzi) return;
    setEditPinyin(convertPinyin(editHanzi));
  };

  const renderHanziText = (text: string) => {
    return text.split("").map((char, i) =>
      isHanzi(char) ? (
        <span
          key={i}
          className="text-2xl font-hanzi select-none"
        >
          {char}
        </span>
      ) : (
        <span key={i}>{char}</span>
      ),
    );
  };

  return (
    <tr className="border-b transition-colors border-zinc-100 dark:border-zinc-800/60 hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
      {isEditing ? (
        <>
          <td className="py-3 px-1" />
          <td className="py-3 px-4">
            <div className="flex flex-col gap-1.5">
              <Input
                value={editHanzi}
                onChange={(e) => setEditHanzi(filterHanziInput(e.target.value))}
                className="font-hanzi text-base w-full text-zinc-900 dark:text-zinc-100"
                placeholder="Chữ Hán"
              />
              <div className="flex gap-1">
                <Input
                  value={editPinyin}
                  onChange={(e) => setEditPinyin(e.target.value)}
                  className="text-sm w-full text-indigo-600 dark:text-sky-400 font-semibold"
                  placeholder="Pinyin"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleEditAutoPinyin}
                  title="Tự động tạo pinyin"
                  className="shrink-0"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </td>
          <td className="py-3 px-4">
            <Input
              value={editMeaning}
              onChange={(e) => setEditMeaning(e.target.value)}
              className="text-base w-full text-zinc-900 dark:text-zinc-100"
              placeholder="Nghĩa tiếng Việt"
            />
          </td>
          <td className="py-3 px-2 text-center">
            <Badge
              className={`w-24 justify-center whitespace-nowrap ${badgeClasses[card.level] || badgeClasses[0]}`}
            >
              {card.level === 8 ? (
                <span className="badge-ultimate-text">{getMasteryLabel(card.level)}</span>
              ) : (
                getMasteryLabel(card.level)
              )}
            </Badge>
          </td>
          <td className="py-3 px-2 text-center text-sm text-zinc-400 dark:text-zinc-500">
            {card.date_added
              ? new Date(card.date_added).toLocaleDateString("vi-VN")
              : "—"}
          </td>
          <td className="py-3 px-2">
            <div className="flex items-center justify-center gap-1.5">
              <button
                onClick={handleSave}
                className="p-1.5 rounded-lg transition-all duration-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:scale-110 active:scale-95 cursor-pointer"
                title="Lưu"
              >
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </button>
              <button
                onClick={cancelEdit}
                className="p-1.5 rounded-lg transition-all duration-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 dark:text-zinc-500 hover:scale-110 active:scale-95 cursor-pointer"
                title="Hủy"
              >
                <X className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
              </button>
            </div>
          </td>
        </>
      ) : (
        <>
          <td className="py-3 px-1 text-center">
            {isGenerating ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto text-indigo-600 dark:text-sky-400" />
            ) : hasAudio ? (
              <button
                onClick={() => onPlayAudio(card.id, card.hanzi)}
                className="p-1.5 rounded-lg transition-all duration-200 mx-auto flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 text-indigo-500 hover:text-indigo-600 dark:text-sky-400 dark:hover:text-sky-300 hover:scale-110 active:scale-95 cursor-pointer"
                title="Phát âm thanh"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={() => onPlayAudio(card.id, card.hanzi)}
                className="p-1.5 rounded-lg transition-all duration-200 mx-auto flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-indigo-500 dark:text-zinc-500 dark:hover:text-sky-400 hover:scale-110 active:scale-95 cursor-pointer"
                title="Tạo và phát âm thanh"
              >
                <VolumeX className="w-5 h-5" />
              </button>
            )}
          </td>
          <td className="py-3 px-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-zinc-900 dark:text-zinc-100">
                {renderHanziText(card.hanzi)}
              </span>
              <span className="text-sm text-indigo-600 dark:text-sky-400 font-semibold">
                {card.pinyin || (
                  <span className="text-zinc-400 dark:text-zinc-500">—</span>
                )}
              </span>
            </div>
          </td>
          <td className="py-3 px-4 text-base text-zinc-500 dark:text-zinc-300">
            {card.meaning || (
              <span className="text-zinc-400 dark:text-zinc-500">—</span>
            )}
          </td>
          <td className="py-3 px-2 text-center">
            <Badge
              className={`w-24 justify-center whitespace-nowrap ${badgeClasses[card.level] || badgeClasses[0]}`}
            >
              {card.level === 8 ? (
                <span className="badge-ultimate-text">{getMasteryLabel(card.level)}</span>
              ) : (
                getMasteryLabel(card.level)
              )}
            </Badge>
          </td>
          <td className="py-3 px-2 text-center text-sm text-zinc-400 dark:text-zinc-500">
            {card.date_added
              ? new Date(card.date_added).toLocaleDateString("vi-VN")
              : "—"}
          </td>
          <td className="py-3 px-2">
            <div className="flex items-center justify-center gap-1.5">
              {hasAudio && (
                <button
                  onClick={() => onDeleteAudio(card.id, card.hanzi)}
                  className="p-1.5 rounded-lg transition-all duration-200 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:scale-110 active:scale-95 cursor-pointer"
                  title="Xóa file audio"
                >
                  <FileAudio className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                </button>
              )}
              <button
                onClick={startEdit}
                className="p-1.5 rounded-lg transition-all duration-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-sky-400 hover:scale-110 active:scale-95 cursor-pointer"
                title="Sửa"
              >
                <Pencil className="w-4 h-4 text-indigo-600 dark:text-sky-400" />
              </button>
              <button
                onClick={() => onDelete(card.id)}
                className="p-1.5 rounded-lg transition-all duration-200 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:scale-110 active:scale-95 cursor-pointer"
                title="Xóa thẻ"
              >
                <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              </button>
            </div>
          </td>
        </>
      )}
    </tr>
  );
});
