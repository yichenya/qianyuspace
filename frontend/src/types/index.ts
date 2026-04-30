// 用户类型
export interface User {
  id: string;
  email: string;
  nickname: string;
  avatar?: string;
}

// 项目类型
export interface Project {
  id: string;
  name: string;
  cover_image?: string;
  created_at: string;
  updated_at: string;
}

// 画布状态类型
export interface CanvasState {
  project_id: string;
  elements: any[];
  scale: number;
  position: { x: number; y: number };
}

// 素材类型
export interface Material {
  id: number;
  type: 'image' | 'video';
  url: string;
  name: string;
  width?: number;
  height?: number;
  duration?: number;
  created_at: string;
}

// 生成任务类型
export interface GenerationTask {
  task_id: number;
  status: 'pending' | 'processing' | 'success' | 'failed';
}

// 生成日志类型
export interface GenerationLog {
  id: number;
  type: 'image' | 'video';
  prompt: string;
  charge_amount: number;
  status: string;
  created_at: string;
  completed_at?: string;
}

// 使用额度类型
export interface UsageQuota {
  daily_quota: number;
  used_today: number;
}

// 使用统计类型
export interface UsageStats {
  total_generations: number;
  total_spent: number;
}

// 徽章类型
export interface Badge {
  id: number;
  name: string;
  description?: string;
  icon?: string;
}
