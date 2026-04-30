import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Tabs, Avatar, Form, Input, message, Space, Typography, List, Statistic, Table } from 'antd';
import { ArrowLeftOutlined, UserOutlined, CreditCardOutlined, TrophyOutlined, EditOutlined } from '@ant-design/icons';
import { profileService, usageService } from '../../services';
import { useUserStore } from '../../store/userStore';
import { useUsageStore } from '../../store/usageStore';
import { formatDate, handleError } from '../../utils';
import { Badge } from '../../types';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const Profile: React.FC = () => {
  const [activeKey, setActiveKey] = useState<string>('info');
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const { user, setUser } = useUserStore();
  const { usageQuota, usageStats, consumptionHistory, setUsageQuota, setUsageStats, setConsumptionHistory } = useUsageStore();
  const [badges, setBadges] = useState<Badge[]>([]);

  // 加载用户信息和使用统计
  useEffect(() => {
    loadUserInfo();
    loadUsageData();
    loadBadges();
  }, []);

  const loadUserInfo = async () => {
    setLoading(true);
    try {
      const response = await profileService.getInfo();
      setUser(response);
    } catch (error) {
      message.error(handleError(error));
    } finally {
      setLoading(false);
    }
  };

  const loadUsageData = async () => {
    try {
      // 加载使用额度
      const quotaResponse = await usageService.getQuota();
      setUsageQuota(quotaResponse);
      
      // 加载使用统计
      const statsResponse = await usageService.getStats();
      setUsageStats(statsResponse);
      
      // 加载消费历史
      const historyResponse = await usageService.getHistory();
      setConsumptionHistory(historyResponse);
    } catch (error) {
      message.error(handleError(error));
    }
  };

  const loadBadges = async () => {
    try {
      const response = await profileService.getBadges();
      setBadges(response);
    } catch (error) {
      message.error(handleError(error));
    }
  };

  // 处理更新用户信息
  const handleUpdateInfo = async (values: any) => {
    setLoading(true);
    try {
      const response = await profileService.updateInfo(values);
      setUser(response);
      message.success('个人信息更新成功');
    } catch (error) {
      message.error(handleError(error));
    } finally {
      setLoading(false);
    }
  };

  // 消费历史表格列
  const columns = [
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => type === 'image' ? '图片' : '视频',
    },
    {
      title: '提示词',
      dataIndex: 'prompt',
      key: 'prompt',
      ellipsis: true,
    },
    {
      title: '消费金额',
      dataIndex: 'charge_amount',
      key: 'charge_amount',
      render: (amount: number | string) => `¥${Number(amount || 0).toFixed(2)}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        switch (status) {
          case 'success': return '成功';
          case 'failed': return '失败';
          case 'pending': return '待处理';
          case 'processing': return '处理中';
          default: return status;
        }
      },
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time: string) => formatDate(time, 'YYYY-MM-DD HH:mm'),
    },
  ];

  return (
    <div>
      {/* 顶部导航 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Space>
          <Link to="/">
            <Button icon={<ArrowLeftOutlined />}>返回首页</Button>
          </Link>
          <Title level={2}>个人中心</Title>
        </Space>
      </div>

      {/* 个人信息卡片 */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar size={80} icon={<UserOutlined />} style={{ marginRight: 24 }} />
          <div>
            <Title level={4}>{user?.nickname}</Title>
            <Text type="secondary">{user?.email}</Text>
          </div>
        </div>
      </Card>

      {/* 标签页 */}
      <Tabs activeKey={activeKey} onChange={setActiveKey}>
        <TabPane tab="个人信息" key="info">
          <Card title="编辑个人信息">
            <Form
              form={form}
              onFinish={handleUpdateInfo}
              layout="vertical"
              initialValues={{ nickname: user?.nickname, avatar: user?.avatar }}
            >
              <Form.Item
                name="nickname"
                label="昵称"
                rules={[{ required: true, message: '请输入昵称' }, { max: 50, message: '昵称最多50个字符' }]}
              >
                <Input placeholder="请输入昵称" />
              </Form.Item>
              <Form.Item
                name="avatar"
                label="头像URL"
              >
                <Input placeholder="请输入头像URL" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  保存
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
        <TabPane tab="使用统计" key="usage">
          <Card title="使用统计">
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              {/* 统计卡片 */}
              <Space size={16} style={{ width: '100%', justifyContent: 'space-between' }}>
                <Statistic
                  title="今日额度"
                  value={usageQuota?.daily_quota || 0}
                  suffix={`/ ${usageQuota?.used_today || 0}已用`}
                  prefix={<CreditCardOutlined />}
                />
                <Statistic
                  title="总生成次数"
                  value={usageStats?.total_generations || 0}
                  prefix={<EditOutlined />}
                />
                <Statistic
                  title="总消费"
                  value={usageStats?.total_spent || 0}
                  suffix="元"
                  prefix={<CreditCardOutlined />}
                />
              </Space>
              
              {/* 消费历史 */}
              <div>
                <Title level={5}>消费历史</Title>
                <Table
                  columns={columns}
                  dataSource={consumptionHistory}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              </div>
            </Space>
          </Card>
        </TabPane>
        <TabPane tab="我的徽章" key="badges">
          <Card title="徽章列表">
            <List
              grid={{ gutter: 16, column: 4 }}
              dataSource={badges}
              renderItem={(badge) => (
                <List.Item>
                  <Card
                    hoverable
                    cover={
                      badge.icon ? (
                        <img alt={badge.name} src={badge.icon} style={{ height: 100, objectFit: 'cover' }} />
                      ) : (
                        <div style={{ height: 100, backgroundColor: '#f0f0f0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          <TrophyOutlined style={{ fontSize: 48, color: '#fadb14' }} />
                        </div>
                      )
                    }
                  >
                    <Card.Meta title={badge.name} description={badge.description} />
                  </Card>
                </List.Item>
              )}
              locale={{ emptyText: '暂无徽章' }}
            />
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Profile;
