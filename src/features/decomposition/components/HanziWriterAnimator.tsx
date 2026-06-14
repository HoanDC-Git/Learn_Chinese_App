import { useEffect, useRef, useState } from "react";
import HanziWriter from "hanzi-writer";
import { Play, Pause, RotateCcw, PenTool, Eye, CheckCircle } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { cn } from "../../../lib/utils";

interface HanziWriterAnimatorProps {
  character: string;
  hex_code?: string;
}

export function HanziWriterAnimator({ character, hex_code }: HanziWriterAnimatorProps) {
  const targetRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<HanziWriter | null>(null);
  
  const [mode, setMode] = useState<"animate" | "quiz">("animate");
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasAnimation, setHasAnimation] = useState(true);
  const [hasImage, setHasImage] = useState(true);
  const [quizMessage, setQuizMessage] = useState("Dùng chuột viết theo nét mờ!");
  const [quizSuccess, setQuizSuccess] = useState(false);
  const showGrid = true;

  // Detect theme from DOM
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const initWriter = () => {
    if (!targetRef.current || !character) return;
    
    // Clear previous target content
    targetRef.current.innerHTML = "";
    writerRef.current = null;
    setQuizSuccess(false);
    setHasAnimation(true);
    setHasImage(true);

    const strokeColor = isDark ? "#38bdf8" : "#4f46e5"; // sky-400 vs indigo-600
    const outlineColor = isDark ? "#334155" : "#e2e8f0"; // zinc-700 vs zinc-200
    const drawingColor = isDark ? "#38bdf8" : "#4f46e5";

    try {
      const writer = HanziWriter.create(targetRef.current, character, {
        width: 140,
        height: 140,
        padding: 5,
        showOutline: true,
        strokeColor,
        outlineColor,
        drawingColor,
        drawingWidth: 4,
        strokeAnimationSpeed: 0.5,
        delayBetweenLoops: 2000,
        delayBetweenStrokes: 300,
        charDataLoader: async (char) => {
          try {
            const res = await fetch(`/hanzi_data/${char}.json`);
            if (res.ok) {
              return await res.json();
            }
          } catch (e) {
            console.warn(`Local fetch failed for ${char}, falling back to CDN`, e);
          }
          const res = await fetch(
            `https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/${encodeURIComponent(char)}.json`
          );
          if (!res.ok) throw new Error("Character not found");
          return res.json();
        },
        onLoadCharDataError: (reason) => {
          console.warn("No animation data for", character, reason);
          setHasAnimation(false);
        },
      });

      writerRef.current = writer;

      if (mode === "quiz") {
        startQuiz();
      } else {
        setIsPlaying(true);
        writer.loopCharacterAnimation();
      }
    } catch (e) {
      console.error("HanziWriter init error:", e);
    }
  };

  // Re-init on character, theme, or mode change
  useEffect(() => {
    initWriter();
    return () => {
      if (writerRef.current) {
        writerRef.current.cancelQuiz();
        if ((writerRef.current as any)._renderState) {
          (writerRef.current as any)._renderState.cancelAll();
        }
      }
    };
  }, [character, isDark, mode]);

  const handlePlayPause = () => {
    if (!writerRef.current) return;
    
    if (isPlaying) {
      writerRef.current.pauseAnimation();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      writerRef.current.resumeAnimation();
    }
  };

  const handleReset = () => {
    if (!writerRef.current) return;
    
    if (mode === "quiz") {
      writerRef.current.cancelQuiz();
      if ((writerRef.current as any)._renderState) {
        (writerRef.current as any)._renderState.cancelAll();
      }
      startQuiz();
    } else {
      if ((writerRef.current as any)._renderState) {
        (writerRef.current as any)._renderState.cancelAll();
      }
      setIsPlaying(true);
      writerRef.current.loopCharacterAnimation();
    }
  };

  const startQuiz = () => {
    if (!writerRef.current) return;
    
    setQuizSuccess(false);
    setQuizMessage("Viết nét đầu tiên...");
    
    writerRef.current.quiz({
      onCorrectStroke: (strokeData) => {
        setQuizMessage(`Đúng! Nét ${strokeData.strokeNum + 1}/${(strokeData as any).totalStrokes}`);
      },
      onMistake: () => {
        setQuizMessage(`Sai rồi. Cố lên! Nét tiếp theo...`);
      },
      onComplete: () => {
        setQuizSuccess(true);
        setQuizMessage("Xuất sắc! Bạn đã viết đúng.");
      },
    });
  };

  return (
    <div className="flex flex-col items-center gap-6 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 select-none">
      <div className="relative">
        <div 
          ref={targetRef} 
          className={cn(
            "relative z-10 w-[140px] h-[140px]",
            !hasAnimation && "hidden"
          )}
        />
        
        {!hasAnimation && (
          <div className="relative z-10 w-[140px] h-[140px] flex items-center justify-center">
            {hex_code && hasImage ? (
              <img 
                src={`/components/${hex_code}.svg`} 
                alt={character}
                className="w-24 h-24 dark:invert opacity-80"
                onError={() => setHasImage(false)}
              />
            ) : (
              <span className="text-8xl font-hanzi text-zinc-800 dark:text-zinc-200 opacity-90">
                {character}
              </span>
            )}
          </div>
        )}

        {showGrid && hasAnimation && (
          <svg
            className="absolute inset-0 w-full h-full stroke-zinc-200 dark:stroke-zinc-900 pointer-events-none"
            viewBox="0 0 100 100"
          >
            <line x1="0" y1="50" x2="100" y2="50" strokeWidth="0.5" strokeDasharray="3,3" />
            <line x1="50" y1="0" x2="50" y2="100" strokeWidth="0.5" strokeDasharray="3,3" />
            <line x1="0" y1="0" x2="100" y2="100" strokeWidth="0.25" strokeDasharray="3,3" />
            <line x1="100" y1="0" x2="0" y2="100" strokeWidth="0.25" strokeDasharray="3,3" />
          </svg>
        )}

        {quizSuccess && hasAnimation && (
          <div className="absolute inset-0 bg-white/80 dark:bg-zinc-950/80 flex flex-col items-center justify-center gap-1 z-25">
            <CheckCircle className="w-10 h-10 text-emerald-500 animate-bounce" />
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Hoàn thành!</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant={mode === "animate" ? "primary" : "ghost"}
          size="sm"
          onClick={() => {
            setMode("animate");
            setQuizMessage("Đã chuyển sang chế độ Xem");
          }}
          disabled={!hasAnimation}
          className="w-24"
        >
          <Eye className="w-4 h-4 mr-2" />
          Xem
        </Button>
        <Button
          variant={mode === "quiz" ? "primary" : "ghost"}
          size="sm"
          onClick={() => {
            setMode("quiz");
          }}
          disabled={!hasAnimation}
          className="w-24"
        >
          <PenTool className="w-4 h-4 mr-2" />
          Luyện
        </Button>
      </div>

      {hasAnimation && mode === "quiz" && (
        <div className="w-full text-center">
          <span className={`text-xs font-medium ${quizSuccess ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-500 dark:text-zinc-400"}`}>
            {quizMessage}
          </span>
        </div>
      )}

      <div className="w-full border-t border-zinc-100 dark:border-zinc-800/60 pt-3">
        {!hasAnimation ? (
          <p className="text-sm font-medium text-center text-amber-600 dark:text-amber-500">
            Chưa có dữ liệu nét viết
          </p>
        ) : mode === "animate" ? (
          <Button
            variant="secondary"
            size="sm"
            className="w-full flex items-center justify-center gap-1.5 h-8 text-xs font-semibold"
            onClick={handlePlayPause}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isPlaying ? "Tạm dừng" : "Tiếp tục"}
          </Button>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            className="w-full flex items-center justify-center gap-1 h-8 text-xs"
            onClick={handleReset}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Viết lại từ đầu
          </Button>
        )}
      </div>
    </div>
  );
}
