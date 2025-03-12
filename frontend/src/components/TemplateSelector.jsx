import React, { useState, useEffect } from 'react';
import { 
  Card, 
  List, 
  Radio, 
  Button, 
  Modal, 
  Tabs, 
  Tag, 
  Image, 
  Typography, 
  Space,
  Input,
  Select,
  Divider,
  Empty,
  Skeleton,
  Row,
  Col,
  Tooltip,
  Avatar
} from 'antd';
import { 
  FileTextOutlined, 
  AppstoreOutlined, 
  StarOutlined, 
  StarFilled,
  SearchOutlined,
  FilterOutlined,
  PlusOutlined,
  EyeOutlined,
  DownloadOutlined,
  ShareAltOutlined,
  HistoryOutlined,
  UserOutlined
} from '@ant-design/icons';
import apiService from '../services/apiService';

const { TabPane } = Tabs;
const { Title, Paragraph, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const TemplateSelector = ({ 
  resourceType, 
  onSelectTemplate, 
  defaultTemplate,
  subject,
  grade
}) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(defaultTemplate || null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState({
    subject: subject || 'all',
    grade: grade || 'all',
    sort: 'popular'
  });

  // 加载模板
  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        const params = {
          type: resourceType,
          subject: filters.subject !== 'all' ? filters.subject : undefined,
          grade: filters.grade !== 'all' ? filters.grade : undefined,
          sort: filters.sort,
          search: searchValue || undefined
        };
        
        const response = await apiService.get('/templates', { params });
        setTemplates(response);
      } catch (error) {
        console.error('Failed to fetch templates:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTemplates();
  }, [resourceType, filters, searchValue]);

  // 处理模板选择
  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template.id);
    if (onSelectTemplate) {
      onSelectTemplate(template);
    }
  };

  // 处理模板预览
  const handlePreview = (template) => {
    setPreviewTemplate(template);
    setPreviewVisible(true);
  };

  // 处理收藏模板
  const handleFavorite = async (template) => {
    try {
      await apiService.post('/templates/favorite', {
        templateId: template.id,
        isFavorite: !template.isFavorite
      });
      
      // 更新模板列表
      setTemplates(prev => 
        prev.map(item => 
          item.id === template.id 
            ? { ...item, isFavorite: !item.isFavorite } 
            : item
        )
      );
    } catch (error) {
      console.error('Failed to favorite template:', error);
    }
  };

  // 处理搜索
  const handleSearch = (value) => {
    setSearchValue(value);
  };

  // 处理筛选变化
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // 渲染模板列表
  const renderTemplateList = (templateList) => {
    if (templateList.length === 0 && !loading) {
      return <Empty description="暂无模板" />;
    }
    
    return (
      <List
        grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 4, xxl: 6 }}
        dataSource={templateList}
        renderItem={template => (
          <List.Item>
            <Card
              hoverable
              cover={
                <div 
                  style={{ 
                    height: 160, 
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                >
                  {template.thumbnail ? (
                    <img 
                      alt={template.name} 
                      src={template.thumbnail} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : (
                    <div 
                      style={{ 
                        height: '100%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        background: '#f0f2f5'
                      }}
                    >
                      <FileTextOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                    </div>
                  )}
                  
                  {/* 预览按钮 */}
                  <Button
                    type="primary"
                    icon={<EyeOutlined />}
                    size="small"
                    style={{
                      position: 'absolute',
                      right: 8,
                      top: 8,
                      opacity: 0.8
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePreview(template);
                    }}
                  >
                    预览
                  </Button>
                </div>
              }
              onClick={() => handleSelectTemplate(template)}
              className={selectedTemplate === template.id ? 'template-selected' : ''}
              style={selectedTemplate === template.id ? { borderColor: '#1890ff', boxShadow: '0 0 0 2px rgba(24,144,255,0.2)' } : {}}
              actions={[
                <Tooltip title="预览">
                  <EyeOutlined key="preview" onClick={(e) => {
                    e.stopPropagation();
                    handlePreview(template);
                  }} />
                </Tooltip>,
                <Tooltip title={template.isFavorite ? "取消收藏" : "收藏"}>
                  {template.isFavorite ? (
                    <StarFilled 
                      key="favorite" 
                      style={{ color: '#faad14' }} 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFavorite(template);
                      }} 
                    />
                  ) : (
                    <StarOutlined 
                      key="favorite" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFavorite(template);
                      }} 
                    />
                  )}
                </Tooltip>,
                <Tooltip title="下载">
                  <DownloadOutlined key="download" onClick={(e) => {
                    e.stopPropagation();
                    // 下载模板逻辑
                  }} />
                </Tooltip>
              ]}
            >
              <Skeleton loading={loading} active>
                <Card.Meta
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Tooltip title={template.name}>
                        <span style={{ 
                          maxWidth: '80%', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap' 
                        }}>
                          {template.name}
                        </span>
                      </Tooltip>
                      {template.isOfficial && (
                        <Tag color="blue" style={{ marginLeft: 4 }}>官方</Tag>
                      )}
                    </div>
                  }
                  description={
                    <>
                      <Paragraph ellipsis={{ rows: 2 }} style={{ height: 40 }}>
                        {template.description}
                      </Paragraph>
                      <Space style={{ marginTop: 8 }}>
                        {template.subject && <Tag>{template.subject}</Tag>}
                        {template.grade && <Tag>{template.grade}</Tag>}
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          使用次数: {template.usageCount}
                        </Text>
                      </Space>
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

  // 渲染筛选器
  const renderFilters = () => {
    return (
      <div style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8} md={6} lg={5} xl={4}>
            <Search
              placeholder="搜索模板"
              onSearch={handleSearch}
              style={{ width: '100%' }}
              allowClear
            />
          </Col>
          
          <Col xs={24} sm={16} md={18} lg={19} xl={20}>
            <Space wrap>
              <span>
                <Text strong style={{ marginRight: 8 }}>学科:</Text>
                <Select
                  value={filters.subject}
                  onChange={(value) => handleFilterChange('subject', value)}
                  style={{ width: 120 }}
                >
                  <Option value="all">全部</Option>
                  <Option value="chinese">语文</Option>
                  <Option value="math">数学</Option>
                  <Option value="english">英语</Option>
                  <Option value="physics">物理</Option>
                  <Option value="chemistry">化学</Option>
                  <Option value="biology">生物</Option>
                  <Option value="history">历史</Option>
                  <Option value="geography">地理</Option>
                  <Option value="politics">政治</Option>
                </Select>
              </span>
              
              <span>
                <Text strong style={{ marginRight: 8 }}>年级:</Text>
                <Select
                  value={filters.grade}
                  onChange={(value) => handleFilterChange('grade', value)}
                  style={{ width: 120 }}
                >
                  <Option value="all">全部</Option>
                  <Option value="primary">小学</Option>
                  <Option value="junior">初中</Option>
                  <Option value="senior">高中</Option>
                </Select>
              </span>
              
              <span>
                <Text strong style={{ marginRight: 8 }}>排序:</Text>
                <Select
                  value={filters.sort}
                  onChange={(value) => handleFilterChange('sort', value)}
                  style={{ width: 120 }}
                >
                  <Option value="popular">最受欢迎</Option>
                  <Option value="newest">最新</Option>
                  <Option value="recommended">推荐</Option>
                </Select>
              </span>
            </Space>
          </Col>
        </Row>
      </div>
    );
  };

  return (
    <div className="template-selector">
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane 
          tab={
            <span>
              <AppstoreOutlined />
              全部模板
            </span>
          } 
          key="all"
        >
          {renderFilters()}
          {renderTemplateList(templates)}
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <StarOutlined />
              收藏模板
            </span>
          } 
          key="favorites"
        >
          {renderTemplateList(templates.filter(t => t.isFavorite))}
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <HistoryOutlined />
              最近使用
            </span>
          } 
          key="recent"
        >
          {renderTemplateList(templates.filter(t => t.recentlyUsed))}
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <UserOutlined />
              我的模板
            </span>
          } 
          key="my"
        >
          <div style={{ marginBottom: 16, textAlign: 'right' }}>
            <Button type="primary" icon={<PlusOutlined />}>
              创建模板
            </Button>
          </div>
          {renderTemplateList(templates.filter(t => t.isOwner))}
        </TabPane>
      </Tabs>
      
      {/* 模板预览模态框 */}
      <Modal
        title={previewTemplate?.name}
        visible={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        width={800}
        footer={[
          <Button key="back" onClick={() => setPreviewVisible(false)}>
            关闭
          </Button>,
          <Button 
            key="select" 
            type="primary" 
            onClick={() => {
              handleSelectTemplate(previewTemplate);
              setPreviewVisible(false);
            }}
          >
            使用此模板
          </Button>
        ]}
      >
        {previewTemplate && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              {previewTemplate.previewImage ? (
                <Image
                  src={previewTemplate.previewImage}
                  alt={previewTemplate.name}
                  style={{ maxWidth: '100%', maxHeight: 400 }}
                />
              ) : (
                <div 
                  style={{ 
                    height: 300, 
                    background: '#f0f2f5', 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <FileTextOutlined style={{ fontSize: 64, color: '#1890ff' }} />
                </div>
              )}
            </div>
            
            <Divider />
            
            <Row gutter={16}>
              <Col span={16}>
                <Title level={5}>模板描述</Title>
                <Paragraph>{previewTemplate.description}</Paragraph>
                
                <Title level={5} style={{ marginTop: 16 }}>适用场景</Title>
                <Paragraph>{previewTemplate.suitableFor || '适用于各种教学场景'}</Paragraph>
                
                {previewTemplate.features && (
                  <>
                    <Title level={5} style={{ marginTop: 16 }}>特点</Title>
                    <ul>
                      {previewTemplate.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </>
                )}
              </Col>
              
              <Col span={8}>
                <Card size="small" title="模板信息">
                  <p><strong>创建者:</strong> {previewTemplate.author}</p>
                  <p><strong>创建时间:</strong> {previewTemplate.createdAt}</p>
                  <p><strong>更新时间:</strong> {previewTemplate.updatedAt}</p>
                  <p><strong>使用次数:</strong> {previewTemplate.usageCount}</p>
                  <p>
                    <strong>标签:</strong> 
                    <div style={{ marginTop: 4 }}>
                      {previewTemplate.tags?.map(tag => (
                        <Tag key={tag}>{tag}</Tag>
                      ))}
                    </div>
                  </p>
                </Card>
                
                <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
                  <Button icon={<DownloadOutlined />}>
                    下载模板
                  </Button>
                  <Button icon={<ShareAltOutlined />}>
                    分享模板
                  </Button>
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TemplateSelector; 