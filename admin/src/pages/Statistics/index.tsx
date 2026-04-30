import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Table, Typography, message } from 'antd';
import { BarChartOutlined, DollarOutlined, UserOutlined } from '@ant-design/icons';
import { adminService } from '../../services/admin';

const { Title, Text } = Typography;

const Statistics: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState({ total_revenue: 0, total_tasks: 0, avg_task_cost: 0, active_users: 0 });
  const [userConsumption, setUserConsumption] = useState<any[]>([]);
  const [revenueTrend, setRevenueTrend] = useState<any[]>([]);
  const [typeDistribution, setTypeDistribution] = useState<any[]>([]);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    setLoading(true);
    try {
      const response = await adminService.getStatistics();
      setStatistics(response.statistics || statistics);
      setUserConsumption(response.user_consumption || []);
      setRevenueTrend(response.revenue_trend || []);
      setTypeDistribution(response.type_distribution || []);
    } catch {
      message.error('加载统计数据失败');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: '用户ID', dataIndex: 'user_id', key: 'user_id', width: 220, ellipsis: true },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    { title: '总消费', dataIndex: 'total_spent', key: 'total_spent', render: (spent: number) => `¥${Number(spent || 0).toFixed(2)}` },
    { title: '任务数', dataIndex: 'total_tasks', key: 'total_tasks' },
    { title: '最后消费', dataIndex: 'last_consumption', key: 'last_consumption', render: (time: string) => time ? new Date(time).toLocaleString('zh-CN') : '-' },
  ];

  return (
    <div>
      <Title level={2}>消费统计</Title>
      <Text type="secondary">基于真实生成日志统计平台收入、活跃用户与消费排行。</Text>

      <Row gutter={16} style={{ marginTop: 24, marginBottom: 24 }}>
        <Col span={6}><Card><Statistic title="总收入" value={statistics.total_revenue} prefix={<DollarOutlined />} suffix="元" precision={2} valueStyle={{ color: '#0066cc' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="总任务数" value={statistics.total_tasks} prefix={<BarChartOutlined />} suffix="个" /></Card></Col>
        <Col span={6}><Card><Statistic title="平均任务消费" value={statistics.avg_task_cost} prefix={<DollarOutlined />} suffix="元" precision={2} /></Card></Col>
        <Col span={6}><Card><Statistic title="活跃用户" value={statistics.active_users} prefix={<UserOutlined />} suffix="人" /></Card></Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card title="近7天消费趋势">
            <Table size="small" dataSource={revenueTrend} rowKey="day" pagination={false} columns={[{ title: '日期', dataIndex: 'day' }, { title: '金额', dataIndex: 'amount', render: (v: number) => `¥${Number(v || 0).toFixed(2)}` }]} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="类型分布">
            <Table size="small" dataSource={typeDistribution} rowKey="name" pagination={false} columns={[{ title: '类型', dataIndex: 'name' }, { title: '数量', dataIndex: 'value' }]} />
          </Card>
        </Col>
      </Row>

      <Card title="用户消费排行">
        <Table columns={columns} dataSource={userConsumption} rowKey="user_id" loading={loading} pagination={{ pageSize: 10 }} />
      </Card>
    </div>
  );
};

export default Statistics;
