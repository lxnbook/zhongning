import React, { useState, useEffect, useRef } from 'react';
import { 
  Card, 
  Tabs, 
  Form, 
  Input, 
  Select, 
  Button, 
  Radio, 
  Spin, 
  Typography, 
  Space, 
  Divider, 
  Alert, 
  Tag, 
  Tooltip, 
  Modal, 
  message, 
  Upload, 
  Collapse,
  Row,
  Col,
  Switch,
  Slider,
  List,
  Avatar,
  Popconfirm,
  Drawer
} from 'antd';
import { 
  FileTextOutlined, 
  BulbOutlined, 
  RobotOutlined, 
  SaveOutlined, 
  DownloadOutlined, 
  HistoryOutlined, 
  CopyOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined, 
  SettingOutlined,
  BookOutlined,
  FileImageOutlined,
  VideoCameraOutlined,
  SoundOutlined,
  QuestionCircleOutlined,
  ExperimentOutlined,
  TeamOutlined,
  StarOutlined,
  UploadOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import apiService from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';
import { saveAs } from 'file-saver';
import moment from 'moment';
import LLMSelector from './common/LLMSelector';
import { TASK_TYPES } from '../services/llmService';
import llmService from '../services/llmService';
import ReactMarkdown from 'react-markdown';

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;
const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;
const { Dragger } = Upload;

const AIContentGenerator = ({
  initialType = 'lesson',
  subjectId,
  gradeId,
  onGenerated,
  onSave
}) => {
  const [activeTab, setActiveTab] = useState('create');
  const [contentType, setContentType] = useState(initialType);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [form] = Form.useForm();
  const [generatedContent, setGeneratedContent] = useState(null);
  const [editedContent, setEditedContent] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [savedContents, setSavedContents] = useState([]);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [advancedOptions, setAdvancedOptions] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [saveForm] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const editorRef = useRef(null);
  const { user } = useAuth();
  const [selectedLLM, setSelectedLLM] = useState(null);
  const [useStreaming, setUseStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  // 内容类型选项
  const contentTypes = [
    { value: 'lesson', label: '教案', icon: <BookOutlined /> },
    { value: 'slides', label: '课件', icon: <FileImageOutlined /> },
    { value: 'worksheet', label: '练习题', icon: <QuestionCircleOutlined /> },
    { value: 'quiz', label: '小测验', icon: <FileTextOutlined /> },
    { value: 'experiment', label: '实验指导', icon: <ExperimentOutlined /> },
    { value: 'video', label: '教学视频脚本', icon: <VideoCameraOutlined /> },
    { value: 'activity', label: '课堂活动', icon: <TeamOutlined /> },
    { value: 'summary', label: '知识总结', icon: <BulbOutlined /> }
  ];

  // 加载元数据
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [subjectsData, gradesData, templatesData, savedData] = await Promise.all([
          apiService.get('/subjects'),
          apiService.get('/grades'),
          apiService.get('/content-templates'),
          apiService.get('/saved-contents', { userId: user.id })
        ]);
        
        setSubjects(subjectsData);
        setGrades(gradesData);
        setTemplates(templatesData);
        setSavedContents(savedData);
        
        // 设置初始值
        if (subjectId) {
          form.setFieldsValue({ subject: subjectId });
        }
        
        if (gradeId) {
          form.setFieldsValue({ grade: gradeId });
        }
      } catch (error) {
        console.error('加载元数据失败:', error);
        message.error('加载数据失败');
      }
    };
    
    fetchMetadata();
  }, [form, subjectId, gradeId, user.id]);

  // 生成内容
  const generateContent = async () => {
    try {
      setGenerating(true);
      
      const promptData = {
        subject: subject,
        topic: topic,
        grade: grade,
        contentType: contentType,
        requirements: requirements
      };
      
      if (useStreaming) {
        // 使用流式响应
        setIsStreaming(true);
        setStreamingContent('');
        
        const { streamId, resultPromise } = await llmService.generateStreamContent(
          promptData,
          { 
            provider: selectedLLM,
            onProgress: (data) => {
              setStreamingContent(data.content);
            }
          }
        );
        
        // 等待流式响应完成
        const result = await resultPromise;
        setGeneratedContent(result.content);
        setIsStreaming(false);
      } else {
        // 使用普通响应
        const result = await llmService.generateContent(
          promptData,
          { provider: selectedLLM }
        );
        
        setGeneratedContent(result.content);
      }
      
      message.success('内容生成成功');
    } catch (error) {
      console.error('Content generation failed:', error);
      message.error('内容生成失败: ' + (error.message || '未知错误'));
    } finally {
      setGenerating(false);
    }
  };

  // 保存内容
  const handleSave = async () => {
    try {
      const values = await saveForm.validateFields();
      
      setLoading(true);
      
      const saveData = {
        ...generatedContent,
        title: values.title,
        description: values.description,
        tags: values.tags,
        isPublic: values.isPublic,
        content: editedContent,
        userId: user.id,
        contentType,
        savedAt: new Date().toISOString()
      };
      
      const response = await apiService.post('/saved-contents', saveData);
      
      setSavedContents([response, ...savedContents]);
      setSaveModalVisible(false);
      setLoading(false);
      message.success('内容保存成功');
      
      if (onSave) {
        onSave(response);
      }
    } catch (error) {
      setLoading(false);
      console.error('保存内容失败:', error);
      message.error('保存内容失败');
    }
  };

  // 下载内容
  const handleDownload = (format = 'docx') => {
    try {
      const title = generatedContent?.title || `${getContentTypeName(contentType)}_${moment().format('YYYYMMDD')}`;
      
      if (format === 'docx') {
        apiService.post('/export/docx', { 
          content: editedContent, 
          title 
        }, { responseType: 'blob' })
          .then(blob => {
            saveAs(blob, `${title}.docx`);
          });
      } else if (format === 'pdf') {
        apiService.post('/export/pdf', { 
          content: editedContent, 
          title 
        }, { responseType: 'blob' })
          .then(blob => {
            saveAs(blob, `${title}.pdf`);
          });
      } else if (format === 'html') {
        const blob = new Blob([editedContent], { type: 'text/html' });
        saveAs(blob, `${title}.html`);
      } else if (format === 'txt') {
        // 移除HTML标签
        const textContent = editedContent.replace(/<[^>]*>/g, '');
        const blob = new Blob([textContent], { type: 'text/plain' });
        saveAs(blob, `${title}.txt`);
      }
      
      message.success(`已下载为${format.toUpperCase()}格式`);
    } catch (error) {
      console.error('下载内容失败:', error);
      message.error('下载内容失败');
    }
  };

  // 应用模板
  const handleApplyTemplate = (template) => {
    form.setFieldsValue({
      title: template.title,
      topic: template.topic,
      objective: template.objective,
      targetAudience: template.targetAudience,
      difficultyLevel: template.difficultyLevel,
      additionalRequirements: template.additionalRequirements
    });
    
    setTemplateModalVisible(false);
    message.success('模板应用成功');
  };

  // 删除保存的内容
  const handleDeleteSaved = async (id) => {
    try {
      await apiService.delete(`/saved-contents/${id}`);
      setSavedContents(savedContents.filter(item => item.id !== id));
      message.success('内容已删除');
    } catch (error) {
      console.error('删除内容失败:', error);
      message.error('删除内容失败');
    }
  };

  // 加载保存的内容
  const handleLoadSaved = (content) => {
    setGeneratedContent(content);
    setEditedContent(content.content);
    setActiveTab('edit');
  };

  // 获取内容类型名称
  const getContentTypeName = (type) => {
    const found = contentTypes.find(item => item.value === type);
    return found ? found.label : type;
  };

  // 文件上传配置
  const uploadProps = {
    onRemove: file => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: file => {
      setFileList([...fileList, file]);
      return false;
    },
    fileList,
  };

  // 渲染创建表单
  const renderCreateForm = () => {
    return (
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          difficultyLevel: 'medium',
          contentStyle: 'standard',
          language: 'chinese'
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="subject"
              label="学科"
              rules={[{ required: true, message: '请选择学科' }]}
            >
              <Select placeholder="选择学科">
                {subjects.map(subject => (
                  <Option key={subject.id} value={subject.id}>{subject.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="grade"
              label="年级"
              rules={[{ required: true, message: '请选择年级' }]}
            >
              <Select placeholder="选择年级">
                {grades.map(grade => (
                  <Option key={grade.id} value={grade.id}>{grade.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item
          name="topic"
          label="主题/章节"
          rules={[{ required: true, message: '请输入主题或章节' }]}
        >
          <Input placeholder="例如：分数加减法、牛顿第一定律、唐诗鉴赏" />
        </Form.Item>
        
        <Form.Item
          name="objective"
          label="教学目标"
          rules={[{ required: true, message: '请输入教学目标' }]}
        >
          <TextArea 
            rows={3} 
            placeholder="描述您希望通过这个内容达成的教学目标" 
          />
        </Form.Item>
        
        <Form.Item
          name="targetAudience"
          label="目标学生"
        >
          <Input placeholder="描述目标学生的特点，如：初学者、有基础的学生、特殊需求学生等" />
        </Form.Item>
        
        <Form.Item
          name="difficultyLevel"
          label="难度级别"
        >
          <Radio.Group>
            <Radio.Button value="easy">简单</Radio.Button>
            <Radio.Button value="medium">中等</Radio.Button>
            <Radio.Button value="hard">困难</Radio.Button>
            <Radio.Button value="mixed">混合难度</Radio.Button>
          </Radio.Group>
        </Form.Item>
        
        <Form.Item
          name="contentStyle"
          label="内容风格"
        >
          <Select>
            <Option value="standard">标准教学</Option>
            <Option value="interactive">互动式</Option>
            <Option value="inquiry">探究式</Option>
            <Option value="gamified">游戏化</Option>
            <Option value="storytelling">故事化</Option>
          </Select>
        </Form.Item>
        
        <Form.Item
          name="language"
          label="语言"
        >
          <Select>
            <Option value="chinese">中文</Option>
            <Option value="english">英文</Option>
            <Option value="bilingual">中英双语</Option>
          </Select>
        </Form.Item>
        
        <Form.Item
          name="additionalRequirements"
          label="额外要求"
        >
          <TextArea 
            rows={3} 
            placeholder="任何其他特殊要求或说明" 
          />
        </Form.Item>
        
        <Form.Item
          name="referenceFiles"
          label="参考资料"
        >
          <Dragger {...uploadProps} multiple maxCount={5}>
            <p className="ant-upload-drag-icon">
              <UploadOutlined />
            </p>
            <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
            <p className="ant-upload-hint">
              支持单个或批量上传，可上传教材、参考资料等
            </p>
          </Dragger>
        </Form.Item>
        
        <Form.Item label="AI模型">
          <LLMSelector
            taskType={TASK_TYPES.CONTENT_GENERATION}
            value={selectedLLM}
            onChange={setSelectedLLM}
          />
        </Form.Item>
        
        <Form.Item label="流式响应">
          <Switch 
            checked={useStreaming} 
            onChange={setUseStreaming}
            checkedChildren="开启"
            unCheckedChildren="关闭"
          />
          <Tooltip title="开启流式响应可以实时查看生成过程">
            <InfoCircleOutlined style={{ marginLeft: 8 }} />
          </Tooltip>
        </Form.Item>
        
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <Space>
            <Button 
              type="primary" 
              icon={<RobotOutlined />} 
              onClick={generateContent}
              loading={generating}
              size="large"
            >
              AI生成内容
            </Button>
            <Button 
              icon={<BookOutlined />} 
              onClick={() => setTemplateModalVisible(true)}
            >
              使用模板
            </Button>
          </Space>
        </div>
      </Form>
    );
  };

  // 渲染编辑器
  const renderEditor = () => {
    if (!generatedContent) {
      return (
        <Empty 
          description="请先生成内容" 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button 
            type="primary" 
            onClick={() => setActiveTab('create')}
          >
            去生成内容
          </Button>
        </Empty>
      );
    }
    
    return (
      <div>
        <Alert
          message={`已生成${getContentTypeName(contentType)}：${generatedContent.title || '未命名'}`}
          description={generatedContent.description}
          type="success"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Button 
              icon={<SaveOutlined />} 
              type="primary"
              onClick={() => {
                saveForm.setFieldsValue({
                  title: generatedContent.title || '',
                  description: generatedContent.description || '',
                  tags: generatedContent.tags || [],
                  isPublic: false
                });
                setSaveModalVisible(true);
              }}
            >
              保存
            </Button>
            <Dropdown overlay={
              <Menu>
                <Menu.Item key="docx" onClick={() => handleDownload('docx')}>
                  Word文档(.docx)
                </Menu.Item>
                <Menu.Item key="pdf" onClick={() => handleDownload('pdf')}>
                  PDF文档(.pdf)
                </Menu.Item>
                <Menu.Item key="html" onClick={() => handleDownload('html')}>
                  HTML文件(.html)
                </Menu.Item>
                <Menu.Item key="txt" onClick={() => handleDownload('txt')}>
                  纯文本文件(.txt)
                </Menu.Item>
              </Menu>
            }>
              <Button icon={<DownloadOutlined />}>
                下载 <DownOutlined />
              </Button>
            </Dropdown>
            <Button 
              icon={<CopyOutlined />}
              onClick={() => {
                navigator.clipboard.writeText(editedContent.replace(/<[^>]*>/g, ''));
                message.success('内容已复制到剪贴板');
              }}
            >
              复制文本
            </Button>
            <Button 
              icon={<RobotOutlined />}
              onClick={() => {
                Modal.confirm({
                  title: '重新生成',
                  content: '确定要重新生成内容吗？当前编辑的内容将会丢失。',
                  onOk: () => {
                    setActiveTab('create');
                  }
                });
              }}
            >
              重新生成
            </Button>
          </Space>
        </div>
        
        <ReactQuill
          ref={editorRef}
          theme="snow"
          value={editedContent}
          onChange={setEditedContent}
          style={{ height: 400, marginBottom: 50 }}
        />
        
        {isStreaming && (
          <div style={{ marginBottom: 24 }}>
            <Card title="实时生成">
              <Spin spinning={true} />
              <div style={{ marginTop: 16 }}>
                <ReactMarkdown>{streamingContent || '正在生成中...'}</ReactMarkdown>
              </div>
            </Card>
          </div>
        )}
      </div>
    );
  };

  // 渲染历史记录
  const renderHistory = () => {
    return (
      <List
        itemLayout="vertical"
        dataSource={savedContents}
        renderItem={item => (
          <List.Item
            key={item.id}
            actions={[
              <Button 
                type="link" 
                icon={<EditOutlined />} 
                onClick={() => handleLoadSaved(item)}
              >
                编辑
              </Button>,
              <Popconfirm
                title="确定要删除这个内容吗？"
                onConfirm={() => handleDeleteSaved(item.id)}
                okText="确定"
                cancelText="取消"
              >
                <Button 
                  type="link" 
                  icon={<DeleteOutlined />} 
                  danger
                >
                  删除
                </Button>
              </Popconfirm>
            ]}
            extra={
              <Space direction="vertical" align="end">
                <Text type="secondary">{moment(item.savedAt).format('YYYY-MM-DD HH:mm')}</Text>
                <Tag color={
                  item.contentType === 'lesson' ? 'blue' :
                  item.contentType === 'slides' ? 'green' :
                  item.contentType === 'worksheet' ? 'orange' :
                  item.contentType === 'quiz' ? 'red' :
                  item.contentType === 'experiment' ? 'purple' :
                  item.contentType === 'video' ? 'cyan' :
                  item.contentType === 'activity' ? 'gold' :
                  'default'
                }>
                  {getContentTypeName(item.contentType)}
                </Tag>
              </Space>
            }
          >
            <List.Item.Meta
              avatar={
                <Avatar icon={
                  item.contentType === 'lesson' ? <BookOutlined /> :
                  item.contentType === 'slides' ? <FileImageOutlined /> :
                  item.contentType === 'worksheet' ? <QuestionCircleOutlined /> :
                  item.contentType === 'quiz' ? <FileTextOutlined /> :
                  item.contentType === 'experiment' ? <ExperimentOutlined /> :
                  item.contentType === 'video' ? <VideoCameraOutlined /> :
                  item.contentType === 'activity' ? <TeamOutlined /> :
                  <BulbOutlined />
                } />
              }
              title={item.title || '未命名内容'}
              description={
                <Space direction="vertical" size={0}>
                  <Text type="secondary">
                    科目: {item.subject} | 年级: {item.grade}
                  </Text>
                  <div>
                    {item.tags && item.tags.map(tag => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </div>
                </Space>
              }
            />
            <Paragraph ellipsis={{ rows: 2 }}>
              {item.description || '无描述'}
            </Paragraph>
          </List.Item>
        )}
      />
    );
  };

  return (
    <Card
      title={
        <Space>
          {contentType === 'lesson' && <BookOutlined />}
          {contentType === 'slides' && <FileImageOutlined />}
          {contentType === 'worksheet' && <QuestionCircleOutlined />}
          {contentType === 'quiz' && <FileTextOutlined />}
          {contentType === 'experiment' && <ExperimentOutlined />}
          {contentType === 'video' && <VideoCameraOutlined />}
          {contentType === 'activity' && <TeamOutlined />}
          {contentType === 'summary' && <BulbOutlined />}
          <span>AI内容生成器</span>
        </Space>
      }
      extra={
        <Button 
          icon={<HistoryOutlined />} 
          onClick={() => setHistoryVisible(true)}
        >
          历史记录
        </Button>
      }
    >
      <div style={{ marginBottom: 16 }}>
        <Radio.Group 
          value={contentType} 
          onChange={e => setContentType(e.target.value)}
          buttonStyle="solid"
        >
          {contentTypes.map(type => (
            <Tooltip key={type.value} title={type.label}>
              <Radio.Button value={type.value}>
                {type.icon} {type.label}
              </Radio.Button>
            </Tooltip>
          ))}
        </Radio.Group>
      </div>
      
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane 
          tab={
            <span>
              <PlusOutlined />
              创建
            </span>
          } 
          key="create"
        >
          {renderCreateForm()}
        </TabPane>
        <TabPane 
          tab={
            <span>
              <EditOutlined />
              编辑
            </span>
          } 
          key="edit"
          disabled={!generatedContent}
        >
          {renderEditor()}
        </TabPane>
      </Tabs>
      
      {/* 模板选择模态框 */}
      <Modal
        title="选择内容模板"
        open={templateModalVisible}
        onCancel={() => setTemplateModalVisible(false)}
        footer={null}
        width={700}
      >
        <List
          itemLayout="horizontal"
          dataSource={templates.filter(t => t.contentType === contentType)}
          renderItem={template => (
            <List.Item
              actions={[
                <Button
                  type="primary"
                  size="small"
                  onClick={() => handleApplyTemplate(template)}
                >
                  应用
                </Button>
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar icon={
                  template.contentType === 'lesson' ? <BookOutlined /> :
                  template.contentType === 'slides' ? <FileImageOutlined /> :
                  template.contentType === 'worksheet' ? <QuestionCircleOutlined /> :
                  template.contentType === 'quiz' ? <FileTextOutlined /> :
                  template.contentType === 'experiment' ? <ExperimentOutlined /> :
                  template.contentType === 'video' ? <VideoCameraOutlined /> :
                  template.contentType === 'activity' ? <TeamOutlined /> :
                  <BulbOutlined />
                } />}
                title={template.title}
                description={
                  <Space direction="vertical" size={0}>
                    <Text type="secondary">
                      科目: {template.subject} | 年级: {template.grade}
                    </Text>
                    <Paragraph ellipsis={{ rows: 2 }}>
                      {template.description}
                    </Paragraph>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Modal>
      
      {/* 保存模态框 */}
      <Modal
        title="保存内容"
        open={saveModalVisible}
        onOk={handleSave}
        onCancel={() => setSaveModalVisible(false)}
        confirmLoading={loading}
      >
        <Form form={saveForm} layout="vertical">
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="输入内容标题" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="描述"
          >
            <TextArea rows={3} placeholder="简要描述内容" />
          </Form.Item>
          
          <Form.Item
            name="tags"
            label="标签"
          >
            <Select mode="tags" placeholder="添加标签">
              <Option value="重点">重点</Option>
              <Option value="难点">难点</Option>
              <Option value="复习">复习</Option>
              <Option value="考试">考试</Option>
              <Option value="课堂">课堂</Option>
              <Option value="作业">作业</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="isPublic"
            valuePropName="checked"
          >
            <Switch checkedChildren="公开" unCheckedChildren="私有" /> 
            <Text type="secondary" style={{ marginLeft: 8 }}>
              公开的内容可以被其他教师查看和使用
            </Text>
          </Form.Item>
        </Form>
      </Modal>
      
      {/* 历史记录抽屉 */}
      <Drawer
        title="内容历史记录"
        placement="right"
        width={600}
        onClose={() => setHistoryVisible(false)}
        open={historyVisible}
      >
        {renderHistory()}
      </Drawer>
      
      {/* 图片预览 */}
      <Modal
        visible={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <img alt="预览" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </Card>
  );
};

export default AIContentGenerator; 