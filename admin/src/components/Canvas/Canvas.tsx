import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Stage, Layer, Rect, Text, Image as KonvaImage, Transformer } from 'react-konva';
import { useCanvasStore, CanvasElement } from '../../store/canvasStore';
import { KonvaEventObject } from 'konva/lib/Node';

interface CanvasProps {
  projectId: string;
  onSave?: () => void;
}

export const Canvas: React.FC<CanvasProps> = () => {
  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; elementId: string } | null>(null);

  const {
    elements,
    scale,
    position,
    selectedIds,
    setScale,
    setPosition,
    setSelectedIds,
    addToSelection,
    clearSelection,
    updateElement,
    deleteElement,
    duplicateElement,
  } = useCanvasStore();

  useEffect(() => {
    if (transformerRef.current && stageRef.current) {
      const stage = stageRef.current;
      const selectedNodes = selectedIds
        .map((id) => stage.findOne(`#${id}`))
        .filter(Boolean);
      transformerRef.current.nodes(selectedNodes);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selectedIds]);

  const handleWheel = useCallback(
    (e: KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      const stage = stageRef.current;
      if (!stage) return;

      const oldScale = scale;
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const mousePointTo = {
        x: (pointer.x - position.x) / oldScale,
        y: (pointer.y - position.y) / oldScale,
      };

      const direction = e.evt.deltaY > 0 ? -1 : 1;
      const newScale = direction > 0 ? oldScale * 1.1 : oldScale / 1.1;
      const clampedScale = Math.max(0.1, Math.min(5, newScale));

      setScale(clampedScale);
      setPosition({
        x: pointer.x - mousePointTo.x * clampedScale,
        y: pointer.y - mousePointTo.y * clampedScale,
      });
    },
    [scale, position, setScale, setPosition]
  );

  const handleStageMouseDown = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      const clickedOnEmpty = e.target === e.target.getStage();
      if (clickedOnEmpty) {
        clearSelection();
        setContextMenu(null);
      }
    },
    [clearSelection]
  );

  const handleElementClick = useCallback(
    (e: KonvaEventObject<MouseEvent>, elementId: string) => {
      e.cancelBubble = true;
      if (e.evt.shiftKey) {
        if (selectedIds.includes(elementId)) {
          setSelectedIds(selectedIds.filter((id) => id !== elementId));
        } else {
          addToSelection(elementId);
        }
      } else {
        setSelectedIds([elementId]);
      }
    },
    [selectedIds, setSelectedIds, addToSelection]
  );

  const handleContextMenu = useCallback(
    (e: KonvaEventObject<PointerEvent>, elementId: string) => {
      e.evt.preventDefault();
      const stage = stageRef.current;
      if (!stage) return;
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      if (!selectedIds.includes(elementId)) {
        setSelectedIds([elementId]);
      }

      setContextMenu({
        x: pointer.x,
        y: pointer.y,
        elementId,
      });
    },
    [selectedIds, setSelectedIds]
  );

  const handleDragEnd = useCallback(
    (e: KonvaEventObject<DragEvent>, id: string) => {
      updateElement(id, {
        x: e.target.x(),
        y: e.target.y(),
      });
    },
    [updateElement]
  );

  const handleTransformEnd = useCallback(
    (e: KonvaEventObject<Event>, id: string) => {
      const node = e.target;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();

      node.scaleX(1);
      node.scaleY(1);

      updateElement(id, {
        x: node.x(),
        y: node.y(),
        width: Math.max(5, node.width() * scaleX),
        height: Math.max(5, node.height() * scaleY),
        rotation: node.rotation(),
      });
    },
    [updateElement]
  );

  const renderElement = (element: CanvasElement) => {
    const isSelected = selectedIds.includes(element.id);
    const commonProps = {
      id: element.id,
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
      scaleX: element.scaleX,
      scaleY: element.scaleY,
      rotation: element.rotation,
      draggable: true,
      onClick: (e: KonvaEventObject<MouseEvent>) => handleElementClick(e, element.id),
      onTap: () => setSelectedIds([element.id]),
      onContextMenu: (e: KonvaEventObject<PointerEvent>) => handleContextMenu(e, element.id),
      onDragEnd: (e: KonvaEventObject<DragEvent>) => handleDragEnd(e, element.id),
      onTransformEnd: (e: KonvaEventObject<Event>) => handleTransformEnd(e, element.id),
    };

    switch (element.type) {
      case 'rect':
        return (
          <Rect
            key={element.id}
            {...commonProps}
            fill={element.attrs.fill || '#e0e0e0'}
            stroke={isSelected ? '#1890ff' : undefined}
            strokeWidth={isSelected ? 2 : 0}
          />
        );
      case 'text':
        return (
          <Text
            key={element.id}
            {...commonProps}
            text={element.attrs.text || '双击编辑文本'}
            fontSize={element.attrs.fontSize || 16}
            fill={element.attrs.fill || '#000000'}
            stroke={isSelected ? '#1890ff' : undefined}
            strokeWidth={isSelected ? 1 : 0}
          />
        );
      case 'image':
        return <ImageElement key={element.id} element={element} commonProps={commonProps} isSelected={isSelected} />;
      case 'video':
        return <VideoElement key={element.id} element={element} commonProps={commonProps} isSelected={isSelected} />;
      default:
        return null;
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Stage
        ref={stageRef}
        width={window.innerWidth}
        height={window.innerHeight}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        onWheel={handleWheel}
        onMouseDown={handleStageMouseDown}
        onContextMenu={(e) => {
          e.evt.preventDefault();
          setContextMenu(null);
        }}
      >
        <Layer>
          <Rect
            width={5000}
            height={5000}
            x={-2500}
            y={-2500}
            fill="#f5f5f5"
            stroke="#e0e0e0"
            strokeWidth={1}
          />
          {elements.map(renderElement)}
          <Transformer
            ref={transformerRef}
            boundBoxFunc={(oldBox: any, newBox: any) => {
              if (newBox.width < 5 || newBox.height < 5) {
                return oldBox;
              }
              return newBox;
            }}
          />
        </Layer>
      </Stage>

      {contextMenu && (
        <div
          style={{
            position: 'absolute',
            top: contextMenu.y,
            left: contextMenu.x,
            background: 'white',
            border: '1px solid #d9d9d9',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            padding: '4px 0',
            zIndex: 1000,
          }}
          onClick={() => setContextMenu(null)}
        >
          <MenuItem
            onClick={() => {
              duplicateElement(contextMenu.elementId);
              setContextMenu(null);
            }}
          >
            复制
          </MenuItem>
          <MenuItem
            onClick={() => {
              deleteElement(contextMenu.elementId);
              setContextMenu(null);
            }}
          >
            删除
          </MenuItem>
        </div>
      )}
    </div>
  );
};

interface ImageElementProps {
  element: CanvasElement;
  commonProps: any;
  isSelected: boolean;
}

const ImageElement: React.FC<ImageElementProps> = ({ element, commonProps, isSelected }) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (element.attrs.src) {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.src = element.attrs.src;
      img.onload = () => setImage(img);
    }
  }, [element.attrs.src]);

  if (!image) return null;

  return (
    <KonvaImage
      {...commonProps}
      image={image}
      stroke={isSelected ? '#1890ff' : undefined}
      strokeWidth={isSelected ? 2 : 0}
    />
  );
};

interface VideoElementProps {
  element: CanvasElement;
  commonProps: any;
  isSelected: boolean;
}

const VideoElement: React.FC<VideoElementProps> = ({ element, commonProps, isSelected }) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (element.attrs.poster) {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.src = element.attrs.poster;
      img.onload = () => setImage(img);
    }
  }, [element.attrs.poster]);

  return (
    <>
      {image && (
        <KonvaImage
          {...commonProps}
          image={image}
          stroke={isSelected ? '#1890ff' : undefined}
          strokeWidth={isSelected ? 2 : 0}
        />
      )}
    </>
  );
};

interface MenuItemProps {
  onClick: () => void;
  children: React.ReactNode;
}

const MenuItem: React.FC<MenuItemProps> = ({ onClick, children }) => {
  return (
    <div
      style={{
        padding: '8px 16px',
        cursor: 'pointer',
        fontSize: '14px',
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#f5f5f5';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
      }}
    >
      {children}
    </div>
  );
};

export default Canvas;