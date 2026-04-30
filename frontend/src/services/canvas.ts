import api from './api';

// 画布管理相关的API服务
export const canvasService = {
  /**
   * 获取画布状态
   * @param projectId 项目ID
   * @returns 画布状态
   */
  getState: (projectId: string) => {
    return api.get(`/projects/${projectId}/canvas`);
  },

  /**
   * 保存画布状态
   * @param projectId 项目ID
   * @param stateData 画布状态数据
   * @returns 保存结果
   */
  saveState: (
    projectId: string,
    stateData: { elements: any[]; scale?: number; position?: { x: number; y: number } }
  ) => {
    return api.put(`/projects/${projectId}/canvas`, {
      elements: stateData.elements || [],
      scale: stateData.scale ?? 1,
      position: stateData.position ?? { x: 0, y: 0 },
    });
  },
};
