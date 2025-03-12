import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Drawer, 
  Switch, 
  List, 
  Typography, 
  Space, 
  Divider,
  Alert,
  message,
  Result
} from 'antd';
import { 
  BulbOutlined, 
  RocketOutlined, 
  QuestionCircleOutlined
} from '@ant-design/icons';
import apiService from '../services/apiService';

const { Title, Paragraph, Text } = Typography;

const SimpleModeToggle = () => {
  const [visible, setVisible] = useState(false);
  const [simpleMode, setSimpleMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [features, setFeatures] = useState([]);

  // 加载简化模式状态
  useEffect(() => {
    const fetchSimpleModeStatus = async () => {
      try {
        const response = await apiService.get('/user/preferences');
        setSimpleMode(response.simpleMode || false);
        
        const featuresResponse = await apiService.get('/features/comparison');
        setFeatures(featuresResponse);
      } catch (error) {
        console.error('Failed to load simple mode status:', error);
      }
    };
    
    fetchSimpleModeStatus();
  }, []);

  // 切换简化模式
  const toggleSimpleMode = async (checked) => {
    setLoading(true);
    try {
      await apiService.put('/user/preferences', { simpleMode: checked });
      setSimpleMode(checked);
      message.success(`已${checked ? '开启' : '关闭'}简化模式，刷新页面后生效`);
      
      // 提示用户刷新页面
      setTimeout(() => {
        if (window.confirm('需要刷新页面以应用更改，是否立即刷新？')) {
          window.location.reload();
        }
      }, 1500);
    } catch (error) {
      console.error('Failed to toggle simple mode:', error);
      message.error('切换模式失败');
    } finally {
      setLoading(false);
    }
  };

  // 显示抽屉
  const showDrawer = () => {
    setVisible(true);
  };

  // 关闭抽屉
  const onClose = () => {
    setVisible(false);
  };

  return (
    <>
      <Button 
        type="default" 
        icon={<BulbOutlined />} 
        onClick={showDrawer}
        style={{ marginRight: 8 }}
      >
        {simpleMode ? '简化模式已开启' : '切换到简化模式'}
      </Button>
      
      <Drawer
        title={
          <Space>
            <BulbOutlined />
            简化模式
          </Space>
        }
        placement="right"
        onClose={onClose}
        visible={visible}
        width={500}
      >
        <div style={{ marginBottom: 24 }}>
          <Switch 
            checked={simpleMode} 
            onChange={toggleSimpleMode} 
            loading={loading}
            checkedChildren="开启" 
            unCheckedChildren="关闭"
          />
          <Text style={{ marginLeft: 8 }}>
            {simpleMode ? '简化模式已开启' : '简化模式已关闭'}
          </Text>
        </div>
        
        <Alert
          message="什么是简化模式？"
          description="简化模式提供精简的功能和界面，降低使用门槛，帮助新用户快速上手。随着您的熟练度提高，可以随时切换到完整模式，体验全部功能。"
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />
        
        {simpleMode && (
          <Result
            icon={<RocketOutlined />}
            title="简化模式已开启"
            subTitle="您正在使用简化版界面，部分高级功能已隐藏"
            extra={
              <Button type="primary" onClick={() => toggleSimpleMode(false)}>
                切换到完整模式
              </Button>
            }
            style={{ marginBottom: 24 }}
          />
        )}
        
        <Divider orientation="left">功能对比</Divider>
        
        <List
          itemLayout="horizontal"
          dataSource={features}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                title={item.name}
                description={item.description}
              />
              <Space size="large">
                <Text>{item.simpleMode ? '✓' : '✗'}</Text>
                <Text>{item.fullMode ? '✓' : '✗'}</Text>
              </Space>
            </List.Item>
          )}
          header={
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text strong>功能</Text>
              <Space size="large" style={{ marginRight: 8 }}>
                <Text strong>简化版</Text>
                <Text strong>完整版</Text>
              </Space>
            </div>
          }
        />
        
        <Divider />
        
        <Paragraph>
          <Text strong>提示：</Text> 简化模式专为初次使用的教师设计，随着您的熟练度提高，建议切换到完整模式以体验全部功能。
        </Paragraph>
        
        <div style={{ marginTop: 24 }}>
          <Button type="primary" onClick={onClose}>
            确定
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={() => window.open('/help/simple-mode', '_blank')}>
            <QuestionCircleOutlined /> 了解更多
          </Button>
        </div>
      </Drawer>
    </>
  );
};

export default SimpleModeToggle; 