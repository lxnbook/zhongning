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
  Tooltip
} from 'antd';
import { 
  TeamOutlined, 
  SearchOutlined, 
  LineChartOutlined, 
  UserOutlined, 
  BarChartOutlined, 
  MessageOutlined,
  FileSearchOutlined,
  FileAddOutlined,
  WarningOutlined,
  HomeOutlined
} from '@ant-design/icons';
import LLMSelector from '../../components/common/LLMSelector';
import { TASK_TYPES } from '../../services/llmService';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;

const StudentManagement = () => {
  const [activeTab, setActiveTab] = useState('analysis');
  const [selectedLLM, setSelectedLLM] = useState(null);
  
  // 学生数据分析
  const renderStudentAnalysis = () => {
    const studentData = [
      { id: 1, name: '张三', grade: '高一(3)班', attendance: 98, academic: 92, behavior: 85, overall: 91 },
      { id: 2, name: '李四', grade: '高一(2)班', attendance: 95, academic: 78, behavior: 90, overall: 85 },
      { id: 3, name: '王五', grade: '高二(1)班', attendance: 90, academic: 85, behavior: 75, overall: 83 },
      { id: 4, name: '赵六', grade: '初三(4)班', attendance: 85, academic: 65, behavior: 70, overall: 72 },
      { id: 5, name: '钱七', grade: '高三(2)班', attendance: 99, academic: 95, behavior: 92, overall: 95 }
    ];
    
    const columns = [
      {
        title: '姓名',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '班级',
        dataIndex: 'grade',
        key: 'grade',
      },
      {
        title: '出勤率',
        dataIndex: 'attendance',
        key: 'attendance',
        render: value => <Progress percent={value} size="small" />
      },
      {
        title: '学业表现',
        dataIndex: 'academic',
        key: 'academic',
        render: value => <Progress percent={value} size="small" />
      },
      {
        title: '行为表现',
        dataIndex: 'behavior',
        key: 'behavior',
        render: value => <Progress percent={value} size="small" />
      },
      {
        title: '综合评分',
        dataIndex: 'overall',
        key: 'overall',
        render: value => {
          let color = 'green';
          if (value < 60) color = 'red';
          else if (value < 80) color = 'orange';
          else if (value < 90) color = 'blue';
          
          return <Tag color={color}>{value}</Tag>;
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
    
    return (
      <div>
        <Space style={{ marginBottom: 16 }} wrap>
          <Input.Search placeholder="搜索学生姓名" style={{ width: 250 }} />
          <Select defaultValue="all" style={{ width: 120 }}>
            <Option value="all">所有年级</Option>
            <Option value="junior1">初一</Option>
            <Option value="junior2">初二</Option>
            <Option value="junior3">初三</Option>
            <Option value="senior1">高一</Option>
            <Option value="senior2">高二</Option>
            <Option value="senior3">高三</Option>
          </Select>
          <Select defaultValue="all" style={{ width: 120 }}>
            <Option value="all">所有班级</Option>
            <Option value="class1">1班</Option>
            <Option value="class2">2班</Option>
            <Option value="class3">3班</Option>
            <Option value="class4">4班</Option>
          </Select>
          <Button type="primary" icon={<FileSearchOutlined />}>查询</Button>
          <Button icon={<FileAddOutlined />}>添加学生</Button>
        </Space>
        
        <Card title="学生数据分析">
          <Table 
            columns={columns} 
            dataSource={studentData} 
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Card>
        
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card title="AI学生分析">
              <Form layout="vertical">
                <Form.Item label="选择学生">
                  <Select defaultValue="all">
                    <Option value="all">全班分析</Option>
                    <Option value="student1">张三</Option>
                    <Option value="student2">李四</Option>
                    <Option value="student3">王五</Option>
                  </Select>
                </Form.Item>
                <Form.Item label="分析维度">
                  <Select defaultValue="academic">
                    <Option value="academic">学业分析</Option>
                    <Option value="behavior">行为分析</Option>
                    <Option value="attendance">出勤分析</Option>
                    <Option value="comprehensive">综合分析</Option>
                  </Select>
                </Form.Item>
                <Form.Item label="分析时段">
                  <RangePicker style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item label="AI模型">
                  <LLMSelector
                    taskType={TASK_TYPES.STUDENT_EVALUATION}
                    value={selectedLLM}
                    onChange={setSelectedLLM}
                  />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" icon={<LineChartOutlined />}>
                    生成分析报告
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="学生统计数据">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic 
                    title="平均出勤率" 
                    value={93.4} 
                    suffix="%" 
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic 
                    title="平均学业成绩" 
                    value={83.0} 
                    suffix="分" 
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic 
                    title="需要关注学生" 
                    value={15} 
                    valueStyle={{ color: '#cf1322' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic 
                    title="优秀学生比例" 
                    value={32.5} 
                    suffix="%" 
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Col>
              </Row>
              <Divider />
              <Title level={5}>最近学生活动</Title>
              <List
                size="small"
                dataSource={[
                  '高一(3)班期中考试成绩分析',
                  '初三(4)班学生行为问题处理',
                  '高三(2)班升学指导会议',
                  '高二(1)班心理健康讲座'
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
  
  // 其他功能的实现...
  
  return (
    <Card
      title={
        <Space>
          <TeamOutlined />
          <span>学生管理部门</span>
        </Space>
      }
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane 
          tab={
            <span>
              <LineChartOutlined />
              学生数据分析
            </span>
          } 
          key="analysis"
        >
          {renderStudentAnalysis()}
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <UserOutlined />
              学生发展跟踪
            </span>
          } 
          key="development"
        >
          {/* 学生发展跟踪功能 */}
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <WarningOutlined />
              行为管理支持
            </span>
          } 
          key="behavior"
        >
          {/* 行为管理支持功能 */}
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <HomeOutlined />
              家校沟通辅助
            </span>
          } 
          key="communication"
        >
          {/* 家校沟通辅助功能 */}
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default StudentManagement; 