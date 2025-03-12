import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  UserOutlined,
  BookOutlined,
  DatabaseOutlined,
  BarChartOutlined,
  LogoutOutlined,
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>个人信息</Menu.Item>
      <Menu.Item key="logout" icon={<LogoutOutlined />}>退出登录</Menu.Item>
    </Menu>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="logo" style={{ height: 64, margin: 16, background: 'rgba(255, 255, 255, 0.2)' }} />
        <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
          <Menu.Item key="1" icon={<UserOutlined />} onClick={() => navigate('/')}>
            工作台
          </Menu.Item>
          <Menu.Item key="2" icon={<BookOutlined />} onClick={() => navigate('/teach-plan')}>
            教案生成
          </Menu.Item>
          <Menu.Item key="3" icon={<DatabaseOutlined />} onClick={() => navigate('/resources')}>
            资源中心
          </Menu.Item>
          <Menu.Item key="4" icon={<BarChartOutlined />} onClick={() => navigate('/analysis')}>
            数据分析
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout className="site-layout">
        <Header className="site-layout-background" style={{ padding: 0, background: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px' }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: '16px', width: 64, height: 64 }}
            />
            <Dropdown overlay={userMenu} placement="bottomRight">
              <div style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} />
                <span style={{ marginLeft: 8 }}>管理员</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content
          className="site-layout-background"
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: '#fff',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout; 