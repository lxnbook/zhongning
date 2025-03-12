import React, { useState } from 'react';
import { 
  Card, 
  Tabs, 
  Typography, 
  Space, 
  Button, 
  Table, 
  Tag, 
  Input, 
  Select, 
  Form, 
  DatePicker, 
  Progress, 
  Statistic, 
  Row, 
  Col,
  List,
  Avatar,
  Divider,
  Alert,
  Steps,
  Timeline,
  Upload,
  message,
  Rate
} from 'antd';
import { 
  ToolOutlined, 
  SearchOutlined, 
  PlayCircleOutlined, 
  FileTextOutlined, 
  BarChartOutlined, 
  BookOutlined,
  FileSearchOutlined,
  FileAddOutlined,
  UploadOutlined,
  DownloadOutlined,
  LaptopOutlined,
  VideoCameraOutlined,
  AppstoreOutlined,
  CloudUploadOutlined,
  CheckCircleOutlined,
  StarOutlined,
  PlusOutlined
} from '@ant-design/icons';
import LLMSelector from '../../components/common/LLMSelector';
import { TASK_TYPES } from '../../services/llmService';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Step } = Steps;

const EducationTechnology = () => {
  const [activeTab, setActiveTab] = useState('guidance');
  const [selectedLLM, setSelectedLLM] = useState(null);
  
  // 技术应用指导
  const renderTechGuidance = () => {
    const techData = [
      { id: 1, name: '智慧课堂应用指南', category: '教学应用', target: '教师', downloads: 235, rating: 4.7 },
      { id: 2, name: '在线教学平台使用手册', category: '平台使用', target: '教师/学生', downloads: 412, rating: 4.5 },
      { id: 3, name: '教育数据分析工具指南', category: '数据分析', target: '管理人员', downloads: 156, rating: 4.2 },
      { id: 4, name: '多媒体教学资源制作指南', category: '资源制作', target: '教师', downloads: 287, rating: 4.8 },
      { id: 5, name: '教育APP评估与选择指南', category: '软件评估', target: '教师/管理人员', downloads: 198, rating: 4.3 }
    ];
    
    const columns = [
      {
        title: '指南名称',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '类别',
        dataIndex: 'category',
        key: 'category',
        render: category => <Tag>{category}</Tag>
      },
      {
        title: '适用对象',
        dataIndex: 'target',
        key: 'target',
      },
      {
        title: '下载次数',
        dataIndex: 'downloads',
        key: 'downloads',
      },
      {
        title: '评分',
        dataIndex: 'rating',
        key: 'rating',
        render: rating => <Rate disabled defaultValue={rating} allowHalf />
      },
      {
        title: '操作',
        key: 'action',
        render: (_, record) => (
          <Space size="small">
            <Button type="link" size="small" icon={<DownloadOutlined />}>下载</Button>
            <Button type="link" size="small">查看详情</Button>
          </Space>
        )
      }
    ];
    
    return (
      <div>
        <Space style={{ marginBottom: 16 }} wrap>
          <Input.Search placeholder="搜索指南名称" style={{ width: 250 }} />
          <Select defaultValue="all" style={{ width: 120 }}>
            <Option value="all">所有类别</Option>
            <Option value="teaching">教学应用</Option>
            <Option value="platform">平台使用</Option>
            <Option value="data">数据分析</Option>
            <Option value="resource">资源制作</Option>
            <Option value="software">软件评估</Option>
          </Select>
          <Select defaultValue="all" style={{ width: 120 }}>
            <Option value="all">所有对象</Option>
            <Option value="teacher">教师</Option>
            <Option value="student">学生</Option>
            <Option value="admin">管理人员</Option>
          </Select>
          <Button type="primary" icon={<FileSearchOutlined />}>查询</Button>
          <Button icon={<FileAddOutlined />}>新增指南</Button>
        </Space>
        
        <Card title="技术应用指南库">
          <Table 
            dataSource={techData} 
            columns={columns} 
            rowKey="id"
            pagination={{ pageSize: 5 }}
          />
        </Card>
        
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={12}>
            <Card title="AI指南生成器">
              <Form layout="vertical">
                <Form.Item label="技术名称">
                  <Input placeholder="请输入技术名称" />
                </Form.Item>
                <Form.Item label="技术描述">
                  <Input.TextArea placeholder="请描述该技术的基本功能和特点" rows={3} />
                </Form.Item>
                <Form.Item label="适用对象">
                  <Select mode="multiple" placeholder="请选择适用对象">
                    <Option value="teacher">教师</Option>
                    <Option value="student">学生</Option>
                    <Option value="admin">管理人员</Option>
                    <Option value="parent">家长</Option>
                  </Select>
                </Form.Item>
                <Form.Item label="指南类型">
                  <Select defaultValue="usage">
                    <Option value="usage">使用指南</Option>
                    <Option value="best">最佳实践</Option>
                    <Option value="trouble">故障排除</Option>
                    <Option value="integration">教学融合</Option>
                  </Select>
                </Form.Item>
                <Form.Item label="AI模型">
                  <LLMSelector
                    taskType={TASK_TYPES.CONTENT_GENERATION}
                    value={selectedLLM}
                    onChange={setSelectedLLM}
                  />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" icon={<ToolOutlined />}>
                    生成技术指南
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="热门技术趋势">
              <List
                itemLayout="horizontal"
                dataSource={[
                  { title: '人工智能在教育中的应用', hot: 98 },
                  { title: '虚拟现实教学环境', hot: 85 },
                  { title: '自适应学习系统', hot: 76 },
                  { title: '教育大数据分析', hot: 72 },
                  { title: '区块链在教育记录中的应用', hot: 65 }
                ]}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<LaptopOutlined />} />}
                      title={item.title}
                      description={`热度指数: ${item.hot}`}
                    />
                    <Button type="link">了解更多</Button>
                  </List.Item>
                )}
              />
              <Divider />
              <Title level={5}>技术支持热线</Title>
              <Paragraph>
                <Text strong>电话：</Text> 400-123-4567<br />
                <Text strong>邮箱：</Text> tech-support@edu.gov.cn<br />
                <Text strong>工作时间：</Text> 周一至周五 8:30-17:30
              </Paragraph>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };
  
  // 数字资源开发
  const renderDigitalResourceDev = () => {
    return (
      <div>
        <Row gutter={16}>
          <Col span={24}>
            <Alert
              message="数字资源开发"
              description="这里将展示数字资源开发功能，包括教学资源制作、多媒体内容开发、交互式课件设计等。"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col span={12}>
            <Card title="AI资源开发助手">
              <Form layout="vertical">
                <Form.Item label="资源名称">
                  <Input placeholder="请输入资源名称" />
                </Form.Item>
                <Form.Item label="学科">
                  <Select defaultValue="math">
                    <Option value="math">数学</Option>
                    <Option value="chinese">语文</Option>
                    <Option value="english">英语</Option>
                    <Option value="physics">物理</Option>
                    <Option value="chemistry">化学</Option>
                  </Select>
                </Form.Item>
                <Form.Item label="年级">
                  <Select defaultValue="junior">
                    <Option value="primary">小学</Option>
                    <Option value="junior">初中</Option>
                    <Option value="senior">高中</Option>
                  </Select>
                </Form.Item>
                <Form.Item label="资源类型">
                  <Select defaultValue="interactive">
                    <Option value="video">教学视频</Option>
                    <Option value="ppt">演示文稿</Option>
                    <Option value="interactive">交互式课件</Option>
                    <Option value="game">教育游戏</Option>
                    <Option value="vr">虚拟现实</Option>
                  </Select>
                </Form.Item>
                <Form.Item label="资源描述">
                  <Input.TextArea placeholder="请描述资源的内容和用途" rows={3} />
                </Form.Item>
                <Form.Item label="AI模型">
                  <LLMSelector
                    taskType={TASK_TYPES.CONTENT_GENERATION}
                    value={selectedLLM}
                    onChange={setSelectedLLM}
                  />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" icon={<AppstoreOutlined />}>
                    生成资源方案
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
          
          <Col span={12}>
            <Card title="资源库管理">
              <List
                itemLayout="horizontal"
                dataSource={[
                  { id: 1, title: '初中数学函数图像交互课件', type: '交互式课件', views: 1256 },
                  { id: 2, title: '高中物理虚拟实验室', type: '虚拟实验', views: 987 },
                  { id: 3, title: '小学英语单词学习游戏', type: '教育游戏', views: 2341 },
                  { id: 4, title: '高中化学分子结构3D模型', type: '3D模型', views: 765 }
                ]}
                renderItem={item => (
                  <List.Item
                    actions={[
                      <Button type="link" size="small">预览</Button>,
                      <Button type="link" size="small">编辑</Button>,
                      <Button type="link" size="small">分享</Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar icon={<AppstoreOutlined />} />}
                      title={item.title}
                      description={
                        <Space>
                          <Tag>{item.type}</Tag>
                          <Text type="secondary">浏览量: {item.views}</Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <Button type="primary" icon={<CloudUploadOutlined />}>上传新资源</Button>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };
  
  // 技术培训内容
  const renderTechTraining = () => {
    return (
      <div>
        <Row gutter={16}>
          <Col span={24}>
            <Alert
              message="技术培训内容"
              description="为教师和管理人员提供教育技术培训内容，提升教育工作者的技术应用能力。"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col span={12}>
            <Card title="培训课程库">
              <List
                itemLayout="horizontal"
                dataSource={[
                  { id: 1, title: '智慧课堂工具应用', level: '初级', duration: '10课时', participants: 356 },
                  { id: 2, title: '教育数据分析与应用', level: '中级', duration: '15课时', participants: 245 },
                  { id: 3, title: '多媒体教学资源制作', level: '初级', duration: '8课时', participants: 412 },
                  { id: 4, title: '虚拟现实在教学中的应用', level: '高级', duration: '12课时', participants: 178 },
                  { id: 5, title: '人工智能辅助教学', level: '中级', duration: '16课时', participants: 289 }
                ]}
                renderItem={item => (
                  <List.Item
                    actions={[
                      <Button type="link" size="small">查看详情</Button>,
                      <Button type="link" size="small">报名</Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar icon={<BookOutlined />} />}
                      title={item.title}
                      description={
                        <Space>
                          <Tag color={
                            item.level === '初级' ? 'green' : 
                            item.level === '中级' ? 'blue' : 'purple'
                          }>{item.level}</Tag>
                          <Text type="secondary">{item.duration}</Text>
                          <Text type="secondary">学员: {item.participants}人</Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
          
          <Col span={12}>
            <Card title="AI培训内容生成器">
              <Form layout="vertical">
                <Form.Item label="培训主题">
                  <Input placeholder="请输入培训主题" />
                </Form.Item>
                <Form.Item label="培训对象">
                  <Select mode="multiple" placeholder="请选择培训对象">
                    <Option value="teacher">教师</Option>
                    <Option value="admin">管理人员</Option>
                    <Option value="tech">技术人员</Option>
                  </Select>
                </Form.Item>
                <Form.Item label="技术难度">
                  <Select defaultValue="beginner">
                    <Option value="beginner">初级</Option>
                    <Option value="intermediate">中级</Option>
                    <Option value="advanced">高级</Option>
                  </Select>
                </Form.Item>
                <Form.Item label="培训内容要点">
                  <Input.TextArea placeholder="请描述培训内容的主要要点" rows={3} />
                </Form.Item>
                <Form.Item label="培训形式">
                  <Select defaultValue="online">
                    <Option value="online">在线课程</Option>
                    <Option value="workshop">工作坊</Option>
                    <Option value="lecture">讲座</Option>
                    <Option value="practice">实践操作</Option>
                  </Select>
                </Form.Item>
                <Form.Item label="AI模型">
                  <LLMSelector
                    taskType={TASK_TYPES.CONTENT_GENERATION}
                    value={selectedLLM}
                    onChange={setSelectedLLM}
                  />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" icon={<BookOutlined />}>
                    生成培训内容
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };
  
  // 技术评估工具
  const renderTechEvaluation = () => {
    return (
      <div>
        <Row gutter={16}>
          <Col span={24}>
            <Alert
              message="技术评估工具"
              description="提供教育技术评估工具，帮助学校和教育机构评估教育技术的应用效果和价值。"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col span={12}>
            <Card title="技术评估项目">
              <List
                itemLayout="horizontal"
                dataSource={[
                  { id: 1, title: '智慧校园系统评估', target: '某市第一中学', status: 'completed', score: 87 },
                  { id: 2, title: '在线学习平台评估', target: '某区教育局', status: 'in_progress', score: null },
                  { id: 3, title: '教学辅助软件评估', target: '某实验小学', status: 'completed', score: 92 },
                  { id: 4, title: '教育管理系统评估', target: '某市教育局', status: 'planned', score: null }
                ]}
                renderItem={item => (
                  <List.Item
                    actions={[
                      <Button type="link" size="small">查看详情</Button>,
                      item.status === 'completed' ? 
                        <Button type="link" size="small">查看报告</Button> : 
                        <Button type="link" size="small">编辑</Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar icon={<CheckCircleOutlined />} />}
                      title={item.title}
                      description={
                        <Space>
                          <Text type="secondary">评估对象: {item.target}</Text>
                          <Tag color={
                            item.status === 'completed' ? 'green' : 
                            item.status === 'in_progress' ? 'blue' : 'orange'
                          }>
                            {
                              item.status === 'completed' ? '已完成' : 
                              item.status === 'in_progress' ? '进行中' : '计划中'
                            }
                          </Tag>
                          {item.score && <Text strong>评分: {item.score}</Text>}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <Button type="primary" icon={<PlusOutlined />}>新建评估项目</Button>
              </div>
            </Card>
          </Col>
          
          <Col span={12}>
            <Card title="AI评估助手">
              <Form layout="vertical">
                <Form.Item label="评估项目名称">
                  <Input placeholder="请输入评估项目名称" />
                </Form.Item>
                <Form.Item label="评估对象">
                  <Input placeholder="请输入评估对象" />
                </Form.Item>
                <Form.Item label="技术类型">
                  <Select defaultValue="platform">
                    <Option value="platform">教育平台</Option>
                    <Option value="software">教育软件</Option>
                    <Option value="hardware">教育硬件</Option>
                    <Option value="system">管理系统</Option>
                    <Option value="other">其他技术</Option>
                  </Select>
                </Form.Item>
                <Form.Item label="评估维度">
                  <Select mode="multiple" defaultValue={['usability', 'effectiveness']}>
                    <Option value="usability">易用性</Option>
                    <Option value="effectiveness">有效性</Option>
                    <Option value="reliability">可靠性</Option>
                    <Option value="security">安全性</Option>
                    <Option value="cost">成本效益</Option>
                    <Option value="integration">集成性</Option>
                  </Select>
                </Form.Item>
                <Form.Item label="评估目标">
                  <Input.TextArea placeholder="请描述评估的目标和期望" rows={3} />
                </Form.Item>
                <Form.Item label="AI模型">
                  <LLMSelector
                    taskType={TASK_TYPES.CONTENT_GENERATION}
                    value={selectedLLM}
                    onChange={setSelectedLLM}
                  />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" icon={<StarOutlined />}>
                    生成评估方案
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };
  
  return (
    <Card
      title={
        <Space>
          <ToolOutlined />
          <span>教育技术部门</span>
        </Space>
      }
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane 
          tab={
            <span>
              <ToolOutlined />
              技术应用指导
            </span>
          } 
          key="guidance"
        >
          {renderTechGuidance()}
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <AppstoreOutlined />
              数字资源开发
            </span>
          } 
          key="resource"
        >
          {renderDigitalResourceDev()}
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <BookOutlined />
              技术培训内容
            </span>
          } 
          key="training"
        >
          {renderTechTraining()}
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <CheckCircleOutlined />
              技术评估工具
            </span>
          } 
          key="evaluation"
        >
          {renderTechEvaluation()}
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default EducationTechnology; 