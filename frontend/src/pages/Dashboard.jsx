import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Button, 
  List, 
  Typography, 
  Divider, 
  Calendar, 
  Badge, 
  Tooltip, 
  Space, 
  Carousel,
  Image,
  Affix,
  Tag,
  Spin,
  Alert
} from 'antd';
import { 
  BookOutlined, 
  FileOutlined, 
  TeamOutlined, 
  BulbOutlined, 
  RobotOutlined, 
  InfoCircleOutlined, 
  ApartmentOutlined, 
  UserOutlined, 
  SolutionOutlined, 
  ReadOutlined, 
  ExperimentOutlined, 
  ToolOutlined,
  RocketOutlined,
  CheckCircleOutlined,
  ThunderboltOutlined,
  FileTextOutlined,
  MessageOutlined,
  PlusOutlined,
  RightOutlined
} from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import llmService from '../services/llmService';
import deepseekLogo from '../assets/deepseek-logo.png';
import apiService from '../services/apiService';
import MainLayout from '../components/layout/MainLayout';
import RecentActivityChart from '../components/dashboard/RecentActivityChart';
import ResourceUsageChart from '../components/dashboard/ResourceUsageChart';
import AIUsageChart from '../components/dashboard/AIUsageChart';
import QuickActionCard from '../components/dashboard/QuickActionCard';
import { useAuth } from '../contexts/AuthContext';

const { Title, Paragraph, Text } = Typography;

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTeachPlans, setRecentTeachPlans] = useState([]);
  const [recentResources, setRecentResources] = useState([]);
  const [events, setEvents] = useState([]);
  const [llmStatus, setLlmStatus] = useState({
    initialized: false,
    defaultProvider: null,
    availableProviders: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 模拟数据，实际应从API获取
  useEffect(() => {
    // 模拟最近教案
    setRecentTeachPlans([
      { id: 1, title: '七年级数学《分数的加减法》', date: '2023-05-15' },
      { id: 2, title: '九年级物理《牛顿第一定律》', date: '2023-05-12' },
      { id: 3, title: '高一化学《化学键》', date: '2023-05-10' },
    ]);
    
    // 模拟最近资源
    setRecentResources([
      { id: 1, title: '小学语文教学PPT模板', type: 'presentation' },
      { id: 2, title: '初中数学练习题集', type: 'document' },
      { id: 3, title: '高中物理实验视频', type: 'video' },
    ]);
    
    // 模拟日历事件
    setEvents([
      { type: 'success', content: '教研活动', date: '2023-05-20' },
      { type: 'warning', content: '期中考试', date: '2023-05-25' },
      { type: 'error', content: '教师培训', date: '2023-05-15' },
    ]);
    
    // 初始化LLM状态
    initializeLLM();
  }, []);
  
  const initializeLLM = async () => {
    try {
      const status = await llmService.getStatus();
      setLlmStatus(status);
    } catch (error) {
      console.error('Failed to initialize LLM:', error);
    }
  };
  
  const renderDepartmentCards = () => {
    const departments = [
      {
        title: '教学管理部门',
        icon: <ApartmentOutlined />,
        description: '教学质量监控、资源管理、计划审核、标准制定',
        path: '/teaching-management'
      },
      {
        title: '学生管理部门',
        icon: <TeamOutlined />,
        description: '学生数据分析、发展跟踪、行为管理、家校沟通',
        path: '/student-management'
      },
      {
        title: '教师发展部门',
        icon: <UserOutlined />,
        description: '教师培训规划、能力评估、专业发展、教学研究',
        path: '/teacher-development'
      },
      {
        title: '课程与教材部门',
        icon: <ReadOutlined />,
        description: '课程设计、教材分析、使用指导、资源补充',
        path: '/curriculum-materials'
      },
      {
        title: '教育科研部门',
        icon: <ExperimentOutlined />,
        description: '研究设计、数据分析、报告生成、文献综述',
        path: '/education-research'
      },
      {
        title: '教育技术部门',
        icon: <ToolOutlined />,
        description: '技术应用指导、数字资源开发、培训内容、评估工具',
        path: '/education-technology'
      }
    ];
 
    return (
      <>
        <Divider orientation="left">
          <Space>
            <ApartmentOutlined />
            <span>教育局部门功能</span>
          </Space>
        </Divider>
        
        <Row gutter={[16, 16]}>
          {departments.map(dept => (
            <Col xs={24} sm={12} md={8} key={dept.path}>
              <Card 
                hoverable
                onClick={() => navigate(dept.path)}
                className="department-card"
              >
                <Space direction="vertical" style={{ width: '100%' }} align="center">
                  <div className="department-icon">
                    {dept.icon}
                  </div>
                  <Title level={4}>{dept.title}</Title>
                  <Paragraph type="secondary" ellipsis={{ rows: 2 }}>
                    {dept.description}
                  </Paragraph>
                  <Button type="primary" ghost>
                    进入
                  </Button>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </>
    );
  };

  // 渲染首页顶部大图轮播
  const renderHeroBanner = () => {
    return (
      <div className="hero-banner" style={{ marginBottom: 40 }}>
        <Carousel autoplay effect="fade">
          <div>
            <div className="banner-slide" style={{ 
              height: '400px', 
              background: 'linear-gradient(135deg, #1a365d 0%, #44337a 100%)',
              borderRadius: '8px',
              padding: '40px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <Row align="middle">
                <Col xs={24} md={14}>
                  <Title style={{ color: 'white', marginBottom: 24 }}>
                    教育智能助手系统
                  </Title>
                  <Title level={3} style={{ color: 'white', fontWeight: 'normal', marginBottom: 30 }}>
                    赋能教育管理，提升教学质量
                  </Title>
                  <Space size="large">
                    <Button type="primary" size="large" onClick={() => navigate('/content-generator')}>
                      开始使用
                    </Button>
                    <Button ghost size="large" onClick={() => navigate('/llm-settings')}>
                      系统设置
                    </Button>
                  </Space>
                </Col>
                <Col xs={0} md={10} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 180, color: 'rgba(255,255,255,0.2)' }}>
                    <RobotOutlined />
                  </div>
                </Col>
              </Row>
              <div style={{ 
                position: 'absolute', 
                bottom: 20, 
                right: 30, 
                display: 'flex', 
                alignItems: 'center' 
              }}>
                <Text style={{ color: 'white', marginRight: 10 }}>由</Text>
                <Image 
                  src={deepseekLogo} 
                  alt="DeepSeek" 
                  height={30} 
                  preview={false}
                />
                <Text style={{ color: 'white', marginLeft: 10 }}>驱动</Text>
              </div>
            </div>
          </div>
          <div>
            <div className="banner-slide" style={{ 
              height: '400px', 
              background: 'linear-gradient(135deg, #065535 0%, #1e9b8a 100%)',
              borderRadius: '8px',
              padding: '40px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <Row align="middle">
                <Col xs={24} md={14}>
                  <Title style={{ color: 'white', marginBottom: 24 }}>
                    AI 驱动的教育管理
                  </Title>
                  <Title level={3} style={{ color: 'white', fontWeight: 'normal', marginBottom: 30 }}>
                    智能分析数据，辅助教育决策
                  </Title>
                  <Space size="large">
                    <Button type="primary" size="large" onClick={() => navigate('/data-visualization')}>
                      数据分析
                    </Button>
                    <Button ghost size="large" onClick={() => navigate('/assessment')}>
                      评估管理
                    </Button>
                  </Space>
                </Col>
                <Col xs={0} md={10} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 180, color: 'rgba(255,255,255,0.2)' }}>
                    <BarChartOutlined />
                  </div>
                </Col>
              </Row>
              <div style={{ 
                position: 'absolute', 
                bottom: 20, 
                right: 30, 
                display: 'flex', 
                alignItems: 'center' 
              }}>
                <Text style={{ color: 'white', marginRight: 10 }}>由</Text>
                <Image 
                  src={deepseekLogo} 
                  alt="DeepSeek" 
                  height={30} 
                  preview={false}
                />
                <Text style={{ color: 'white', marginLeft: 10 }}>驱动</Text>
              </div>
            </div>
          </div>
        </Carousel>
      </div>
    );
  };

  // 渲染系统功能介绍
  const renderSystemFeatures = () => {
    const features = [
      {
        title: '智能内容生成',
        icon: <BulbOutlined />,
        description: '自动生成教案、课件、试题和教学资源，节省教师备课时间'
      },
      {
        title: '数据驱动决策',
        icon: <BarChartOutlined />,
        description: '分析教学数据，提供决策支持，优化教育管理流程'
      },
      {
        title: '个性化学习',
        icon: <UserOutlined />,
        description: '根据学生特点推荐个性化学习路径，提高学习效果'
      },
      {
        title: '教育科研支持',
        icon: <ExperimentOutlined />,
        description: '辅助教育研究设计、数据分析和报告生成，提升研究质量'
      }
    ];

    return (
      <>
        <Divider orientation="left">
          <Space>
            <RocketOutlined />
            <span>系统核心功能</span>
          </Space>
        </Divider>
        
        <Row gutter={[24, 24]} style={{ marginBottom: 40 }}>
          {features.map((feature, index) => (
            <Col xs={24} sm={12} md={6} key={index}>
              <Card className="feature-card" bordered={false} style={{ height: '100%', textAlign: 'center' }}>
                <div style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }}>
                  {feature.icon}
                </div>
                <Title level={4}>{feature.title}</Title>
                <Paragraph>{feature.description}</Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </>
    );
  };

  // 渲染 DeepSeek 技术优势
  const renderDeepSeekAdvantages = () => {
    const advantages = [
      {
        title: '先进的大语言模型',
        description: '采用 DeepSeek 最新的大语言模型技术，提供高质量的内容生成和理解能力'
      },
      {
        title: '教育领域专业知识',
        description: '模型经过教育领域数据的专门训练，理解教育专业术语和教学需求'
      },
      {
        title: '多语言支持',
        description: '支持中英文等多种语言，满足国际化教育需求'
      },
      {
        title: '安全可靠',
        description: '内置内容安全过滤机制，确保生成内容的适当性和安全性'
      },
      {
        title: '持续更新',
        description: 'DeepSeek 模型持续优化更新，系统功能不断完善'
      }
    ];

    return (
      <>
        <Divider orientation="left">
          <Space>
            <ThunderboltOutlined />
            <span>DeepSeek 技术优势</span>
          </Space>
        </Divider>
        
        <Card 
          style={{ 
            marginBottom: 40, 
            background: 'linear-gradient(to right, #f0f5ff, #e6f7ff)',
            border: '1px solid #d6e4ff'
          }}
        >
          <Row align="middle" gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <div style={{ textAlign: 'center' }}>
                <Image 
                  src={deepseekLogo} 
                  alt="DeepSeek" 
                  height={60} 
                  preview={false}
                  style={{ marginBottom: 16 }}
                />
                <Title level={3} style={{ marginTop: 0 }}>DeepSeek 驱动</Title>
                <Paragraph>
                  采用 DeepSeek 先进的大语言模型技术，为教育管理和教学提供智能支持
                </Paragraph>
                <Button type="primary" onClick={() => window.open('https://deepseek.com', '_blank')}>
                  了解更多
                </Button>
              </div>
            </Col>
            <Col xs={24} md={16}>
              <List
                itemLayout="horizontal"
                dataSource={advantages}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<CheckCircleOutlined style={{ color: '#52c41a', fontSize: 24 }} />}
                      title={<Text strong>{item.title}</Text>}
                      description={item.description}
                    />
                  </List.Item>
                )}
              />
            </Col>
          </Row>
        </Card>
      </>
    );
  };
   
  return (
    <MainLayout selectedKey="dashboard">
      <div style={{ padding: '24px' }}>
        <Title level={2}>欢迎回来，{user?.name || '老师'}</Title>
        <Text type="secondary">今天是 {new Date().toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
        
        {error && (
          <Alert 
            message="错误" 
            description={error} 
            type="error" 
            showIcon 
            style={{ marginTop: 16, marginBottom: 16 }} 
          />
        )}
        
        {loading ? (
          <div style={{ textAlign: 'center', margin: '50px 0' }}>
            <Spin size="large" />
          </div>
        ) : (
          <>
            {/* 统计数据 */}
            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
              <Col xs={12} sm={12} md={6} lg={6}>
                <Card>
                  <Statistic 
                    title="我的教案" 
                    value={stats?.teachPlanCount || 0} 
                    prefix={<FileTextOutlined />} 
                  />
                </Card>
              </Col>
              <Col xs={12} sm={12} md={6} lg={6}>
                <Card>
                  <Statistic 
                    title="使用的资源" 
                    value={stats?.resourceCount || 0} 
                    prefix={<BookOutlined />} 
                  />
                </Card>
              </Col>
              <Col xs={12} sm={12} md={6} lg={6}>
                <Card>
                  <Statistic 
                    title="AI对话次数" 
                    value={stats?.aiChatCount || 0} 
                    prefix={<MessageOutlined />} 
                  />
                </Card>
              </Col>
              <Col xs={12} sm={12} md={6} lg={6}>
                <Card>
                  <Statistic 
                    title="节省时间(小时)" 
                    value={stats?.savedHours || 0} 
                    precision={1} 
                  />
                </Card>
              </Col>
            </Row>
            
            {/* 快速操作 */}
            <Title level={4} style={{ marginTop: 32, marginBottom: 16 }}>快速操作</Title>
            <Row gutter={[16, 16]}>
              {quickActions.map((action, index) => (
                <Col xs={24} sm={12} md={6} lg={6} key={index}>
                  <QuickActionCard 
                    title={action.title}
                    icon={action.icon}
                    description={action.description}
                    link={action.link}
                    color={action.color}
                  />
                </Col>
              ))}
            </Row>
            
            {/* 活动图表 */}
            <Title level={4} style={{ marginTop: 32, marginBottom: 16 }}>近期活动</Title>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Card title="活动统计" style={{ height: 380 }}>
                  <RecentActivityChart data={stats?.activityData || []} />
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card title="资源使用" style={{ height: 380 }}>
                  <ResourceUsageChart data={stats?.resourceUsage || []} />
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card title="AI使用情况" style={{ height: 380 }}>
                  <AIUsageChart data={stats?.aiUsage || []} />
                </Card>
              </Col>
            </Row>
            
            {/* 最近内容 */}
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col xs={24} md={12}>
                <Card 
                  title="最近的教案" 
                  extra={<Link to="/teach-plans">查看全部 <RightOutlined /></Link>}
                >
                  <List
                    dataSource={recentTeachPlans}
                    renderItem={item => (
                      <List.Item
                        actions={[
                          <Link to={`/teach-plans/${item.id}`}>查看</Link>
                        ]}
                      >
                        <List.Item.Meta
                          title={<Link to={`/teach-plans/${item.id}`}>{item.title}</Link>}
                          description={`${item.subject} | ${item.grade} | ${new Date(item.updatedAt).toLocaleDateString()}`}
                        />
                      </List.Item>
                    )}
                    locale={{ emptyText: '暂无最近的教案' }}
                  />
                  <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <Button type="primary" icon={<PlusOutlined />} href="/teach-plans/create">
                      创建新教案
                    </Button>
                  </div>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card 
                  title="最近的资源" 
                  extra={<Link to="/resources">查看全部 <RightOutlined /></Link>}
                >
                  <List
                    dataSource={recentResources}
                    renderItem={item => (
                      <List.Item
                        actions={[
                          <Link to={`/resources/${item.id}`}>查看</Link>
                        ]}
                      >
                        <List.Item.Meta
                          title={<Link to={`/resources/${item.id}`}>{item.title}</Link>}
                          description={`${item.type} | ${item.subject} | ${new Date(item.updatedAt).toLocaleDateString()}`}
                        />
                      </List.Item>
                    )}
                    locale={{ emptyText: '暂无最近的资源' }}
                  />
                  <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <Button type="primary" icon={<PlusOutlined />} href="/resources?action=upload">
                      上传新资源
                    </Button>
                  </div>
                </Card>
              </Col>
            </Row>
          </>
        )}
      </div>
    </MainLayout>
  );
  
  // 日历单元格渲染
  function dateCellRender(value) {
    const listData = events.filter(
      event => event.date === value.format('YYYY-MM-DD')
    );
    
    return (
      <ul className="events" style={{ listStyle: 'none', padding: 0 }}>
        {listData.map((item, index) => (
          <li key={index}>
            <Badge status={item.type} text={item.content} />
          </li>
        ))}
      </ul>
    );
  }
};

export default Dashboard; 