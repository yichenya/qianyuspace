import React, { useEffect, useState } from 'react';
import { Button, Card, Empty, Form, Input, List, Modal, Space, Typography, message, Dropdown, Menu } from 'antd';
import { DeleteOutlined, EditOutlined, MoreOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { projectService } from '../../services';
import { useProjectStore } from '../../store/projectStore';
import { useUserStore } from '../../store/userStore';
import { Project } from '../../types';
import { formatDate, handleError } from '../../utils';

const { Title, Text, Paragraph } = Typography;

const Home: React.FC = () => {
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const { projects, setProjects, addProject, updateProject, deleteProject } = useProjectStore();
  const { user, logout } = useUserStore();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const response = await projectService.getList<Project[]>();
      setProjects(response);
    } catch (error) {
      message.error(handleError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (values: { name: string }) => {
    setLoading(true);
    try {
      const response = await projectService.create<Project>(values.name);
      addProject(response);
      setCreateModalVisible(false);
      form.resetFields();
      message.success('项目创建成功');
    } catch (error) {
      message.error(handleError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProject = async (values: { name: string; cover_image?: string }) => {
    if (!editingProject) return;
    setLoading(true);
    try {
      const response = await projectService.update<Project>(editingProject.id, values);
      updateProject(response);
      setEditingProject(null);
      editForm.resetFields();
      message.success('项目已更新');
    } catch (error) {
      message.error(handleError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    setLoading(true);
    try {
      await projectService.delete(projectId);
      deleteProject(projectId);
      message.success('项目删除成功');
    } catch (error) {
      message.error(handleError(error));
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    editForm.setFieldsValue({ name: project.name, cover_image: project.cover_image });
  };

  const projectMenu = (project: Project) => (
    <Menu>
      <Menu.Item key="edit" onClick={() => openEditModal(project)} icon={<EditOutlined />}>
        编辑项目
      </Menu.Item>
      <Menu.Item key="delete" danger onClick={() => handleDeleteProject(project.id)} icon={<DeleteOutlined />}>
        删除项目
      </Menu.Item>
    </Menu>
  );

  const userMenu = (
    <Menu>
      <Menu.Item key="profile">
        <Link to="/profile">个人中心</Link>
      </Menu.Item>
      <Menu.Item key="logout" danger onClick={logout}>
        退出登录
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="q-page">
      <section className="q-hero">
        <div className="q-topbar" style={{ margin: '-64px -72px 56px', color: '#1d1d1f' }}>
          <Text strong>千域空间</Text>
          <Space>
            <Link to="/materials"><Button>素材库</Button></Link>
            <Link to="/profile"><Button>个人中心</Button></Link>
            <Dropdown overlay={userMenu} placement="bottomRight">
              <Button type="text" icon={<UserOutlined />}>{user?.nickname || user?.email}</Button>
            </Dropdown>
          </Space>
        </div>
        <Title className="q-hero-title">让每一个空间创意，都成为作品。</Title>
        <Paragraph className="q-hero-subtitle">
          创建项目、在画布中组织素材，用 AI 生成图片与视频，并把生成结果自动沉淀到你的素材库。
        </Paragraph>
        <Space size={12} wrap>
          <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => setCreateModalVisible(true)}>
            新建项目
          </Button>
          <Link to="/materials"><Button size="large">查看素材库</Button></Link>
        </Space>
      </section>

      <section className="q-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <Title level={3} style={{ marginBottom: 4 }}>我的项目</Title>
            <Text type="secondary">选择一个项目进入画布继续创作。</Text>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalVisible(true)}>
            新建项目
          </Button>
        </div>

        <List
          grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 3, xl: 3, xxl: 4 }}
          dataSource={projects}
          loading={loading}
          locale={{ emptyText: <Empty description="暂无项目，点击新建项目开始创作" /> }}
          renderItem={(project) => (
            <List.Item>
              <Card
                className="q-tile"
                hoverable
                cover={
                  project.cover_image ? (
                    <img alt={project.name} src={project.cover_image} style={{ height: 180, objectFit: 'cover' }} />
                  ) : (
                    <div style={{ height: 180, background: '#fafafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Text type="secondary">No Cover</Text>
                    </div>
                  )
                }
                actions={[
                  <Link key="enter" to={`/canvas/${project.id}`}><Button type="link">进入画布</Button></Link>,
                  <Dropdown key="more" overlay={projectMenu(project)} placement="bottomRight">
                    <Button type="text" icon={<MoreOutlined />} />
                  </Dropdown>,
                ]}
              >
                <Card.Meta title={project.name} description={formatDate(project.created_at, 'YYYY-MM-DD HH:mm')} />
              </Card>
            </List.Item>
          )}
        />
      </section>

      <Modal title="新建项目" open={isCreateModalVisible} onCancel={() => setCreateModalVisible(false)} footer={null}>
        <Form form={form} onFinish={handleCreateProject} layout="vertical">
          <Form.Item name="name" label="项目名称" rules={[{ required: true, message: '请输入项目名称' }, { max: 50, message: '项目名称最多50个字符' }]}>
            <Input placeholder="例如：春日花园空间" />
          </Form.Item>
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setCreateModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit" loading={loading}>创建</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="编辑项目" open={!!editingProject} onCancel={() => setEditingProject(null)} footer={null}>
        <Form form={editForm} onFinish={handleUpdateProject} layout="vertical">
          <Form.Item name="name" label="项目名称" rules={[{ required: true, message: '请输入项目名称' }, { max: 50, message: '项目名称最多50个字符' }]}>
            <Input placeholder="请输入项目名称" />
          </Form.Item>
          <Form.Item name="cover_image" label="封面URL">
            <Input placeholder="可选，输入封面图片URL" />
          </Form.Item>
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setEditingProject(null)}>取消</Button>
              <Button type="primary" htmlType="submit" loading={loading}>保存</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Home;
