import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus, Maximize2, Minimize2, X } from "lucide-react";
import { useState, useEffect } from "react";

export function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const win = getCurrentWindow();
    win.isMaximized().then(setIsMaximized).catch(console.error);
  }, []);

  const handleMinimize = () => {
    getCurrentWindow().minimize().catch(console.error);
  };

  const handleMaximize = async () => {
    const win = getCurrentWindow();
    try {
      if (isMaximized) {
        await win.unmaximize();
      } else {
        await win.maximize();
      }
      setIsMaximized(!isMaximized);
    } catch (e) {
      console.error("Window toggle failed:", e);
    }
  };

  const handleClose = () => {
    getCurrentWindow().close().catch(console.error);
  };

  return (
    <div className="flex items-center justify-between h-10 select-none bg-zinc-900 text-zinc-400">
      <div
        className="flex-1 flex items-center gap-3 px-4 cursor-default"
        data-tauri-drag-region
      >
        <span className="text-sm font-medium">Hoan Hoc Tieng Trung</span>
      </div>

      <div className="flex items-center h-full">
        <button
          type="button"
          onClick={handleMinimize}
          className="w-12 h-10 flex items-center justify-center transition-colors hover:bg-zinc-800"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleMaximize}
          className="w-12 h-10 flex items-center justify-center transition-colors hover:bg-zinc-800"
        >
          {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
        <button
          type="button"
          onClick={handleClose}
          className="w-12 h-10 flex items-center justify-center transition-colors hover:bg-rose-600 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
