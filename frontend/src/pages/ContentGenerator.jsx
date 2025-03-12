import React, { useState } from 'react';
import { 
  Card, 
  Input, 
  Button, 
  Space, 
  Tabs, 
  Typography, 
  Divider, 
  Select,
  Row,
  Col,
  Drawer
} from 'antd';
import { 
  RobotOutlined, 
  FileTextOutlined, 
  BookOutlined,
  HistoryOutlined,
  SaveOutlined,
  CopyOutlined,
  SettingOutlined
} from '@ant-design/icons';
import LLMSelector from '../components/common/LLMSelector';
import PromptTemplateSelector from '../components/common/PromptTemplateSelector';
import { TASK_TYPES } from '../services/llmService';
import errorHandler from '../services/errorHandler';

const { TextArea } = Input;
const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const ContentGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedLLM, setSelectedLLM] = useState(null);
  const [templateDrawerVisible, setTemplateDrawerVisible] = useState(false);
  
  // 处理提示词生成
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      message.warning('请输入提示词');
      return;
    }
    
    setLoading(true);
    try {
      const result = await llmService.generate(prompt, {
        model: selectedLLM,
        taskType: TASK_TYPES.CONTENT_GENERATION
      });
      
      setResponse(result.content);
    } catch (error) {
      errorHandler.handleLLMError(error);
    } finally {
      setLoading(false);
    }
  };
  
  // 处理模板选择
  const handleTemplateSelect = (templatePrompt) => {
    setPrompt(templatePrompt);
    setTemplateDrawerVisible(false);
  };
  
  return (
    <div>
      <Card
        title={
          <Space>
            <RobotOutlined />
            <span>AI内容生成</span>
          </Space>
        }
        extra={
          <Button 
            icon={<BookOutlined />}
            onClick={() => setTemplateDrawerVisible(true)}
          >
            提示词模板
          </Button>
        }
      >
        <Row gutter={16}>
          <Col span={24}>
            <Card title="输入提示词" bordered={false}>
              <TextArea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="请输入您的提示词，或从模板中选择..."
                autoSize={{ minRows: 6, maxRows: 12 }}
                style={{ marginBottom: 16 }}
              />
              
              <Space style={{ marginBottom: 16 }}>
                <Text>选择AI模型:</Text>
                <LLMSelector
                  taskType={TASK_TYPES.CONTENT_GENERATION}
                  value={selectedLLM}
                  onChange={setSelectedLLM}
                />
              </Space>
              
              <Button 
                type="primary" 
                icon={<RobotOutlined />} 
                onClick={handleGenerate}
                loading={loading}
              >
                生成内容
              </Button>
            </Card>
          </Col>
          
          <Col span={24} style={{ marginTop: 16 }}>
            <Card title="生成结果" bordered={false}>
              {response ? (
                <div>
                  <div style={{ whiteSpace: 'pre-wrap', marginBottom: 16 }}>
                    {response}
                  </div>
                  
                  <Space>
                    <Button icon={<CopyOutlined />}>
                      复制内容
                    </Button>
                    <Button icon={<SaveOutlined />}>
                      保存到我的内容
                    </Button>
                  </Space>
                </div>
              ) : (
                <Paragraph type="secondary">
                  生成的内容将显示在这里...
                </Paragraph>
              )}
            </Card>
          </Col>
        </Row>
      </Card>
      
      {/* 提示词模板抽屉 */}
      <Drawer
        title="选择提示词模板"
        placement="right"
        width={500}
        onClose={() => setTemplateDrawerVisible(false)}
        visible={templateDrawerVisible}
      >
        <PromptTemplateSelector onSelect={handleTemplateSelect} />
      </Drawer>
    </div>
  );
};

export default ContentGenerator; 