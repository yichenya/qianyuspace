import React from 'react';
import { Button, Space, Tooltip, Divider, message } from 'antd';
import { ZoomInOutlined, ZoomOutOutlined, DeleteOutlined, CopyOutlined, SaveOutlined } from '@ant-design/icons';
import { useCanvasStore, CanvasElement } from '../../store/canvasStore';

interface CanvasToolbarProps {
  onSave?: () => void;
  projectName?: string;
}

export const CanvasToolbar: React.FC<CanvasToolbarProps> = ({ onSave, projectName }) => {
  const {
    scale,
    setScale,
    selectedIds,
    deleteSelectedElements,
    duplicateElement,
    addElement,
  } = useCanvasStore();

  const handleZoomIn = () => {
    setScale(Math.min(5, scale * 1.2));
  };

  const handleZoomOut = () => {
    setScale(Math.max(0.1, scale / 1.2));
  };

  const handleResetZoom = () => {
    setScale(1);
  };

  const handleDelete = () => {
    if (selectedIds.length === 0) {
      message.warning('请先选择要删除的元素');
      return;
    }
    deleteSelectedElements();
    message.success('已删除选中的元素');
  };

  const handleDuplicate = () => {
    if (selectedIds.length === 0) {
      message.warning('请先选择要复制的元素');
      return;
    }
    selectedIds.forEach((id) => duplicateElement(id));
    message.success('已复制选中的元素');
  };

  const handleAddText = () => {
    const newElement: CanvasElement = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'text',
      x: 100,
      y: 100,
      width: 200,
      height: 50,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      attrs: {
        text: '双击编辑文本',
        fontSize: 16,
        fill: '#000000',
      },
    };
    addElement(newElement);
    message.success('已添加文本元素');
  };

  const handleAddRect = () => {
    const newElement: CanvasElement = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'rect',
      x: 100,
      y: 100,
      width: 200,
      height: 150,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      attrs: {
        fill: '#e0e0e0',
      },
    };
    addElement(newElement);
    message.success('已添加矩形元素');
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 16,
        left: 16,
        right: 16,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'white',
        padding: '12px 16px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        zIndex: 100,
      }}
    >
      <Space>
        <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
          {projectName || '未命名项目'}
        </span>
      </Space>

      <Space>
        <Tooltip title="添加文本">
          <Button onClick={handleAddText}>文本</Button>
        </Tooltip>
        <Tooltip title="添加矩形">
          <Button onClick={handleAddRect}>矩形</Button>
        </Tooltip>

        <Divider type="vertical" />

        <Tooltip title="放大 (Ctrl+滚轮)">
          <Button icon={<ZoomInOutlined />} onClick={handleZoomIn} />
        </Tooltip>
        <Tooltip title="缩小">
          <Button icon={<ZoomOutOutlined />} onClick={handleZoomOut} />
        </Tooltip>
        <Tooltip title="重置缩放">
          <Button onClick={handleResetZoom}>{(scale * 100).toFixed(0)}%</Button>
        </Tooltip>

        <Divider type="vertical" />

        <Tooltip title="复制 (选中元素)">
          <Button icon={<CopyOutlined />} onClick={handleDuplicate} disabled={selectedIds.length === 0} />
        </Tooltip>
        <Tooltip title="删除 (选中元素)">
          <Button icon={<DeleteOutlined />} onClick={handleDelete} disabled={selectedIds.length === 0} />
        </Tooltip>

        <Divider type="vertical" />

        <Tooltip title="保存 (Ctrl+S)">
          <Button type="primary" icon={<SaveOutlined />} onClick={onSave}>
            保存
          </Button>
        </Tooltip>
      </Space>
    </div>
  );
};

export default CanvasToolbar;