import React from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { ConfigProvider, Layout, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import Canvas from './pages/Canvas/index';
import Home from './pages/Home/index';
import Login from './pages/Login/index';
import Materials from './pages/Materials/index';
import Profile from './pages/Profile/index';
import { useUserStore } from './store/userStore';

const { Content } = Layout;

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn } = useUserStore();
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
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
        <Layout className="q-app-shell">
          <Content className="q-app-content">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Home />
                  </PrivateRoute>
                }
              />
              <Route
                path="/canvas/:projectId"
                element={
                  <PrivateRoute>
                    <Canvas />
                  </PrivateRoute>
                }
              />
              <Route
                path="/materials"
                element={
                  <PrivateRoute>
                    <Materials />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Content>
        </Layout>
      </Router>
    </ConfigProvider>
  );
}

export default App;
