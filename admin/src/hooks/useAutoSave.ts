import { useEffect, useRef, useCallback } from 'react';
import { useCanvasStore } from '../store/canvasStore';
import api from '../services/api';
import { message } from 'antd';

const DEBOUNCE_DELAY = 3000; // 3秒防抖

export const useAutoSave = (projectId: string, enabled: boolean = true) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { elements, scale, position, isDirty, setLastSaved } = useCanvasStore();

  const save = useCallback(async () => {
    if (!isDirty) return;

    try {
      await api.put(`/projects/${projectId}/canvas`, {
        elements,
        scale,
        position,
      });
      setLastSaved(new Date().toISOString());
    } catch (error) {
      console.error('自动保存失败:', error);
      message.error('自动保存失败，请检查网络连接');
    }
  }, [projectId, elements, scale, position, isDirty, setLastSaved]);

  useEffect(() => {
    if (!enabled) return;

    if (isDirty) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        save();
      }, DEBOUNCE_DELAY);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isDirty, enabled, save]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '您有未保存的更改，确定要离开吗？';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  return { save };
};

export const useLocalBackup = (projectId: string) => {
  const { elements, scale, position } = useCanvasStore();

  const saveToLocal = useCallback(() => {
    const data = { elements, scale, position };
    localStorage.setItem(`canvas_backup_${projectId}`, JSON.stringify(data));
  }, [projectId, elements, scale, position]);

  const loadFromLocal = useCallback(() => {
    const backup = localStorage.getItem(`canvas_backup_${projectId}`);
    if (backup) {
      try {
        return JSON.parse(backup);
      } catch (error) {
        console.error('加载本地备份失败:', error);
        return null;
      }
    }
    return null;
  }, [projectId]);

  const clearLocalBackup = useCallback(() => {
    localStorage.removeItem(`canvas_backup_${projectId}`);
  }, [projectId]);

  return { saveToLocal, loadFromLocal, clearLocalBackup };
};