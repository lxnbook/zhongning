import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Form, 
  Input, 
  Select, 
  Switch, 
  Button, 
  Table, 
  Space, 
  Tabs, 
  message, 
  Spin, 
  Tooltip, 
  Divider,
  Alert,
  Modal,
  Tag,
  Collapse
} from 'antd';
import { 
  RobotOutlined, 
  ApiOutlined, 
  SettingOutlined, 
  QuestionCircleOutlined, 
  CheckCircleOutlined, 
  SyncOutlined, 
  InfoCircleOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  ExperimentOutlined
} from '@ant-design/icons';
import apiService from '../services/apiService';
import { LLM_PROVIDERS, TASK_TYPES } from '../services/llmService';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { Panel } = Collapse;

const LLMSettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [config, setConfig] = useState({
    defaultProvider: '',
    providers: {},
    taskMapping: {}
  });
  const [activeTab, setActiveTab] = useState('providers');
  const [testResult, setTestResult] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentProvider, setCurrentProvider] = useState(null);
  const [providerForm] = Form.useForm();

  // 加载配置
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        const data = await apiService.get('/settings/llm-config');
        setConfig(data);
      } catch (error) {
        console.error('Failed to load LLM configuration:', error);
        message.error('加载LLM配置失败');
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  // 保存配置
  const handleSave = async () => {
    try {
      setSaving(true);
      await apiService.post('/settings/llm-config', config);
      message.success('LLM配置保存成功');
    } catch (error) {
      console.error('Failed to save LLM configuration:', error);
      message.error('保存LLM配置失败');
    } finally {
      setSaving(false);
    }
  };

  // 测试LLM连接
  const testConnection = async (provider) => {
    try {
      setTesting(true);
      setTestResult(null);
      
      const result = await apiService.post('/llm/test-connection', { provider });
      
      setTestResult({
        provider,
        success: true,
        message: result.message,
        details: result.details
      });
      
      message.success(`${provider} 连接测试成功`);
    } catch (error) {
      console.error(`Failed to test ${provider} connection:`, error);
      
      setTestResult({
        provider,
        success: false,
        message: error.message || '连接测试失败',
        details: error.details
      });
      
      message.error(`${provider} 连接测试失败`);
    } finally {
      setTesting(false);
    }
  };

  // 添加/编辑提供商
  const handleEditProvider = (provider = null) => {
    setCurrentProvider(provider);
    
    if (provider) {
      // 编辑现有提供商
      providerForm.setFieldsValue({
        ...config.providers[provider],
        name: provider
      });
    } else {
      // 添加新提供商
      providerForm.resetFields();
    }
    
    setEditModalVisible(true);
  };

  // 保存提供商设置
  const handleProviderFormSubmit = () => {
    providerForm.validateFields().then(values => {
      const { name, ...providerConfig } = values;
      
      // 更新配置
      const newConfig = { ...config };
      newConfig.providers = { ...newConfig.providers };
      newConfig.providers[name] = providerConfig;
      
      // 如果是新提供商且只有这一个启用的提供商，设为默认
      if (!currentProvider && providerConfig.enabled && !newConfig.defaultProvider) {
        newConfig.defaultProvider = name;
      }
      
      setConfig(newConfig);
      setEditModalVisible(false);
      message.success(`${currentProvider ? '更新' : '添加'}提供商成功`);
    });
  };

  // 删除提供商
  const handleDeleteProvider = (provider) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除 ${provider} 提供商吗？`,
      onOk: () => {
        const newConfig = { ...config };
        newConfig.providers = { ...newConfig.providers };
        delete newConfig.providers[provider];
        
        // 如果删除的是默认提供商，重置默认提供商
        if (newConfig.defaultProvider === provider) {
          const enabledProviders = Object.keys(newConfig.providers)
            .filter(key => newConfig.providers[key].enabled);
          
          newConfig.defaultProvider = enabledProviders.length > 0 ? enabledProviders[0] : null;
        }
        
        // 更新任务映射
        newConfig.taskMapping = { ...newConfig.taskMapping };
        Object.keys(newConfig.taskMapping).forEach(task => {
          if (newConfig.taskMapping[task] === provider) {
            newConfig.taskMapping[task] = newConfig.defaultProvider;
          }
        });
        
        setConfig(newConfig);
        message.success(`删除提供商 ${provider} 成功`);
      }
    });
  };

  // 切换提供商启用状态
  const toggleProviderEnabled = (provider, enabled) => {
    const newConfig = { ...config };
    newConfig.providers = { ...newConfig.providers };
    newConfig.providers[provider] = { 
      ...newConfig.providers[provider],
      enabled 
    };
    
    // 如果禁用了默认提供商，需要更新默认提供商
    if (!enabled && newConfig.defaultProvider === provider) {
      const enabledProviders = Object.keys(newConfig.providers)
        .filter(key => key !== provider && newConfig.providers[key].enabled);
      
      newConfig.defaultProvider = enabledProviders.length > 0 ? enabledProviders[0] : null;
    }
    
    setConfig(newConfig);
  };

  // 设置默认提供商
  const setDefaultProvider = (provider) => {
    setConfig({
      ...config,
      defaultProvider: provider
    });
  };

  // 更新任务映射
  const updateTaskMapping = (task, provider) => {
    setConfig({
      ...config,
      taskMapping: {
        ...config.taskMapping,
        [task]: provider
      }
    });
  };

  // 渲染提供商表格
  const renderProvidersTable = () => {
    const columns = [
      {
        title: '提供商',
        dataIndex: 'name',
        key: 'name',
        render: (text) => (
          <Space>
            <Text strong>{text}</Text>
            {config.defaultProvider === text && (
              <Tag color="blue">默认</Tag>
            )}
          </Space>
        )
      },
      {
        title: '描述',
        dataIndex: 'description',
        key: 'description'
      },
      {
        title: '状态',
        dataIndex: 'enabled',
        key: 'enabled',
        render: (enabled, record) => (
          <Switch 
            checked={enabled} 
            onChange={(checked) => toggleProviderEnabled(record.name, checked)}
          />
        )
      },
      {
        title: '操作',
        key: 'action',
        render: (_, record) => (
          <Space>
            {record.enabled && config.defaultProvider !== record.name && (
              <Button 
                type="link" 
                onClick={() => setDefaultProvider(record.name)}
              >
                设为默认
              </Button>
            )}
            <Button 
              type="link" 
              icon={<EditOutlined />} 
              onClick={() => handleEditProvider(record.name)}
            >
              编辑
            </Button>
            <Button 
              type="link" 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => handleDeleteProvider(record.name)}
            >
              删除
            </Button>
            <Button 
              type="link" 
              icon={<ExperimentOutlined />} 
              onClick={() => testConnection(record.name)}
              loading={testing && testResult?.provider === record.name}
            >
              测试
            </Button>
          </Space>
        )
      }
    ];

    const data = Object.keys(config.providers).map(key => ({
      key,
      name: key,
      ...config.providers[key]
    }));

    return (
      <div>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Title level={4}>LLM提供商配置</Title>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => handleEditProvider()}
          >
            添加提供商
          </Button>
        </div>
        
        {testResult && (
          <Alert
            message={`${testResult.provider} 连接测试${testResult.success ? '成功' : '失败'}`}
            description={
              <div>
                <p>{testResult.message}</p>
                {testResult.details && (
                  <pre style={{ maxHeight: 200, overflow: 'auto' }}>
                    {JSON.stringify(testResult.details, null, 2)}
                  </pre>
                )}
              </div>
            }
            type={testResult.success ? 'success' : 'error'}
            showIcon
            closable
            style={{ marginBottom: 16 }}
          />
        )}
        
        <Table 
          columns={columns} 
          dataSource={data} 
          rowKey="name"
          pagination={false}
        />
      </div>
    );
  };

  // 渲染任务映射表格
  const renderTaskMappingTable = () => {
    const columns = [
      {
        title: '任务类型',
        dataIndex: 'task',
        key: 'task',
        render: (text) => {
          // 将任务类型转换为更友好的显示名称
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
          
          return taskNames[text] || text;
        }
      },
      {
        title: '使用提供商',
        dataIndex: 'provider',
        key: 'provider',
        render: (text, record) => {
          const enabledProviders = Object.keys(config.providers)
            .filter(key => config.providers[key].enabled);
          
          return (
            <Select
              value={text || config.defaultProvider}
              style={{ width: 200 }}
              onChange={(value) => updateTaskMapping(record.task, value)}
            >
              <Option value={null}>使用默认 ({config.defaultProvider || '无'})</Option>
              {enabledProviders.map(provider => (
                <Option key={provider} value={provider}>{provider}</Option>
              ))}
            </Select>
          );
        }
      }
    ];

    const data = Object.values(TASK_TYPES).map(task => ({
      key: task,
      task,
      provider: config.taskMapping[task]
    }));

    return (
      <div>
        <Title level={4}>任务-提供商映射</Title>
        <Paragraph>
          为不同类型的任务指定最合适的LLM提供商。如果不指定，将使用默认提供商。
        </Paragraph>
        
        <Table 
          columns={columns} 
          dataSource={data} 
          rowKey="task"
          pagination={false}
        />
      </div>
    );
  };

  // 渲染高级设置
  const renderAdvancedSettings = () => {
    return (
      <div>
        <Title level={4}>高级设置</Title>
        
        <Collapse>
          <Panel header="模型参数设置" key="model-params">
            <Form layout="vertical">
              <Form.Item label="温度 (Temperature)">
                <Tooltip title="控制输出的随机性，较高的值会使输出更加多样化">
                  <Input.Group compact>
                    <Input
                      style={{ width: 'calc(100% - 80px)' }}
                      type="number"
                      min={0}
                      max={2}
                      step={0.1}
                      value={config.globalParams?.temperature || 0.7}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        setConfig({
                          ...config,
                          globalParams: {
                            ...config.globalParams,
                            temperature: value
                          }
                        });
                      }}
                    />
                    <Button
                      style={{ width: 80 }}
                      onClick={() => {
                        setConfig({
                          ...config,
                          globalParams: {
                            ...config.globalParams,
                            temperature: 0.7
                          }
                        });
                      }}
                    >
                      重置
                    </Button>
                  </Input.Group>
                </Tooltip>
              </Form.Item>
              
              <Form.Item label="最大令牌数 (Max Tokens)">
                <Tooltip title="控制生成文本的最大长度">
                  <Input.Group compact>
                    <Input
                      style={{ width: 'calc(100% - 80px)' }}
                      type="number"
                      min={1}
                      max={8192}
                      step={1}
                      value={config.globalParams?.maxTokens || 2048}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        setConfig({
                          ...config,
                          globalParams: {
                            ...config.globalParams,
                            maxTokens: value
                          }
                        });
                      }}
                    />
                    <Button
                      style={{ width: 80 }}
                      onClick={() => {
                        setConfig({
                          ...config,
                          globalParams: {
                            ...config.globalParams,
                            maxTokens: 2048
                          }
                        });
                      }}
                    >
                      重置
                    </Button>
                  </Input.Group>
                </Tooltip>
              </Form.Item>
            </Form>
          </Panel>
          
          <Panel header="系统提示词设置" key="system-prompts">
            <Form layout="vertical">
              {Object.values(TASK_TYPES).map(task => {
                // 将任务类型转换为更友好的显示名称
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
                
                return (
                  <Form.Item 
                    key={task} 
                    label={taskNames[task] || task}
                  >
                    <Input.TextArea
                      rows={3}
                      value={config.systemPrompts?.[task] || ''}
                      onChange={(e) => {
                        setConfig({
                          ...config,
                          systemPrompts: {
                            ...config.systemPrompts,
                            [task]: e.target.value
                          }
                        });
                      }}
                      placeholder={`输入${taskNames[task] || task}任务的系统提示词...`}
                    />
                  </Form.Item>
                );
              })}
            </Form>
          </Panel>
          
          <Panel header="错误处理设置" key="error-handling">
            <Form layout="vertical">
              <Form.Item label="重试次数">
                <Input
                  type="number"
                  min={0}
                  max={5}
                  value={config.errorHandling?.maxRetries || 3}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    setConfig({
                      ...config,
                      errorHandling: {
                        ...config.errorHandling,
                        maxRetries: value
                      }
                    });
                  }}
                />
              </Form.Item>
              
              <Form.Item label="失败时回退到备用提供商">
                <Switch
                  checked={config.errorHandling?.fallbackToDefault || false}
                  onChange={(checked) => {
                    setConfig({
                      ...config,
                      errorHandling: {
                        ...config.errorHandling,
                        fallbackToDefault: checked
                      }
                    });
                  }}
                />
              </Form.Item>
            </Form>
          </Panel>
        </Collapse>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Card
      title={
        <Space>
          <RobotOutlined />
          <span>LLM集成设置</span>
        </Space>
      }
      extra={
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={handleSave}
          loading={saving}
        >
          保存配置
        </Button>
      }
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane
          tab={
            <span>
              <ApiOutlined />
              提供商配置
            </span>
          }
          key="providers"
        >
          {renderProvidersTable()}
        </TabPane>
        
        <TabPane
          tab={
            <span>
              <SettingOutlined />
              任务映射
            </span>
          }
          key="task-mapping"
        >
          {renderTaskMappingTable()}
        </TabPane>
        
        <TabPane
          tab={
            <span>
              <SettingOutlined />
              高级设置
            </span>
          }
          key="advanced"
        >
          {renderAdvancedSettings()}
        </TabPane>
      </Tabs>
      
      {/* 提供商编辑模态框 */}
      <Modal
        title={`${currentProvider ? '编辑' : '添加'}LLM提供商`}
        open={editModalVisible}
        onOk={handleProviderFormSubmit}
        onCancel={() => setEditModalVisible(false)}
        width={700}
      >
        <Form
          form={providerForm}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="提供商名称"
            rules={[
              { required: true, message: '请输入提供商名称' },
              {
                validator: (_, value) => {
                  if (currentProvider && value === currentProvider) {
                    return Promise.resolve();
                  }
                  
                  if (config.providers[value]) {
                    return Promise.reject(new Error('提供商名称已存在'));
                  }
                  
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Input disabled={!!currentProvider} />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea rows={2} />
          </Form.Item>
          
          <Form.Item
            name="enabled"
            valuePropName="checked"
            label="启用"
          >
            <Switch />
          </Form.Item>
          
          <Form.Item
            name="apiKey"
            label="API密钥"
            rules={[{ required: true, message: '请输入API密钥' }]}
          >
            <Input.Password />
          </Form.Item>
          
          <Form.Item
            name="apiEndpoint"
            label="API端点"
          >
            <Input placeholder="https://api.example.com/v1" />
          </Form.Item>
          
          <Form.Item
            name="modelName"
            label="模型名称"
          >
            <Input placeholder="例如: gpt-4, claude-3-opus-20240229" />
          </Form.Item>
          
          <Form.Item
            name="timeout"
            label="超时时间 (毫秒)"
          >
            <Input type="number" min={1000} step={1000} defaultValue={30000} />
          </Form.Item>
          
          <Form.Item
            name="headers"
            label="额外请求头"
          >
            <Input.TextArea 
              rows={3} 
              placeholder='{"X-Custom-Header": "value"}'
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default LLMSettingsPage; 