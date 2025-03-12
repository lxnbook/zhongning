import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Input, 
  Select, 
  Upload, 
  Table, 
  Tabs, 
  Spin, 
  Typography, 
  Space, 
  Tag, 
  Divider, 
  Alert, 
  Collapse, 
  Tooltip, 
  Progress,
  Empty,
  Statistic,
  Row,
  Col,
  Badge,
  Modal,
  Form
} from 'antd';
import { 
  FileTextOutlined, 
  UploadOutlined, 
  RobotOutlined, 
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  BulbOutlined,
  EditOutlined,
  DownloadOutlined,
  SendOutlined,
  QuestionCircleOutlined,
  PieChartOutlined,
  UserOutlined,
  TeamOutlined
} from '@ant-design/icons';
import apiService from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Dragger } = Upload;

const AIFeedback = ({ 
  assessmentType = 'homework', // 'homework', 'exam', 'quiz', 'project'
  subjectId,
  classId,
  onFeedbackGenerated,
  initialData = null
}) => {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const [fileList, setFileList] = useState([]);
  const [studentData, setStudentData] = useState([]);
  const [feedbackResults, setFeedbackResults] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetailVisible, setStudentDetailVisible] = useState(false);
  const [customPromptVisible, setCustomPromptVisible] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [form] = Form.useForm();
  const { user } = useAuth();

  // 如果有初始数据，加载它
  useEffect(() => {
    if (initialData) {
      setStudentData(initialData.students || []);
      if (initialData.feedback) {
        setFeedbackResults(initialData.feedback);
        setActiveTab('results');
      }
    }
  }, [initialData]);

  // 加载科目和班级数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subjectsResponse, classesResponse] = await Promise.all([
          apiService.get('/subjects'),
          apiService.get('/classes')
        ]);
        setSubjects(subjectsResponse);
        setClasses(classesResponse);
      } catch (error) {
        console.error('加载数据失败:', error);
      }
    };

    fetchData();
  }, []);

  // 文件上传配置
  const uploadProps = {
    name: 'file',
    multiple: false,
    accept: '.xlsx,.xls,.csv,.pdf,.doc,.docx',
    fileList,
    beforeUpload: (file) => {
      setFileList([file]);
      return false;
    },
    onRemove: () => {
      setFileList([]);
    }
  };

  // 处理文件上传
  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.error('请先选择文件');
      return;
    }

    const formData = new FormData();
    formData.append('file', fileList[0]);
    formData.append('assessmentType', assessmentType);
    if (subjectId) formData.append('subjectId', subjectId);
    if (classId) formData.append('classId', classId);

    setLoading(true);
    try {
      const response = await apiService.post('/ai-feedback/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setStudentData(response.students);
      setActiveTab('review');
      message.success('数据上传成功');
    } catch (error) {
      console.error('上传失败:', error);
      message.error('数据上传失败');
    } finally {
      setLoading(false);
    }
  };

  // 手动输入学生数据
  const handleManualInput = (values) => {
    const { students } = values;
    setStudentData(students);
    setActiveTab('review');
    message.success('数据添加成功');
  };

  // 生成AI反馈
  const generateFeedback = async (customInstructions = '') => {
    if (studentData.length === 0) {
      message.error('没有学生数据可分析');
      return;
    }

    setAnalyzing(true);
    try {
      const response = await apiService.post('/ai-feedback/analyze', {
        students: studentData,
        assessmentType,
        subjectId,
        classId,
        customInstructions
      });
      
      setFeedbackResults(response);
      setActiveTab('results');
      
      if (onFeedbackGenerated) {
        onFeedbackGenerated(response);
      }
      
      message.success('AI反馈生成成功');
    } catch (error) {
      console.error('生成反馈失败:', error);
      message.error('AI反馈生成失败');
    } finally {
      setAnalyzing(false);
      setCustomPromptVisible(false);
    }
  };

  // 查看学生详情
  const viewStudentDetail = (student) => {
    setSelectedStudent(student);
    setStudentDetailVisible(true);
  };

  // 下载反馈报告
  const downloadReport = async (format = 'pdf') => {
    try {
      const response = await apiService.get(`/ai-feedback/download/${feedbackResults.id}`, {
        params: { format },
        responseType: 'blob'
      });
      
      // 创建下载链接
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `反馈报告_${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      message.success('报告下载成功');
    } catch (error) {
      console.error('下载报告失败:', error);
      message.error('报告下载失败');
    }
  };

  // 渲染上传选项卡
  const renderUploadTab = () => {
    return (
      <div>
        <Tabs defaultActiveKey="file" centered>
          <TabPane 
            tab={<span><UploadOutlined />上传文件</span>} 
            key="file"
          >
            <Dragger {...uploadProps} style={{ padding: '20px 0' }}>
              <p className="ant-upload-drag-icon">
                <FileTextOutlined style={{ fontSize: 48, color: '#1890ff' }} />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
              <p className="ant-upload-hint">
                支持Excel、CSV、PDF和Word文档格式
              </p>
            </Dragger>
            
            <div style={{ marginTop: 16 }}>
              <Form layout="vertical">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="科目">
                      <Select 
                        placeholder="选择科目" 
                        value={subjectId}
                        onChange={(value) => form.setFieldsValue({ subjectId: value })}
                      >
                        {subjects.map(subject => (
                          <Option key={subject.id} value={subject.id}>{subject.name}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="班级">
                      <Select 
                        placeholder="选择班级" 
                        value={classId}
                        onChange={(value) => form.setFieldsValue({ classId: value })}
                      >
                        {classes.map(cls => (
                          <Option key={cls.id} value={cls.id}>{cls.name}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                
                <Form.Item label="评估类型">
                  <Select 
                    value={assessmentType}
                    onChange={(value) => form.setFieldsValue({ assessmentType: value })}
                  >
                    <Option value="homework">家庭作业</Option>
                    <Option value="exam">考试</Option>
                    <Option value="quiz">小测验</Option>
                    <Option value="project">项目作业</Option>
                  </Select>
                </Form.Item>
              </Form>
            </div>
            
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <Button 
                type="primary" 
                onClick={handleUpload} 
                loading={loading}
                disabled={fileList.length === 0}
                size="large"
              >
                上传并解析
              </Button>
            </div>
          </TabPane>
          
          <TabPane 
            tab={<span><EditOutlined />手动输入</span>} 
            key="manual"
          >
            <Form
              form={form}
              onFinish={handleManualInput}
              layout="vertical"
            >
              <Form.List name="students">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Card 
                        key={key} 
                        style={{ marginBottom: 16 }} 
                        size="small"
                        extra={
                          <Button 
                            danger 
                            type="text" 
                            icon={<CloseCircleOutlined />} 
                            onClick={() => remove(name)}
                          />
                        }
                      >
                        <Row gutter={16}>
                          <Col span={12}>
                            <Form.Item
                              {...restField}
                              name={[name, 'name']}
                              label="学生姓名"
                              rules={[{ required: true, message: '请输入学生姓名' }]}
                            >
                              <Input placeholder="学生姓名" />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item
                              {...restField}
                              name={[name, 'id']}
                              label="学号"
                            >
                              <Input placeholder="学号" />
                            </Form.Item>
                          </Col>
                        </Row>
                        
                        <Row gutter={16}>
                          <Col span={8}>
                            <Form.Item
                              {...restField}
                              name={[name, 'score']}
                              label="分数"
                              rules={[{ required: true, message: '请输入分数' }]}
                            >
                              <Input type="number" placeholder="分数" />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item
                              {...restField}
                              name={[name, 'totalScore']}
                              label="总分"
                              rules={[{ required: true, message: '请输入总分' }]}
                            >
                              <Input type="number" placeholder="总分" />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item
                              {...restField}
                              name={[name, 'completionTime']}
                              label="完成时间(分钟)"
                            >
                              <Input type="number" placeholder="完成时间" />
                            </Form.Item>
                          </Col>
                        </Row>
                        
                        <Form.Item
                          {...restField}
                          name={[name, 'mistakes']}
                          label="错误题目或问题"
                        >
                          <TextArea rows={2} placeholder="记录错误的题目或问题，用逗号分隔" />
                        </Form.Item>
                        
                        <Form.Item
                          {...restField}
                          name={[name, 'notes']}
                          label="教师备注"
                        >
                          <TextArea rows={2} placeholder="教师备注" />
                        </Form.Item>
                      </Card>
                    ))}
                    
                    <Form.Item>
                      <Button 
                        type="dashed" 
                        onClick={() => add()} 
                        block 
                        icon={<PlusOutlined />}
                      >
                        添加学生
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
              
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  确认添加
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </div>
    );
  };

  // 渲染数据审核选项卡
  const renderReviewTab = () => {
    const columns = [
      {
        title: '学生姓名',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '学号',
        dataIndex: 'id',
        key: 'id',
      },
      {
        title: '分数',
        dataIndex: 'score',
        key: 'score',
        render: (text, record) => `${text}/${record.totalScore}`,
      },
      {
        title: '得分率',
        key: 'scoreRate',
        render: (_, record) => {
          const rate = (record.score / record.totalScore) * 100;
          let color = 'green';
          if (rate < 60) color = 'red';
          else if (rate < 80) color = 'orange';
          
          return (
            <Progress 
              percent={Math.round(rate)} 
              size="small" 
              status={rate < 60 ? 'exception' : 'normal'}
              strokeColor={color}
            />
          );
        },
      },
      {
        title: '操作',
        key: 'action',
        render: (_, record) => (
          <Space size="small">
            <Button 
              type="text" 
              size="small" 
              icon={<EditOutlined />}
              onClick={() => viewStudentDetail(record)}
            >
              编辑
            </Button>
          </Space>
        ),
      },
    ];

    return (
      <div>
        <Alert
          message="数据审核"
          description="请检查学生数据是否正确，确认无误后点击"生成AI反馈"按钮。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Table
          columns={columns}
          dataSource={studentData}
          rowKey="id"
          pagination={false}
          size="middle"
          bordered
        />
        
        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={() => setActiveTab('upload')}>
            返回上传
          </Button>
          <Space>
            <Button 
              onClick={() => setCustomPromptVisible(true)}
              icon={<EditOutlined />}
            >
              自定义分析指令
            </Button>
            <Button 
              type="primary" 
              onClick={() => generateFeedback()}
              loading={analyzing}
              icon={<RobotOutlined />}
            >
              生成AI反馈
            </Button>
          </Space>
        </div>
      </div>
    );
  };

  // 渲染结果选项卡
  const renderResultsTab = () => {
    if (!feedbackResults) {
      return (
        <Empty description="暂无反馈结果" />
      );
    }

    const { 
      overallAnalysis, 
      studentFeedback, 
      improvementSuggestions, 
      statistics 
    } = feedbackResults;

    return (
      <div>
        <div style={{ marginBottom: 16, textAlign: 'right' }}>
          <Space>
            <Button 
              icon={<DownloadOutlined />} 
              onClick={() => downloadReport('pdf')}
            >
              下载PDF报告
            </Button>
            <Button 
              icon={<DownloadOutlined />} 
              onClick={() => downloadReport('docx')}
            >
              下载Word报告
            </Button>
          </Space>
        </div>
        
        <Card title="整体分析" bordered={false} style={{ marginBottom: 16 }}>
          <div dangerouslySetInnerHTML={{ __html: overallAnalysis }} />
        </Card>
        
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="平均分"
                value={statistics.averageScore}
                suffix={`/${statistics.totalScore}`}
                precision={1}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="最高分"
                value={statistics.highestScore}
                suffix={`/${statistics.totalScore}`}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="最低分"
                value={statistics.lowestScore}
                suffix={`/${statistics.totalScore}`}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="及格率"
                value={statistics.passRate}
                suffix="%"
                precision={1}
              />
            </Card>
          </Col>
        </Row>
        
        <Card title="常见问题分析" bordered={false} style={{ marginBottom: 16 }}>
          <Collapse>
            {statistics.commonMistakes.map((mistake, index) => (
              <Panel 
                header={
                  <Space>
                    <Badge count={index + 1} style={{ backgroundColor: '#1890ff' }} />
                    <span>{mistake.description}</span>
                    <Tag color="red">{mistake.frequency}人出错</Tag>
                  </Space>
                } 
                key={index}
              >
                <div>
                  <Paragraph>
                    <Text strong>问题分析：</Text> {mistake.analysis}
                  </Paragraph>
                  <Paragraph>
                    <Text strong>改进建议：</Text> {mistake.suggestion}
                  </Paragraph>
                </div>
              </Panel>
            ))}
          </Collapse>
        </Card>
        
        <Card title="学生个人反馈" bordered={false} style={{ marginBottom: 16 }}>
          <Table
            dataSource={studentFeedback}
            rowKey="studentId"
            pagination={{ pageSize: 5 }}
            expandable={{
              expandedRowRender: record => (
                <div style={{ padding: '0 20px' }}>
                  <Paragraph>
                    <Text strong>个人表现分析：</Text> {record.analysis}
                  </Paragraph>
                  <Paragraph>
                    <Text strong>优点：</Text> {record.strengths}
                  </Paragraph>
                  <Paragraph>
                    <Text strong>需要改进：</Text> {record.weaknesses}
                  </Paragraph>
                  <Paragraph>
                    <Text strong>学习建议：</Text> {record.suggestions}
                  </Paragraph>
                </div>
              ),
            }}
            columns={[
              { 
                title: '学生姓名', 
                dataIndex: 'studentName', 
                key: 'studentName' 
              },
              { 
                title: '得分', 
                dataIndex: 'score', 
                key: 'score',
                render: (text, record) => `${text}/${record.totalScore}`,
                sorter: (a, b) => a.score - b.score
              },
              { 
                title: '表现评级', 
                dataIndex: 'performanceLevel', 
                key: 'performanceLevel',
                render: text => {
                  let color = 'green';
                  if (text === '需要改进') color = 'red';
                  else if (text === '良好') color = 'orange';
                  else if (text === '优秀') color = 'green';
                  
                  return <Tag color={color}>{text}</Tag>;
                }
              },
              {
                title: '操作',
                key: 'action',
                render: (_, record) => (
                  <Button 
                    type="link" 
                    size="small"
                    onClick={() => {
                      // 这里可以实现发送反馈给学生的功能
                      message.success(`反馈已发送给${record.studentName}`);
                    }}
                  >
                    发送反馈
                  </Button>
                )
              }
            ]}
          />
        </Card>
        
        <Card title="教学改进建议" bordered={false}>
          <div dangerouslySetInnerHTML={{ __html: improvementSuggestions }} />
        </Card>
      </div>
    );
  };

  // 根据当前选项卡渲染内容
  const renderContent = () => {
    switch (activeTab) {
      case 'upload':
        return renderUploadTab();
      case 'review':
        return renderReviewTab();
      case 'results':
        return renderResultsTab();
      default:
        return null;
    }
  };

  return (
    <Card
      title={
        <Space>
          <RobotOutlined />
          <span>AI智能教学反馈</span>
        </Space>
      }
      extra={
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          type="card"
          size="small"
        >
          <TabPane tab="上传数据" key="upload" />
          <TabPane tab="数据审核" key="review" disabled={studentData.length === 0} />
          <TabPane tab="反馈结果" key="results" disabled={!feedbackResults} />
        </Tabs>
      }
    >
      {renderContent()}
      
      {/* 学生详情编辑模态框 */}
      <Modal
        title="编辑学生数据"
        open={studentDetailVisible}
        onCancel={() => setStudentDetailVisible(false)}
        onOk={() => {
          // 更新学生数据
          const updatedStudentData = studentData.map(student => 
            student.id === selectedStudent.id ? selectedStudent : student
          );
          setStudentData(updatedStudentData);
          setStudentDetailVisible(false);
          message.success('学生数据已更新');
        }}
      >
        {selectedStudent && (
          <Form layout="vertical">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="学生姓名">
                  <Input 
                    value={selectedStudent.name} 
                    onChange={e => setSelectedStudent({...selectedStudent, name: e.target.value})}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="学号">
                  <Input 
                    value={selectedStudent.id} 
                    onChange={e => setSelectedStudent({...selectedStudent, id: e.target.value})}
                  />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="分数">
                  <Input 
                    type="number" 
                    value={selectedStudent.score} 
                    onChange={e => setSelectedStudent({...selectedStudent, score: Number(e.target.value)})}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="总分">
                  <Input 
                    type="number" 
                    value={selectedStudent.totalScore} 
                    onChange={e => setSelectedStudent({...selectedStudent, totalScore: Number(e.target.value)})}
                  />
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item label="错误题目或问题">
              <TextArea 
                rows={3} 
                value={selectedStudent.mistakes} 
                onChange={e => setSelectedStudent({...selectedStudent, mistakes: e.target.value})}
              />
            </Form.Item>
            
            <Form.Item label="教师备注">
              <TextArea 
                rows={3} 
                value={selectedStudent.notes} 
                onChange={e => setSelectedStudent({...selectedStudent, notes: e.target.value})}
              />
            </Form.Item>
          </Form>
        )}
      </Modal>
      
      {/* 自定义分析指令模态框 */}
      <Modal
        title="自定义分析指令"
        open={customPromptVisible}
        onCancel={() => setCustomPromptVisible(false)}
        onOk={() => generateFeedback(customPrompt)}
        okText="生成反馈"
        confirmLoading={analyzing}
      >
        <Alert
          message="提示"
          description="您可以提供额外的指令来引导AI分析，例如特定的教学目标、关注点或评估标准。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Form layout="vertical">
          <Form.Item label="自定义分析指令">
            <TextArea 
              rows={6} 
              value={customPrompt} 
              onChange={e => setCustomPrompt(e.target.value)}
              placeholder="例如：请特别关注学生在分数计算方面的问题，并提供针对性的教学建议。"
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default AIFeedback; 