import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Input, Modal, Popconfirm, Select, Space, Table, Typography, message } from 'antd';
import { DeleteOutlined, EyeOutlined, PictureOutlined, SearchOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { adminService } from '../../services/admin';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

interface Task {
  id: number;
  user_id: string;
  user_email: string;
  type: 'image' | 'video';
  prompt: string;
  status: 'pending' | 'processing' | 'success' | 'failed';
  charge_amount: number;
  created_at: string;
  completed_at?: string;
  duration?: number;
  image_count?: number;
}

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const response = await adminService.getTasks({ search: searchText, type: typeFilter || undefined, status: statusFilter || undefined });
      setTasks(response);
    } catch {
      message.error('加载任务列表失败');
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = useMemo(() => tasks.filter((task) => {
    const matchesSearch = task.prompt.includes(searchText) || task.user_email.includes(searchText);
    const matchesType = typeFilter ? task.type === typeFilter : true;
    const matchesStatus = statusFilter ? task.status === statusFilter : true;
    return matchesSearch && matchesType && matchesStatus;
  }), [tasks, searchText, typeFilter, statusFilter]);

  const handleCancelTask = async (taskId: number) => {
    try {
      await adminService.cancelTask(taskId);
      setTasks(tasks.map((task) => task.id === taskId ? { ...task, status: 'failed' } : task));
      message.success('任务已取消');
    } catch {
      message.error('取消任务失败');
    }
  };

  const renderStatus = (taskStatus: string) => {
    const textMap: Record<string, string> = { success: '成功', processing: '处理中', failed: '失败', pending: '待处理' };
    const typeMap: Record<string, any> = { success: 'success', processing: 'warning', failed: 'danger', pending: undefined };
    return <Text type={typeMap[taskStatus]}>{textMap[taskStatus] || taskStatus}</Text>;
  };

  const columns = [
    { title: '任务ID', dataIndex: 'id', key: 'id' },
    { title: '类型', dataIndex: 'type', key: 'type', render: (type: string) => type === 'image' ? <Text type="success"><PictureOutlined /> 图片</Text> : <Text type="warning"><VideoCameraOutlined /> 视频</Text> },
    { title: '用户', dataIndex: 'user_email', key: 'user_email' },
    { title: '提示词', dataIndex: 'prompt', key: 'prompt', ellipsis: true },
    { title: '状态', dataIndex: 'status', key: 'status', render: renderStatus },
    { title: '消费', dataIndex: 'charge_amount', key: 'charge_amount', render: (amount: number) => `¥${Number(amount || 0).toFixed(2)}` },
    { title: '创建时间', dataIndex: 'created_at', key: 'created_at', render: (time: string) => time ? new Date(time).toLocaleString('zh-CN') : '-' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Task) => (
        <Space>
          <Button icon={<EyeOutlined />} size="small" onClick={() => setSelectedTask(record)}>详情</Button>
          {(record.status === 'pending' || record.status === 'processing') && (
            <Popconfirm title="确定取消此任务吗？" onConfirm={() => handleCancelTask(record.id)} okText="确定" cancelText="取消">
              <Button icon={<DeleteOutlined />} size="small" danger>取消</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>生成任务管理</Title>
      <Card style={{ marginBottom: 16 }}>
        <Space>
          <Search placeholder="搜索提示词或用户邮箱" style={{ width: 320 }} value={searchText} onChange={(e) => setSearchText(e.target.value)} prefix={<SearchOutlined />} onSearch={loadTasks} />
          <Select placeholder="筛选类型" style={{ width: 120 }} value={typeFilter || undefined} onChange={(value) => setTypeFilter(value || '')} allowClear>
            <Option value="image">图片</Option>
            <Option value="video">视频</Option>
          </Select>
          <Select placeholder="筛选状态" style={{ width: 120 }} value={statusFilter || undefined} onChange={(value) => setStatusFilter(value || '')} allowClear>
            <Option value="pending">待处理</Option>
            <Option value="processing">处理中</Option>
            <Option value="success">成功</Option>
            <Option value="failed">失败</Option>
          </Select>
          <Button type="primary" onClick={loadTasks}>查询</Button>
        </Space>
      </Card>
      <Card>
        <Table columns={columns} dataSource={filteredTasks} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
      </Card>
      <Modal title="任务详情" open={!!selectedTask} onCancel={() => setSelectedTask(null)} footer={null} width={640}>
        {selectedTask && (
          <Space direction="vertical" size={8}>
            <Text>任务ID：{selectedTask.id}</Text>
            <Text>用户：{selectedTask.user_email}</Text>
            <Text>状态：{renderStatus(selectedTask.status)}</Text>
            <Text>消费：¥{Number(selectedTask.charge_amount || 0).toFixed(2)}</Text>
            <Text>提示词：{selectedTask.prompt}</Text>
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default Tasks;
