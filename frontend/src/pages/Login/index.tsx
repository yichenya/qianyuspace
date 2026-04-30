import React, { useState } from 'react';
import { Card, Tabs, Form, Input, Button, message, Space } from 'antd';
import { LockOutlined, UserOutlined, MailOutlined } from '@ant-design/icons';
import { authService } from '../../services';
import { useUserStore } from '../../store/userStore';
import { handleError } from '../../utils';

const { TabPane } = Tabs;

const Login: React.FC = () => {
  const [activeKey, setActiveKey] = useState<string>('login');
  const [loading, setLoading] = useState<boolean>(false);
  const { setUser, setToken } = useUserStore();
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();

  // 处理登录
  const handleLogin = async (values: any) => {
    setLoading(true);
    try {
      const response = await authService.login(values.email, values.password);
      setUser(response.user);
      setToken(response.access_token);
      message.success('登录成功');
    } catch (error) {
      message.error(handleError(error));
    } finally {
      setLoading(false);
    }
  };

  // 处理注册
  const handleRegister = async (values: any) => {
    setLoading(true);
    try {
      const response = await authService.register(values.email, values.password, values.nickname);
      setUser(response.user);
      setToken(response.access_token);
      message.success('注册成功');
    } catch (error) {
      message.error(handleError(error));
    } finally {
      setLoading(false);
    }
  };

  // 处理发送验证码
  const handleSendCode = async (email: string) => {
    try {
      await authService.sendCode(email);
      message.success('验证码已发送');
    } catch (error) {
      message.error(handleError(error));
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <Card title="千域空间" style={{ width: 400 }}>
        <Tabs activeKey={activeKey} onChange={setActiveKey}>
          <TabPane tab="登录" key="login">
            <Form form={loginForm} onFinish={handleLogin} layout="vertical">
              <Form.Item
                name="email"
                label="邮箱"
                rules={[{ required: true, message: '请输入邮箱' }, { type: 'email', message: '请输入正确的邮箱格式' }]}
              >
                <Input prefix={<MailOutlined />} placeholder="请输入邮箱" />
              </Form.Item>
              <Form.Item
                name="password"
                label="密码"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} block>
                  登录
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
          <TabPane tab="注册" key="register">
            <Form form={registerForm} onFinish={handleRegister} layout="vertical">
              <Form.Item
                name="email"
                label="邮箱"
                rules={[{ required: true, message: '请输入邮箱' }, { type: 'email', message: '请输入正确的邮箱格式' }]}
              >
                <Input prefix={<MailOutlined />} placeholder="请输入邮箱" />
              </Form.Item>
              <Form.Item
                name="password"
                label="密码"
                rules={[{ required: true, message: '请输入密码' }, { min: 8, message: '密码长度至少8位' }]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" />
              </Form.Item>
              <Form.Item
                name="nickname"
                label="昵称"
                rules={[{ required: true, message: '请输入昵称' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="请输入昵称" />
              </Form.Item>
              <Form.Item>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button
                    type="default"
                    onClick={() => {
                      const email = registerForm.getFieldValue('email');
                      if (email) {
                        handleSendCode(email);
                      } else {
                        message.error('请先输入邮箱');
                      }
                    }}
                  >
                    发送验证码
                  </Button>
                  <Button type="primary" htmlType="submit" loading={loading} block>
                    注册
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default Login;
