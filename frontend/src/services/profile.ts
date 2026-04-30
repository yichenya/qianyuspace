import api from './api';

// 个人中心相关的API服务
export const profileService = {
  /**
   * 获取个人信息
   * @returns 个人信息
   */
  getInfo: () => {
    return api.get('/users/me');
  },

  /**
   * 更新个人信息
   * @param data 更新数据
   * @returns 更新后的个人信息
   */
  updateInfo: (data: { nickname?: string; avatar?: string }) => {
    return api.patch('/users/me', data);
  },

  /**
   * 获取徽章列表
   * @returns 徽章列表
   */
  getBadges: () => {
    return api.get('/users/badges');
  },
};
