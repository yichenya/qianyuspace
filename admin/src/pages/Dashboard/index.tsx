import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Table, Typography, message } from 'antd';
import { AppstoreOutlined, DollarOutlined, PictureOutlined, ProjectOutlined, UserOutlined } from '@ant-design/icons';
import { adminService } from '../../services/admin';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState({ user_count: 0, project_count: 0, material_count: 0, task_count: 0, total_revenue: 0 });
  const [recentTasks, setRecentTasks] = useState<any[]>([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const response = await adminService.getDashboard();
      setStatistics(response.statistics || statistics);
      setRecentTasks(response.recent_tasks || []);
    } catch {
      message.error('加载仪表盘失败');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: '任务ID', dataIndex: 'id', key: 'id' },
    { title: '用户', dataIndex: 'user', key: 'user' },
    { title: '类型', dataIndex: 'type', key: 'type', render: (type: string) => type === 'image' ? '图片' : '视频' },
    { title: '提示词', dataIndex: 'prompt', key: 'prompt', ellipsis: true },
    { title: '状态', dataIndex: 'status', key: 'status' },
    { title: '消费', dataIndex: 'cost', key: 'cost', render: (cost: number) => `¥${Number(cost || 0).toFixed(2)}` },
    { title: '创建时间', dataIndex: 'created_at', key: 'created_at', render: (time: string) => time ? new Date(time).toLocaleString('zh-CN') : '-' },
  ];

  return (
    <div>
      <Title level={2}>仪表盘</Title>
      <Text type="secondary">实时汇总平台用户、项目、素材与生成消费。</Text>

      <Row gutter={16} style={{ marginTop: 24, marginBottom: 24 }}>
        <Col span={6}><Card><Statistic title="用户数量" value={statistics.user_count} prefix={<UserOutlined />} suffix="人" /></Card></Col>
        <Col span={6}><Card><Statistic title="项目数量" value={statistics.project_count} prefix={<ProjectOutlined />} suffix="个" /></Card></Col>
        <Col span={6}><Card><Statistic title="素材数量" value={statistics.material_count} prefix={<PictureOutlined />} suffix="个" /></Card></Col>
        <Col span={6}><Card><Statistic title="生成任务" value={statistics.task_count} prefix={<AppstoreOutlined />} suffix="个" /></Card></Col>
      </Row>

      <Card title="平台收入" style={{ marginBottom: 24 }}>
        <Statistic title="总消费金额" value={statistics.total_revenue} prefix={<DollarOutlined />} suffix="元" precision={2} valueStyle={{ color: '#0066cc' }} />
      </Card>

      <Card title="最近生成任务">
        <Table columns={columns} dataSource={recentTasks} rowKey="id" loading={loading} pagination={{ pageSize: 5 }} />
      </Card>
    </div>
  );
};

export default Dashboard;
