import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Input, Modal, Popconfirm, Select, Space, Table, Typography, message } from 'antd';
import { DeleteOutlined, EyeOutlined, PictureOutlined, SearchOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { adminService } from '../../services/admin';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

interface Material {
  id: number;
  user_id: string;
  user_email: string;
  type: 'image' | 'video';
  url: string;
  name: string;
  width?: number;
  height?: number;
  duration?: number;
  created_at: string;
}

const Materials: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    setLoading(true);
    try {
      const response = await adminService.getMaterials({ search: searchText, type: typeFilter || undefined });
      setMaterials(response);
    } catch {
      message.error('加载素材列表失败');
    } finally {
      setLoading(false);
    }
  };

  const filteredMaterials = useMemo(() => materials.filter((material) => {
    const matchesSearch = material.name.includes(searchText) || material.user_email.includes(searchText);
    const matchesType = typeFilter ? material.type === typeFilter : true;
    return matchesSearch && matchesType;
  }), [materials, searchText, typeFilter]);

  const handleDeleteMaterial = async (materialId: number) => {
    try {
      await adminService.deleteMaterial(materialId);
      setMaterials(materials.filter((material) => material.id !== materialId));
      message.success('素材已删除');
    } catch {
      message.error('删除素材失败');
    }
  };

  const columns = [
    { title: '素材ID', dataIndex: 'id', key: 'id' },
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '类型', dataIndex: 'type', key: 'type', render: (type: string) => type === 'image' ? <Text type="success"><PictureOutlined /> 图片</Text> : <Text type="warning"><VideoCameraOutlined /> 视频</Text> },
    { title: '用户', dataIndex: 'user_email', key: 'user_email' },
    { title: '尺寸/时长', key: 'size', render: (_: any, record: Material) => record.type === 'image' ? `${record.width || '-'} × ${record.height || '-'}` : `${record.duration || '-'}秒` },
    { title: '创建时间', dataIndex: 'created_at', key: 'created_at', render: (time: string) => time ? new Date(time).toLocaleString('zh-CN') : '-' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Material) => (
        <Space>
          <Button icon={<EyeOutlined />} size="small" onClick={() => setSelectedMaterial(record)}>详情</Button>
          <Popconfirm title="确定删除此素材吗？" onConfirm={() => handleDeleteMaterial(record.id)} okText="确定" cancelText="取消">
            <Button icon={<DeleteOutlined />} size="small" danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>素材管理</Title>
      <Card style={{ marginBottom: 16 }}>
        <Space>
          <Search placeholder="搜索素材名称或用户邮箱" style={{ width: 320 }} value={searchText} onChange={(e) => setSearchText(e.target.value)} prefix={<SearchOutlined />} onSearch={loadMaterials} />
          <Select placeholder="筛选类型" style={{ width: 120 }} value={typeFilter || undefined} onChange={(value) => setTypeFilter(value || '')} allowClear>
            <Option value="image">图片</Option>
            <Option value="video">视频</Option>
          </Select>
          <Button type="primary" onClick={loadMaterials}>查询</Button>
        </Space>
      </Card>
      <Card>
        <Table columns={columns} dataSource={filteredMaterials} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
      </Card>
      <Modal title="素材详情" open={!!selectedMaterial} onCancel={() => setSelectedMaterial(null)} footer={null} width={800}>
        {selectedMaterial && (
          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            {selectedMaterial.type === 'image' ? <img src={selectedMaterial.url} alt={selectedMaterial.name} style={{ maxWidth: '100%', maxHeight: 420, objectFit: 'contain' }} /> : <Text>视频地址：{selectedMaterial.url}</Text>}
            <Text strong>{selectedMaterial.name}</Text>
            <Text>用户：{selectedMaterial.user_email}</Text>
            <Text>创建时间：{new Date(selectedMaterial.created_at).toLocaleString('zh-CN')}</Text>
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default Materials;
