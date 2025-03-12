import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import { useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import PrivateRoute from './components/common/PrivateRoute';
import LoadingScreen from './components/common/LoadingScreen';

// 懒加载页面组件
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const TeachPlanList = lazy(() => import('./pages/teachPlan/TeachPlanList'));
const TeachPlanCreate = lazy(() => import('./pages/teachPlan/TeachPlanCreate'));
const TeachPlanDetail = lazy(() => import('./pages/teachPlan/TeachPlanDetail'));
const ResourceLibrary = lazy(() => import('./pages/resource/ResourceLibrary'));
const ResourceDetail = lazy(() => import('./pages/resource/ResourceDetail'));
const AIChat = lazy(() => import('./pages/ai/AIChat'));
const UserProfile = lazy(() => import('./pages/user/UserProfile'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const SystemSettings = lazy(() => import('./pages/admin/SystemSettings'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  const { isAuthenticated, checkAuth } = useAuth();
  
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <ThemeProvider>
      <ConfigProvider 
        locale={zhCN}
        theme={{
          algorithm: theme.defaultAlgorithm,
        }}
      >
        <Router>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route path="/" element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } />
              
              <Route path="/teach-plans" element={
                <PrivateRoute>
                  <TeachPlanList />
                </PrivateRoute>
              } />
              
              <Route path="/teach-plans/create" element={
                <PrivateRoute>
                  <TeachPlanCreate />
                </PrivateRoute>
              } />
              
              <Route path="/teach-plans/:id" element={
                <PrivateRoute>
                  <TeachPlanDetail />
                </PrivateRoute>
              } />
              
              <Route path="/resources" element={
                <PrivateRoute>
                  <ResourceLibrary />
                </PrivateRoute>
              } />
              
              <Route path="/resources/:id" element={
                <PrivateRoute>
                  <ResourceDetail />
                </PrivateRoute>
              } />
              
              <Route path="/ai-chat" element={
                <PrivateRoute>
                  <AIChat />
                </PrivateRoute>
              } />
              
              <Route path="/profile" element={
                <PrivateRoute>
                  <UserProfile />
                </PrivateRoute>
              } />
              
              <Route path="/admin/users" element={
                <PrivateRoute requiredRole="admin">
                  <UserManagement />
                </PrivateRoute>
              } />
              
              <Route path="/admin/settings" element={
                <PrivateRoute requiredRole="admin">
                  <SystemSettings />
                </PrivateRoute>
              } />
              
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </Suspense>
        </Router>
      </ConfigProvider>
    </ThemeProvider>
  );
}

export default App; 