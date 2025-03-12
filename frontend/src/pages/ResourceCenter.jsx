import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Input, 
  Select, 
  Space, 
  Tag, 
  Upload, 
  Modal, 
  Form, 
  message,
  Typography,
  Divider
} from 'antd';
import { 
  SearchOutlined, 
  UploadOutlined, 
  FileOutlined, 
  FilePdfOutlined, 
  FileImageOutlined,
  FileExcelOutlined,
  FilePptOutlined,
  FileWordOutlined,
  FileZipOutlined,
  FileUnknownOutlined,
  VideoCameraOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { Title, Paragraph } = Typography;

const ResourceCenter = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [form] = Form.useForm();
  
  // 模拟数据，实际应从API获取
  useEffect(() => {
    setLoading(true);
    // 模拟API请求
    setTimeout(() => {
      const mockData = [
        {
          id: 1,
          title: '小学语文教学PPT模板',
          type: 'presentation',
          grade: '小学',
          subject: '语文',
          fileSize: 2.5,
          fileType: 'ppt',
          uploader: '张老师',
          downloads: 125,
          views: 356,
          createdAt: '2023-04-15',
          tags: ['PPT', '模板', '语文']
        },
        {
          id: 2,
          title: '初中数学练习题集',
          type: 'document',
          grade: '初中',
          subject: '数学',
          fileSize: 1.8,
          fileType: 'pdf',
          uploader: '李老师',
          downloads: 89,
          views: 210,
          createdAt: '2023-04-20',
          tags: ['练习题', '数学', '初中']
        },
        {
          id: 3,
          title: '高中物理实验视频',
          type: 'video',
          grade: '高中',
          subject: '物理',
          fileSize: 15.6,
          fileType: 'mp4',
          uploader: '王老师',
          downloads: 56,
          views: 178,
          createdAt: '2023-04-25',
          tags: ['实验', '物理', '视频']
        },
        {
          id: 4,
          title: '英语听力练习音频',
          type: 'audio',
          grade: '高中',
          subject: '英语',
          fileSize: 8.2,
          fileType: 'mp3',
          uploader: '刘老师',
          downloads: 112,
          views: 245,
          createdAt: '2023-04-28',
          tags: ['听力', '英语', '练习']
        },
        {
          id: 5,
          title: '生物细胞结构图解',
          type: 'image',
          grade: '初中',
          subject: '生物',
          fileSize: 3.5,
          fileType: 'jpg',
          uploader: '赵老师',
          downloads: 78,
          views: 190,
          createdAt: '2023-05-02',
          tags: ['细胞', '生物', '图解']
        }
      ];
      setResources(mockData);
      setLoading(false);
    }, 1000);
  }, []);
  
  // 获取文件图标
  const getFileIcon = (fileType) => {
    switch(fileType) {
      case 'pdf':
        return <FilePdfOutlined style={{ color: '#ff4d4f' }} />;
      case 'doc':
      case 'docx':
        return <FileWordOutlined style={{ color: '#1890ff' }} />;
      case 'xls':
      case 'xlsx':
        return <FileExcelOutlined style={{ color: '#52c41a' }} />;
      case 'ppt':
      case 'pptx':
        return <FilePptOutlined style={{ color: '#fa8c16' }} />;
      case 'jpg':
      case 'png':
      case 'gif':
        return <FileImageOutlined style={{ color: '#722ed1' }} />;
      case 'zip':
      case 'rar':
        return <FileZipOutlined style={{ color: '#faad14' }} />;
      case 'mp4':
      case 'avi':
        return <VideoCameraOutlined style={{ color: '#eb2f96' }} />;
      default:
        return <FileUnknownOutlined />;
    }
  };
  
  // 表格列定义
  const columns = [
    {
      title: '资源名称',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Space>
          {getFileIcon(record.fileType)}
          <a href="#">{text}</a>
        </Space>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: type => {
        let color = 'blue';
        let text = '文档';
        
        if (type === 'presentation') {
          color = 'orange';
          text = '演示文稿';
        } else if (type === 'video') {
          color = 'purple';
          text = '视频';
        } else if (type === 'audio') {
          color = 'cyan';
          text = '音频';
        } else if (type === 'image') {
          color = 'green';
          text = '图片';
        }
        
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: '年级',
      dataIndex: 'grade',
      key: 'grade',
    },
    {
      title: '学科',
      dataIndex: 'subject',
      key: 'subject',
    },
    {
      title: '大小',
      dataIndex: 'fileSize',
      key: 'fileSize',
      render: size => `${size} MB`
    },
    {
      title: '上传者',
      dataIndex: 'uploader',
      key: 'uploader',
    },
    {
      title: '下载/查看',
      key: 'stats',
      render: (_, record) => (
        <span>{record.downloads} / {record.views}</span>
      )
    },
    {
      title: '上传日期',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: '标签',
      key: 'tags',
      dataIndex: 'tags',
      render: tags => (
        <>
          {tags.map(tag => (
            <Tag color="blue" key={tag}>
              {tag}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <a href="#">下载</a>
          <a href="#">查看</a>
        </Space>
      ),
    },
  ];
  
  // 处理资源上传
  const handleUpload = (values) => {
    console.log('上传资源:', values);
    message.success('资源上传成功');
    setUploadModalVisible(false);
    form.resetFields();
  };
  
  return (
    <div>
      <Title level={2}>资源中心</Title>
      <Paragraph>浏览、搜索和上传教育资源</Paragraph>
      <Divider />
      
      {/* 搜索和过滤 */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 16 }}>
            <Input 
              placeholder="搜索资源" 
              prefix={<SearchOutlined />} 
              style={{ width: 250 }} 
            />
            <Select placeholder="资源类型" style={{ width: 120 }}>
              <Option value="all">全部类型</Option>
              <Option value="document">文档</Option>
              <Option value="presentation">演示文稿</Option>
              <Option value="video">视频</Option>
              <Option value="audio">音频</Option>
              <Option value="image">图片</Option>
            </Select>
            <Select placeholder="年级" style={{ width: 120 }}>
              <Option value="all">全部年级</Option>
              <Option value="小学">小学</Option>
              <Option value="初中">初中</Option>
              <Option value="高中">高中</Option>
            </Select>
            <Select placeholder="学科" style={{ width: 120 }}>
              <Option value="all">全部学科</Option>
              <Option value="语文">语文</Option>
              <Option value="数学">数学</Option>
              <Option value="英语">英语</Option>
              <Option value="物理">物理</Option>
              <Option value="化学">化学</Option>
              <Option value="生物">生物</Option>
            </Select>
          </div>
          <Button 
            type="primary" 
            icon={<UploadOutlined />}
            onClick={() => setUploadModalVisible(true)}
          >
            上传资源
          </Button>
        </div>
      </Card>
      
      {/* 资源列表 */}
      <Card>
        <Table 
          columns={columns} 
          dataSource={resources} 
          rowKey="id" 
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
      
      {/* 上传资源模态框 */}
      <Modal
        title="上传资源"
        visible={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpload}
        >
          <Form.Item
            name="title"
            label="资源名称"
            rules={[{ required: true, message: '请输入资源名称' }]}
          >
            <Input placeholder="请输入资源名称" />
          </Form.Item>
          
          <Form.Item
            name="type"
            label="资源类型"
            rules={[{ required: true, message: '请选择资源类型' }]}
          >
            <Select placeholder="请选择资源类型">
              <Option value="document">文档</Option>
              <Option value="presentation">演示文稿</Option>
              <Option value="video">视频</Option>
              <Option value="audio">音频</Option>
              <Option value="image">图片</Option>
              <Option value="exercise">习题</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="grade"
            label="适用年级"
            rules={[{ required: true, message: '请选择适用年级' }]}
          >
            <Select placeholder="请选择适用年级">
              <Option value="小学">小学</Option>
              <Option value="初中">初中</Option>
              <Option value="高中">高中</Option>
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
            name="tags"
            label="标签"
          >
            <Select mode="tags" placeholder="请输入标签，按回车分隔" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="资源描述"
          >
            <Input.TextArea rows={4} placeholder="请输入资源描述" />
          </Form.Item>
          
          <Form.Item
            name="file"
            label="上传文件"
            rules={[{ required: true, message: '请上传文件' }]}
          >
            <Upload
              beforeUpload={() => false}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>选择文件</Button>
            </Upload>
          </Form.Item>
          
          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button onClick={() => setUploadModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">上传</Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ResourceCenter; 