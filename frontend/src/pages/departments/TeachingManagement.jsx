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
  message
} from 'antd';
import { 
  ApartmentOutlined, 
  SearchOutlined, 
  FileTextOutlined, 
  CheckCircleOutlined, 
  BarChartOutlined, 
  SettingOutlined,
  FileSearchOutlined,
  FileAddOutlined,
  TeamOutlined,
  BookOutlined
} from '@ant-design/icons';
import LLMSelector from '../../components/common/LLMSelector';
import { TASK_TYPES } from '../../services/llmService';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;

const TeachingManagement = () => {
  const [activeTab, setActiveTab] = useState('quality');
  const [selectedLLM, setSelectedLLM] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // 教学质量监控
  const renderQualityMonitoring = () => {
    const qualityData = [
      { id: 1, school: '第一中学', subject: '数学', grade: '高一', teacher: '张老师', score: 92, status: 'excellent' },
      { id: 2, school: '实验中学', subject: '语文', grade: '初三', teacher: '李老师', score: 85, status: 'good' },
      { id: 3, school: '第三中学', subject: '英语', grade: '高二', teacher: '王老师', score: 78, status: 'average' },
      { id: 4, school: '育才中学', subject: '物理', grade: '高三', teacher: '赵老师', score: 65, status: 'poor' },
      { id: 5, school: '第二中学', subject: '化学', grade: '高一', teacher: '刘老师', score: 88, status: 'good' }
    ];
    
    const columns = [
      {
        title: '学校',
        dataIndex: 'school',
        key: 'school',
      },
      {
        title: '学科',
        dataIndex: 'subject',
        key: 'subject',
      },
      {
        title: '年级',
        dataIndex: 'grade',
        key: 'grade',
      },
      {
        title: '教师',
        dataIndex: 'teacher',
        key: 'teacher',
      },
      {
        title: '评分',
        dataIndex: 'score',
        key: 'score',
        render: score => <Progress percent={score} size="small" />
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        render: status => {
          let color = 'green';
          let text = '优秀';
          
          if (status === 'good') {
            color = 'blue';
            text = '良好';
          } else if (status === 'average') {
            color = 'orange';
            text = '一般';
          } else if (status === 'poor') {
            color = 'red';
            text = '待改进';
          }
          
          return <Tag color={color}>{text}</Tag>;
        }
      },
      {
        title: '操作',
        key: 'action',
        render: (_, record) => (
          <Space size="small">
            <Button type="link" size="small">查看详情</Button>
            <Button type="link" size="small">生成报告</Button>
          </Space>
        )
      }
    ];
    
    const fetchData = async () => {
      setLoading(true);
      try {
        // 数据加载逻辑
        // ...
      } catch (error) {
        console.error('加载数据失败:', error);
        message.error('加载数据失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };
    
    return (
      <div>
        <Space style={{ marginBottom: 16 }} wrap>
          <Input.Search placeholder="搜索学校或教师" style={{ width: 250 }} />
          <Select defaultValue="all" style={{ width: 120 }}>
            <Option value="all">所有学科</Option>
            <Option value="math">数学</Option>
            <Option value="chinese">语文</Option>
            <Option value="english">英语</Option>
            <Option value="physics">物理</Option>
            <Option value="chemistry">化学</Option>
          </Select>
          <Select defaultValue="all" style={{ width: 120 }}>
            <Option value="all">所有年级</Option>
            <Option value="junior1">初一</Option>
            <Option value="junior2">初二</Option>
            <Option value="junior3">初三</Option>
            <Option value="senior1">高一</Option>
            <Option value="senior2">高二</Option>
            <Option value="senior3">高三</Option>
          </Select>
          <RangePicker />
          <Button type="primary" icon={<FileSearchOutlined />}>查询</Button>
          <Button icon={<FileAddOutlined />}>新增评估</Button>
        </Space>
        
        <Card title="教学质量评估结果">
          <Table 
            loading={loading}
            columns={columns} 
            dataSource={qualityData} 
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Card>
        
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={12}>
            <Card title="AI教学质量分析">
              <Form layout="vertical">
                <Form.Item label="选择学校">
                  <Select defaultValue="all">
                    <Option value="all">所有学校</Option>
                    <Option value="school1">第一中学</Option>
                    <Option value="school2">实验中学</Option>
                    <Option value="school3">第三中学</Option>
                  </Select>
                </Form.Item>
                <Form.Item label="选择学科">
                  <Select defaultValue="all">
                    <Option value="all">所有学科</Option>
                    <Option value="math">数学</Option>
                    <Option value="chinese">语文</Option>
                    <Option value="english">英语</Option>
                  </Select>
                </Form.Item>
                <Form.Item label="分析类型">
                  <Select defaultValue="trend">
                    <Option value="trend">趋势分析</Option>
                    <Option value="comparison">对比分析</Option>
                    <Option value="problem">问题诊断</Option>
                    <Option value="suggestion">改进建议</Option>
                  </Select>
                </Form.Item>
                <Form.Item label="AI模型">
                  <LLMSelector
                    taskType={TASK_TYPES.FEEDBACK_ANALYSIS}
                    value={selectedLLM}
                    onChange={setSelectedLLM}
                  />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" icon={<BarChartOutlined />}>
                    生成分析报告
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="教学质量统计">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic 
                    title="平均教学质量评分" 
                    value={82.6} 
                    suffix="/100" 
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic 
                    title="优秀教师比例" 
                    value={35.8} 
                    suffix="%" 
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic 
                    title="待改进教师数量" 
                    value={12} 
                    valueStyle={{ color: '#cf1322' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic 
                    title="本月评估完成率" 
                    value={92.5} 
                    suffix="%" 
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Col>
              </Row>
              <Divider />
              <Title level={5}>最近评估活动</Title>
              <List
                size="small"
                dataSource={[
                  '第一中学高一数学教学质量评估',
                  '实验中学初三语文教学质量评估',
                  '第三中学高二英语教学质量评估',
                  '育才中学高三物理教学质量评估'
                ]}
                renderItem={item => (
                  <List.Item>
                    <Text ellipsis>{item}</Text>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </div>
    );
  };
  
  // 教学资源管理
  const renderResourceManagement = () => {
    // 实现教学资源管理功能
    return (
      <div>
        <Alert
          message="教学资源管理"
          description="这里将展示教学资源管理功能，包括资源库、资源分类、资源审核、资源分发等功能。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        {/* 教学资源管理功能实现 */}
      </div>
    );
  };
  
  // 教学计划审核
  const renderPlanReview = () => {
    // 实现教学计划审核功能
    return (
      <div>
        <Alert
          message="教学计划审核"
          description="这里将展示教学计划审核功能，包括计划提交、审核流程、审核标准、审核反馈等功能。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        {/* 教学计划审核功能实现 */}
      </div>
    );
  };
  
  // 教学标准制定
  const renderStandardSetting = () => {
    // 实现教学标准制定功能
    return (
      <div>
        <Alert
          message="教学标准制定"
          description="这里将展示教学标准制定功能，包括标准草案、标准审核、标准发布、标准执行监督等功能。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        {/* 教学标准制定功能实现 */}
      </div>
    );
  };
  
  return (
    <Card
      title={
        <Space>
          <ApartmentOutlined />
          <span>教学管理部门</span>
        </Space>
      }
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane 
          tab={
            <span>
              <BarChartOutlined />
              教学质量监控
            </span>
          } 
          key="quality"
        >
          {renderQualityMonitoring()}
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <FileTextOutlined />
              教学资源管理
            </span>
          } 
          key="resource"
        >
          {renderResourceManagement()}
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <CheckCircleOutlined />
              教学计划审核
            </span>
          } 
          key="plan"
        >
          {renderPlanReview()}
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <SettingOutlined />
              教学标准制定
            </span>
          } 
          key="standard"
        >
          {renderStandardSetting()}
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default TeachingManagement; 