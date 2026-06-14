import { useState } from "react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Card } from "../../../components/ui/Card";
import { Plus, Wand2 } from "lucide-react";
import { filterHanziInput } from "../../../lib/utils";
import { convertPinyin } from "../../../lib/pinyin";

interface AddCardFormProps {
  onAdd: (card: { hanzi: string; pinyin?: string; meaning?: string }) => Promise<void>;
}

export function AddCardForm({ onAdd }: AddCardFormProps) {
  const [hanzi, setHanzi] = useState("");
  const [pinyin, setPinyin] = useState("");
  const [meaning, setMeaning] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async () => {
    if (!hanzi) return;
    setIsSubmitting(true);
    try {
      await onAdd({
        hanzi,
        pinyin: pinyin || undefined,
        meaning: meaning || undefined,
      });
      setHanzi("");
      setPinyin("");
      setMeaning("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutoPinyin = () => {
    if (!hanzi) return;
    setPinyin(convertPinyin(hanzi));
  };

  return (
    <Card className="focus-within:border-indigo-500/50 dark:focus-within:border-indigo-500/30 hover:border-zinc-300 dark:hover:border-zinc-800/80 transition-all duration-300">
      <h3 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4 select-none">
        Thêm thẻ mới
      </h3>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-3">
          <Input
            placeholder="汉字"
            value={hanzi}
            onChange={(e) => setHanzi(filterHanziInput(e.target.value))}
            className="font-hanzi text-2xl h-12 text-zinc-900 dark:text-zinc-100"
          />
        </div>
        <div className="col-span-3 flex gap-2">
          <Input
            placeholder="Pinyin"
            value={pinyin}
            onChange={(e) => setPinyin(e.target.value)}
            className="flex-1 text-base h-12 text-indigo-600 dark:text-sky-400 font-semibold"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={handleAutoPinyin}
            title="Tự động tạo pinyin"
            type="button"
            className="shrink-0 hover:scale-105 active:scale-95 transition-transform duration-200 group"
          >
            <Wand2 className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
          </Button>
        </div>
        <div className="col-span-5">
          <Input
            placeholder="Nghĩa (tiếng Việt)"
            value={meaning}
            onChange={(e) => setMeaning(e.target.value)}
            className="text-base h-12 text-zinc-900 dark:text-zinc-100"
          />
        </div>
        <div className="col-span-1">
          <Button
            onClick={handleAdd}
            disabled={!hanzi || isSubmitting}
            className="w-full h-12 hover:scale-[1.02] active:scale-[0.98] hover:shadow-md transition-all duration-200 group flex items-center justify-center"
          >
            <Plus className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
