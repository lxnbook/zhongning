import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  Button, 
  Card, 
  Steps, 
  message, 
  Table, 
  Select, 
  Form, 
  Modal, 
  Spin, 
  Alert, 
  Typography,
  Space,
  Divider,
  Tooltip,
  List,
  Avatar,
  Tag,
  Input,
  DatePicker,
  Result
} from 'antd';
import { 
  InboxOutlined, 
  FileExcelOutlined, 
  FileTextOutlined, 
  CheckCircleOutlined,
  SyncOutlined,
  QuestionCircleOutlined,
  UploadOutlined,
  DatabaseOutlined,
  InfoCircleOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import apiService from '../services/apiService';

const { Dragger } = Upload;
const { Step } = Steps;
const { Option } = Select;
const { Text, Title, Paragraph } = Typography;

const SmartDataImport = ({ onImportComplete }) => {
  const [current, setCurrent] = useState(0);
  const [fileList, setFileList] = useState([]);
  const [previewData, setPreviewData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [mappings, setMappings] = useState({});
  const [loading, setLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [form] = Form.useForm();
  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [uploadedData, setUploadedData] = useState({
    fileName: '',
    fileType: '',
    rowCount: 0,
    preview: []
  });

  // 文件上传配置
  const uploadProps = {
    name: 'file',
    multiple: false,
    accept: '.xlsx,.xls,.csv,.txt',
    fileList,
    beforeUpload: (file) => {
      setFileList([file]);
      return false; // 阻止自动上传
    },
    onRemove: () => {
      setFileList([]);
    }
  };

  // 步骤1: 上传文件
  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.error('请先选择文件');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', fileList[0]);

    try {
      const response = await apiService.post('/data/preview-import', formData);
      setPreviewData(response.data);
      
      // 生成列配置
      const sampleRow = response.data[0] || {};
      const detectedColumns = Object.keys(sampleRow).map(key => ({
        title: key,
        dataIndex: key,
        key: key
      }));
      setColumns(detectedColumns);
      
      // 初始化映射
      const initialMappings = {};
      detectedColumns.forEach(col => {
        // 智能匹配列名
        let mappedField = null;
        const colLower = col.title.toLowerCase();
        
        if (colLower.includes('姓名') || colLower.includes('name')) {
          mappedField = 'name';
        } else if (colLower.includes('学号') || colLower.includes('id')) {
          mappedField = 'studentId';
        } else if (colLower.includes('成绩') || colLower.includes('分数') || colLower.includes('score')) {
          mappedField = 'score';
        } else if (colLower.includes('班级') || colLower.includes('class')) {
          mappedField = 'class';
        }
        
        initialMappings[col.key] = mappedField;
      });
      setMappings(initialMappings);
      
      // 设置上传数据信息
      setUploadedData({
        fileName: fileList[0].name,
        fileType: fileList[0].type,
        rowCount: response.data.length,
        preview: response.data.slice(0, 5) // 只保存前5行用于预览
      });
      
      setCurrent(1);
    } catch (error) {
      console.error('Preview import error:', error);
      message.error('文件解析失败，请检查文件格式');
    } finally {
      setLoading(false);
    }
  };

  // 步骤2: 映射字段
  const handleFieldMapping = async () => {
    // 检查是否有必要的字段映射
    const requiredFields = ['name', 'studentId'];
    const mappedFields = Object.values(mappings);
    
    for (const field of requiredFields) {
      if (!mappedFields.includes(field)) {
        message.error(`请至少映射"${field === 'name' ? '姓名' : '学号'}"字段`);
        return;
      }
    }
    
    setLoading(true);
    try {
      // 准备映射数据
      const mappingData = {
        mappings,
        data: previewData
      };
      
      // 发送映射数据到服务器
      const response = await apiService.post('/data/import', mappingData);
      
      setImportResult(response);
      setCurrent(2);
    } catch (error) {
      console.error('Import data error:', error);
      message.error('数据导入失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理文件上传变化
  const handleFileChange = info => {
    let fileList = [...info.fileList];
    
    // 只保留最后一个文件
    fileList = fileList.slice(-1);
    
    // 只接受Excel和CSV文件
    fileList = fileList.filter(file => {
      const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                      file.type === 'application/vnd.ms-excel';
      const isCSV = file.type === 'text/csv' || file.name.endsWith('.csv');
      
      if (!(isExcel || isCSV)) {
        message.error('只支持Excel和CSV文件');
        return false;
      }
      return true;
    });
    
    setFileList(fileList);
  };

  // 处理字段映射变化
  const handleMappingChange = (sourceField, targetField) => {
    setMappings(prev => ({
      ...prev,
      [sourceField]: targetField
    }));
  };

  // 重置导入过程
  const handleReset = () => {
    setCurrent(0);
    setFileList([]);
    setPreviewData([]);
    setColumns([]);
    setMappings({});
    setImportResult(null);
    setUploadedData({
      fileName: '',
      fileType: '',
      rowCount: 0,
      preview: []
    });
  };

  // 显示预览模态框
  const showPreviewModal = () => {
    setPreviewModalVisible(true);
  };

  // 加载模板
  const loadTemplates = async () => {
    setLoading(true);
    try {
      const response = await apiService.get('/data/import-templates');
      setTemplates(response);
      setTemplateModalVisible(true);
    } catch (error) {
      console.error('Load templates error:', error);
      message.error('加载模板失败');
    } finally {
      setLoading(false);
    }
  };

  // 应用模板
  const applyTemplate = (template) => {
    setMappings(template.mappings);
    form.setFieldsValue({ mappings: template.mappings });
    setTemplateModalVisible(false);
    setSelectedTemplate(template);
    message.success(`已应用模板: ${template.name}`);
  };

  // 保存为模板
  const saveAsTemplate = async () => {
    const values = await form.validateFields();
    
    Modal.confirm({
      title: '保存为导入模板',
      content: (
        <Form layout="vertical">
          <Form.Item
            label="模板名称"
            name="templateName"
            rules={[{ required: true, message: '请输入模板名称' }]}
          >
            <Input placeholder="例如: 期末成绩导入模板" />
          </Form.Item>
          <Form.Item
            label="描述"
            name="templateDescription"
          >
            <Input.TextArea placeholder="模板描述（可选）" />
          </Form.Item>
        </Form>
      ),
      onOk: async (close) => {
        const modalForm = document.querySelector('.ant-modal-content form');
        const formData = new FormData(modalForm);
        
        try {
          await apiService.post('/data/save-import-template', {
            name: formData.get('templateName'),
            description: formData.get('templateDescription'),
            mappings: values.mappings
          });
          
          message.success('模板保存成功');
          close();
        } catch (error) {
          console.error('Save template error:', error);
          message.error('模板保存失败');
        }
      }
    });
  };

  // 渲染步骤内容
  const renderStepContent = () => {
    switch (current) {
      case 0:
        return (
          <div className="upload-step">
            <Dragger {...uploadProps}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
              <p className="ant-upload-hint">
                支持Excel、CSV和文本文件格式
              </p>
            </Dragger>
            
            <Divider />
            
            <div style={{ textAlign: 'center' }}>
              <Space>
                <Button 
                  type="primary" 
                  onClick={handleUpload} 
                  disabled={fileList.length === 0}
                  loading={loading}
                >
                  解析文件
                </Button>
                <Tooltip title="下载示例文件">
                  <Button icon={<FileExcelOutlined />}>
                    下载模板
                  </Button>
                </Tooltip>
              </Space>
            </div>
          </div>
        );
        
      case 1:
        return (
          <div className="mapping-step">
            <Alert
              message="字段映射"
              description="请将文件中的列映射到系统字段，带*的为必填字段"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <Space>
                <Button 
                  type="primary" 
                  ghost 
                  icon={<FileTextOutlined />}
                  onClick={loadTemplates}
                >
                  应用模板
                </Button>
                <Button 
                  icon={<SyncOutlined />}
                  onClick={saveAsTemplate}
                >
                  保存为模板
                </Button>
              </Space>
              
              {selectedTemplate && (
                <Tag color="blue">当前模板: {selectedTemplate.name}</Tag>
              )}
            </div>
            
            <Form
              form={form}
              layout="vertical"
              initialValues={{ mappings }}
            >
              <Card title="预览数据" style={{ marginBottom: 16 }}>
                <Table 
                  dataSource={previewData.slice(0, 5)} 
                  columns={columns}
                  size="small"
                  pagination={false}
                  scroll={{ x: 'max-content' }}
                />
                <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                  显示前5行，共{previewData.length}行
                </Text>
              </Card>
              
              <Card title="字段映射">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                  {columns.map(col => (
                    <Form.Item
                      key={col.key}
                      label={
                        <Space>
                          {col.title}
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            (示例: {previewData[0]?.[col.dataIndex]})
                          </Text>
                        </Space>
                      }
                      name={['mappings', col.key]}
                    >
                      <Select placeholder="选择映射字段">
                        <Option value="name">学生姓名 *</Option>
                        <Option value="studentId">学号</Option>
                        <Option value="score">分数 *</Option>
                        <Option value="class">班级</Option>
                        <Option value="subject">科目</Option>
                        <Option value="examDate">考试日期</Option>
                        <Option value="examType">考试类型</Option>
                        <Option value="comments">备注</Option>
                        <Option value="ignore">忽略此列</Option>
                      </Select>
                    </Form.Item>
                  ))}
                </div>
              </Card>
              
              <Card title="元数据" style={{ marginTop: 16 }}>
                <Form.Item
                  label="考试/作业名称"
                  name={['metadata', 'examName']}
                >
                  <Input placeholder="例如: 2023年春季期末考试" />
                </Form.Item>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <Form.Item
                    label="科目"
                    name={['metadata', 'subject']}
                  >
                    <Select placeholder="选择科目">
                      <Option value="chinese">语文</Option>
                      <Option value="math">数学</Option>
                      <Option value="english">英语</Option>
                      <Option value="physics">物理</Option>
                      <Option value="chemistry">化学</Option>
                      <Option value="biology">生物</Option>
                      <Option value="history">历史</Option>
                      <Option value="geography">地理</Option>
                      <Option value="politics">政治</Option>
                    </Select>
                  </Form.Item>
                  
                  <Form.Item
                    label="考试日期"
                    name={['metadata', 'examDate']}
                  >
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </div>
              </Card>
            </Form>
          </div>
        );
        
      case 2:
        return (
          <div className="result-step">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>正在导入数据，请稍候...</div>
              </div>
            ) : (
              <>
                <Result
                  status="success"
                  title="数据导入成功"
                  subTitle={`成功导入 ${importResult?.successCount || 0} 条数据`}
                />
                
                {importResult?.warnings?.length > 0 && (
                  <Alert
                    message="导入警告"
                    description={
                      <ul>
                        {importResult.warnings.map((warning, index) => (
                          <li key={index}>{warning}</li>
                        ))}
                      </ul>
                    }
                    type="warning"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                )}
                
                {importResult?.summary && (
                  <Card title="导入摘要" size="small" style={{ marginBottom: 16 }}>
                    <ul>
                      <li>总记录数: {importResult.summary.totalCount}</li>
                      <li>成功导入: {importResult.summary.successCount}</li>
                      <li>跳过记录: {importResult.summary.skippedCount}</li>
                      <li>错误记录: {importResult.summary.errorCount}</li>
                    </ul>
                  </Card>
                )}
                
                <div style={{ marginTop: 24 }}>
                  <Space>
                    <Button onClick={handleReset}>
                      导入新文件
                    </Button>
                    <Button type="primary" onClick={() => window.location.reload()}>
                      查看导入的数据
                    </Button>
                  </Space>
                </div>
              </>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };

  const renderPreviewModal = () => {
    if (!previewData || previewData.length === 0) {
      return null;
    }
    
    // 创建预览表格的列
    const previewColumns = Object.keys(previewData[0]).map(key => ({
      title: key,
      dataIndex: key,
      key: key,
      ellipsis: true
    }));
    
    return (
      <Modal
        title="原始数据预览"
        open={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setPreviewModalVisible(false)}>
            关闭
          </Button>
        ]}
      >
        <Table
          dataSource={previewData.slice(0, 10)}
          columns={previewColumns}
          scroll={{ x: 'max-content' }}
          pagination={false}
          size="small"
        />
        {previewData.length > 10 && (
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <Text type="secondary">显示前10行数据，共 {previewData.length} 行</Text>
          </div>
        )}
      </Modal>
    );
  };

  return (
    <Card title="智能数据导入" className="smart-data-import">
      <Steps current={current} style={{ marginBottom: 24 }}>
        <Step title="上传文件" description="选择Excel或CSV文件" />
        <Step title="字段映射" description="配置数据字段" />
        <Step title="导入结果" description="查看导入摘要" />
      </Steps>
      
      <div className="steps-content" style={{ marginTop: 24 }}>
        {renderStepContent()}
      </div>
      
      {renderPreviewModal()}
      
      <Modal
        title="选择导入模板"
        visible={templateModalVisible}
        onCancel={() => setTemplateModalVisible(false)}
        footer={null}
        width={600}
      >
        <List
          itemLayout="horizontal"
          dataSource={templates}
          renderItem={template => (
            <List.Item
              actions={[
                <Button type="primary" size="small" onClick={() => applyTemplate(template)}>
                  应用
                </Button>
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar icon={<FileTextOutlined />} />}
                title={template.name}
                description={template.description || '无描述'}
              />
              <div>
                <Text type="secondary">
                  {Object.keys(template.mappings).length}个字段映射
                </Text>
              </div>
            </List.Item>
          )}
        />
      </Modal>
    </Card>
  );
};

export default SmartDataImport; 