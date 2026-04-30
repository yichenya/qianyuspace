import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout, Button, Input, Form, message, Card, Tabs, Space, Spin, Divider, List, Tag } from 'antd';
import { ArrowLeftOutlined, SendOutlined, PlusOutlined, PictureOutlined, VideoCameraOutlined, FontSizeOutlined, DragOutlined } from '@ant-design/icons';
import { Stage, Layer, Rect, Text as KonvaText, Transformer, Group } from 'react-konva';
import { canvasService, projectService, generateService, materialService, usageService } from '../../services';
import { useCanvasStore } from '../../store/canvasStore';
import { useProjectStore } from '../../store/projectStore';
import { useMaterialStore } from '../../store/materialStore';
import { useUsageStore } from '../../store/usageStore';
import { Material } from '../../types';
import { handleError } from '../../utils';

const { Content, Sider } = Layout;
const { TabPane } = Tabs;

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;

const Canvas: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<any>(null);
  const [canvasState, setCanvasState] = useState<any>({
    elements: [],
    scale: 1,
    position: { x: 0, y: 0 },
  });
  const [activeElement, setActiveElement] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [prompt, setPrompt] = useState<string>('');
  const [generatedMaterials, setGeneratedMaterials] = useState<Material[]>([]);
  const [form] = Form.useForm();
  const { setCanvasState: updateCanvasStore } = useCanvasStore();
  const { setCurrentProject } = useProjectStore();
  const { materials, setMaterials, addMaterial } = useMaterialStore();
  const { setUsageQuota, setUsageStats } = useUsageStore();
  const stageRef = useRef<any>(null);

  const normalizeElement = (element: any) => ({
    id: element.id || `element-${Date.now()}-${Math.random()}`,
    type: element.type || 'rect',
    x: element.x ?? 100,
    y: element.y ?? 100,
    width: element.width ?? 150,
    height: element.height ?? 100,
    scaleX: element.scaleX ?? 1,
    scaleY: element.scaleY ?? 1,
    rotation: element.rotation ?? 0,
    attrs: element.attrs || {
      text: element.text || '',
      fill: element.fill || '#1677ff',
      url: element.url || '',
      name: element.name || '',
      materialId: element.materialId,
      materialType: element.materialType || element.type,
    },
  });

  useEffect(() => {
    if (projectId) {
      loadProject();
      loadCanvasState();
      loadMaterials();
      refreshUsageData();
    }
  }, [projectId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (projectId && canvasState) {
        saveCanvasState();
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [canvasState, projectId]);

  const loadProject = async (): Promise<boolean> => {
    setLoading(true);
    try {
      const response: any = await projectService.getDetail(projectId!);
      setProject(response);
      setCurrentProject(response as any);
      return true;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        message.warning('项目不存在或已删除，已返回项目列表');
        navigate('/', { replace: true });
      } else {
        message.error(handleError(error));
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const loadMaterials = async () => {
    try {
      const response: any = await materialService.getList();
      setMaterials(response as any[]);
    } catch (error) {
      message.error(handleError(error));
    }
  };

  const refreshUsageData = async () => {
    try {
      const [quota, stats] = await Promise.all([
        usageService.getQuota(),
        usageService.getStats(),
      ]);
      setUsageQuota(quota as any);
      setUsageStats(stats as any);
    } catch {
      // 不打断主流程
    }
  };

  const loadCanvasState = async () => {
    setLoading(true);
    try {
      const response: any = await canvasService.getState(projectId!);
      const normalizedState = {
        elements: (response.elements || []).map((item: any) => normalizeElement(item)),
        scale: response.scale ?? 1,
        position: response.position ?? { x: 0, y: 0 },
      };
      setCanvasState(normalizedState);
      updateCanvasStore(normalizedState);
    } catch (error) {
      message.error(handleError(error));
    } finally {
      setLoading(false);
    }
  };

  const saveCanvasState = async () => {
    if (!projectReady) {
      return;
    }
    try {
      await canvasService.saveState(projectId!, canvasState);
    } catch (error) {
      console.error('保存画布状态失败:', error);
    }
  };

  const addElement = (type: 'rect' | 'text' | 'image' | 'video') => {
    const newElement = normalizeElement({
      id: `element-${Date.now()}`,
      type,
      x: 100,
      y: 100,
      width: type === 'text' ? 220 : 180,
      height: type === 'text' ? 70 : 120,
      attrs: {
        text: type === 'text' ? '文本内容' : type === 'image' ? '图片占位' : type === 'video' ? '视频占位' : '',
        fill: type === 'rect' ? '#1677ff' : '#d9d9d9',
      },
    });

    const newElements = [...canvasState.elements, newElement];
    setCanvasState({ ...canvasState, elements: newElements });
  };

  const addMaterialToCanvas = (material: Material, pos?: { x: number; y: number }) => {
    const newElement = normalizeElement({
      id: `material-${material.id}-${Date.now()}`,
      type: material.type,
      x: pos?.x ?? 120,
      y: pos?.y ?? 120,
      width: material.width || 220,
      height: material.height || 150,
      attrs: {
        name: material.name,
        url: material.url,
        materialId: material.id,
        materialType: material.type,
        fill: material.type === 'image' ? '#e6f4ff' : '#f6ffed',
      },
    });

    const newElements = [...canvasState.elements, newElement];
    setCanvasState({ ...canvasState, elements: newElements });
    message.success('已加入画布');
  };

  const handleMaterialDragStart = (e: React.DragEvent, material: Material) => {
    e.dataTransfer.setData('application/json', JSON.stringify(material));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleCanvasDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    try {
      const materialStr = e.dataTransfer.getData('application/json');
      if (!materialStr) {
        return;
      }
      const material: Material = JSON.parse(materialStr);
      if (!stageRef.current) {
        addMaterialToCanvas(material);
        return;
      }

      stageRef.current.setPointersPositions(e.nativeEvent);
      const pointer = stageRef.current.getPointerPosition();
      addMaterialToCanvas(material, {
        x: pointer?.x ?? 120,
        y: pointer?.y ?? 120,
      });
    } catch {
      message.error('素材拖拽失败，请重试');
    }
  };

  const handleElementClick = (e: any) => {
    const shape = e.target;
    setActiveElement(shape.id());
  };

  const handleStageClick = () => {
    setActiveElement(null);
  };

  const handleElementUpdate = (newAttrs: any, index: number) => {
    const newElements = [...canvasState.elements];
    newElements[index] = { ...newElements[index], ...newAttrs };
    setCanvasState({ ...canvasState, elements: newElements });
  };

  const checkTaskStatusUntilDone = async (taskId: number, maxRetry = 8) => {
    let retries = 0;
    while (retries < maxRetry) {
      const taskResponse: any = await generateService.getTaskStatus(taskId);
      if (taskResponse.status === 'success' || taskResponse.status === 'failed') {
        return taskResponse;
      }
      await new Promise((resolve) => setTimeout(resolve, 800));
      retries += 1;
    }
    return generateService.getTaskStatus(taskId);
  };

  const handleGenerate = async (type: 'image' | 'video') => {
    if (!prompt.trim()) {
      message.error('请输入提示词');
      return;
    }

    setAiLoading(true);
    try {
      const task: any = type === 'image'
        ? await generateService.image(prompt)
        : await generateService.video(prompt);

      const taskDetail: any = await checkTaskStatusUntilDone(task.task_id);

      if (taskDetail.status !== 'success') {
        message.error(`${type === 'image' ? '图片' : '视频'}生成失败`);
        return;
      }

      const materialsFromTask: Material[] = taskDetail?.result?.materials || [];
      setGeneratedMaterials(materialsFromTask);
      materialsFromTask.forEach((material) => addMaterial(material));

      const cost = Number(taskDetail?.result?.charge_amount || 0);
      message.success(
        `${type === 'image' ? '图片' : '视频'}生成成功，已入素材库${cost > 0 ? `，本次消费 ¥${cost.toFixed(2)}` : ''}`
      );

      await refreshUsageData();
    } catch (error) {
      message.error(handleError(error));
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: '80vh' }}>
      <Sider width={260} style={{ background: '#fff', padding: 16, borderRight: '1px solid #f0f0f0' }}>
        <Link to="/">
          <Button icon={<ArrowLeftOutlined />} style={{ marginBottom: 16 }}>
            返回首页
          </Button>
        </Link>

        <div style={{ marginBottom: 12, fontWeight: 600 }}>{project?.name || '画布编辑'}</div>

        <Divider orientation="left">添加元素</Divider>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button icon={<PlusOutlined />} onClick={() => addElement('rect')} block>
            矩形
          </Button>
          <Button icon={<FontSizeOutlined />} onClick={() => addElement('text')} block>
            文本
          </Button>
        </Space>

        <Divider orientation="left">素材库（拖入画布）</Divider>
        <List
          size="small"
          dataSource={materials.slice(0, 12)}
          locale={{ emptyText: '暂无素材，请先生成' }}
          renderItem={(item) => (
            <List.Item
              style={{ cursor: 'grab', paddingLeft: 0, paddingRight: 0 }}
              draggable
              onDragStart={(e) => handleMaterialDragStart(e, item)}
            >
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Space size={6}>
                  <DragOutlined />
                  <Tag color={item.type === 'image' ? 'blue' : 'green'}>{item.type === 'image' ? '图片' : '视频'}</Tag>
                  <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.name}>{item.name}</span>
                </Space>
                <Button size="small" onClick={() => addMaterialToCanvas(item)}>加入</Button>
              </Space>
            </List.Item>
          )}
        />
      </Sider>

      <Layout style={{ flex: 1 }}>
        <Content style={{ padding: 16 }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
              <Spin size="large" />
            </div>
          ) : (
            <div
              style={{ border: '1px solid #e8e8e8', borderRadius: 4, overflow: 'auto' }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleCanvasDrop}
            >
              <Stage
                ref={stageRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                onMouseDown={handleStageClick}
                style={{ background: '#f5f5f5' }}
              >
                <Layer>
                  {canvasState.elements.map((element: any, index: number) => {
                    const attrs = element.attrs || {};

                    if (element.type === 'rect') {
                      return (
                        <Rect
                          key={element.id}
                          id={element.id}
                          x={element.x}
                          y={element.y}
                          width={element.width}
                          height={element.height}
                          fill={attrs.fill || '#1677ff'}
                          draggable
                          onMouseDown={handleElementClick}
                          onDragEnd={(e) => {
                            handleElementUpdate({ x: e.target.x(), y: e.target.y() }, index);
                          }}
                          onTransformEnd={(e) => {
                            const node = e.target;
                            handleElementUpdate({
                              x: node.x(),
                              y: node.y(),
                              width: node.width() * node.scaleX(),
                              height: node.height() * node.scaleY(),
                              scaleX: 1,
                              scaleY: 1,
                              rotation: node.rotation(),
                            }, index);
                          }}
                        />
                      );
                    }

                    if (element.type === 'text') {
                      return (
                        <KonvaText
                          key={element.id}
                          id={element.id}
                          x={element.x}
                          y={element.y}
                          width={element.width}
                          height={element.height}
                          text={attrs.text || '文本'}
                          fontSize={16}
                          fill={attrs.fill || '#000'}
                          draggable
                          onMouseDown={handleElementClick}
                          onDragEnd={(e) => {
                            handleElementUpdate({ x: e.target.x(), y: e.target.y() }, index);
                          }}
                        />
                      );
                    }

                    if (element.type === 'image' || element.type === 'video') {
                      return (
                        <Group
                          key={element.id}
                          id={element.id}
                          x={element.x}
                          y={element.y}
                          draggable
                          onMouseDown={handleElementClick}
                          onDragEnd={(e) => {
                            handleElementUpdate({ x: e.target.x(), y: e.target.y() }, index);
                          }}
                        >
                          <Rect
                            width={element.width}
                            height={element.height}
                            fill={attrs.fill || (element.type === 'image' ? '#e6f4ff' : '#f6ffed')}
                            stroke={element.type === 'image' ? '#1677ff' : '#52c41a'}
                            cornerRadius={6}
                          />
                          <KonvaText
                            x={12}
                            y={12}
                            width={Math.max((element.width || 200) - 24, 80)}
                            text={`${element.type === 'image' ? '图片' : '视频'}素材\n${attrs.name || ''}`}
                            fontSize={14}
                            lineHeight={1.4}
                            fill="#333"
                          />
                        </Group>
                      );
                    }

                    return null;
                  })}

                  {activeElement && (
                    <Transformer
                      nodes={[stageRef.current?.findOne(`#${activeElement}`)]}
                      boundBoxFunc={(_, newBox) => {
                        if (newBox.width < 20) {
                          newBox.width = 20;
                        }
                        if (newBox.height < 20) {
                          newBox.height = 20;
                        }
                        return newBox;
                      }}
                    />
                  )}
                </Layer>
              </Stage>
            </div>
          )}
        </Content>

        <Sider width={360} style={{ background: '#fff', padding: 16, borderLeft: '1px solid #f0f0f0' }}>
          <Card title="AI助手">
            <Tabs defaultActiveKey="image">
              <TabPane tab="生成图片" key="image">
                <Form form={form} layout="vertical">
                  <Form.Item name="prompt" label="提示词">
                    <Input.TextArea
                      rows={4}
                      placeholder="请输入图片描述"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                    />
                  </Form.Item>
                  <Form.Item>
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      onClick={() => handleGenerate('image')}
                      loading={aiLoading}
                      block
                    >
                      生成图片
                    </Button>
                  </Form.Item>
                </Form>
              </TabPane>
              <TabPane tab="生成视频" key="video">
                <Form form={form} layout="vertical">
                  <Form.Item name="prompt" label="提示词">
                    <Input.TextArea
                      rows={4}
                      placeholder="请输入视频描述"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                    />
                  </Form.Item>
                  <Form.Item>
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      onClick={() => handleGenerate('video')}
                      loading={aiLoading}
                      block
                    >
                      生成视频
                    </Button>
                  </Form.Item>
                </Form>
              </TabPane>
            </Tabs>

            <Divider orientation="left">本次生成结果</Divider>
            <List
              size="small"
              dataSource={generatedMaterials}
              locale={{ emptyText: '生成后会显示在这里，可直接入画布' }}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button key="use" size="small" type="link" onClick={() => addMaterialToCanvas(item)}>
                      加入画布
                    </Button>,
                  ]}
                >
                  <Space>
                    {item.type === 'image' ? <PictureOutlined /> : <VideoCameraOutlined />}
                    <span style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.name}>
                      {item.name}
                    </span>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Sider>
      </Layout>
    </Layout>
  );
};

export default Canvas;
