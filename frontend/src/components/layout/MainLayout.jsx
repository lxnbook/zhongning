import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Badge, Drawer, Space, Typography } from 'antd';
import { 
  MenuUnfoldOutlined, 
  MenuFoldOutlined, 
  DashboardOutlined, 
  FileTextOutlined, 
  BookOutlined, 
  MessageOutlined, 
  UserOutlined, 
  SettingOutlined, 
  LogoutOutlined, 
  BellOutlined, 
  TeamOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import NotificationList from '../notification/NotificationList';
import logo from '../../assets/images/logo.png';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const MainLayout = ({ children, selectedKey }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileView, setMobileView] = useState(window.innerWidth < 768);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [notificationDrawerVisible, setNotificationDrawerVisible] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  // 响应式布局
  useEffect(() => {
    const handleResize = () => {
      setMobileView(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setDrawerVisible(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // 获取通知
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // 这里应该调用API获取通知
        // const response = await apiService.get('/notifications');
        // setNotifications(response.data);
        // setUnreadCount(response.data.filter(n => !n.read).length);
        
        // 模拟数据
        const mockNotifications = [
          { id: 1, title: '系统通知', content: '您的账号已成功激活', time: '2023-09-01 10:00', read: false },
          { id: 2, title: '教案审核', content: '您的教案《小学语文教学设计》已通过审核', time: '2023-08-30 14:30', read: true },
          { id: 3, title: '资源更新', content: '您关注的资源库已更新5个新资源', time: '2023-08-28 09:15', read: false }
        ];
        
        setNotifications(mockNotifications);
        setUnreadCount(mockNotifications.filter(n => !n.read).length);
      } catch (error) {
        console.error('获取通知失败:', error);
      }
    };
    
    fetchNotifications();
  }, []);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        <Link to="/profile">个人中心</Link>
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />}>
        <Link to="/profile/settings">账号设置</Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        退出登录
      </Menu.Item>
    </Menu>
  );
  
  const renderMenu = () => (
    <Menu
      theme={darkMode ? 'dark' : 'light'}
      mode="inline"
      selectedKeys={[selectedKey]}
    >
      <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
        <Link to="/">首页</Link>
      </Menu.Item>
      <Menu.Item key="teach-plans" icon={<FileTextOutlined />}>
        <Link to="/teach-plans">教案管理</Link>
      </Menu.Item>
      <Menu.Item key="resources" icon={<BookOutlined />}>
        <Link to="/resources">资源库</Link>
      </Menu.Item>
      <Menu.Item key="ai-chat" icon={<MessageOutlined />}>
        <Link to="/ai-chat">AI助手</Link>
      </Menu.Item>
      
      {user?.role === 'admin' && (
        <>
          <Menu.Divider />
          <Menu.Item key="user-management" icon={<TeamOutlined />}>
            <Link to="/admin/users">用户管理</Link>
          </Menu.Item>
          <Menu.Item key="system-settings" icon={<SettingOutlined />}>
            <Link to="/admin/settings">系统设置</Link>
          </Menu.Item>
        </>
      )}
    </Menu>
  );
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 移动端抽屉菜单 */}
      {mobileView && (
        <Drawer
          title="菜单"
          placement="left"
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          bodyStyle={{ padding: 0 }}
        >
          <div style={{ padding: '16px', textAlign: 'center' }}>
            <img src={logo} alt="Logo" style={{ height: 40 }} />
            <Typography.Title level={4} style={{ margin: '8px 0 0 0' }}>
              教育AI助手
            </Typography.Title>
          </div>
          {renderMenu()}
        </Drawer>
      )}
      
      {/* 通知抽屉 */}
      <Drawer
        title="通知中心"
        placement="right"
        onClose={() => setNotificationDrawerVisible(false)}
        open={notificationDrawerVisible}
        width={320}
      >
        <NotificationList 
          notifications={notifications} 
          onMarkAsRead={(id) => {
            // 标记为已读的逻辑
            setNotifications(prev => 
              prev.map(n => n.id === id ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
          }}
        />
      </Drawer>
      
      {/* 侧边栏 */}
      {!mobileView && (
        <Sider 
          trigger={null} 
          collapsible 
          collapsed={collapsed}
          theme={darkMode ? 'dark' : 'light'}
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
          }}
        >
          <div style={{ 
            height: 64, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? 0 : '0 16px'
          }}>
            <img src={logo} alt="Logo" style={{ height: 32 }} />
            {!collapsed && (
              <Typography.Title level={4} style={{ margin: '0 0 0 12px', color: darkMode ? 'white' : 'inherit' }}>
                教育AI助手
              </Typography.Title>
            )}
          </div>
          {renderMenu()}
        </Sider>
      )}
      
      <Layout style={{ marginLeft: mobileView ? 0 : (collapsed ? 80 : 200) }}>
        {/* 顶部导航 */}
        <Header style={{ 
          padding: '0 16px', 
          background: darkMode ? '#001529' : '#fff',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 1,
          boxShadow: '0 1px 4px rgba(0,21,41,.08)'
        }}>
          <div>
            {mobileView ? (
              <Button 
                type="text" 
                icon={<MenuUnfoldOutlined />} 
                onClick={() => setDrawerVisible(true)}
                style={{ color: darkMode ? 'white' : 'inherit' }}
              />
            ) : (
              <Button 
                type="text" 
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} 
                onClick={() => setCollapsed(!collapsed)}
                style={{ color: darkMode ? 'white' : 'inherit' }}
              />
            )}
          </div>
          
          <Space>
            <Badge count={unreadCount} overflowCount={99}>
              <Button 
                type="text" 
                icon={<BellOutlined />} 
                onClick={() => setNotificationDrawerVisible(true)}
                style={{ color: darkMode ? 'white' : 'inherit' }}
              />
            </Badge>
            
            <Dropdown overlay={userMenu} placement="bottomRight">
              <Space style={{ cursor: 'pointer', color: darkMode ? 'white' : 'inherit' }}>
                <Avatar icon={<UserOutlined />} src={user?.avatar} />
                {!mobileView && <Text style={{ color: darkMode ? 'white' : 'inherit' }}>{user?.name || '用户'}</Text>}
              </Space>
            </Dropdown>
          </Space>
        </Header>
        
        {/* 主要内容区 */}
        <Content style={{ 
          margin: '0',
          minHeight: 'calc(100vh - 64px)',
          background: darkMode ? '#141414' : '#f0f2f5',
          color: darkMode ? 'rgba(255,255,255,0.85)' : 'inherit'
        }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout; 