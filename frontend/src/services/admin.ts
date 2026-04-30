import api from './api';

// 管理端功能占位联调用 API（当前仅提供最小调用封装）
export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: () => api.get('/admin/users'),
  getTasks: () => api.get('/admin/tasks'),
  getMaterials: () => api.get('/admin/materials'),
  getStatistics: () => api.get('/admin/statistics'),
};
