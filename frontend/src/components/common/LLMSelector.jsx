import React, { useState, useEffect } from 'react';
import { Select, Tooltip, Space, Tag } from 'antd';
import { RobotOutlined, InfoCircleOutlined } from '@ant-design/icons';
import llmService, { LLM_PROVIDERS, TASK_TYPES } from '../../services/llmService';

const { Option } = Select;

const LLMSelector = ({ 
  taskType, 
  onChange, 
  value, 
  style = {}, 
  showDescription = true 
}) => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [defaultProvider, setDefaultProvider] = useState(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        await llmService.initialize();
        
        // 获取可用的提供商
        const availableProviders = llmService.getAvailableProviders();
        setProviders(availableProviders);
        
        // 获取当前任务的默认提供商
        const defaultForTask = llmService.getProviderForTask(taskType);
        setDefaultProvider(defaultForTask);
        
        // 如果没有选择值，设置为默认值
        if (!value && onChange) {
          onChange(defaultForTask);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Failed to initialize LLM selector:', error);
        setLoading(false);
      }
    };
    
    initialize();
  }, [taskType, onChange, value]);

  // 获取任务类型的友好名称
  const getTaskName = (type) => {
    const taskNames = {
      content_generation: '内容生成',
      lesson_planning: '课程规划',
      assessment_creation: '评估创建',
      feedback_analysis: '反馈分析',
      student_evaluation: '学生评估',
      question_answering: '问题回答',
      summarization: '内容总结',
      translation: '翻译',
      code_generation: '代码生成',
      creative_writing: '创意写作'
    };
    
    return taskNames[type] || type;
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', ...style }}>
      {showDescription && (
        <Space style={{ marginRight: 8 }}>
          <RobotOutlined />
          <span>AI模型:</span>
        </Space>
      )}
      
      <Select
        loading={loading}
        value={value || defaultProvider}
        onChange={onChange}
        style={{ width: 180 }}
        placeholder="选择AI模型"
      >
        {providers.map(provider => (
          <Option key={provider} value={provider}>
            <Space>
              {provider}
              {provider === defaultProvider && (
                <Tag color="blue" style={{ marginLeft: 4 }}>默认</Tag>
              )}
            </Space>
          </Option>
        ))}
      </Select>
      
      <Tooltip title={`当前任务: ${getTaskName(taskType)}`}>
        <InfoCircleOutlined style={{ marginLeft: 8, color: '#1890ff' }} />
      </Tooltip>
    </div>
  );
};

export default LLMSelector; 