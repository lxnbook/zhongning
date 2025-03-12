import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge, Button, Space, Typography } from 'antd';
import { 
  MenuUnfoldOutlined, 
  MenuFoldOutlined, 
  UserOutlined, 
  BellOutlined, 
  BookOutlined, 
  BarChartOutlined, 
  FileTextOutlined, 
  TeamOutlined, 
  RobotOutlined, 
  SettingOutlined, 
  LogoutOutlined, 
  HomeOutlined, 
  CalendarOutlined, 
  NodeIndexOutlined, 
  VideoCameraOutlined, 
  MessageOutlined,
  ApartmentOutlined,
  ReadOutlined,
  ExperimentOutlined,
  ToolOutlined
} from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.png';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const MainLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const toggle = () => {
    setCollapsed(!collapsed);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        <Link to="/profile">个人资料</Link>
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />}>
        <Link to="/settings">系统设置</Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        退出登录
      </Menu.Item>
    </Menu>
  );

  const notificationsMenu = (
    <Menu>
      <Menu.Item key="notification1">
        <Text strong>新消息</Text>
        <br />
        <Text type="secondary">家长李明发来一条消息</Text>
      </Menu.Item>
      <Menu.Item key="notification2">
        <Text strong>作业提醒</Text>
        <br />
        <Text type="secondary">5名学生尚未提交作业</Text>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="all">
        <Link to="/notifications">查看全部通知</Link>
      </Menu.Item>
    </Menu>
  );

  const items = [
    {
      key: 'departments',
      icon: <ApartmentOutlined />,
      label: '教育局部门',
      children: [
        {
          key: 'teaching-management',
          icon: <ApartmentOutlined />,
          label: '教学管理部门',
        },
        {
          key: 'student-management',
          icon: <TeamOutlined />,
          label: '学生管理部门',
        },
        {
          key: 'teacher-development',
          icon: <UserOutlined />,
          label: '教师发展部门',
        },
        {
          key: 'curriculum-materials',
          icon: <ReadOutlined />,
          label: '课程与教材部门',
        },
        {
          key: 'education-research',
          icon: <ExperimentOutlined />,
          label: '教育科研部门',
        },
        {
          key: 'education-technology',
          icon: <ToolOutlined />,
          label: '教育技术部门',
        }
      ]
    }
  ];

  const handleMenuClick = (e) => {
    const routeMap = {
      'teaching-management': '/teaching-management',
      'student-management': '/student-management',
      'teacher-development': '/teacher-development',
      'curriculum-materials': '/curriculum-materials',
      'education-research': '/education-research',
      'education-technology': '/education-technology'
    };
    
    if (routeMap[e.key]) {
      navigate(routeMap[e.key]);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} width={250}>
        <div className="logo" style={{ padding: '16px', textAlign: 'center' }}>
          <img src={logo} alt="Logo" style={{ height: 32 }} />
          {!collapsed && <Title level={4} style={{ color: 'white', margin: '0 0 0 8px', display: 'inline-block' }}>教育AI助手</Title>}
        </div>
        <Menu theme="dark" mode="inline" selectedKeys={[location.pathname]} onClick={handleMenuClick}>
          <Menu.Item key="/" icon={<HomeOutlined />}>
            <Link to="/">首页</Link>
          </Menu.Item>
          <Menu.Item key="/lesson-planner" icon={<CalendarOutlined />}>
            <Link to="/lesson-planner">课程规划</Link>
          </Menu.Item>
          <Menu.Item key="/content-generator" icon={<RobotOutlined />}>
            <Link to="/content-generator">内容生成</Link>
          </Menu.Item>
          <Menu.Item key="/assessment" icon={<FileTextOutlined />}>
            <Link to="/assessment">评估管理</Link>
          </Menu.Item>
          <Menu.Item key="/classroom" icon={<VideoCameraOutlined />}>
            <Link to="/classroom">虚拟课堂</Link>
          </Menu.Item>
          <Menu.Item key="/student-portfolio" icon={<BookOutlined />}>
            <Link to="/student-portfolio">学生作品集</Link>
          </Menu.Item>
          <Menu.Item key="/data-visualization" icon={<BarChartOutlined />}>
            <Link to="/data-visualization">数据分析</Link>
          </Menu.Item>
          <Menu.Item key="/parent-communication" icon={<MessageOutlined />}>
            <Link to="/parent-communication">家校沟通</Link>
          </Menu.Item>
          <Menu.Item key="/adaptive-learning" icon={<NodeIndexOutlined />}>
            <Link to="/adaptive-learning">自适应学习</Link>
          </Menu.Item>
          <Menu.Item key="/professional-development" icon={<TeamOutlined />}>
            <Link to="/professional-development">专业发展</Link>
          </Menu.Item>
          <Menu.Item key="/llm-settings" icon={<RobotOutlined />}>
            <Link to="/llm-settings">LLM集成设置</Link>
          </Menu.Item>
          {items.map(item => (
            <Menu.SubMenu key={item.key} icon={item.icon} title={item.label}>
              {item.children.map(child => (
                <Menu.Item key={child.key}>{child.label}</Menu.Item>
              ))}
            </Menu.SubMenu>
          ))}
        </Menu>
      </Sider>
      <Layout className="site-layout">
        <Header className="site-layout-background" style={{ padding: 0, background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
              className: 'trigger',
              onClick: toggle,
              style: { padding: '0 24px', fontSize: '18px' }
            })}
          </div>
          <div style={{ paddingRight: 24 }}>
            <Space size="large">
              <Dropdown overlay={notificationsMenu} trigger={['click']}>
                <Badge count={3}>
                  <Button type="text" icon={<BellOutlined style={{ fontSize: '18px' }} />} />
                </Badge>
              </Dropdown>
              <Dropdown overlay={userMenu} trigger={['click']}>
                <Space>
                  <Avatar src={user?.avatar} icon={<UserOutlined />} />
                  {!collapsed && <span>{user?.name || '用户'}</span>}
                </Space>
              </Dropdown>
            </Space>
          </div>
        </Header>
        <Content
          className="site-layout-background"
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            overflow: 'auto'
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout; 