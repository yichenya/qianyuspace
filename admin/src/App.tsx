import React from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes, Link, useLocation } from 'react-router-dom';
import { Button, ConfigProvider, Layout, Menu, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import {
  AppstoreOutlined,
  BarChartOutlined,
  DashboardOutlined,
  LogoutOutlined,
  PictureOutlined,
  ProjectOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import Canvas from './pages/Canvas/index';
import Config from './pages/Config/index';
import Dashboard from './pages/Dashboard/index';
import Login from './pages/Login/index';
import Materials from './pages/Materials/index';
import Projects from './pages/Projects/index';
import Statistics from './pages/Statistics/index';
import Tasks from './pages/Tasks/index';
import Users from './pages/Users/index';
import { useAuthStore } from './store/authStore';

const { Header, Sider, Content } = Layout;

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn } = useAuthStore();
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AdminLayout: React.FC = () => {
  const { logout } = useAuthStore();
  const [collapsed, setCollapsed] = React.useState(false);
  const location = useLocation();
  const selectedKey = location.pathname.split('/')[1] || 'dashboard';

  return (
    <PrivateRoute>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
          <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600 }}>
            {collapsed ? '千域' : '千域空间'}
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[selectedKey]}
            items={[
              { key: 'dashboard', icon: <DashboardOutlined />, label: <Link to="/">仪表盘</Link> },
              { key: 'users', icon: <UserOutlined />, label: <Link to="/users">用户管理</Link> },
              { key: 'projects', icon: <ProjectOutlined />, label: <Link to="/projects">项目管理</Link> },
              { key: 'materials', icon: <PictureOutlined />, label: <Link to="/materials">素材管理</Link> },
              { key: 'tasks', icon: <AppstoreOutlined />, label: <Link to="/tasks">生成任务</Link> },
              { key: 'statistics', icon: <BarChartOutlined />, label: <Link to="/statistics">消费统计</Link> },
              { key: 'config', icon: <SettingOutlined />, label: <Link to="/config">系统配置</Link> },
            ]}
          />
        </Sider>
        <Layout>
          <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingInline: 24 }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#fff' }}>千域空间管理系统</div>
            <Button type="text" icon={<LogoutOutlined />} style={{ color: '#fff' }} onClick={logout}>退出登录</Button>
          </Header>
          <Content style={{ padding: 24, minHeight: 280 }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/users" element={<Users />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/canvas/:projectId" element={<Canvas />} />
              <Route path="/materials" element={<Materials />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/statistics" element={<Statistics />} />
              <Route path="/config" element={<Config />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </PrivateRoute>
  );
};

function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#0066cc',
          borderRadius: 11,
          fontFamily: 'SF Pro Text, SF Pro Display, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
        },
      }}
    >
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<AdminLayout />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;
