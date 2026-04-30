import api from './api';

// 消费统计相关的API服务
export const usageService = {
  /**
   * 获取使用额度
   * @returns 使用额度
   */
  getQuota: () => {
    return api.get('/usage/quota');
  },

  /**
   * 获取消费历史
   * @returns 消费历史
   */
  getHistory: () => {
    return api.get('/usage/history');
  },

  /**
   * 获取使用统计
   * @returns 使用统计
   */
  getStats: () => {
    return api.get('/usage/stats');
  },
};
