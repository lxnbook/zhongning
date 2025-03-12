import React, { useState, useEffect } from 'react';
import { 
  Card, 
  List, 
  Avatar, 
  Button, 
  Tabs, 
  Tag, 
  Skeleton, 
  Typography, 
  Empty,
  Space,
  Tooltip,
  Rate,
  Divider
} from 'antd';
import { 
  BulbOutlined, 
  FileTextOutlined, 
  ReadOutlined, 
  VideoCameraOutlined,
  StarOutlined,
  FireOutlined,
  ThunderboltOutlined,
  HistoryOutlined,
  UserOutlined,
  TeamOutlined,
  EyeOutlined
} from '@ant-design/icons';
import apiService from '../services/apiService';

const { TabPane } = Tabs;
const { Title, Paragraph, Text } = Typography;

const SmartRecommendations = ({ subject, grade, recentActivities }) => {
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState({
    teachPlans: [],
    resources: [],
    methods: [],
    community: []
  });
  const [activeTab, setActiveTab] = useState('teachPlans');

  // 加载推荐内容
  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        // 构建请求参数
        const params = {
          subject,
          grade,
          recentActivities: JSON.stringify(recentActivities)
        };
        
        const response = await apiService.get('/recommendations', { params });
        setRecommendations(response);
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommendations();
  }, [subject, grade, recentActivities]);

  // 处理资源点击
  const handleResourceClick = async (resource) => {
    try {
      // 记录点击行为，用于改进推荐
      await apiService.post('/recommendations/feedback', {
        resourceId: resource.id,
        resourceType: resource.type,
        action: 'click'
      });
      
      // 导航到资源页面
      window.location.href = resource.url;
    } catch (error) {
      console.error('Failed to record feedback:', error);
    }
  };

  // 处理收藏
  const handleFavorite = async (resource) => {
    try {
      await apiService.post('/favorites', {
        resourceId: resource.id,
        resourceType: resource.type
      });
      
      // 更新推荐列表中的收藏状态
      setRecommendations(prev => {
        const category = Object.keys(prev).find(key => 
          prev[key].some(item => item.id === resource.id && item.type === resource.type)
        );
        
        if (category) {
          return {
            ...prev,
            [category]: prev[category].map(item => 
              item.id === resource.id && item.type === resource.type
                ? { ...item, isFavorite: !item.isFavorite }
                : item
            )
          };
        }
        
        return prev;
      });
    } catch (error) {
      console.error('Failed to favorite resource:', error);
    }
  };

  // 渲染教案推荐
  const renderTeachPlans = () => {
    const { teachPlans } = recommendations;
    
    if (teachPlans.length === 0 && !loading) {
      return <Empty description="暂无推荐教案" />;
    }
    
    return (
      <List
        itemLayout="vertical"
        dataSource={teachPlans}
        renderItem={item => (
          <List.Item
            key={item.id}
            actions={[
              <Space>
                <Button 
                  type="primary" 
                  size="small"
                  onClick={() => handleResourceClick(item)}
                >
                  查看详情
                </Button>
                <Button 
                  type={item.isFavorite ? "default" : "text"} 
                  icon={<StarOutlined />} 
                  size="small"
                  onClick={() => handleFavorite(item)}
                >
                  {item.isFavorite ? '已收藏' : '收藏'}
                </Button>
              </Space>
            ]}
          >
            <Skeleton loading={loading} active avatar>
              <List.Item.Meta
                avatar={<Avatar icon={<FileTextOutlined />} style={{ backgroundColor: '#1890ff' }} />}
                title={
                  <Space>
                    <a onClick={() => handleResourceClick(item)}>{item.title}</a>
                    {item.isNew && <Tag color="green">新</Tag>}
                    {item.isPopular && <Tag color="red">热门</Tag>}
                  </Space>
                }
                description={
                  <Space>
                    <Text type="secondary">{item.subject} | {item.grade}</Text>
                    <Rate disabled defaultValue={item.rating} size="small" />
                    <Text type="secondary">({item.ratingCount})</Text>
                  </Space>
                }
              />
              <Paragraph ellipsis={{ rows: 2 }}>{item.description}</Paragraph>
              <div>
                <Space split={<Divider type="vertical" />}>
                  <Text type="secondary">
                    <UserOutlined /> {item.author}
                  </Text>
                  <Text type="secondary">
                    <HistoryOutlined /> {item.createdAt}
                  </Text>
                  <Text type="secondary">
                    <EyeOutlined /> {item.viewCount} 次查看
                  </Text>
                </Space>
              </div>
            </Skeleton>
          </List.Item>
        )}
      />
    );
  };

  // 渲染资源推荐
  const renderResources = () => {
    const { resources } = recommendations;
    
    if (resources.length === 0 && !loading) {
      return <Empty description="暂无推荐资源" />;
    }
    
    return (
      <List
        grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 4 }}
        dataSource={resources}
        renderItem={item => (
          <List.Item>
            <Card
              hoverable
              cover={
                <div 
                  style={{ 
                    height: 140, 
                    background: '#f0f2f5', 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {item.thumbnail ? (
                    <img 
                      alt={item.title} 
                      src={item.thumbnail} 
                      style={{ maxHeight: '100%', maxWidth: '100%' }} 
                    />
                  ) : (
                    <Avatar 
                      icon={
                        item.type === 'video' ? <VideoCameraOutlined /> : 
                        item.type === 'document' ? <FileTextOutlined /> : 
                        <ReadOutlined />
                      } 
                      size={64}
                      style={{ backgroundColor: '#1890ff' }}
                    />
                  )}
                </div>
              }
              actions={[
                <Tooltip title="查看详情">
                  <Button 
                    type="text" 
                    icon={<ReadOutlined />} 
                    onClick={() => handleResourceClick(item)}
                  />
                </Tooltip>,
                <Tooltip title={item.isFavorite ? "取消收藏" : "收藏"}>
                  <Button 
                    type="text" 
                    icon={item.isFavorite ? <StarFilled /> : <StarOutlined />} 
                    onClick={() => handleFavorite(item)}
                  />
                </Tooltip>
              ]}
            >
              <Skeleton loading={loading} active>
                <Card.Meta
                  title={
                    <Space>
                      <Tooltip title={item.title}>
                        <Text ellipsis style={{ maxWidth: 150 }}>{item.title}</Text>
                      </Tooltip>
                      {item.isNew && <Tag color="green">新</Tag>}
                    </Space>
                  }
                  description={
                    <>
                      <Space>
                        <Tag color="blue">{item.type}</Tag>
                        <Rate disabled defaultValue={item.rating} size="small" />
                      </Space>
                      <div style={{ marginTop: 8 }}>
                        <Text type="secondary" ellipsis>
                          {item.description}
                        </Text>
                      </div>
                    </>
                  }
                />
              </Skeleton>
            </Card>
          </List.Item>
        )}
      />
    );
  };

  // 渲染教学方法推荐
  const renderMethods = () => {
    const { methods } = recommendations;
    
    if (methods.length === 0 && !loading) {
      return <Empty description="暂无推荐教学方法" />;
    }
    
    return (
      <List
        itemLayout="horizontal"
        dataSource={methods}
        renderItem={item => (
          <List.Item
            actions={[
              <Button 
                type="link" 
                onClick={() => handleResourceClick(item)}
              >
                查看详情
              </Button>
            ]}
          >
            <Skeleton loading={loading} active avatar>
              <List.Item.Meta
                avatar={
                  <Avatar 
                    icon={<ThunderboltOutlined />} 
                    style={{ backgroundColor: '#52c41a' }}
                  />
                }
                title={
                  <Space>
                    <a onClick={() => handleResourceClick(item)}>{item.title}</a>
                    {item.difficulty && (
                      <Tag color={
                        item.difficulty === 'easy' ? 'green' : 
                        item.difficulty === 'medium' ? 'orange' : 
                        'red'
                      }>
                        {
                          item.difficulty === 'easy' ? '简单' : 
                          item.difficulty === 'medium' ? '中等' : 
                          '高级'
                        }
                      </Tag>
                    )}
                  </Space>
                }
                description={
                  <>
                    <Paragraph ellipsis={{ rows: 2 }}>{item.description}</Paragraph>
                    <Space>
                      <Tag>{item.category}</Tag>
                      <Text type="secondary">适用于: {item.suitableFor.join(', ')}</Text>
                    </Space>
                  </>
                }
              />
            </Skeleton>
          </List.Item>
        )}
      />
    );
  };

  // 渲染社区推荐
  const renderCommunity = () => {
    const { community } = recommendations;
    
    if (community.length === 0 && !loading) {
      return <Empty description="暂无社区推荐" />;
    }
    
    return (
      <List
        itemLayout="horizontal"
        dataSource={community}
        renderItem={item => (
          <List.Item>
            <Skeleton loading={loading} active avatar>
              <List.Item.Meta
                avatar={<Avatar src={item.avatar} />}
                title={
                  <Space>
                    <a onClick={() => handleResourceClick(item)}>{item.title}</a>
                    {item.type === 'discussion' && <Tag color="blue">讨论</Tag>}
                    {item.type === 'question' && <Tag color="green">问答</Tag>}
                    {item.type === 'group' && <Tag color="purple">小组</Tag>}
                    {item.isHot && <Tag color="red" icon={<FireOutlined />}>热门</Tag>}
                  </Space>
                }
                description={
                  <>
                    <Paragraph ellipsis={{ rows: 2 }}>{item.description}</Paragraph>
                    <Space split={<Divider type="vertical" />}>
                      <Text type="secondary">
                        <UserOutlined /> {item.author}
                      </Text>
                      <Text type="secondary">
                        <TeamOutlined /> {item.participantsCount} 参与
                      </Text>
                      <Text type="secondary">
                        <HistoryOutlined /> {item.lastActivity}
                      </Text>
                    </Space>
                  </>
                }
              />
            </Skeleton>
          </List.Item>
        )}
      />
    );
  };

  return (
    <Card
      title={
        <Space>
          <BulbOutlined />
          智能推荐
        </Space>
      }
      extra={
        <Button type="link" onClick={() => window.location.href = '/recommendations'}>
          查看全部
        </Button>
      }
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane 
          tab={
            <span>
              <FileTextOutlined />
              教案
            </span>
          } 
          key="teachPlans"
        >
          {renderTeachPlans()}
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <ReadOutlined />
              资源
            </span>
          } 
          key="resources"
        >
          {renderResources()}
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <ThunderboltOutlined />
              教学方法
            </span>
          } 
          key="methods"
        >
          {renderMethods()}
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <TeamOutlined />
              社区
            </span>
          } 
          key="community"
        >
          {renderCommunity()}
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default SmartRecommendations; 