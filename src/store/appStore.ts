import { create } from 'zustand';

interface AppState {
  appKey: string | null;
  setAppKey: (appKey: string) => void;
  clearAppKey: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  appKey: null,
  setAppKey: (appKey) => set({ appKey }),
  clearAppKey: () => set({ appKey: null }),
}));