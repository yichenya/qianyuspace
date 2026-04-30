import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, List, message, Space, Typography, Tabs, Modal, Popconfirm } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined, StarOutlined, StarFilled, VideoCameraOutlined } from '@ant-design/icons';
import { materialService } from '../../services';
import { useMaterialStore } from '../../store/materialStore';
import { formatDate, handleError } from '../../utils';
import { Material } from '../../types';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const Materials: React.FC = () => {
  const [activeKey, setActiveKey] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(false);
  const [previewVisible, setPreviewVisible] = useState<boolean>(false);
  const [previewMaterial, setPreviewMaterial] = useState<Material | null>(null);
  const { 
    materials, 
    favoriteMaterials, 
    setMaterials, 
    setFavoriteMaterials, 
    deleteMaterial, 
    addFavoriteMaterial, 
    removeFavoriteMaterial 
  } = useMaterialStore();

  // 加载素材列表
  useEffect(() => {
    loadMaterials();
    loadFavoriteMaterials();
  }, []);

  const loadMaterials = async () => {
    setLoading(true);
    try {
      const response = await materialService.getList();
      setMaterials(response);
    } catch (error) {
      message.error(handleError(error));
    } finally {
      setLoading(false);
    }
  };

  const loadFavoriteMaterials = async () => {
    try {
      const response = await materialService.getFavorites();
      setFavoriteMaterials(response);
    } catch (error) {
      message.error(handleError(error));
    }
  };

  // 处理删除素材
  const handleDeleteMaterial = async (materialId: number) => {
    setLoading(true);
    try {
      await materialService.delete(materialId);
      deleteMaterial(materialId);
      message.success('素材删除成功');
    } catch (error) {
      message.error(handleError(error));
    } finally {
      setLoading(false);
    }
  };

  // 处理收藏/取消收藏
  const handleFavorite = async (material: Material, isFavorite: boolean) => {
    try {
      if (isFavorite) {
        await materialService.favorite(material.id);
        addFavoriteMaterial(material);
        message.success('素材已收藏');
      } else {
        await materialService.unfavorite(material.id);
        removeFavoriteMaterial(material.id);
        message.success('收藏已取消');
      }
    } catch (error) {
      message.error(handleError(error));
    }
  };

  // 检查素材是否已收藏
  const isFavorite = (materialId: number): boolean => {
    return favoriteMaterials.some(material => material.id === materialId);
  };

  // 渲染素材项
  const renderMaterialItem = (material: Material) => {
    const fav = isFavorite(material.id);
    return (
      <List.Item key={material.id}>
        <Card
          hoverable
          cover={
            material.type === 'image' ? (
              <img 
                alt={material.name} 
                src={material.url} 
                style={{ height: 150, objectFit: 'cover', cursor: 'pointer' }}
                onClick={() => {
                  setPreviewMaterial(material);
                  setPreviewVisible(true);
                }}
              />
            ) : (
              <div style={{ height: 150, backgroundColor: '#f0f0f0', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }} onClick={() => {
                setPreviewMaterial(material);
                setPreviewVisible(true);
              }}>
                <VideoCameraOutlined style={{ fontSize: 48, color: '#999' }} />
              </div>
            )
          }
          actions={[
            <Button
              key="favorite"
              icon={fav ? <StarFilled style={{ color: '#fadb14' }} /> : <StarOutlined />}
              onClick={() => handleFavorite(material, !fav)}
            />,
            <Popconfirm
              title="确定删除此素材吗？"
              onConfirm={() => handleDeleteMaterial(material.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button key="delete" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          ]}
        >
          <Card.Meta 
            title={material.name} 
            description={
              <Space direction="vertical" size={4}>
                <Text type="secondary">{material.type === 'image' ? '图片' : '视频'}</Text>
                <Text type="secondary">{formatDate(material.created_at, 'YYYY-MM-DD HH:mm')}</Text>
                {material.type === 'image' && (
                  <Text type="secondary">{material.width} × {material.height}</Text>
                )}
                {material.type === 'video' && (
                  <Text type="secondary">{material.duration}秒</Text>
                )}
              </Space>
            } 
          />
        </Card>
      </List.Item>
    );
  };

  return (
    <div>
      {/* 顶部导航 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Space>
          <Link to="/">
            <Button icon={<ArrowLeftOutlined />}>返回首页</Button>
          </Link>
          <Title level={2}>素材库</Title>
        </Space>
      </div>

      {/* 素材标签页 */}
      <Tabs activeKey={activeKey} onChange={setActiveKey} style={{ marginBottom: 16 }}>
        <TabPane tab="全部素材" key="all" />
        <TabPane tab="收藏素材" key="favorites" />
        <TabPane tab="图片" key="image" />
        <TabPane tab="视频" key="video" />
      </Tabs>

      {/* 素材列表 */}
      <List
        grid={{ gutter: 16, column: 4 }}
        dataSource={
          activeKey === 'all' ? materials :
          activeKey === 'favorites' ? favoriteMaterials :
          activeKey === 'image' ? materials.filter(m => m.type === 'image') :
          materials.filter(m => m.type === 'video')
        }
        loading={loading}
        renderItem={renderMaterialItem}
        locale={{ emptyText: '暂无素材' }}
      />

      {/* 素材预览模态框 */}
      <Modal
        title={previewMaterial?.name}
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width={800}
      >
        {previewMaterial && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {previewMaterial.type === 'image' ? (
              <img 
                src={previewMaterial.url} 
                alt={previewMaterial.name} 
                style={{ maxWidth: '100%', maxHeight: 500 }}
              />
            ) : (
              <div style={{ width: '100%', height: 400, backgroundColor: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <VideoCameraOutlined style={{ fontSize: 64, color: '#fff' }} />
                <Text style={{ color: '#fff', marginLeft: 16 }}>视频预览</Text>
              </div>
            )}
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <Text>{previewMaterial.type === 'image' ? '图片' : '视频'}</Text>
              <Text style={{ marginLeft: 16 }}>{formatDate(previewMaterial.created_at, 'YYYY-MM-DD HH:mm')}</Text>
              {previewMaterial.type === 'image' && (
                <Text style={{ marginLeft: 16 }}>{previewMaterial.width} × {previewMaterial.height}</Text>
              )}
              {previewMaterial.type === 'video' && (
                <Text style={{ marginLeft: 16 }}>{previewMaterial.duration}秒</Text>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Materials;
