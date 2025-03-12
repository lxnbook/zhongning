import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';

// 导入页面组件
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TeachPlanGenerator from './pages/TeachPlanGenerator';
import ResourceCenter from './pages/ResourceCenter';
import DataAnalysis from './pages/DataAnalysis';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="teach-plan" element={<TeachPlanGenerator />} />
            <Route path="resources" element={<ResourceCenter />} />
            <Route path="analysis" element={<DataAnalysis />} />
          </Route>
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App; 