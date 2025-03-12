import React, { useState } from 'react';
import { Card, Steps, Space, Button, Modal, Form, Input, Select, TextArea, Alert, Avatar, List, Paragraph, Text } from 'antd';
import { FileTextOutlined, QuestionCircleOutlined, EyeOutlined, SaveOutlined, RobotOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';

const { Step } = Steps;

const AssessmentCreator = ({ assessment, templates, onSave }) => {
  const [current, setCurrent] = useState(0);
  const [readOnly, setReadOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [questionModalVisible, setQuestionModalVisible] = useState(false);
  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [questions, setQuestions] = useState(assessment.questions || []);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionTypes, setQuestionTypes] = useState([
    { value: 'single', label: '单选题' },
    { value: 'multiple', label: '多选题' },
    { value: 'truefalse', label: '判断题' },
    { value: 'shortanswer', label: '简答题' },
    { value: 'essay', label: '论述题' },
    { value: 'fillblank', label: '填空题' }
  ]);
  const [questionForm, setQuestionForm] = useState(null);
  const [aiGenerating, setAiGenerating] = useState(false);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      const assessmentData = {
        ...assessment,
        ...values,
        questions,
        scheduledAt: values.scheduledAt ? values.scheduledAt.format('YYYY-MM-DD HH:mm:ss') : null,
        dueAt: values.dueAt ? values.dueAt.format('YYYY-MM-DD HH:mm:ss') : null,
        createdBy: user.id,
        updatedAt: new Date().toISOString()
      };
      
      setLoading(true);
      
      let response;
      if (assessment.id) {
        response = await apiService.put(`/assessments/${assessment.id}`, assessmentData);
      } else {
        response = await apiService.post('/assessments', assessmentData);
      }
      
      setLoading(false);
      message.success('评估保存成功');
      
      if (onSave) {
        onSave(response);
      }
    } catch (error) {
      setLoading(false);
      console.error('保存评估失败:', error);
      message.error('保存评估失败');
    }
  };

  const handleAIGenerate = async () => {
    try {
      setAiGenerating(true);
      
      const values = await form.validateFields();
      
      const requestData = {
        subject: values.subject,
        grade: values.grade,
        title: values.title,
        description: values.description,
        prompt: aiPrompt,
        existingQuestions: questions
      };
      
      const response = await apiService.post('/ai/generate-questions', requestData);
      
      if (response.questions && response.questions.length > 0) {
        setQuestions([...questions, ...response.questions]);
        message.success(`成功生成 ${response.questions.length} 个问题`);
      } else {
        message.warning('未能生成问题，请调整提示后重试');
      }
      
      setAiModalVisible(false);
      setAiGenerating(false);
    } catch (error) {
      setAiGenerating(false);
      console.error('AI生成问题失败:', error);
      message.error('生成问题失败');
    }
  };

  const handleApplyTemplate = (template) => {
    Modal.confirm({
      title: '应用模板',
      content: '应用模板将覆盖当前的评估内容，确定要继续吗？',
      onOk: () => {
        form.setFieldsValue({
          title: template.title,
          description: template.description,
          subject: template.subject,
          grade: template.grade,
          duration: template.duration,
          totalScore: template.totalScore,
          passingScore: template.passingScore,
          isRandomized: template.isRandomized,
          showAnswers: template.showAnswers,
          allowRetake: template.allowRetake
        });
        
        setQuestions(template.questions || []);
        setTemplateModalVisible(false);
        message.success('模板应用成功');
      }
    });
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setQuestions(items);
  };

  const renderStepContent = () => {
    // Implementation of renderStepContent
  };

  const renderStepActions = () => {
    // Implementation of renderStepActions
  };

  const renderPreview = () => {
    // Implementation of renderPreview
  };

  return (
    <Card
      title={
        <Space>
          <FileTextOutlined />
          <span>智能评估创建</span>
        </Space>
      }
      extra={
        <Space>
          {!readOnly && (
            <>
              <Button 
                icon={<SaveOutlined />} 
                onClick={handleSave}
              >
                保存
              </Button>
              <Button 
                icon={<EyeOutlined />} 
                onClick={() => setPreviewVisible(true)}
              >
                预览
              </Button>
            </>
          )}
        </Space>
      }
      loading={loading}
    >
      <Steps current={current} onChange={setCurrent} style={{ marginBottom: 24 }}>
        <Step title="基本信息" icon={<FileTextOutlined />} />
        <Step title="题目管理" icon={<QuestionCircleOutlined />} />
        <Step title="预览" icon={<EyeOutlined />} />
      </Steps>
      
      <div className="steps-content">
        {renderStepContent()}
      </div>
      
      <div className="steps-action">
        {renderStepActions()}
      </div>
      
      {/* 问题编辑模态框 */}
      <Modal
        title={currentQuestion ? '编辑问题' : '添加问题'}
        open={questionModalVisible}
        onOk={handleSaveQuestion}
        onCancel={() => setQuestionModalVisible(false)}
        width={800}
        destroyOnClose
      >
        <Form form={questionForm} layout="vertical">
          <Form.Item
            name="type"
            label="问题类型"
            rules={[{ required: true, message: '请选择问题类型' }]}
          >
            <Select>
              {questionTypes.map(type => (
                <Option key={type.value} value={type.value}>{type.label}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="content"
            label="问题内容"
            rules={[{ required: true, message: '请输入问题内容' }]}
          >
            <TextArea rows={4} placeholder="输入问题内容，支持HTML格式" />
          </Form.Item>
          
          <Form.Item
            name="score"
            label="分值"
            rules={[{ required: true, message: '请输入分值' }]}
          >
            <InputNumber min={1} max={100} />
          </Form.Item>
          
          {(questionForm.getFieldValue('type') === 'single' || questionForm.getFieldValue('type') === 'multiple') && (
            <Form.List name="options">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field, index) => (
                    <Space key={field.key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                      <Form.Item
                        {...field}
                        name={[field.name, 'content']}
                        fieldKey={[field.fieldKey, 'content']}
                        rules={[{ required: true, message: '请输入选项内容' }]}
                        style={{ width: 400 }}
                      >
                        <Input placeholder={`选项 ${index + 1}`} />
                      </Form.Item>
                      <Form.Item
                        {...field}
                        name={[field.name, 'isCorrect']}
                        fieldKey={[field.fieldKey, 'isCorrect']}
                        valuePropName="checked"
                      >
                        {questionForm.getFieldValue('type') === 'single' ? (
                          <Radio>正确答案</Radio>
                        ) : (
                          <Checkbox>正确答案</Checkbox>
                        )}
                      </Form.Item>
                      {fields.length > 2 && (
                        <Button
                          icon={<DeleteOutlined />}
                          onClick={() => remove(field.name)}
                          type="text"
                          danger
                        />
                      )}
                    </Space>
                  ))}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add({ content: '', isCorrect: false })}
                      block
                      icon={<PlusOutlined />}
                    >
                      添加选项
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          )}
          
          {questionForm.getFieldValue('type') === 'truefalse' && (
            <Form.Item
              name="answer"
              label="正确答案"
              rules={[{ required: true, message: '请选择正确答案' }]}
            >
              <Radio.Group>
                <Radio value={true}>正确</Radio>
                <Radio value={false}>错误</Radio>
              </Radio.Group>
            </Form.Item>
          )}
          
          {(questionForm.getFieldValue('type') === 'shortanswer' || questionForm.getFieldValue('type') === 'essay' || questionForm.getFieldValue('type') === 'fillblank') && (
            <Form.Item
              name="answer"
              label="参考答案"
            >
              <TextArea rows={4} placeholder="输入参考答案" />
            </Form.Item>
          )}
          
          <Form.Item
            name="explanation"
            label="解析"
          >
            <TextArea rows={3} placeholder="输入解析内容，帮助学生理解" />
          </Form.Item>
        </Form>
      </Modal>
      
      {/* AI生成模态框 */}
      <Modal
        title={
          <Space>
            <RobotOutlined />
            <span>AI生成问题</span>
          </Space>
        }
        open={aiModalVisible}
        onOk={handleAIGenerate}
        onCancel={() => setAiModalVisible(false)}
        confirmLoading={aiGenerating}
      >
        <Alert
          message="AI生成提示"
          description="描述您需要的问题类型、难度和内容范围，AI将为您生成相关问题。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Form layout="vertical">
          <Form.Item
            label="生成提示"
            required
          >
            <TextArea
              rows={6}
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              placeholder="例如：请生成5道关于初中代数方程的单选题，难度适中，包含解析。"
            />
          </Form.Item>
        </Form>
      </Modal>
      
      {/* 模板选择模态框 */}
      <Modal
        title="选择评估模板"
        open={templateModalVisible}
        onCancel={() => setTemplateModalVisible(false)}
        footer={null}
        width={700}
      >
        <List
          itemLayout="horizontal"
          dataSource={templates}
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
                avatar={<Avatar icon={<FileTextOutlined />} />}
                title={template.title}
                description={
                  <Space direction="vertical" size={0}>
                    <Text type="secondary">
                      科目: {template.subject} | 年级: {template.grade} | 题目数: {template.questions?.length || 0}
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
      
      {/* 预览模态框 */}
      <Modal
        title="评估预览"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {renderPreview()}
      </Modal>
    </Card>
  );
};

export default AssessmentCreator; 