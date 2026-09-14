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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && hanzi) {
      handleAdd();
    }
  };

  const handleAutoPinyin = () => {
    if (!hanzi) return;
    setPinyin(convertPinyin(hanzi));
  };

  return (
    <Card variant="flat" className="p-4">
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-5">
            <Input
              placeholder="汉字 - Nhập chữ Hán"
              value={hanzi}
              onChange={(e) => setHanzi(filterHanziInput(e.target.value))}
              onKeyDown={handleKeyDown}
              className="font-hanzi text-xl h-11 w-full"
            />
          </div>
          <div className="sm:col-span-3">
            <div className="flex gap-2">
              <Input
                placeholder="Pinyin"
                value={pinyin}
                onChange={(e) => setPinyin(e.target.value)}
                onKeyDown={handleKeyDown}
                className="text-sm h-11 text-accent font-semibold flex-1 min-w-0"
              />
              <Button
                variant="secondary"
                onClick={handleAutoPinyin}
                title="Tự động tạo pinyin"
                className="h-11 w-11 p-0 shrink-0"
              >
                <Wand2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="sm:col-span-4">
            <Input
              placeholder="Nghĩa tiếng Việt"
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              onKeyDown={handleKeyDown}
              className="text-sm h-11 w-full"
            />
          </div>
        </div>
        <Button
          onClick={handleAdd}
          disabled={!hanzi || isSubmitting}
          className="h-11 w-full lg:w-auto lg:px-6 shrink-0"
        >
          <Plus className="w-4 h-4 lg:mr-2" />
          <span className="hidden lg:inline">Thêm thẻ</span>
        </Button>
      </div>
    </Card>
  );
}
