import { create } from "zustand";
import type { TabId } from "../types";

interface AppStore {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  activeTab: "review",
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
