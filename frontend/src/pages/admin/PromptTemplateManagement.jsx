import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Modal, 
  Form, 
  Input, 
  Select, 
  message,
  Tabs,
  Tag,
  Popconfirm,
  Typography
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  ExportOutlined, 
  ImportOutlined,
  BookOutlined,
  UserOutlined,
  ApartmentOutlined,
  AppstoreOutlined
} from '@ant-design/icons';
import api from '../../services/api';
import errorHandler from '../../services/errorHandler';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { Title } = Typography;

const PromptTemplateManagement = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('subjects');
  
  // 获取模板列表
  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/prompt-templates');
      setTemplates(response.data);
    } catch (error) {
      errorHandler.handleApiError(error, '获取提示词模板失败');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTemplates();
  }, []);
  
  // 处理添加/编辑模板
  const handleSaveTemplate = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingTemplate) {
        // 更新模板
        await api.put(`/admin/prompt-templates/${editingTemplate.id}`, values);
        message.success('模板更新成功');
      } else {
        // 添加模板
        await api.post('/admin/prompt-templates', values);
        message.success('模板添加成功');
      }
      
      setModalVisible(false);
      form.resetFields();
      setEditingTemplate(null);
      fetchTemplates();
    } catch (error) {
      if (error.errorFields) {
        // 表单验证错误
        return;
      }
      errorHandler.handleApiError(error, '保存模板失败');
    }
  };
  
  // 处理删除模板
  const handleDeleteTemplate = async (id) => {
    try {
      await api.delete(`/admin/prompt-templates/${id}`);
      message.success('模板删除成功');
      fetchTemplates();
    } catch (error) {
      errorHandler.handleApiError(error, '删除模板失败');
    }
  };
  
  // 处理编辑模板
  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    form.setFieldsValue({
      category: template.category,
      subCategory: template.subCategory,
      name: template.name,
      title: template.title,
      prompt: template.prompt,
      parameters: template.parameters.join(',')
    });
    setModalVisible(true);
  };
  
  // 表格列定义
  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (category) => {
        let icon = <BookOutlined />;
        let color = 'blue';
        
        if (category === 'roles') {
          icon = <UserOutlined />;
          color = 'green';
        } else if (category === 'departments') {
          icon = <ApartmentOutlined />;
          color = 'orange';
        } else if (category === 'functions') {
          icon = <AppstoreOutlined />;
          color = 'purple';
        }
        
        return (
          <Tag color={color} icon={icon}>
            {category === 'subjects' ? '学科' : 
             category === 'roles' ? '角色' :
             category === 'departments' ? '部门' : '功能'}
          </Tag>
        );
      }
    },
    {
      title: '子分类',
      dataIndex: 'subCategory',
      key: 'subCategory',
    },
    {
      title: '模板名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '参数',
      dataIndex: 'parameters',
      key: 'parameters',
      render: (parameters) => (
        <>
          {parameters.map(param => (
            <Tag key={param}>{param}</Tag>
          ))}
        </>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleEditTemplate(record)}
          />
          <Popconfirm
            title="确定要删除此模板吗？"
            onConfirm={() => handleDeleteTemplate(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];
  
  // 过滤当前标签页的模板
  const filteredTemplates = templates.filter(
    template => template.category === activeTab
  );
  
  return (
    <Card 
      title="提示词模板管理" 
      extra={
        <Space>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingTemplate(null);
              form.resetFields();
              form.setFieldsValue({ category: activeTab });
              setModalVisible(true);
            }}
          >
            添加模板
          </Button>
          <Button icon={<ImportOutlined />}>
            导入模板
          </Button>
          <Button icon={<ExportOutlined />}>
            导出模板
          </Button>
        </Space>
      }
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane 
          tab={
            <span>
              <BookOutlined />
              学科模板
            </span>
          } 
          key="subjects"
        >
          <Table 
            columns={columns} 
            dataSource={filteredTemplates} 
            rowKey="id"
            loading={loading}
          />
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <UserOutlined />
              角色模板
            </span>
          } 
          key="roles"
        >
          <Table 
            columns={columns} 
            dataSource={filteredTemplates} 
            rowKey="id"
            loading={loading}
          />
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <ApartmentOutlined />
              部门模板
            </span>
          } 
          key="departments"
        >
          <Table 
            columns={columns} 
            dataSource={filteredTemplates} 
            rowKey="id"
            loading={loading}
          />
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <AppstoreOutlined />
              功能模板
            </span>
          } 
          key="functions"
        >
          <Table 
            columns={columns} 
            dataSource={filteredTemplates} 
            rowKey="id"
            loading={loading}
          />
        </TabPane>
      </Tabs>
      
      {/* 添加/编辑模板对话框 */}
      <Modal
        title={editingTemplate ? '编辑提示词模板' : '添加提示词模板'}
        visible={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingTemplate(null);
          form.resetFields();
        }}
        onOk={handleSaveTemplate}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ category: activeTab }}
        >
          <Form.Item
            name="category"
            label="分类"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select>
              <Option value="subjects">学科</Option>
              <Option value="roles">角色</Option>
              <Option value="departments">部门</Option>
              <Option value="functions">功能</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="subCategory"
            label="子分类"
            rules={[{ required: true, message: '请输入子分类' }]}
          >
            <Input placeholder="如: chinese, math, teacher, studentManagement 等" />
          </Form.Item>
          
          <Form.Item
            name="name"
            label="模板名称"
            rules={[{ required: true, message: '请输入模板名称' }]}
          >
            <Input placeholder="如: lessonPlanning, contentCreation 等" />
          </Form.Item>
          
          <Form.Item
            name="title"
            label="模板标题"
            rules={[{ required: true, message: '请输入模板标题' }]}
          >
            <Input placeholder="如: 语文教案设计, 课堂管理策略 等" />
          </Form.Item>
          
          <Form.Item
            name="prompt"
            label="提示词内容"
            rules={[{ required: true, message: '请输入提示词内容' }]}
          >
            <TextArea 
              rows={10} 
              placeholder="提示词内容，使用 {paramName} 表示参数" 
            />
          </Form.Item>
          
          <Form.Item
            name="parameters"
            label="参数列表"
            rules={[{ required: true, message: '请输入参数列表' }]}
            extra="多个参数用逗号分隔，如: grade,topic,difficulty"
          >
            <Input placeholder="如: grade,topic,difficulty" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default PromptTemplateManagement; 