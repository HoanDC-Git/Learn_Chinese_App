import { BookOpen, Loader2, FileText } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { GrammarDetailsHeader } from "./GrammarDetailsHeader";
import { GrammarExplanation } from "./GrammarExplanation";
import { GrammarExampleCard } from "./GrammarExampleCard";
import type { GrammarPoint, GrammarExample, GrammarNote } from "../../../types";
import { useState, useEffect } from "react";

interface GrammarDetailsProps {
  isDetailsLoading: boolean;
  selectedPoint: GrammarPoint | null;
  details: {
    point: GrammarPoint;
    examples: GrammarExample[];
  } | null;
  showPinyin: boolean;
  setShowPinyin: (show: boolean) => void;
  showEnglish: boolean;
  setShowEnglish: (show: boolean) => void;
  learnedIds: Set<number>;
  onToggleLearned: (id: number) => void;
  speakText: (text: string, rate?: number) => Promise<void>;
  
  // New props
  selectedNote: GrammarNote | null;
  onSaveNote: (note: any) => Promise<void>;
  onDeleteNote: (id: number) => Promise<void>;
  onCancelEdit?: () => void;
}

export function GrammarDetails({
  isDetailsLoading,
  selectedPoint,
  details,
  showPinyin,
  setShowPinyin,
  showEnglish,
  setShowEnglish,
  learnedIds,
  onToggleLearned,
  speakText,
  selectedNote,
  onSaveNote,
  onDeleteNote,
  onCancelEdit,
}: GrammarDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<GrammarNote>>({});

  // Sync edit mode and form data when note selection changes
  useEffect(() => {
    if (selectedNote && selectedNote.id === 0) {
      setIsEditing(true);
      setFormData({
        id: 0,
        note_type: "grammar",
        title: selectedNote.title || (selectedPoint ? `Ghi chú: ${selectedPoint.title_vi}` : ""),
        level: selectedNote.level || selectedPoint?.level || 1,
        formula: selectedNote.formula || "",
        explanation: selectedNote.explanation || "",
        examples: selectedNote.examples || "",
        grammar_point_id: selectedNote.grammar_point_id || selectedPoint?.id || null,
      });
    } else {
      setIsEditing(false);
      setFormData({});
    }
  }, [selectedNote, selectedPoint]);

  const handleEditClick = () => {
    if (selectedNote) {
      setFormData(selectedNote);
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    if (selectedNote?.id === 0) {
      onCancelEdit?.();
    } else {
      setIsEditing(false);
    }
  };

  if (isDetailsLoading) {
    return (
      <Card className="flex-1 flex flex-col min-h-0 overflow-hidden bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl p-0">
        <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 dark:text-zinc-500 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500 dark:text-sky-500" />
          <span className="text-sm">Đang tải chi tiết điểm ngữ pháp...</span>
        </div>
      </Card>
    );
  }

  // Render Inline Form Mode
  if (isEditing) {
    return (
      <Card className="flex-1 flex flex-col min-h-0 overflow-hidden bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl p-0">
        <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-4 scrollbar-thin">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              {formData.id === 0 ? "Tạo vở ghi mới" : "Chỉnh sửa vở ghi"}
            </h3>
            {formData.grammar_point_id && (
              <span className="text-xs px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-sky-400 border border-indigo-150 dark:border-indigo-900/30">
                Liên kết HSK
              </span>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider">
                Tiêu đề
              </label>
              <Input
                value={formData.title || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Nhập tiêu đề cho vở ghi..."
                className="w-full text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider">
                Công thức
              </label>
              <Input
                value={formData.formula || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, formula: e.target.value }))}
                placeholder="Ví dụ: A + 极了 | S + V + 起来..."
                className="w-full text-sm font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider">
                Giải thích / Cách dùng
              </label>
              <textarea
                className="w-full min-h-[100px] p-2.5 text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                value={formData.explanation || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, explanation: e.target.value }))}
                placeholder="Nhập giải thích chi tiết..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider">
                Các câu ví dụ cá nhân
              </label>
              <textarea
                className="w-full min-h-[120px] p-2.5 text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-sans"
                value={formData.examples || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, examples: e.target.value }))}
                placeholder="Mỗi ví dụ viết trên một dòng (Ví dụ:&#10;他是老师。 | Anh ấy là giáo viên.&#10;旧衣物 | Quần áo cũ)..."
              />
            </div>

            {formData.grammar_point_id && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-indigo-50/40 dark:bg-zinc-950/40 border border-indigo-150/20 dark:border-zinc-800">
                <div className="text-xs text-indigo-800 dark:text-sky-400">
                  <span className="font-semibold">Được liên kết với cấu trúc HSK:</span>{" "}
                  {selectedPoint?.title_vi || "Cấu trúc hiện tại"}
                </div>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, grammar_point_id: null }))}
                  className="text-xs font-bold text-rose-500 hover:text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                >
                  Hủy liên kết
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-2 shrink-0 bg-zinc-50 dark:bg-zinc-900/60">
          <Button variant="secondary" onClick={handleCancel} className="cursor-pointer">
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={async () => {
              await onSaveNote(formData);
              setIsEditing(false);
            }}
            disabled={!formData.title?.trim()}
            className="cursor-pointer"
          >
            Lưu vở ghi
          </Button>
        </div>
      </Card>
    );
  }

  // Render Standalone Personal Note Mode (No HSK point linked)
  if (!selectedPoint && selectedNote) {
    return (
      <Card className="flex-1 flex flex-col min-h-0 overflow-hidden bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl p-0">
        <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-6 scrollbar-thin">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {selectedNote.title || "Vở ghi không tiêu đề"}
              </h3>
              <div className="flex gap-2">
                <span className="text-xs px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
                  Vở ghi tự do
                </span>
              </div>
            </div>
            <div className="flex gap-1.5">
              <Button variant="secondary" size="sm" onClick={handleEditClick} className="text-xs py-1 h-8 cursor-pointer">
                Sửa vở ghi
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => onDeleteNote(selectedNote.id)}
                className="text-xs py-1 h-8 cursor-pointer bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 dark:text-rose-400 border border-rose-500/20"
              >
                Xóa
              </Button>
            </div>
          </div>

          {selectedNote.formula && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Công thức
              </h4>
              <p className="text-sm font-mono bg-amber-50/20 dark:bg-zinc-950 border border-amber-250/20 dark:border-zinc-800/80 px-4 py-2 rounded-xl text-indigo-700 dark:text-sky-400">
                {selectedNote.formula}
              </p>
            </div>
          )}

          {selectedNote.explanation && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Giải nghĩa / Cách dùng
              </h4>
              <div className="p-4 rounded-xl bg-zinc-50/60 dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-800/40">
                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {selectedNote.explanation}
                </p>
              </div>
            </div>
          )}

          {selectedNote.examples && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Ví dụ cá nhân
              </h4>
              <div className="p-4 rounded-xl bg-white dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-800/40 space-y-2.5">
                {selectedNote.examples
                  .split("\n")
                  .filter((line) => line.trim())
                  .map((line, idx) => (
                    <p
                      key={idx}
                      className="text-sm text-zinc-700 dark:text-zinc-300 border-l-2 border-amber-300 dark:border-zinc-700 pl-3 py-0.5"
                    >
                      {line}
                    </p>
                  ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  }

  // Placeholder State (Nothing selected)
  if (!selectedPoint || !details) {
    return (
      <Card className="flex-1 flex flex-col min-h-0 overflow-hidden bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl p-0">
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-zinc-400 dark:text-zinc-500">
          <div className="w-16 h-16 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center mb-4 border border-zinc-100 dark:border-zinc-800">
            <BookOpen className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            Chi tiết Ngữ pháp
          </h3>
          <p className="text-sm max-w-sm">
            Vui lòng chọn một điểm ngữ pháp bên danh sách cây thư mục để xem công thức, giải nghĩa và các câu ví dụ trực quan.
          </p>
        </div>
      </Card>
    );
  }

  const isLearned = learnedIds.has(details.point.id);

  return (
    <Card className="flex-1 flex flex-col min-h-0 overflow-hidden bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl p-0">
      <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-6 scrollbar-thin">
        {/* Header Info */}
        <GrammarDetailsHeader
          point={details.point}
          showPinyin={showPinyin}
          setShowPinyin={setShowPinyin}
          showEnglish={showEnglish}
          setShowEnglish={setShowEnglish}
          isLearned={isLearned}
          onToggleLearned={() => onToggleLearned(details.point.id)}
        />

        {/* Explanations */}
        <GrammarExplanation point={details.point} showEnglish={showEnglish} />

        {/* Examples */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            Các câu ví dụ mẫu ({details.examples.length})
          </h3>

          <div className="space-y-3">
            {details.examples.length === 0 ? (
              <p className="text-sm text-zinc-400 dark:text-zinc-500 italic">
                Chưa có câu ví dụ nào cho điểm ngữ pháp này.
              </p>
            ) : (
              details.examples.map((ex, idx) => (
                <GrammarExampleCard
                  key={ex.id}
                  example={ex}
                  index={idx}
                  showPinyin={showPinyin}
                  showEnglish={showEnglish}
                  speakText={speakText}
                />
              ))
            )}
          </div>
        </div>

        {/* Personal Notes Section (Option 2) */}
        <div className="border-t border-zinc-100 dark:border-zinc-800 pt-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-500" />
              Vở ghi cá nhân của tôi
            </h3>
            {selectedNote ? (
              <div className="flex gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7 py-0 px-2 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  onClick={handleEditClick}
                >
                  Sửa ghi chú
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  className="text-xs h-7 py-0 px-2 cursor-pointer bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 dark:text-rose-400 border border-rose-500/20"
                  onClick={() => onDeleteNote(selectedNote.id)}
                >
                  Xóa
                </Button>
              </div>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                className="text-xs h-7 py-0 px-2.5 cursor-pointer border-dashed border-indigo-200 dark:border-zinc-800 hover:border-indigo-400 dark:hover:border-sky-500 text-indigo-600 dark:text-sky-400 hover:bg-indigo-50/50 dark:hover:bg-sky-950/20"
                onClick={() => {
                  setFormData({
                    id: 0,
                    note_type: "grammar",
                    title: `Ghi chú: ${selectedPoint.title_vi}`,
                    level: selectedPoint.level,
                    formula: "",
                    explanation: "",
                    examples: "",
                    grammar_point_id: selectedPoint.id,
                  });
                  setIsEditing(true);
                }}
              >
                Thêm ghi chú
              </Button>
            )}
          </div>

          {selectedNote ? (
            <div className="p-4 rounded-xl bg-amber-50/20 dark:bg-zinc-950 border border-amber-200/20 dark:border-zinc-800 space-y-4">
              {selectedNote.title && (
                <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">
                  {selectedNote.title}
                </h4>
              )}

              {selectedNote.formula && (
                <div className="space-y-1">
                  <span className="text-xs uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500">
                    Công thức cá nhân
                  </span>
                  <p className="text-sm font-mono bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 px-3 py-1.5 rounded-lg text-indigo-600 dark:text-sky-400">
                    {selectedNote.formula}
                  </p>
                </div>
              )}

              {selectedNote.explanation && (
                <div className="space-y-1">
                  <span className="text-xs uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500">
                    Giải thích riêng
                  </span>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {selectedNote.explanation}
                  </p>
                </div>
              )}

              {selectedNote.examples && (
                <div className="space-y-1.5">
                  <span className="text-xs uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500">
                    Ví dụ tự thêm
                  </span>
                  <div className="space-y-1.5 bg-white/50 dark:bg-zinc-900/50 p-3 border border-zinc-100 dark:border-zinc-800/40 rounded-lg">
                    {selectedNote.examples
                      .split("\n")
                      .filter((line) => line.trim())
                      .map((line, idx) => (
                        <p
                          key={idx}
                          className="text-xs text-zinc-600 dark:text-zinc-400 border-l-2 border-amber-300 dark:border-zinc-700 pl-2.5 py-0.5"
                        >
                          {line}
                        </p>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-zinc-400 dark:text-zinc-500 italic">
              Bạn chưa thêm ghi chú cá nhân nào cho cấu trúc ngữ pháp này. Hãy nhấp vào "Thêm ghi chú" để ghi lại các mẹo học, công thức hoặc các ví dụ thực tế của riêng bạn.
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
