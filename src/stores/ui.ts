import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import type { HoverResult } from "../types";

interface AppConfig {
  theme: "light" | "dark";
  grammar_show_pinyin: boolean;
  grammar_show_english: boolean;
}

interface UiStore {
  theme: "light" | "dark";
  themeLoaded: boolean;
  grammarShowPinyin: boolean;
  grammarShowEnglish: boolean;
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;
  setGrammarShowPinyin: (show: boolean) => void;
  setGrammarShowEnglish: (show: boolean) => void;

  hoverEnabled: boolean;
  toggleHover: () => void;

  hoverWords: HoverResult[];
  hoverPosition: { x: number; y: number; height?: number } | null;
  hoverHighlightRange: { start: number; length: number } | null;
  isHideTimerActive: boolean;
  setHoverWords: (
    words: HoverResult[] | null,
    position?: { x: number; y: number; height?: number },
    highlightRange?: { start: number; length: number } | null,
  ) => void;
  setHoverWordsDeferred: (
    words: HoverResult[] | null,
    position?: { x: number; y: number; height?: number },
    highlightRange?: { start: number; length: number } | null,
    delayMs?: number,
  ) => void;
  clearHideTimer: () => void;
}

let hideTimeout: ReturnType<typeof setTimeout> | null = null;

const applyThemeClass = (theme: "light" | "dark") => {
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};

const saveConfig = async (
  theme: "light" | "dark",
  pinyin: boolean,
  english: boolean,
) => {
  try {
    await invoke("save_app_config", {
      config: {
        theme,
        grammar_show_pinyin: pinyin,
        grammar_show_english: english,
      },
    });
  } catch (e) {
    console.error("Failed to save app config:", e);
  }
};

export const useUiStore = create<UiStore>((set, get) => ({
  theme: "light",
  themeLoaded: false,
  grammarShowPinyin: true,
  grammarShowEnglish: true,
  setTheme: async (theme) => {
    applyThemeClass(theme);
    set({ theme, themeLoaded: true });
    await saveConfig(theme, get().grammarShowPinyin, get().grammarShowEnglish);
  },
  toggleTheme: async () => {
    const next = get().theme === "light" ? "dark" : "light";
    applyThemeClass(next);
    set({ theme: next, themeLoaded: true });
    await saveConfig(next, get().grammarShowPinyin, get().grammarShowEnglish);
  },
  setGrammarShowPinyin: async (show) => {
    set({ grammarShowPinyin: show });
    await saveConfig(get().theme, show, get().grammarShowEnglish);
  },
  setGrammarShowEnglish: async (show) => {
    set({ grammarShowEnglish: show });
    await saveConfig(get().theme, get().grammarShowPinyin, show);
  },

  hoverEnabled: true,
  toggleHover: () =>
    set((state) => ({
      hoverEnabled: !state.hoverEnabled,
    })),

  hoverWords: [],
  hoverPosition: null,
  hoverHighlightRange: null,
  isHideTimerActive: false,
  setHoverWords: (words, position, highlightRange) => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
    set({
      hoverWords: words || [],
      hoverPosition: position || null,
      hoverHighlightRange: highlightRange ?? null,
      isHideTimerActive: false,
    });
  },
  setHoverWordsDeferred: (words, position, highlightRange, delayMs = 100) => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
    }

    if (words === null) {
      set({ isHideTimerActive: true });
      hideTimeout = setTimeout(() => {
        set({
          hoverWords: [],
          hoverPosition: null,
          hoverHighlightRange: null,
          isHideTimerActive: false,
        });
        hideTimeout = null;
      }, delayMs);
    } else {
      set({
        hoverWords: words,
        hoverPosition: position || null,
        hoverHighlightRange: highlightRange ?? null,
        isHideTimerActive: false,
      });
    }
  },
  clearHideTimer: () => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
    set({ isHideTimerActive: false });
  },
}));

export async function loadInitialConfig() {
  try {
    const config = await invoke<AppConfig>("get_app_config");
    if (config && (config.theme === "dark" || config.theme === "light")) {
      useUiStore.setState({
        theme: config.theme,
        grammarShowPinyin: config.grammar_show_pinyin,
        grammarShowEnglish: config.grammar_show_english,
        themeLoaded: true,
      });
      applyThemeClass(config.theme);
    } else {
      useUiStore.setState({ themeLoaded: true });
    }
  } catch (e) {
    console.error("Failed to load initial app config:", e);
    useUiStore.setState({ themeLoaded: true });
  }
}
