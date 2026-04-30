import React, { useState } from 'react';
import { Card, Form, Input, Button, Tabs, Table, message, Typography, Popconfirm } from 'antd';
import { SettingOutlined, KeyOutlined, UserOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { TabPane } = Tabs;

interface Admin {
  id: number;
  username: string;
  name: string;
  created_at: string;
  last_login?: string;
}

const Config: React.FC = () => {
  const [form] = Form.useForm();
  const [apiForm] = Form.useForm();
  const [admins, setAdmins] = useState<Admin[]>([
    {
      id: 1,
      username: 'admin',
      name: '超级管理员',
      created_at: '2026-04-10 10:00:00',
      last_login: '2026-04-19 10:00:00'
    },
    {
      id: 2,
      username: 'operator',
      name: '操作员',
      created_at: '2026-04-11 11:00:00',
      last_login: '2026-04-18 15:00:00'
    }
  ]);

  // 处理保存系统参数
  const handleSaveSystemParams = () => {
    message.success('系统参数保存成功');
  };

  // 处理保存API密钥
  const handleSaveApiKeys = () => {
    message.success('API密钥保存成功');
  };

  // 处理添加管理员
  const handleAddAdmin = () => {
    message.success('管理员添加功能开发中');
  };

  // 处理删除管理员
  const handleDeleteAdmin = (adminId: number) => {
    setAdmins(admins.filter(admin => admin.id !== adminId));
    message.success('管理员已删除');
  };

  const adminColumns = [
    {
      title: '管理员ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
    },
    {
      title: '最后登录',
      dataIndex: 'last_login',
      key: 'last_login',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Admin) => (
        <div>
          <Button
            icon={<EditOutlined />}
            size="small"
            style={{ marginRight: 8 }}
          >
            编辑
          </Button>
          {record.id !== 1 && (
            <Popconfirm
              title="确定删除此管理员吗？"
              onConfirm={() => handleDeleteAdmin(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button icon={<DeleteOutlined />} size="small" danger>
                删除
              </Button>
            </Popconfirm>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>系统配置</Title>
      
      <Tabs defaultActiveKey="system">
        <TabPane tab={<><SettingOutlined /> 系统参数</>} key="system">
          <Card>
            <Form
              form={form}
              onFinish={handleSaveSystemParams}
              layout="vertical"
              initialValues={{
                siteName: '千域空间',
                dailyQuota: 100,
                maxProjectSize: 10,
                maxImageSize: 5,
                maxVideoSize: 50
              }}
            >
              <Form.Item
                name="siteName"
                label="站点名称"
                rules={[{ required: true, message: '请输入站点名称' }]}
              >
                <Input placeholder="请输入站点名称" />
              </Form.Item>
              <Form.Item
                name="dailyQuota"
                label="每日使用额度"
                rules={[{ required: true, message: '请输入每日使用额度' }]}
              >
                <Input type="number" placeholder="请输入每日使用额度" />
              </Form.Item>
              <Form.Item
                name="maxProjectSize"
                label="最大项目大小 (MB)"
                rules={[{ required: true, message: '请输入最大项目大小' }]}
              >
                <Input type="number" placeholder="请输入最大项目大小" />
              </Form.Item>
              <Form.Item
                name="maxImageSize"
                label="最大图片大小 (MB)"
                rules={[{ required: true, message: '请输入最大图片大小' }]}
              >
                <Input type="number" placeholder="请输入最大图片大小" />
              </Form.Item>
              <Form.Item
                name="maxVideoSize"
                label="最大视频大小 (MB)"
                rules={[{ required: true, message: '请输入最大视频大小' }]}
              >
                <Input type="number" placeholder="请输入最大视频大小" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  保存
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
        
        <TabPane tab={<><KeyOutlined /> API密钥</>} key="api">
          <Card>
            <Form
              form={apiForm}
              onFinish={handleSaveApiKeys}
              layout="vertical"
              initialValues={{
                aliyunApiKey: 'your-aliyun-api-key',
                aliyunApiSecret: 'your-aliyun-api-secret',
                emailApiKey: 'your-email-api-key',
                emailSender: 'no-reply@qianyu-space.com'
              }}
            >
              <Form.Item
                name="aliyunApiKey"
                label="阿里云API Key"
                rules={[{ required: true, message: '请输入阿里云API Key' }]}
              >
                <Input placeholder="请输入阿里云API Key" />
              </Form.Item>
              <Form.Item
                name="aliyunApiSecret"
                label="阿里云API Secret"
                rules={[{ required: true, message: '请输入阿里云API Secret' }]}
              >
                <Input.Password placeholder="请输入阿里云API Secret" />
              </Form.Item>
              <Form.Item
                name="emailApiKey"
                label="邮箱API Key"
                rules={[{ required: true, message: '请输入邮箱API Key' }]}
              >
                <Input placeholder="请输入邮箱API Key" />
              </Form.Item>
              <Form.Item
                name="emailSender"
                label="邮箱发件人"
                rules={[{ required: true, message: '请输入邮箱发件人' }]}
              >
                <Input placeholder="请输入邮箱发件人" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  保存
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
        
        <TabPane tab={<><UserOutlined /> 管理员管理</>} key="admin">
          <Card
            extra={
              <Button type="primary" onClick={handleAddAdmin}>
                添加管理员
              </Button>
            }
          >
            <Table
              columns={adminColumns}
              dataSource={admins}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Config;
