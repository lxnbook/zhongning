import React, { useState } from 'react';
import { Modal, Form, Rate, Input, Button, message } from 'antd';
import apiService from '../services/apiService';

const TemplateFeedback = ({ visible, onClose, templateId }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      
      await apiService.post(`/templates/${templateId}/feedback`, values);
      
      message.success('感谢您的反馈！');
      form.resetFields();
      onClose();
    } catch (error) {
      console.error('提交反馈失败:', error);
      message.error('提交反馈失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <Modal
      title="模板反馈"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>取消</Button>,
        <Button key="submit" type="primary" loading={submitting} onClick={handleSubmit}>
          提交
        </Button>
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="rating"
          label="整体评分"
          rules={[{ required: true, message: '请给出评分' }]}
        >
          <Rate allowHalf />
        </Form.Item>
        
        <Form.Item
          name="effectiveness"
          label="效果评价"
          rules={[{ required: true, message: '请评价模板效果' }]}
        >
          <Rate allowHalf />
        </Form.Item>
        
        <Form.Item
          name="usability"
          label="易用性评价"
          rules={[{ required: true, message: '请评价模板易用性' }]}
        >
          <Rate allowHalf />
        </Form.Item>
        
        <Form.Item
          name="comments"
          label="意见和建议"
        >
          <Input.TextArea rows={4} placeholder="请输入您的意见和建议" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TemplateFeedback; 