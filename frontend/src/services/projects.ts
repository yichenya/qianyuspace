import api from './api';

export const projectService = {
  getList: <T = any>() => api.get<T>('/projects'),
  create: <T = any>(name: string) => api.post<T>('/projects', { name }),
  getDetail: <T = any>(id: string) => api.get<T>(`/projects/${id}`),
  update: <T = any>(id: string, data: { name?: string; cover_image?: string }) => api.put<T>(`/projects/${id}`, data),
  delete: <T = any>(id: string) => api.delete<T>(`/projects/${id}`),
};
