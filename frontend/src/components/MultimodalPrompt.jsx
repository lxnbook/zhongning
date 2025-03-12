import React, { useState } from 'react';
import { Upload, Button, Input, Space, message, Image } from 'antd';
import { UploadOutlined, SendOutlined, DeleteOutlined } from '@ant-design/icons';
import apiService from '../services/apiService';

const MultimodalPrompt = ({ onSend }) => {
  const [text, setText] = useState('');
  const [fileList, setFileList] = useState([]);
  const [previewImage, setPreviewImage] = useState('');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [sending, setSending] = useState(false);

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const handleFileChange = ({ fileList }) => {
    setFileList(fileList);
  };

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    
    setPreviewImage(file.url || file.preview);
    setPreviewVisible(true);
  };

  const handleSend = async () => {
    if (!text && fileList.length === 0) {
      message.warning('请输入文本或上传图片');
      return;
    }
    
    try {
      setSending(true);
      
      const formData = new FormData();
      formData.append('text', text);
      
      fileList.forEach(file => {
        if (file.originFileObj) {
          formData.append('files', file.originFileObj);
        }
      });
      
      const response = await apiService.post('/ai/multimodal', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      onSend(text, fileList, response.data);
      
      setText('');
      setFileList([]);
    } catch (error) {
      console.error('发送多模态请求失败:', error);
      message.error('发送失败，请稍后重试');
    } finally {
      setSending(false);
    }
  };

  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  return (
    <div>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Input.TextArea
          value={text}
          onChange={handleTextChange}
          placeholder="输入您的问题或描述..."
          autoSize={{ minRows: 2, maxRows: 6 }}
        />
        
        <Upload
          listType="picture-card"
          fileList={fileList}
          onChange={handleFileChange}
          onPreview={handlePreview}
          beforeUpload={() => false}
        >
          {fileList.length >= 4 ? null : (
            <div>
              <UploadOutlined />
              <div style={{ marginTop: 8 }}>上传图片</div>
            </div>
          )}
        </Upload>
        
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSend}
          loading={sending}
          disabled={!text && fileList.length === 0}
        >
          发送
        </Button>
      </Space>
      
      <Image
        width={200}
        style={{ display: 'none' }}
        src={previewImage}
        preview={{
          visible: previewVisible,
          onVisibleChange: value => setPreviewVisible(value),
          src: previewImage,
        }}
      />
    </div>
  );
};

export default MultimodalPrompt; 