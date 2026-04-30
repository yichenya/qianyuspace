import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Canvas } from '../../components/Canvas/Canvas';
import { CanvasToolbar } from '../../components/Canvas/CanvasToolbar';
import { useCanvasStore } from '../../store/canvasStore';
import { useAutoSave } from '../../hooks/useAutoSave';
import api from '../../services/api';
import { message } from 'antd';

export const CanvasPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [projectName, setProjectName] = useState('');
  const { loadCanvas, elements, scale, position, isDirty } = useCanvasStore();

  useEffect(() => {
    if (!projectId) {
      message.error('项目ID不存在');
      navigate('/projects');
      return;
    }

    loadProjectData();
  }, [projectId]);

  const loadProjectData = async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      const [projectRes, canvasRes] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/projects/${projectId}/canvas`),
      ]);

      setProjectName((projectRes as any).name);
      loadCanvas({
        elements: (canvasRes as any).elements || [],
        scale: (canvasRes as any).scale || 1,
        position: (canvasRes as any).position || { x: 0, y: 0 },
      });
    } catch (error) {
      console.error('加载项目数据失败:', error);
      message.error('加载项目数据失败');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!projectId) return;

    try {
      await api.put(`/projects/${projectId}/canvas`, {
        elements,
        scale,
        position,
      });
      useCanvasStore.getState().setLastSaved(new Date().toISOString());
      message.success('保存成功');
    } catch (error) {
      console.error('保存失败:', error);
      message.error('保存失败，请重试');
    }
  };

  useAutoSave(projectId || '', !!projectId);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        加载中...
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <CanvasToolbar onSave={handleSave} projectName={projectName} />
      <Canvas projectId={projectId!} onSave={handleSave} />

      <div
        style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          background: 'white',
          padding: '8px 12px',
          borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          fontSize: '12px',
          color: '#666',
        }}
      >
        {isDirty ? (
          <span style={{ color: '#faad14' }}>● 未保存</span>
        ) : (
          <span style={{ color: '#52c41a' }}>● 已保存</span>
        )}
        {'  '}缩放: {(scale * 100).toFixed(0)}%
      </div>
    </div>
  );
};

export default CanvasPage;