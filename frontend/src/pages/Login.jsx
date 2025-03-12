import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Spin } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.png';

const { Title, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      await login(values);
      message.success('登录成功');
      navigate('/');
    } catch (error) {
      console.error('登录失败:', error);
      message.error('登录失败: ' + (error.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      background: '#f0f2f5'
    }}>
      <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <img src={logo} alt="Logo" style={{ height: 64 }} />
          <Title level={2} style={{ marginTop: 16 }}>教育AI助手</Title>
          <Text type="secondary">智能教学，个性化学习</Text>
        </div>
        
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={handleSubmit}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" size="large" />
          </Form.Item>
          
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" size="large" />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block loading={loading}>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login; 