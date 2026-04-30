import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Input, Modal, Select, Space, Table, Typography, message } from 'antd';
import { EyeOutlined, LockOutlined, SearchOutlined } from '@ant-design/icons';
import { adminService } from '../../services/admin';

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

type UserStatus = 'active' | 'inactive';

interface UserRecord {
  id: string;
  email: string;
  nickname: string;
  avatar?: string;
  status: UserStatus;
  created_at: string;
  last_login?: string;
  total_spent: number;
  project_count: number;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await adminService.getUsers({ search: searchText, status: statusFilter || undefined });
      setUsers(response);
    } catch {
      message.error('加载用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => users.filter((user) => {
    const matchesSearch = user.email.includes(searchText) || user.nickname.includes(searchText);
    const matchesStatus = statusFilter ? user.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  }), [users, searchText, statusFilter]);

  const handleStatusChange = async (userId: string, newStatus: UserStatus) => {
    try {
      await adminService.updateUserStatus(userId, newStatus);
      setUsers(users.map((user) => user.id === userId ? { ...user, status: newStatus } : user));
      message.success('用户状态已更新');
    } catch {
      message.error('更新用户状态失败');
    }
  };

  const handleResetPassword = async (userId: string) => {
    try {
      await adminService.resetUserPassword(userId);
      message.success('密码已重置为默认密码：12345678');
    } catch {
      message.error('重置密码失败');
    }
  };

  const columns = [
    { title: '用户ID', dataIndex: 'id', key: 'id', width: 220, ellipsis: true },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    { title: '昵称', dataIndex: 'nickname', key: 'nickname' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (status: UserStatus) => status === 'active' ? <Text type="success">活跃</Text> : <Text type="danger">禁用</Text> },
    { title: '创建时间', dataIndex: 'created_at', key: 'created_at', render: (time: string) => time ? new Date(time).toLocaleString('zh-CN') : '-' },
    { title: '总消费', dataIndex: 'total_spent', key: 'total_spent', render: (spent: number) => `¥${Number(spent || 0).toFixed(2)}` },
    { title: '项目数', dataIndex: 'project_count', key: 'project_count' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: UserRecord) => (
        <Space>
          <Button icon={<EyeOutlined />} size="small" onClick={() => setSelectedUser(record)}>详情</Button>
          <Select value={record.status} style={{ width: 92 }} onChange={(value) => handleStatusChange(record.id, value as UserStatus)}>
            <Option value="active">活跃</Option>
            <Option value="inactive">禁用</Option>
          </Select>
          <Button icon={<LockOutlined />} size="small" onClick={() => handleResetPassword(record.id)}>重置密码</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>用户管理</Title>
      <Card style={{ marginBottom: 16 }}>
        <Space>
          <Search placeholder="搜索邮箱或昵称" style={{ width: 320 }} value={searchText} onChange={(e) => setSearchText(e.target.value)} prefix={<SearchOutlined />} onSearch={loadUsers} />
          <Select placeholder="筛选状态" style={{ width: 120 }} value={statusFilter || undefined} onChange={(value) => setStatusFilter(value || '')} allowClear>
            <Option value="active">活跃</Option>
            <Option value="inactive">禁用</Option>
          </Select>
          <Button type="primary" onClick={loadUsers}>查询</Button>
        </Space>
      </Card>
      <Card>
        <Table columns={columns} dataSource={filteredUsers} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
      </Card>
      <Modal title="用户详情" open={!!selectedUser} onCancel={() => setSelectedUser(null)} footer={null} width={600}>
        {selectedUser && (
          <Space direction="vertical" size={8}>
            <Text>用户ID：{selectedUser.id}</Text>
            <Text>邮箱：{selectedUser.email}</Text>
            <Text>昵称：{selectedUser.nickname}</Text>
            <Text>状态：{selectedUser.status === 'active' ? '活跃' : '禁用'}</Text>
            <Text>总消费：¥{Number(selectedUser.total_spent || 0).toFixed(2)}</Text>
            <Text>项目数：{selectedUser.project_count}</Text>
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default Users;
