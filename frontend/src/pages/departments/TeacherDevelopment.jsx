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
  Timeline
} from 'antd';
import { 
  UserOutlined, 
  SearchOutlined, 
  LineChartOutlined, 
  BookOutlined, 
  BarChartOutlined, 
  ExperimentOutlined,
  FileSearchOutlined,
  FileAddOutlined,
  SolutionOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import LLMSelector from '../../components/common/LLMSelector';
import { TASK_TYPES } from '../../services/llmService';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Step } = Steps;

const TeacherDevelopment = () => {
  const [activeTab, setActiveTab] = useState('training');
  const [selectedLLM, setSelectedLLM] = useState(null);
  
  // 教师培训规划
  const renderTrainingPlanning = () => {
    const trainingData = [
      { id: 1, name: '新课标解读培训', category: '教学能力', participants: 120, status: 'planned', startDate: '2023-07-15', endDate: '2023-07-20' },
      { id: 2, name: '信息技术与教学融合', category: '技术能力', participants: 85, status: 'in_progress', startDate: '2023-06-10', endDate: '2023-06-25' },
      { id: 3, name: '班主任能力提升', category: '管理能力', participants: 60, status: 'completed', startDate: '2023-05-05', endDate: '2023-05-15' },
      { id: 4, name: '学科教学研讨', category: '教学能力', participants: 45, status: 'planned', startDate: '2023-08-10', endDate: '2023-08-15' },
      { id: 5, name: '教育心理学应用', category: '心理辅导', participants: 70, status: 'in_progress', startDate: '2023-06-20', endDate: '2023-07-05' }
    ];
    
    const columns = [
      {
        title: '培训名称',
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
        title: '参与人数',
        dataIndex: 'participants',
        key: 'participants',
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
          <Input.Search placeholder="搜索培训名称" style={{ width: 250 }} />
          <Select defaultValue="all" style={{ width: 120 }}>
            <Option value="all">所有类别</Option>
            <Option value="teaching">教学能力</Option>
            <Option value="tech">技术能力</Option>
            <Option value="management">管理能力</Option>
            <Option value="psychology">心理辅导</Option>
          </Select>
          <Select defaultValue="all" style={{ width: 120 }}>
            <Option value="all">所有状态</Option>
            <Option value="planned">计划中</Option>
            <Option value="in_progress">进行中</Option>
            <Option value="completed">已完成</Option>
          </Select>
          <RangePicker />
          <Button type="primary" icon={<FileSearchOutlined />}>查询</Button>
          <Button icon={<FileAddOutlined />}>新增培训</Button>
        </Space>
        
        <Card title="教师培训计划">
          <Table 
            columns={columns} 
            dataSource={trainingData} 
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Card>
        
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={12}>
            <Card title="AI培训规划助手">
              <Form layout="vertical">
                <Form.Item label="培训主题">
                  <Input placeholder="请输入培训主题" />
                </Form.Item>
                <Form.Item label="培训目标">
                  <Input.TextArea placeholder="请输入培训目标" rows={3} />
                </Form.Item>
                <Form.Item label="培训对象">
                  <Select defaultValue="all">
                    <Option value="all">全体教师</Option>
                    <Option value="new">新入职教师</Option>
                    <Option value="senior">高级教师</Option>
                    <Option value="subject">学科教师</Option>
                  </Select>
                </Form.Item>
                <Form.Item label="培训时长">
                  <Input placeholder="请输入培训时长" suffix="小时" />
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
                    生成培训方案
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="培训统计数据">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic 
                    title="本年度培训总数" 
                    value={24} 
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic 
                    title="教师参与率" 
                    value={87.5} 
                    suffix="%" 
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic 
                    title="进行中培训" 
                    value={5} 
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic 
                    title="培训满意度" 
                    value={92.3} 
                    suffix="%" 
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Col>
              </Row>
              <Divider />
              <Title level={5}>培训日程</Title>
              <Timeline>
                <Timeline.Item color="green">新课标解读培训 (2023-07-15)</Timeline.Item>
                <Timeline.Item color="green">信息技术与教学融合 (进行中)</Timeline.Item>
                <Timeline.Item color="blue">学科教学研讨 (2023-08-10)</Timeline.Item>
                <Timeline.Item color="gray">班主任能力提升 (已完成)</Timeline.Item>
              </Timeline>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };
  
  // 教师能力评估
  const renderTeacherEvaluation = () => {
    return (
      <div>
        <Alert
          message="教师能力评估"
          description="这里将展示教师能力评估功能，包括评估标准、评估流程、评估结果分析、改进建议等。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        {/* 教师能力评估功能实现 */}
      </div>
    );
  };
  
  // 专业发展路径
  const renderProfessionalDevelopment = () => {
    return (
      <div>
        <Alert
          message="专业发展路径"
          description="这里将展示专业发展路径功能，包括发展规划、阶段目标、能力提升、职称晋升等。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        {/* 专业发展路径功能实现 */}
      </div>
    );
  };
  
  // 教学研究支持
  const renderResearchSupport = () => {
    return (
      <div>
        <Alert
          message="教学研究支持"
          description="这里将展示教学研究支持功能，包括研究课题、研究方法、数据分析、成果发表等。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        {/* 教学研究支持功能实现 */}
      </div>
    );
  };
  
  return (
    <Card
      title={
        <Space>
          <UserOutlined />
          <span>教师发展部门</span>
        </Space>
      }
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane 
          tab={
            <span>
              <BookOutlined />
              教师培训规划
            </span>
          } 
          key="training"
        >
          {renderTrainingPlanning()}
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <BarChartOutlined />
              教师能力评估
            </span>
          } 
          key="evaluation"
        >
          {renderTeacherEvaluation()}
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <SolutionOutlined />
              专业发展路径
            </span>
          } 
          key="development"
        >
          {renderProfessionalDevelopment()}
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <ExperimentOutlined />
              教学研究支持
            </span>
          } 
          key="research"
        >
          {renderResearchSupport()}
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default TeacherDevelopment; 