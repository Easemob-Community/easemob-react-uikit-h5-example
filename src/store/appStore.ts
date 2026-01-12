import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AppState {
  appKey: string | null;
  userId: string;
  token: string;
  chatroomId: string;
  setAppKey: (appKey: string) => void;
  setUserInfo: (userId: string, token: string, chatroomId: string) => void;
  clearAppKey: () => void;
  clearUserInfo: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      appKey: null,
      userId: '',
      token: '',
      chatroomId: '',
      setAppKey: (appKey) => set({ appKey }),
      setUserInfo: (userId, token, chatroomId) => set({ userId, token, chatroomId }),
      clearAppKey: () => set({ appKey: null }),
      clearUserInfo: () => set({ userId: '', token: '', chatroomId: '' }),
    }),
    {
      name: 'app-storage', // 存储名称
      storage: createJSONStorage(() => localStorage), // 使用 localStorage
    }
  )
);