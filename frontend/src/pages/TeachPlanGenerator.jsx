import React, { useState } from 'react';
import { Form, Select, Button, Card, Input, Spin, Divider, Typography, message } from 'antd';
import axios from 'axios';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Paragraph } = Typography;

const TeachPlanGenerator = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [teachPlan, setTeachPlan] = useState(null);

  const grades = ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级', '七年级', '八年级', '九年级', '高一', '高二', '高三'];
  const subjects = ['语文', '数学', '英语', '物理', '化学', '生物', '历史', '地理', '政治', '信息技术'];

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/teach-plan/generate', values);
      setTeachPlan(response.data.teachPlan);
      message.success('教案生成成功');
    } catch (error) {
      message.error('生成失败: ' + (error.response?.data?.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Title level={2}>智能教案生成</Title>
      <Paragraph>根据年级、学科和章节信息，一键生成教学方案</Paragraph>
      <Divider />
      
      <Card title="教案参数设置" style={{ marginBottom: 20 }}>
        <Form form={form} onFinish={onFinish} layout="vertical">
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              name="grade"
              label="年级"
              rules={[{ required: true, message: '请选择年级' }]}
              style={{ flex: 1 }}
            >
              <Select placeholder="选择年级">
                {grades.map(grade => (
                  <Option key={grade} value={grade}>{grade}</Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item
              name="subject"
              label="学科"
              rules={[{ required: true, message: '请选择学科' }]}
              style={{ flex: 1 }}
            >
              <Select placeholder="选择学科">
                {subjects.map(subject => (
                  <Option key={subject} value={subject}>{subject}</Option>
                ))}
              </Select>
            </Form.Item>
          </div>
          
          <Form.Item
            name="chapter"
            label="章节内容"
            rules={[{ required: true, message: '请输入章节内容' }]}
          >
            <Input placeholder="例如：分数的加减法" />
          </Form.Item>
          
          <Form.Item
            name="requirements"
            label="特殊要求（选填）"
          >
            <TextArea rows={4} placeholder="请输入特殊教学要求或偏好..." />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              一键生成教案
            </Button>
          </Form.Item>
        </Form>
      </Card>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin size="large" />
          <p style={{ marginTop: 16 }}>正在生成教案，请稍候...</p>
        </div>
      ) : teachPlan ? (
        <Card title="生成的教案">
          <div dangerouslySetInnerHTML={{ __html: teachPlan }} />
          <Divider />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button>下载教案</Button>
            <Button type="primary">保存到我的教案</Button>
          </div>
        </Card>
      ) : null}
    </div>
  );
};

export default TeachPlanGenerator; 