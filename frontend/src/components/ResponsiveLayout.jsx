import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Drawer, Avatar, Dropdown } from 'antd';
import { 
  MenuUnfoldOutlined, 
  MenuFoldOutlined, 
  UserOutlined,
  DashboardOutlined,
  BookOutlined,
  FileOutlined,
  TeamOutlined,
  BarChartOutlined,
  RobotOutlined,
  SettingOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Header, Sider, Content } = Layout;

const ResponsiveLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // 监听窗口大小变化
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);
  
  // 菜单项
  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '首页',
    },
    {
      key: '/teach-plan',
      icon: <BookOutlined />,
      label: '智能教案',
    },
    {
      key: '/resources',
      icon: <FileOutlined />,
      label: '资源中心',
    },
    {
      key: '/ai-chat',
      icon: <RobotOutlined />,
      label: '智能问答',
    },
    {
      key: '/learning-path',
      icon: <TeamOutlined />,
      label: '学习路径',
    },
    {
      key: '/data-analysis',
      icon: <BarChartOutlined />,
      label: '数据分析',
    }
  ];
  
  // 管理员菜单项
  if (user && (user.role === 'admin' || user.role === 'school_admin')) {
    menuItems.push({
      key: '/user-management',
      icon: <TeamOutlined />,
      label: '用户管理',
    });
    menuItems.push({
      key: '/settings',
      icon: <SettingOutlined />,
      label: '系统设置',
    });
  }
  
  // 用户下拉菜单
  const userMenuItems = [
    {
      key: 'profile',
      label: <Link to="/profile">个人资料</Link>,
      icon: <UserOutlined />
    },
    {
      key: 'settings',
      label: <Link to="/settings">设置</Link>,
      icon: <SettingOutlined />
    },
    {
      key: 'logout',
      label: '退出登录',
      icon: <LogoutOutlined />,
      onClick: logout
    }
  ];
  
  // 切换菜单折叠状态
  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };
  
  // 切换抽屉可见性
  const toggleDrawer = () => {
    setDrawerVisible(!drawerVisible);
  };
  
  // 处理菜单点击
  const handleMenuClick = ({ key }) => {
    navigate(key);
    if (isMobile) {
      setDrawerVisible(false);
    }
  };
  
  // 渲染侧边栏
  const renderSidebar = () => (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[location.pathname]}
      items={menuItems}
      onClick={handleMenuClick}
    />
  );
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 桌面端侧边栏 */}
      {!isMobile && (
        <Sider 
          trigger={null} 
          collapsible 
          collapsed={collapsed}
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
          }}
        >
          <div className="logo" style={{ 
            height: '64px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'white',
            fontSize: collapsed ? '14px' : '18px',
            fontWeight: 'bold',
            margin: '16px 0'
          }}>
            {collapsed ? 'EAS' : '教育智能助手'}
          </div>
          {renderSidebar()}
        </Sider>
      )}
      
      <Layout style={{ marginLeft: isMobile ? 0 : (collapsed ? 80 : 200), transition: 'all 0.2s' }}>
        <Header style={{ 
          padding: '0 16px', 
          background: '#fff', 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0, 21, 41, 0.08)',
          position: 'sticky',
          top: 0,
          zIndex: 1,
          width: '100%'
        }}>
          {/* 折叠按钮 */}
          {isMobile ? (
            <Button type="text" icon={<MenuUnfoldOutlined />} onClick={toggleDrawer} />
          ) : (
            <Button 
              type="text" 
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} 
              onClick={toggleCollapsed} 
            />
          )}
          
          {/* 用户信息 */}
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <Avatar icon={<UserOutlined />} />
              {!isMobile && (
                <span style={{ marginLeft: 8 }}>{user?.name || '用户'}</span>
              )}
            </div>
          </Dropdown>
        </Header>
        
        <Content style={{ 
          margin: '24px 16px', 
          padding: 24, 
          background: '#fff', 
          minHeight: 280,
          borderRadius: '4px'
        }}>
          {children}
        </Content>
      </Layout>
      
      {/* 移动端抽屉菜单 */}
      {isMobile && (
        <Drawer
          title="教育智能助手"
          placement="left"
          onClose={toggleDrawer}
          open={drawerVisible}
          bodyStyle={{ padding: 0 }}
        >
          {renderSidebar()}
        </Drawer>
      )}
    </Layout>
  );
};

export default ResponsiveLayout; 