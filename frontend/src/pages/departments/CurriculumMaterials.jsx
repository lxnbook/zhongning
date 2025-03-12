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
  Tree,
  Descriptions
} from 'antd';
import { 
  ReadOutlined, 
  SearchOutlined, 
  BookOutlined, 
  FileTextOutlined, 
  BarChartOutlined, 
  PlusOutlined,
  FileSearchOutlined,
  FileAddOutlined,
  FolderOutlined,
  ToolOutlined
} from '@ant-design/icons';
import LLMSelector from '../../components/common/LLMSelector';
import { TASK_TYPES } from '../../services/llmService';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { DirectoryTree } = Tree;

const CurriculumMaterials = () => {
  const [activeTab, setActiveTab] = useState('design');
  const [selectedLLM, setSelectedLLM] = useState(null);
  
  // 课程设计辅助
  const renderCurriculumDesign = () => {
    const curriculumData = [
      { id: 1, name: '初中数学课程标准', subject: '数学', grade: '初中', version: '2022版', status: 'published' },
      { id: 2, name: '高中语文选修课程', subject: '语文', grade: '高中', version: '2021版', status: 'draft' },
      { id: 3, name: '小学科学探究课程', subject: '科学', grade: '小学', version: '2023版', status: 'review' },
      { id: 4, name: '高中物理实验课程', subject: '物理', grade: '高中', version: '2022版', status: 'published' },
      { id: 5, name: '初中历史与社会课程', subject: '历史', grade: '初中', version: '2023版', status: 'draft' }
    ];
    
    const columns = [
      {
        title: '课程名称',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '学科',
        dataIndex: 'subject',
        key: 'subject',
        render: subject => <Tag>{subject}</Tag>
      },
      {
        title: '适用年级',
        dataIndex: 'grade',
        key: 'grade',
      },
      {
        title: '版本',
        dataIndex: 'version',
        key: 'version',
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        render: status => {
          let color = 'green';
          let text = '已发布';
          
          if (status === 'draft') {
            color = 'blue';
            text = '草稿';
          } else if (status === 'review') {
            color = 'orange';
            text = '审核中';
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
            <Button type="link" size="small">编辑</Button>
          </Space>
        )
      }
    ];
    
    return (
      <div>
        <Space style={{ marginBottom: 16 }} wrap>
          <Input.Search placeholder="搜索课程名称" style={{ width: 250 }} />
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
            <Option value="primary">小学</Option>
            <Option value="junior">初中</Option>
            <Option value="senior">高中</Option>
          </Select>
          <Select defaultValue="all" style={{ width: 120 }}>
            <Option value="all">所有状态</Option>
            <Option value="published">已发布</Option>
            <Option value="draft">草稿</Option>
            <Option value="review">审核中</Option>
          </Select>
          <Button type="primary" icon={<FileSearchOutlined />}>查询</Button>
          <Button icon={<FileAddOutlined />}>新增课程</Button>
        </Space>
        
        <Card title="课程设计列表">
          <Table 
            columns={columns} 
            dataSource={curriculumData} 
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Card>
        
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={12}>
            <Card title="AI课程设计助手">
              <Form layout="vertical">
                <Form.Item label="课程名称">
                  <Input placeholder="请输入课程名称" />
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
                <Form.Item label="适用年级">
                  <Select defaultValue="junior">
                    <Option value="primary">小学</Option>
                    <Option value="junior">初中</Option>
                    <Option value="senior">高中</Option>
                  </Select>
                </Form.Item>
                <Form.Item label="课程目标">
                  <Input.TextArea placeholder="请输入课程目标" rows={3} />
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
                    生成课程设计
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="课程体系结构">
              <DirectoryTree
                defaultExpandAll
                treeData={[
                  {
                    title: '义务教育阶段',
                    key: '0-0',
                    children: [
                      {
                        title: '小学',
                        key: '0-0-0',
                        children: [
                          { title: '语文', key: '0-0-0-0' },
                          { title: '数学', key: '0-0-0-1' },
                          { title: '英语', key: '0-0-0-2' },
                          { title: '科学', key: '0-0-0-3' },
                        ],
                      },
                      {
                        title: '初中',
                        key: '0-0-1',
                        children: [
                          { title: '语文', key: '0-0-1-0' },
                          { title: '数学', key: '0-0-1-1' },
                          { title: '英语', key: '0-0-1-2' },
                          { title: '物理', key: '0-0-1-3' },
                          { title: '化学', key: '0-0-1-4' },
                        ],
                      },
                    ],
                  },
                  {
                    title: '高中阶段',
                    key: '0-1',
                    children: [
                      { title: '语文', key: '0-1-0' },
                      { title: '数学', key: '0-1-1' },
                      { title: '英语', key: '0-1-2' },
                      { title: '物理', key: '0-1-3' },
                      { title: '化学', key: '0-1-4' },
                      { title: '生物', key: '0-1-5' },
                    ],
                  },
                ]}
              />
            </Card>
          </Col>
        </Row>
      </div>
    );
  };
  
  // 教材分析工具
  const renderTextbookAnalysis = () => {
    return (
      <div>
        <Alert
          message="教材分析工具"
          description="这里将展示教材分析工具功能，包括教材内容分析、知识点提取、难度评估、教学建议等。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        {/* 教材分析工具功能实现 */}
      </div>
    );
  };
  
  // 教材使用指导
  const renderTextbookGuidance = () => {
    return (
      <div>
        <Alert
          message="教材使用指导"
          description="这里将展示教材使用指导功能，包括教学建议、重点难点、教学策略、案例分享等。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        {/* 教材使用指导功能实现 */}
      </div>
    );
  };
  
  // 课程资源补充
  const renderResourceSupplementation = () => {
    return (
      <div>
        <Alert
          message="课程资源补充"
          description="这里将展示课程资源补充功能，包括补充材料、拓展资源、练习题库、多媒体资源等。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        {/* 课程资源补充功能实现 */}
      </div>
    );
  };
  
  return (
    <Card
      title={
        <Space>
          <ReadOutlined />
          <span>课程与教材部门</span>
        </Space>
      }
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane 
          tab={
            <span>
              <BookOutlined />
              课程设计辅助
            </span>
          } 
          key="design"
        >
          {renderCurriculumDesign()}
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <BarChartOutlined />
              教材分析工具
            </span>
          } 
          key="analysis"
        >
          {renderTextbookAnalysis()}
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <FileTextOutlined />
              教材使用指导
            </span>
          } 
          key="guidance"
        >
          {renderTextbookGuidance()}
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <FolderOutlined />
              课程资源补充
            </span>
          } 
          key="resources"
        >
          {renderResourceSupplementation()}
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default CurriculumMaterials; 