import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Input, Modal, Popconfirm, Space, Table, Tag, Typography, message } from 'antd';
import { DeleteOutlined, EyeOutlined, PlayCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { AdminProject, adminService } from '../../services/admin';

const { Title, Text } = Typography;
const { Search } = Input;

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedProject, setSelectedProject] = useState<AdminProject | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const response = await adminService.getProjects({ search: searchText });
      setProjects(response);
    } catch {
      message.error('加载项目列表失败');
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = useMemo(() => projects.filter((project) =>
    project.name.toLowerCase().includes(searchText.toLowerCase()) || project.user_email.toLowerCase().includes(searchText.toLowerCase())
  ), [projects, searchText]);

  const handleDeleteProject = async (projectId: string) => {
    try {
      await adminService.deleteProject(projectId);
      setProjects(projects.filter((project) => project.id !== projectId));
      message.success('项目已删除');
    } catch {
      message.error('删除项目失败');
    }
  };

  const columns = [
    { title: '项目ID', dataIndex: 'id', key: 'id', width: 220, ellipsis: true },
    { title: '项目名称', dataIndex: 'name', key: 'name' },
    { title: '用户', dataIndex: 'user_email', key: 'user_email' },
    { title: '封面', dataIndex: 'cover_image', key: 'cover_image', render: (cover: string) => cover ? <img src={cover} alt="cover" style={{ width: 56, height: 40, objectFit: 'cover', borderRadius: 8 }} /> : <Tag>无封面</Tag> },
    { title: '创建时间', dataIndex: 'created_at', key: 'created_at', render: (time: string) => time ? new Date(time).toLocaleString('zh-CN') : '-' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: AdminProject) => (
        <Space>
          <Button size="small" icon={<PlayCircleOutlined />} onClick={() => navigate(`/canvas/${record.id}`)}>打开画布</Button>
          <Button size="small" icon={<EyeOutlined />} onClick={() => setSelectedProject(record)}>详情</Button>
          <Popconfirm title="确定删除此项目吗？" onConfirm={() => handleDeleteProject(record.id)} okText="确定" cancelText="取消">
            <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>项目管理</Title>
      <Card style={{ marginBottom: 16 }}>
        <Space>
          <Search placeholder="搜索项目名称或用户邮箱" style={{ width: 320 }} value={searchText} onChange={(e) => setSearchText(e.target.value)} prefix={<SearchOutlined />} onSearch={loadProjects} />
          <Button type="primary" onClick={loadProjects}>刷新</Button>
        </Space>
      </Card>
      <Card>
        <Table columns={columns} dataSource={filteredProjects} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
      </Card>
      <Modal title="项目详情" open={!!selectedProject} onCancel={() => setSelectedProject(null)} footer={null} width={640}>
        {selectedProject && (
          <Space direction="vertical" size={8}>
            <Text strong>{selectedProject.name}</Text>
            <Text type="secondary">项目ID：{selectedProject.id}</Text>
            <Text>用户：{selectedProject.user_email}</Text>
            <Text>创建时间：{new Date(selectedProject.created_at).toLocaleString('zh-CN')}</Text>
            <Text>更新时间：{new Date(selectedProject.updated_at).toLocaleString('zh-CN')}</Text>
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default Projects;
