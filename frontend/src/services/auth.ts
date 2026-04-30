import api from './api';

// 认证相关的API服务
export const authService = {
  /**
   * 用户登录
   * @param email 邮箱
   * @param password 密码
   * @returns 登录结果
   */
  login: (email: string, password: string) => {
    return api.post('/auth/login', { email, password });
  },

  /**
   * 用户注册
   * @param email 邮箱
   * @param password 密码
   * @param nickname 昵称
   * @returns 注册结果
   */
  register: (email: string, password: string, nickname: string) => {
    return api.post('/auth/register', { email, password, nickname });
  },

  /**
   * 刷新token
   * @param refreshToken 刷新令牌
   * @returns 新的访问令牌
   */
  refreshToken: (refreshToken: string) => {
    return api.post('/auth/refresh', { refresh_token: refreshToken });
  },

  /**
   * 发送验证码
   * @param email 邮箱
   * @returns 发送结果
   */
  sendCode: (email: string) => {
    return api.post('/auth/send-code', { email });
  },
};
