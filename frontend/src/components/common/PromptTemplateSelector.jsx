import React, { useState, useEffect } from 'react';
import { Select, Form, Button, Space, Collapse, Input, Tag, Typography } from 'antd';
import { BookOutlined, UserOutlined, ApartmentOutlined, AppstoreOutlined } from '@ant-design/icons';
import promptTemplates from '../../services/promptTemplates';
import api from '../../services/api';

const { Option, OptGroup } = Select;
const { Panel } = Collapse;
const { Text } = Typography;

/**
 * 提示词模板选择器组件
 * 
 * @param {Object} props
 * @param {Function} props.onSelect - 选择模板后的回调函数
 * @param {string} props.defaultCategory - 默认选择的分类
 * @param {string} props.defaultTemplate - 默认选择的模板
 */
const PromptTemplateSelector = ({ onSelect, defaultCategory = 'subjects', defaultTemplate = null }) => {
  const [category, setCategory] = useState(defaultCategory);
  const [subCategory, setSubCategory] = useState(null);
  const [template, setTemplate] = useState(null);
  const [parameters, setParameters] = useState({});
  const [finalPrompt, setFinalPrompt] = useState('');
  
  // 获取当前分类下的子分类
  const getSubCategories = () => {
    return Object.keys(promptTemplates[category] || {});
  };
  
  // 获取当前子分类下的模板
  const getTemplates = () => {
    if (!subCategory || !promptTemplates[category] || !promptTemplates[category][subCategory]) {
      return [];
    }
    return Object.keys(promptTemplates[category][subCategory]);
  };
  
  // 获取当前模板的参数
  const getTemplateParameters = () => {
    if (!template || !subCategory || !promptTemplates[category] || 
        !promptTemplates[category][subCategory] || 
        !promptTemplates[category][subCategory][template]) {
      return [];
    }
    return promptTemplates[category][subCategory][template].parameters || [];
  };
  
  // 生成最终提示词
  const generatePrompt = () => {
    if (!template || !subCategory) return '';
    
    const templateObj = promptTemplates[category][subCategory][template];
    if (!templateObj) return '';
    
    let prompt = templateObj.prompt;
    
    // 替换参数
    Object.keys(parameters).forEach(param => {
      const regex = new RegExp(`{${param}}`, 'g');
      prompt = prompt.replace(regex, parameters[param] || `{${param}}`);
    });
    
    return prompt;
  };
  
  // 当分类、子分类或模板变化时，重置相关状态
  useEffect(() => {
    if (category && getSubCategories().length > 0 && !subCategory) {
      setSubCategory(getSubCategories()[0]);
    }
  }, [category]);
  
  useEffect(() => {
    if (subCategory && getTemplates().length > 0 && !template) {
      setTemplate(getTemplates()[0]);
    }
  }, [subCategory]);
  
  useEffect(() => {
    if (template) {
      // 初始化参数
      const templateParams = getTemplateParameters();
      const initialParams = {};
      templateParams.forEach(param => {
        initialParams[param] = '';
      });
      setParameters(initialParams);
    }
  }, [template]);
  
  useEffect(() => {
    const prompt = generatePrompt();
    setFinalPrompt(prompt);
  }, [template, parameters]);
  
  // 处理参数变化
  const handleParameterChange = (param, value) => {
    setParameters(prev => ({
      ...prev,
      [param]: value
    }));
  };
  
  // 处理模板选择
  const handleTemplateSelect = () => {
    if (onSelect && finalPrompt) {
      // 记录模板使用
      try {
        api.post('/prompt-templates/usage', {
          category,
          subCategory,
          template,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        // 静默处理错误，不影响用户体验
        console.error('记录模板使用失败:', error);
      }
      
      onSelect(finalPrompt);
    }
  };
  
  // 获取当前模板标题
  const getTemplateTitle = () => {
    if (!template || !subCategory || !promptTemplates[category] || 
        !promptTemplates[category][subCategory] || 
        !promptTemplates[category][subCategory][template]) {
      return '';
    }
    return promptTemplates[category][subCategory][template].title || '';
  };
  
  return (
    <div className="prompt-template-selector">
      <Form layout="vertical">
        <Form.Item label="选择提示词分类">
          <Select 
            value={category} 
            onChange={setCategory}
            style={{ width: '100%' }}
          >
            <Option value="subjects">
              <BookOutlined /> 按学科分类
            </Option>
            <Option value="roles">
              <UserOutlined /> 按角色分类
            </Option>
            <Option value="departments">
              <ApartmentOutlined /> 按部门分类
            </Option>
            <Option value="functions">
              <AppstoreOutlined /> 按功能分类
            </Option>
          </Select>
        </Form.Item>
        
        <Form.Item label="选择子分类">
          <Select 
            value={subCategory} 
            onChange={setSubCategory}
            style={{ width: '100%' }}
            disabled={!category || getSubCategories().length === 0}
          >
            {getSubCategories().map(sub => (
              <Option key={sub} value={sub}>
                {sub}
              </Option>
            ))}
          </Select>
        </Form.Item>
        
        <Form.Item label="选择提示词模板">
          <Select 
            value={template} 
            onChange={setTemplate}
            style={{ width: '100%' }}
            disabled={!subCategory || getTemplates().length === 0}
          >
            {getTemplates().map(temp => (
              <Option key={temp} value={temp}>
                {promptTemplates[category][subCategory][temp].title || temp}
              </Option>
            ))}
          </Select>
        </Form.Item>
        
        {template && getTemplateParameters().length > 0 && (
          <Form.Item label="填写模板参数">
            {getTemplateParameters().map(param => (
              <Form.Item 
                key={param} 
                label={param}
                style={{ marginBottom: 12 }}
              >
                <Input 
                  value={parameters[param] || ''}
                  onChange={e => handleParameterChange(param, e.target.value)}
                  placeholder={`请输入${param}`}
                />
              </Form.Item>
            ))}
          </Form.Item>
        )}
        
        <Form.Item>
          <Button 
            type="primary" 
            onClick={handleTemplateSelect}
            disabled={!finalPrompt}
          >
            使用此模板
          </Button>
        </Form.Item>
      </Form>
      
      {finalPrompt && (
        <Collapse>
          <Panel header="预览提示词" key="preview">
            <div style={{ whiteSpace: 'pre-wrap' }}>
              <Text strong>{getTemplateTitle()}</Text>
              <br /><br />
              <Text>{finalPrompt}</Text>
            </div>
          </Panel>
        </Collapse>
      )}
    </div>
  );
};

export default PromptTemplateSelector; 