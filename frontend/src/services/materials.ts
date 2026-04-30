import api from './api';

export const materialService = {
  getList: <T = any>() => api.get<T>('/materials'),
  create: <T = any>(data: { type: 'image' | 'video'; url: string; name: string; width?: number; height?: number; duration?: number }) =>
    api.post<T>('/materials', data),
  delete: <T = any>(id: number) => api.delete<T>(`/materials/${id}`),
  getFavorites: <T = any>() => api.get<T>('/materials/favorites'),
  favorite: <T = any>(id: number) => api.post<T>(`/materials/${id}/favorite`),
  unfavorite: <T = any>(id: number) => api.delete<T>(`/materials/${id}/favorite`),
};
