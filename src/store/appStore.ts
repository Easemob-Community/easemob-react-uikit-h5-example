import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AppState {
  appKey: string | null;
  userId: string;
  token: string;
  chatroomId: string;
  // 客服场景配置
  csAppKey: string;
  csUserId: string;
  csPassword: string;
  csGroupId: string;
  setAppKey: (appKey: string) => void;
  setUserInfo: (userId: string, token: string, chatroomId: string) => void;
  setCsConfig: (appKey: string, userId: string, password: string, groupId: string) => void;
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
      // 客服场景默认值（演示用，可修改）
      csAppKey: '',
      csUserId: '',
      csPassword: '',
      csGroupId: '',
      setAppKey: (appKey) => set({ appKey }),
      setUserInfo: (userId, token, chatroomId) => set({ userId, token, chatroomId }),
      setCsConfig: (csAppKey, csUserId, csPassword, csGroupId) => set({ csAppKey, csUserId, csPassword, csGroupId }),
      clearAppKey: () => set({ appKey: null }),
      clearUserInfo: () => set({ userId: '', token: '', chatroomId: '' }),
    }),
    {
      name: 'app-storage', // 存储名称
      storage: createJSONStorage(() => localStorage), // 使用 localStorage
    }
  )
);