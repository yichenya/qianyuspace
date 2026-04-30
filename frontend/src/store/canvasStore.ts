import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 画布状态接口
interface CanvasState {
  canvasState: any;
  setCanvasState: (state: any) => void;
  resetCanvasState: () => void;
}

// 创建画布状态管理
export const useCanvasStore = create<CanvasState>()(
  persist(
    (set) => ({
      canvasState: { elements: [] },
      setCanvasState: (state) => set({ canvasState: state }),
      resetCanvasState: () => set({ canvasState: { elements: [] } }),
    }),
    {
      name: 'canvas-storage',
    }
  )
);
