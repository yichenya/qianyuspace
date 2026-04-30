import api from './api';

export interface AdminProject {
  id: string;
  user_id: string;
  user_email: string;
  name: string;
  cover_image?: string;
  created_at: string;
  updated_at: string;
}

export const adminService = {
  getDashboard: () => api.get<any>('/admin/dashboard'),
  getUsers: (params?: { search?: string; status?: string }) => api.get<any[]>('/admin/users', { params }),
  updateUserStatus: (userId: string, status: 'active' | 'inactive') =>
    api.patch(`/admin/users/${userId}/status`, { status }),
  resetUserPassword: (userId: string) => api.post(`/admin/users/${userId}/reset-password`),
  getProjects: (params?: { search?: string }) => api.get<AdminProject[]>('/admin/projects', { params }),
  deleteProject: (projectId: string) => api.delete(`/admin/projects/${projectId}`),
  getMaterials: (params?: { search?: string; type?: string }) => api.get<any[]>('/admin/materials', { params }),
  deleteMaterial: (materialId: number) => api.delete(`/admin/materials/${materialId}`),
  getTasks: (params?: { search?: string; type?: string; status?: string }) => api.get<any[]>('/admin/tasks', { params }),
  cancelTask: (taskId: number) => api.post(`/admin/tasks/${taskId}/cancel`),
  getStatistics: () => api.get<any>('/admin/statistics'),
};
