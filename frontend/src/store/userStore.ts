import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';

// 用户状态接口
interface UserState {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

// 创建用户状态管理
export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoggedIn: false,
      setUser: (user) => set({ user, isLoggedIn: true }),
      setToken: (token) => set({ token }),
      logout: () => set({ user: null, token: null, isLoggedIn: false }),
    }),
    {
      name: 'user-storage',
    }
  )
);
