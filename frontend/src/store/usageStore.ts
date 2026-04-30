import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UsageQuota, UsageStats, GenerationLog } from '../types';

// 使用状态接口
interface UsageState {
  usageQuota: UsageQuota | null;
  usageStats: UsageStats | null;
  consumptionHistory: GenerationLog[];
  setUsageQuota: (quota: UsageQuota) => void;
  setUsageStats: (stats: UsageStats) => void;
  setConsumptionHistory: (history: GenerationLog[]) => void;
}

// 创建使用状态管理
export const useUsageStore = create<UsageState>()(
  persist(
    (set) => ({
      usageQuota: null,
      usageStats: null,
      consumptionHistory: [],
      setUsageQuota: (quota) => set({ usageQuota: quota }),
      setUsageStats: (stats) => set({ usageStats: stats }),
      setConsumptionHistory: (history) => set({ consumptionHistory: history }),
    }),
    {
      name: 'usage-storage',
    }
  )
);
