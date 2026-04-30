import api from './api';

// AI生成相关的API服务
export const generateService = {
  /**
   * 生成图片
   * @param prompt 提示词
   * @param params 生成参数
   * @returns 生成任务
   */
  image: (prompt: string, params?: any) => {
    return api.post('/generate/image', { prompt, params });
  },

  /**
   * 生成视频
   * @param prompt 提示词
   * @param params 生成参数
   * @returns 生成任务
   */
  video: (prompt: string, params?: any) => {
    return api.post('/generate/video', { prompt, params });
  },

  /**
   * 获取任务状态
   * @param id 任务ID
   * @returns 任务状态
   */
  getTaskStatus: (id: number) => {
    return api.get(`/generate/tasks/${id}`);
  },

  /**
   * 取消任务
   * @param id 任务ID
   * @returns 取消结果
   */
  cancelTask: (id: number) => {
    return api.delete(`/generate/tasks/${id}`);
  },
};
