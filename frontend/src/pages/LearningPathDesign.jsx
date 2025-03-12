import React, { useState } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Select, 
  Button, 
  Steps, 
  Divider, 
  Typography, 
  Row, 
  Col,
  Spin,
  message,
  Tag,
  List,
  Timeline
} from 'antd';
import { 
  UserOutlined, 
  BookOutlined, 
  RocketOutlined, 
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Paragraph, Text } = Typography;
const { Step } = Steps;

const LearningPathDesign = () => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [learningPath, setLearningPath] = useState(null);
  
  // 学生信息提交
  const handleStudentInfoSubmit = (values) => {
    setCurrentStep(1);
  };
  
  // 学习目标提交
  const handleLearningGoalsSubmit = (values) => {
    setCurrentStep(2);
  };
  
  // 生成学习路径
  const handleGeneratePath = async () => {
    setLoading(true);
    
    try {
      const formValues = form.getFieldsValue(true);
      
      // 调用API生成学习路径
      const response = await axios.post('/api/learning-path/generate', formValues);
      
      setLearningPath(response.data);
      setCurrentStep(3);
      message.success('学习路径生成成功！');
    } catch (error) {
      console.error('Generate learning path error:', error);
      message.error('生成学习路径失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };
  
  // 模拟学习路径数据
  const mockLearningPath = {
    studentName: '张明',
    subject: '数学',
    currentLevel: '基础',
    targetLevel: '进阶',
    duration: '3个月',
    overview: '本学习路径针对初中数学代数部分的提升设计，通过循序渐进的学习步骤，帮助学生从基础水平提升到进阶水平。',
    stages: [
      {
        name: '基础巩固阶段',
        duration: '2周',
        description: '巩固基础知识，确保核心概念理解清晰',
        tasks: [
          { name: '复习整式的加减法', status: 'completed', priority: 'high' },
          { name: '复习整式的乘除法', status: 'completed', priority: 'high' },
          { name: '完成基础练习20题', status: 'in-progress', priority: 'medium' },
          { name: '观看视频讲解', status: 'pending', priority: 'low' }
        ]
      },
      {
        name: '能力提升阶段',
        duration: '4周',
        description: '掌握进阶概念，提升解题能力',
        tasks: [
          { name: '学习因式分解方法', status: 'pending', priority: 'high' },
          { name: '解一元二次方程', status: 'pending', priority: 'high' },
          { name: '完成进阶练习30题', status: 'pending', priority: 'medium' },
          { name: '参加小组讨论', status: 'pending', priority: 'medium' }
        ]
      },
      {
        name: '应用实践阶段',
        duration: '4周',
        description: '应用所学知识解决实际问题',
        tasks: [
          { name: '解决应用题10道', status: 'pending', priority: 'high' },
          { name: '完成一个数学建模小项目', status: 'pending', priority: 'high' },
          { name: '参加模拟考试', status: 'pending', priority: 'medium' },
          { name: '总结学习心得', status: 'pending', priority: 'low' }
        ]
      }
    ],
    resources: [
      { name: '初中数学代数基础', type: 'book', link: '#' },
      { name: '因式分解视频教程', type: 'video', link: '#' },
      { name: '一元二次方程练习题', type: 'exercise', link: '#' },
      { name: '数学应用题解题技巧', type: 'document', link: '#' }
    ],
    milestones: [
      { name: '基础知识测试', date: '2周后', description: '测试基础概念掌握情况' },
      { name: '中期评估', date: '6周后', description: '评估进阶内容学习情况' },
      { name: '综合能力测试', date: '12周后', description: '全面测试学习成果' }
    ]
  };
  
  // 渲染学习路径结果
  const renderLearningPath = () => {
    // 实际项目中应使用API返回的数据，这里使用模拟数据
    const path = mockLearningPath;
    
    return (
      <div>
        <Card title="学习路径概览" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Statistic title="学生姓名" value={path.studentName} />
            </Col>
            <Col span={8}>
              <Statistic title="学科" value={path.subject} />
            </Col>
            <Col span={8}>
              <Statistic title="计划时长" value={path.duration} />
            </Col>
          </Row>
          <Divider />
          <Paragraph>{path.overview}</Paragraph>
        </Card>
        
        <Card title="学习阶段" style={{ marginBottom: 16 }}>
          <Steps progressDot current={0}>
            {path.stages.map((stage, index) => (
              <Step 
                key={index} 
                title={stage.name} 
                description={`${stage.duration}`} 
              />
            ))}
          </Steps>
          
          <Divider />
          
          {path.stages.map((stage, index) => (
            <div key={index} style={{ marginBottom: 24 }}>
              <Title level={4}>{stage.name} ({stage.duration})</Title>
              <Paragraph>{stage.description}</Paragraph>
              
              <List
                bordered
                dataSource={stage.tasks}
                renderItem={task => (
                  <List.Item>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {task.status === 'completed' ? (
                        <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                      ) : task.status === 'in-progress' ? (
                        <ClockCircleOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                      ) : (
                        <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: 8 }} />
                      )}
                      <span>{task.name}</span>
                      <Tag 
                        color={
                          task.priority === 'high' ? 'red' : 
                          task.priority === 'medium' ? 'orange' : 'green'
                        }
                        style={{ marginLeft: 8 }}
                      >
                        {task.priority === 'high' ? '高优先级' : 
                         task.priority === 'medium' ? '中优先级' : '低优先级'}
                      </Tag>
                    </div>
                  </List.Item>
                )}
              />
            </div>
          ))}
        </Card>
        
        <Row gutter={16}>
          <Col span={12}>
            <Card title="推荐学习资源">
              <List
                dataSource={path.resources}
                renderItem={resource => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        resource.type === 'book' ? <BookOutlined /> :
                        resource.type === 'video' ? <PlayCircleOutlined /> :
                        resource.type === 'exercise' ? <FormOutlined /> :
                        <FileOutlined />
                      }
                      title={<a href={resource.link}>{resource.name}</a>}
                      description={
                        resource.type === 'book' ? '参考书籍' :
                        resource.type === 'video' ? '视频教程' :
                        resource.type === 'exercise' ? '练习题' :
                        '学习文档'
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
          
          <Col span={12}>
            <Card title="学习里程碑">
              <Timeline>
                {path.milestones.map((milestone, index) => (
                  <Timeline.Item key={index}>
                    <p><strong>{milestone.name}</strong> - {milestone.date}</p>
                    <p>{milestone.description}</p>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };
  
  return (
    <div>
      <Title level={2}>个性化学习路径设计</Title>
      <Paragraph>根据学生特点和学习目标，生成定制化的学习计划</Paragraph>
      <Divider />
      
      <Steps current={currentStep} style={{ marginBottom: 24 }}>
        <Step title="学生信息" icon={<UserOutlined />} />
        <Step title="学习目标" icon={<BookOutlined />} />
        <Step title="生成路径" icon={<RocketOutlined />} />
        <Step title="学习计划" icon={<CheckCircleOutlined />} />
      </Steps>
      
      <Form
        form={form}
        layout="vertical"
      >
        {/* 步骤1：学生信息 */}
        {currentStep === 0 && (
          <Card title="学生基本信息">
            <Form.Item
              name="studentName"
              label="学生姓名"
              rules={[{ required: true, message: '请输入学生姓名' }]}
            >
              <Input placeholder="请输入学生姓名" />
            </Form.Item>
            
            <Form.Item
              name="grade"
              label="年级"
              rules={[{ required: true, message: '请选择年级' }]}
            >
              <Select placeholder="请选择年级">
                <Option value="小学一年级">小学一年级</Option>
                <Option value="小学二年级">小学二年级</Option>
                <Option value="小学三年级">小学三年级</Option>
                <Option value="小学四年级">小学四年级</Option>
                <Option value="小学五年级">小学五年级</Option>
                <Option value="小学六年级">小学六年级</Option>
                <Option value="初中一年级">初中一年级</Option>
                <Option value="初中二年级">初中二年级</Option>
                <Option value="初中三年级">初中三年级</Option>
                <Option value="高中一年级">高中一年级</Option>
                <Option value="高中二年级">高中二年级</Option>
                <Option value="高中三年级">高中三年级</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="subject"
              label="学科"
              rules={[{ required: true, message: '请选择学科' }]}
            >
              <Select placeholder="请选择学科">
                <Option value="语文">语文</Option>
                <Option value="数学">数学</Option>
                <Option value="英语">英语</Option>
                <Option value="物理">物理</Option>
                <Option value="化学">化学</Option>
                <Option value="生物">生物</Option>
                <Option value="历史">历史</Option>
                <Option value="地理">地理</Option>
                <Option value="政治">政治</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="currentLevel"
              label="当前水平"
              rules={[{ required: true, message: '请选择当前水平' }]}
            >
              <Select placeholder="请选择当前水平">
                <Option value="基础">基础（需要巩固基础知识）</Option>
                <Option value="中等">中等（基础知识掌握较好）</Option>
                <Option value="良好">良好（能够解决一般问题）</Option>
                <Option value="优秀">优秀（能够解决较复杂问题）</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="learningStyle"
              label="学习风格"
            >
              <Select placeholder="请选择学习风格">
                <Option value="visual">视觉型（偏好图表、视频等视觉材料）</Option>
                <Option value="auditory">听觉型（偏好讲解、讨论等听觉材料）</Option>
                <Option value="reading">阅读型（偏好阅读文字材料）</Option>
                <Option value="kinesthetic">动手型（偏好实践、实验等动手活动）</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="strengths"
              label="优势领域"
            >
              <Select mode="tags" placeholder="请输入或选择优势领域">
                <Option value="计算能力">计算能力</Option>
                <Option value="逻辑思维">逻辑思维</Option>
                <Option value="空间想象">空间想象</Option>
                <Option value="记忆力">记忆力</Option>
                <Option value="语言表达">语言表达</Option>
                <Option value="创新思维">创新思维</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="weaknesses"
              label="薄弱环节"
            >
              <Select mode="tags" placeholder="请输入或选择薄弱环节">
                <Option value="概念理解">概念理解</Option>
                <Option value="公式记忆">公式记忆</Option>
                <Option value="解题速度">解题速度</Option>
                <Option value="应用能力">应用能力</Option>
                <Option value="抽象思维">抽象思维</Option>
                <Option value="注意力集中">注意力集中</Option>
              </Select>
            </Form.Item>
            
            <div style={{ textAlign: 'right' }}>
              <Button type="primary" onClick={handleStudentInfoSubmit}>
                下一步
              </Button>
            </div>
          </Card>
        )}
        
        {/* 步骤2：学习目标 */}
        {currentStep === 1 && (
          <Card title="学习目标设置">
            <Form.Item
              name="targetLevel"
              label="目标水平"
              rules={[{ required: true, message: '请选择目标水平' }]}
            >
              <Select placeholder="请选择目标水平">
                <Option value="基础">基础（掌握核心概念和基本方法）</Option>
                <Option value="中等">中等（能够灵活应用所学知识）</Option>
                <Option value="良好">良好（能够解决较复杂的问题）</Option>
                <Option value="优秀">优秀（具备创新思维和拓展能力）</Option>
                <Option value="卓越">卓越（达到学科竞赛水平）</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="duration"
              label="计划时长"
              rules={[{ required: true, message: '请选择计划时长' }]}
            >
              <Select placeholder="请选择计划时长">
                <Option value="1个月">1个月</Option>
                <Option value="2个月">2个月</Option>
                <Option value="3个月">3个月</Option>
                <Option value="半年">半年</Option>
                <Option value="1年">1年</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="focusAreas"
              label="重点关注领域"
              rules={[{ required: true, message: '请选择重点关注领域' }]}
            >
              <Select mode="multiple" placeholder="请选择重点关注领域">
                <Option value="基础知识巩固">基础知识巩固</Option>
                <Option value="解题技巧提升">解题技巧提升</Option>
                <Option value="思维能力培养">思维能力培养</Option>
                <Option value="应用能力提高">应用能力提高</Option>
                <Option value="学科竞赛准备">学科竞赛准备</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="specificGoals"
              label="具体目标"
              rules={[{ required: true, message: '请输入具体目标' }]}
            >
              <TextArea 
                rows={4} 
                placeholder="请输入具体的学习目标，例如：掌握因式分解的基本方法，能够解决一元二次方程应用题等"
              />
            </Form.Item>
            
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={() => setCurrentStep(0)}>
                上一步
              </Button>
              <Button type="primary" onClick={handleLearningGoalsSubmit}>
                下一步
              </Button>
            </div>
          </Card>
        )}
        
        {/* 步骤3：生成路径 */}
        {currentStep === 2 && (
          <Card title="生成学习路径">
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Title level={4}>准备生成个性化学习路径</Title>
              <Paragraph>
                系统将根据您提供的学生信息和学习目标，生成一份定制化的学习计划。
                这个计划将包含学习阶段、任务清单、推荐资源和学习里程碑。
              </Paragraph>
              
              <div style={{ margin: '40px 0' }}>
                {loading ? (
                  <Spin size="large" tip="正在生成学习路径，请稍候..." />
                ) : (
                  <Button 
                    type="primary" 
                    size="large" 
                    icon={<RocketOutlined />} 
                    onClick={handleGeneratePath}
                  >
                    生成学习路径
                  </Button>
                )}
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button onClick={() => setCurrentStep(1)}>
                  上一步
                </Button>
                <Button disabled>
                  下一步
                </Button>
              </div>
            </div>
          </Card>
        )}
        
        {/* 步骤4：学习计划 */}
        {currentStep === 3 && (
          <div>
            {renderLearningPath()}
            
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <Button type="primary" size="large">
                保存学习路径
              </Button>
              <Button style={{ marginLeft: 16 }} size="large">
                导出PDF
              </Button>
              <Button style={{ marginLeft: 16 }} onClick={() => setCurrentStep(0)}>
                重新设计
              </Button>
            </div>
          </div>
        )}
      </Form>
    </div>
  );
};

export default LearningPathDesign; 