import api from './api';

export const authService = {
  login: (username: string, password: string) => {
    return api.post<{ access_token: string; admin: any }>('/auth/admin/login', { username, password });
  },
};
