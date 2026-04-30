import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 认证状态接口
interface AuthState {
  admin: any | null;
  token: string | null;
  isLoggedIn: boolean;
  setAdmin: (admin: any) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

// 创建认证状态管理
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      admin: null,
      token: null,
      isLoggedIn: false,
      setAdmin: (admin) => set({ admin, isLoggedIn: true }),
      setToken: (token) => set({ token }),
      logout: () => set({ admin: null, token: null, isLoggedIn: false }),
    }),
    {
      name: 'admin-auth-storage',
    }
  )
);
