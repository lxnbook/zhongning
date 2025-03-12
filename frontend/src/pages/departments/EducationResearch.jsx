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
  message
} from 'antd';
import { 
  ExperimentOutlined, 
  SearchOutlined, 
  LineChartOutlined, 
  FileTextOutlined, 
  BarChartOutlined, 
  BookOutlined,
  FileSearchOutlined,
  FileAddOutlined,
  UploadOutlined,
  DownloadOutlined,
  TeamOutlined,
  PieChartOutlined,
  PlusOutlined
} from '@ant-design/icons';
import LLMSelector from '../../components/common/LLMSelector';
import { TASK_TYPES } from '../../services/llmService';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Step } = Steps;

const EducationResearch = () => {
  const [activeTab, setActiveTab] = useState('design');
  const [selectedLLM, setSelectedLLM] = useState(null);
  
  // 研究设计辅助
  const renderResearchDesign = () => {
    const researchData = [
      { id: 1, title: '中小学生学习习惯与学业成绩关系研究', type: '教育心理', leader: '张教授', status: 'in_progress', startDate: '2023-03-15', endDate: '2023-12-20' },
      { id: 2, title: '信息技术在高中物理教学中的应用研究', type: '教学方法', leader: '李教授', status: 'planned', startDate: '2023-07-10', endDate: '2024-06-30' },
      { id: 3, title: '农村小学英语教学现状与对策研究', type: '教育政策', leader: '王研究员', status: 'completed', startDate: '2022-09-01', endDate: '2023-05-30' },
      { id: 4, title: '初中生心理健康教育模式创新研究', type: '心理健康', leader: '赵教授', status: 'in_progress', startDate: '2023-02-20', endDate: '2023-11-15' },
      { id: 5, title: '高考改革对高中教学的影响研究', type: '教育政策', leader: '刘研究员', status: 'planned', startDate: '2023-08-01', endDate: '2024-07-31' }
    ];
    
    const columns = [
      {
        title: '研究课题',
        dataIndex: 'title',
        key: 'title',
        ellipsis: true,
      },
      {
        title: '研究类型',
        dataIndex: 'type',
        key: 'type',
        render: type => <Tag>{type}</Tag>
      },
      {
        title: '负责人',
        dataIndex: 'leader',
        key: 'leader',
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        render: status => {
          let color = 'blue';
          let text = '计划中';
          
          if (status === 'in_progress') {
            color = 'green';
            text = '进行中';
          } else if (status === 'completed') {
            color = 'gray';
            text = '已完成';
          }
          
          return <Tag color={color}>{text}</Tag>;
        }
      },
      {
        title: '开始日期',
        dataIndex: 'startDate',
        key: 'startDate',
      },
      {
        title: '结束日期',
        dataIndex: 'endDate',
        key: 'endDate',
      },
      {
        title: '操作',
        key: 'action',
        render: (_, record) => (
          <Space size="small">
            <Button type="link" size="small">查看详情</Button>
            <Button type="link" size="small">编辑</Button>
          </Space>
        )
      }
    ];
    
    return (
      <div>
        <Space style={{ marginBottom: 16 }} wrap>
          <Input.Search placeholder="搜索研究课题" style={{ width: 250 }} />
          <Select defaultValue="all" style={{ width: 120 }}>
            <Option value="all">所有类型</Option>
            <Option value="psychology">教育心理</Option>
            <Option value="method">教学方法</Option>
            <Option value="policy">教育政策</Option>
            <Option value="mental">心理健康</Option>
          </Select>
          <Select defaultValue="all" style={{ width: 120 }}>
            <Option value="all">所有状态</Option>
            <Option value="planned">计划中</Option>
            <Option value="in_progress">进行中</Option>
            <Option value="completed">已完成</Option>
          </Select>
          <RangePicker />
          <Button type="primary" icon={<FileSearchOutlined />}>查询</Button>
          <Button icon={<FileAddOutlined />}>新增研究</Button>
        </Space>
        
        <Card title="教育研究项目">
          <Table 
            columns={columns} 
            dataSource={researchData} 
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Card>
        
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={12}>
            <Card title="AI研究设计助手">
              <Form layout="vertical">
                <Form.Item label="研究课题">
                  <Input placeholder="请输入研究课题" />
                </Form.Item>
                <Form.Item label="研究背景">
                  <Input.TextArea placeholder="请输入研究背景" rows={3} />
                </Form.Item>
                <Form.Item label="研究目标">
                  <Input.TextArea placeholder="请输入研究目标" rows={2} />
                </Form.Item>
                <Form.Item label="研究类型">
                  <Select defaultValue="method">
                    <Option value="psychology">教育心理</Option>
                    <Option value="method">教学方法</Option>
                    <Option value="policy">教育政策</Option>
                    <Option value="mental">心理健康</Option>
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
                  <Button type="primary" icon={<ExperimentOutlined />}>
                    生成研究方案
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="研究进度跟踪">
              <Steps direction="vertical" current={2} size="small">
                <Step title="研究设计" description="确定研究课题和方法" />
                <Step title="文献综述" description="收集和分析相关文献" />
                <Step title="数据收集" description="问卷调查和实验进行中" status="process" />
                <Step title="数据分析" description="统计分析和结果解读" />
                <Step title="报告撰写" description="形成研究报告和论文" />
                <Step title="成果发布" description="发表论文和应用推广" />
              </Steps>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };
  
  // 数据分析工具
  const renderDataAnalysis = () => {
    return (
      <div>
        <Row gutter={16}>
          <Col span={24}>
            <Alert
            message="教育数据分析工具"
            description="利用AI和统计工具分析教育数据，发现规律和趋势，为教育决策提供支持。"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col span={12}>
            <Card title="数据分析项目" style={{ marginBottom: 16 }}>
              <List
                itemLayout="horizontal"
                dataSource={[
                  { id: 1, title: '2023年高考成绩分析', type: '考试分析', status: 'completed' },
                  { id: 2, title: '初中学生学习习惯调查', type: '问卷分析', status: 'in_progress' },
                  { id: 3, title: '教师教学方法与学生成绩关系', type: '相关性分析', status: 'in_progress' },
                  { id: 4, title: '农村与城市学校教育资源对比', type: '对比分析', status: 'planned' }
                ]}
                renderItem={item => (
                  <List.Item
                    actions={[
                      <Button type="link" size="small">查看</Button>,
                      <Button type="link" size="small">编辑</Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar icon={<BarChartOutlined />} />}
                      title={item.title}
                      description={
                        <Space>
                          <Tag>{item.type}</Tag>
                          <Tag color={
                            item.status === 'completed' ? 'green' : 
                            item.status === 'in_progress' ? 'blue' : 'orange'
                          }>
                            {
                              item.status === 'completed' ? '已完成' : 
                              item.status === 'in_progress' ? '进行中' : '计划中'
                            }
                          </Tag>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <Button type="primary" icon={<PlusOutlined />}>新建分析项目</Button>
              </div>
            </Card>
            
            <Card title="数据可视化">
              <Alert
                message="数据可视化功能"
                description="上传数据后，系统将自动生成图表和可视化报告，帮助您直观理解数据。"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Upload.Dragger 
                name="files" 
                action="/upload-data.do"
                onChange={info => {
                  if (info.file.status === 'done') {
                    message.success(`${info.file.name} 文件上传成功`);
                  } else if (info.file.status === 'error') {
                    message.error(`${info.file.name} 文件上传失败`);
                  }
                }}
              >
                <p className="ant-upload-drag-icon">
                  <UploadOutlined />
                </p>
                <p className="ant-upload-text">上传数据文件</p>
                <p className="ant-upload-hint">支持Excel、CSV、SPSS等格式</p>
              </Upload.Dragger>
            </Card>
          </Col>
          
          <Col span={12}>
            <Card title="AI数据分析助手">
              <Form layout="vertical">
                <Form.Item label="分析名称">
                  <Input placeholder="请输入分析名称" />
                </Form.Item>
                <Form.Item label="分析目标">
                  <Select defaultValue="correlation">
                    <Option value="correlation">相关性分析</Option>
                    <Option value="comparison">对比分析</Option>
                    <Option value="trend">趋势分析</Option>
                    <Option value="prediction">预测分析</Option>
                    <Option value="clustering">聚类分析</Option>
                  </Select>
                </Form.Item>
                <Form.Item label="数据描述">
                  <Input.TextArea placeholder="请描述您的数据内容和结构" rows={3} />
                </Form.Item>
                <Form.Item label="分析要求">
                  <Input.TextArea placeholder="请描述您希望了解的问题或假设" rows={3} />
                </Form.Item>
                <Form.Item label="AI模型">
                  <LLMSelector
                    taskType={TASK_TYPES.CONTENT_GENERATION}
                    value={selectedLLM}
                    onChange={setSelectedLLM}
                  />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" icon={<LineChartOutlined />}>
                    生成分析方案
                  </Button>
                </Form.Item>
              </Form>
            </Card>
            
            <Card title="统计分析工具" style={{ marginTop: 16 }}>
              <List
                size="small"
                bordered
                dataSource={[
                  '描述性统计分析',
                  '相关性分析',
                  '回归分析',
                  '方差分析',
                  '因子分析',
                  '聚类分析',
                  '时间序列分析'
                ]}
                renderItem={item => (
                  <List.Item>
                    <Button type="link">{item}</Button>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </div>
    );
  };
  
  // 研究报告生成
  const renderReportGeneration = () => {
    return (
      <div>
        <Row gutter={16}>
          <Col span={24}>
            <Alert
              message="研究报告生成"
              description="基于研究数据和分析结果，利用AI技术自动生成专业的研究报告，提高研究成果的呈现质量。"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col span={12}>
            <Card title="报告模板库">
              <List
                itemLayout="horizontal"
                dataSource={[
                  { id: 1, title: '教育研究学术论文', type: '学术论文', downloads: 156 },
                  { id: 2, title: '教育调查报告', type: '调查报告', downloads: 203 },
                  { id: 3, title: '教育政策分析报告', type: '政策分析', downloads: 127 },
                  { id: 4, title: '教学实验研究报告', type: '实验报告', downloads: 189 },
                  { id: 5, title: '教育项目评估报告', type: '评估报告', downloads: 142 }
                ]}
                renderItem={item => (
                  <List.Item
                    actions={[
                      <Button type="link" size="small" icon={<DownloadOutlined />}>下载</Button>,
                      <Button type="link" size="small">预览</Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar icon={<FileTextOutlined />} />}
                      title={item.title}
                      description={
                        <Space>
                          <Tag>{item.type}</Tag>
                          <Text type="secondary">下载次数: {item.downloads}</Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
          
          <Col span={12}>
            <Card title="AI报告生成器">
              <Form layout="vertical">
                <Form.Item label="报告类型">
                  <Select defaultValue="academic">
                    <Option value="academic">学术论文</Option>
                    <Option value="survey">调查报告</Option>
                    <Option value="policy">政策分析</Option>
                    <Option value="experiment">实验报告</Option>
                    <Option value="evaluation">评估报告</Option>
                  </Select>
                </Form.Item>
                <Form.Item label="研究主题">
                  <Input placeholder="请输入研究主题" />
                </Form.Item>
                <Form.Item label="研究方法">
                  <Select mode="multiple" placeholder="请选择研究方法">
                    <Option value="survey">问卷调查</Option>
                    <Option value="experiment">实验研究</Option>
                    <Option value="observation">观察法</Option>
                    <Option value="interview">访谈法</Option>
                    <Option value="case">案例研究</Option>
                    <Option value="literature">文献研究</Option>
                  </Select>
                </Form.Item>
                <Form.Item label="研究结果摘要">
                  <Input.TextArea placeholder="请简要描述研究的主要发现和结果" rows={4} />
                </Form.Item>
                <Form.Item label="AI模型">
                  <LLMSelector
                    taskType={TASK_TYPES.CONTENT_GENERATION}
                    value={selectedLLM}
                    onChange={setSelectedLLM}
                  />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" icon={<FileTextOutlined />}>
                    生成研究报告
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };
  
  // 文献综述辅助
  const renderLiteratureReview = () => {
    return (
      <div>
        <Row gutter={16}>
          <Col span={24}>
            <Alert
              message="文献综述辅助"
              description="利用AI技术辅助文献检索、分析和综述撰写，提高文献综述的质量和效率。"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col span={12}>
            <Card title="文献检索与管理">
              <Form layout="vertical">
                <Form.Item label="研究主题">
                  <Input placeholder="请输入研究主题" />
                </Form.Item>
                <Form.Item label="关键词">
                  <Select mode="tags" style={{ width: '100%' }} placeholder="请输入关键词">
                    <Option value="education">教育</Option>
                    <Option value="teaching">教学</Option>
                    <Option value="learning">学习</Option>
                  </Select>
                </Form.Item>
                <Form.Item label="文献范围">
                  <RangePicker />
                </Form.Item>
                <Form.Item label="综述类型">
                  <Select defaultValue="narrative">
                    <Option value="narrative">叙述性综述</Option>
                    <Option value="systematic">系统性综述</Option>
                    <Option value="meta">元分析</Option>
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
                    生成文献综述
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="文献分析结果">
              <Alert
                message="文献分析功能"
                description="上传文献或输入研究主题后，AI将帮助您分析文献趋势、主要观点和研究方法等。"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Upload.Dragger 
                name="files" 
                action="/upload-literature.do"
                onChange={info => {
                  if (info.file.status === 'done') {
                    message.success(`${info.file.name} 文件上传成功`);
                  } else if (info.file.status === 'error') {
                    message.error(`${info.file.name} 文件上传失败`);
                  }
                }}
              >
                <p className="ant-upload-drag-icon">
                  <UploadOutlined />
                </p>
                <p className="ant-upload-text">上传文献PDF或文档</p>
                <p className="ant-upload-hint">支持PDF、Word、EndNote等格式</p>
              </Upload.Dragger>
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
          <ExperimentOutlined />
          <span>教育科研部门</span>
        </Space>
      }
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane 
          tab={
            <span>
              <ExperimentOutlined />
              研究设计辅助
            </span>
          } 
          key="design"
        >
          {renderResearchDesign()}
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <LineChartOutlined />
              数据分析工具
            </span>
          } 
          key="analysis"
        >
          {renderDataAnalysis()}
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <FileTextOutlined />
              研究报告生成
            </span>
          } 
          key="report"
        >
          {renderReportGeneration()}
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <BookOutlined />
              文献综述辅助
            </span>
          } 
          key="literature"
        >
          {renderLiteratureReview()}
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default EducationResearch; 