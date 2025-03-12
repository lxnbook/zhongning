import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Tabs, 
  Form, 
  Input, 
  Button, 
  Switch, 
  Select, 
  Radio, 
  Slider, 
  Upload, 
  message, 
  Divider, 
  Typography,
  Space,
  Row,
  Col,
  Avatar,
  Collapse,
  Alert
} from 'antd';
import { 
  UserOutlined, 
  SettingOutlined, 
  BellOutlined, 
  LockOutlined,
  UploadOutlined,
  PaletteOutlined,
  DatabaseOutlined,
  GlobalOutlined,
  MobileOutlined
} from '@ant-design/icons';
import apiService from '../services/apiService';
import themeConfig from '../theme/themeConfig';
import { useWindowSize } from '../utils/responsiveUtils';

const { TabPane } = Tabs;
const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

const UserSettings = () => {
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState({});
  const [preferences, setPreferences] = useState({});
  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm] = Form.useForm();
  const [preferencesForm] = Form.useForm();
  const [securityForm] = Form.useForm();
  const [notificationForm] = Form.useForm();
  const windowSize = useWindowSize();

  // 加载用户信息和偏好设置
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const userResponse = await apiService.get('/user/profile');
        const preferencesResponse = await apiService.get('/user/preferences');
        
        setUserInfo(userResponse);
        setPreferences(preferencesResponse);
        
        // 设置表单初始值
        profileForm.setFieldsValue({
          name: userResponse.name,
          email: userResponse.email,
          title: userResponse.title,
          department: userResponse.department,
          bio: userResponse.bio,
          phone: userResponse.phone
        });
        
        preferencesForm.setFieldsValue({
          theme: preferencesResponse.theme || 'light',
          primaryColor: preferencesResponse.primaryColor || themeConfig.colors.primary,
          fontSize: preferencesResponse.fontSize || 'medium',
          compactMode: preferencesResponse.compactMode || false,
          defaultView: preferencesResponse.defaultView || 'dashboard',
          language: preferencesResponse.language || 'zh-CN',
          dateFormat: preferencesResponse.dateFormat || 'YYYY-MM-DD',
          autoSave: preferencesResponse.autoSave || true,
          autoSaveInterval: preferencesResponse.autoSaveInterval || 5
        });
        
        notificationForm.setFieldsValue({
          emailNotifications: preferencesResponse.emailNotifications || false,
          browserNotifications: preferencesResponse.browserNotifications || true,
          collaborationNotifications: preferencesResponse.collaborationNotifications || true,
          systemNotifications: preferencesResponse.systemNotifications || true,
          reminderNotifications: preferencesResponse.reminderNotifications || false
        });
      } catch (error) {
        console.error('Failed to load user data:', error);
        message.error('加载用户数据失败');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  // 更新个人资料
  const handleUpdateProfile = async (values) => {
    setLoading(true);
    try {
      await apiService.put('/user/profile', values);
      message.success('个人资料已更新');
      setUserInfo({ ...userInfo, ...values });
    } catch (error) {
      console.error('Update profile error:', error);
      message.error('更新个人资料失败');
    } finally {
      setLoading(false);
    }
  };

  // 更新偏好设置
  const handleUpdatePreferences = async (values) => {
    setLoading(true);
    try {
      await apiService.put('/user/preferences', values);
      message.success('偏好设置已更新');
      setPreferences({ ...preferences, ...values });
      
      // 应用主题设置
      document.documentElement.setAttribute('data-theme', values.theme);
      
      // 应用字体大小
      const fontSizeMap = {
        small: '12px',
        medium: '14px',
        large: '16px',
        xlarge: '18px'
      };
      document.documentElement.style.fontSize = fontSizeMap[values.fontSize] || '14px';
      
      // 应用紧凑模式
      if (values.compactMode) {
        document.body.classList.add('compact-mode');
      } else {
        document.body.classList.remove('compact-mode');
      }
      
      // 应用主色调
      document.documentElement.style.setProperty('--primary-color', values.primaryColor);
    } catch (error) {
      console.error('Update preferences error:', error);
      message.error('更新偏好设置失败');
    } finally {
      setLoading(false);
    }
  };

  // 更新通知设置
  const handleUpdateNotifications = async (values) => {
    setLoading(true);
    try {
      await apiService.put('/user/notifications', values);
      message.success('通知设置已更新');
      setPreferences({ ...preferences, ...values });
    } catch (error) {
      console.error('Update notifications error:', error);
      message.error('更新通知设置失败');
    } finally {
      setLoading(false);
    }
  };

  // 更新密码
  const handleUpdatePassword = async (values) => {
    setLoading(true);
    try {
      await apiService.put('/user/password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      });
      message.success('密码已更新');
      securityForm.resetFields();
    } catch (error) {
      console.error('Update password error:', error);
      message.error('更新密码失败');
    } finally {
      setLoading(false);
    }
  };

  // 渲染个人资料表单
  const renderProfileForm = () => {
    return (
      <Form
        form={profileForm}
        layout="vertical"
        onFinish={handleUpdateProfile}
      >
        <Row gutter={24}>
          <Col xs={24} md={8} style={{ textAlign: 'center' }}>
            <Avatar 
              size={120} 
              src={userInfo.avatar} 
              icon={<UserOutlined />} 
              style={{ marginBottom: 16 }}
            />
            <div>
              <Upload
                name="avatar"
                showUploadList={false}
                beforeUpload={(file) => {
                  const isImage = file.type.startsWith('image/');
                  if (!isImage) {
                    message.error('只能上传图片文件');
                    return Upload.LIST_IGNORE;
                  }
                  
                  const isLt2M = file.size / 1024 / 1024 < 2;
                  if (!isLt2M) {
                    message.error('图片必须小于2MB');
                    return Upload.LIST_IGNORE;
                  }
                  
                  // 手动上传
                  const formData = new FormData();
                  formData.append('avatar', file);
                  
                  apiService.post('/user/avatar', formData)
                    .then(response => {
                      setUserInfo({ ...userInfo, avatar: response.avatarUrl });
                      message.success('头像已更新');
                    })
                    .catch(error => {
                      console.error('Upload avatar error:', error);
                      message.error('上传头像失败');
                    });
                  
                  return false;
                }}
              >
                <Button icon={<UploadOutlined />}>更换头像</Button>
              </Upload>
            </div>
          </Col>
          
          <Col xs={24} md={16}>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="name"
                  label="姓名"
                  rules={[{ required: true, message: '请输入姓名' }]}
                >
                  <Input placeholder="您的姓名" />
                </Form.Item>
              </Col>
              
              <Col xs={24} md={12}>
                <Form.Item
                  name="email"
                  label="邮箱"
                  rules={[
                    { required: true, message: '请输入邮箱' },
                    { type: 'email', message: '请输入有效的邮箱地址' }
                  ]}
                >
                  <Input placeholder="您的邮箱" disabled />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="title"
                  label="职称"
                >
                  <Input placeholder="例如：高级教师" />
                </Form.Item>
              </Col>
              
              <Col xs={24} md={12}>
                <Form.Item
                  name="department"
                  label="部门/学校"
                >
                  <Input placeholder="您所在的部门或学校" />
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item
              name="bio"
              label="个人简介"
            >
              <Input.TextArea 
                placeholder="简单介绍一下自己" 
                rows={4}
              />
            </Form.Item>
            
            <Form.Item
              name="phone"
              label="联系电话"
            >
              <Input placeholder="您的联系电话" />
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item style={{ marginTop: 16 }}>
          <Button type="primary" htmlType="submit" loading={loading}>
            保存个人资料
          </Button>
        </Form.Item>
      </Form>
    );
  };

  // 渲染偏好设置表单
  const renderPreferencesForm = () => {
    return (
      <Form
        form={preferencesForm}
        layout="vertical"
        onFinish={handleUpdatePreferences}
      >
        <Collapse defaultActiveKey={['appearance', 'behavior']} bordered={false}>
          <Panel 
            header={
              <span>
                <PaletteOutlined style={{ marginRight: 8 }} />
                外观设置
              </span>
            } 
            key="appearance"
          >
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="theme"
                  label="主题"
                >
                  <Radio.Group>
                    <Radio.Button value="light">浅色</Radio.Button>
                    <Radio.Button value="dark">深色</Radio.Button>
                    <Radio.Button value="system">跟随系统</Radio.Button>
                  </Radio.Group>
                </Form.Item>
              </Col>
              
              <Col xs={24} md={12}>
                <Form.Item
                  name="primaryColor"
                  label="主色调"
                >
                  <div style={{ display: 'flex', gap: 8 }}>
                    {['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2'].map(color => (
                      <div
                        key={color}
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          background: color,
                          cursor: 'pointer',
                          border: preferencesForm.getFieldValue('primaryColor') === color ? '2px solid #000' : 'none'
                        }}
                        onClick={() => preferencesForm.setFieldsValue({ primaryColor: color })}
                      />
                    ))}
                    <Input 
                      type="color" 
                      value={preferencesForm.getFieldValue('primaryColor')}
                      onChange={(e) => preferencesForm.setFieldsValue({ primaryColor: e.target.value })}
                      style={{ width: 40 }}
                    />
                  </div>
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="fontSize"
                  label="字体大小"
                >
                  <Select>
                    <Option value="small">小</Option>
                    <Option value="medium">中</Option>
                    <Option value="large">大</Option>
                    <Option value="xlarge">特大</Option>
                  </Select>
                </Form.Item>
              </Col>
              
              <Col xs={24} md={12}>
                <Form.Item
                  name="compactMode"
                  label="紧凑模式"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                <Text type="secondary">减少页面间距，显示更多内容</Text>
              </Col>
            </Row>
          </Panel>
          
          <Panel 
            header={
              <span>
                <SettingOutlined style={{ marginRight: 8 }} />
                行为设置
              </span>
            } 
            key="behavior"
          >
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="defaultView"
                  label="默认页面"
                >
                  <Select>
                    <Option value="dashboard">仪表盘</Option>
                    <Option value="teach-plan">教案管理</Option>
                    <Option value="data-analysis">数据分析</Option>
                    <Option value="resources">资源库</Option>
                  </Select>
                </Form.Item>
              </Col>
              
              <Col xs={24} md={12}>
                <Form.Item
                  name="language"
                  label="系统语言"
                >
                  <Select>
                    <Option value="zh-CN">简体中文</Option>
                    <Option value="en-US">English</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="dateFormat"
                  label="日期格式"
                >
                  <Select>
                    <Option value="YYYY-MM-DD">2023-01-01</Option>
                    <Option value="DD/MM/YYYY">01/01/2023</Option>
                    <Option value="MM/DD/YYYY">01/01/2023</Option>
                    <Option value="YYYY年MM月DD日">2023年01月01日</Option>
                  </Select>
                </Form.Item>
              </Col>
              
              <Col xs={24} md={12}>
                <Form.Item
                  name="autoSave"
                  label="自动保存"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>
            
            {preferencesForm.getFieldValue('autoSave') && (
              <Form.Item
                name="autoSaveInterval"
                label="自动保存间隔（分钟）"
              >
                <Slider min={1} max={30} marks={{ 1: '1', 5: '5', 15: '15', 30: '30' }} />
              </Form.Item>
            )}
          </Panel>
          
          <Panel 
            header={
              <span>
                <MobileOutlined style={{ marginRight: 8 }} />
                移动设备设置
              </span>
            } 
            key="mobile"
          >
            <Form.Item
              name="mobileDataSaving"
              label="数据节省模式"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            <Text type="secondary">在移动网络下减少数据使用量，降低图片质量和禁用自动播放</Text>
            
            <Form.Item
              name="enableOfflineMode"
              label="离线模式"
              valuePropName="checked"
              style={{ marginTop: 16 }}
            >
              <Switch />
            </Form.Item>
            <Text type="secondary">允许在无网络连接时访问已缓存的内容</Text>
          </Panel>
        </Collapse>
        
        <Form.Item style={{ marginTop: 16 }}>
          <Button type="primary" htmlType="submit" loading={loading}>
            保存偏好设置
          </Button>
        </Form.Item>
      </Form>
    );
  };

  // 渲染通知设置表单
  const renderNotificationsForm = () => {
    return (
      <Form
        form={notificationForm}
        layout="vertical"
        onFinish={handleUpdateNotifications}
      >
        <Alert
          message="通知设置"
          description="设置您希望接收的通知类型和方式。"
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />
        
        <Form.Item
          name="emailNotifications"
          label="电子邮件通知"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
        <Text type="secondary">通过电子邮件接收重要通知</Text>
        
        <Divider />
        
        <Form.Item
          name="browserNotifications"
          label="浏览器通知"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
        <Text type="secondary">在浏览器中接收实时通知</Text>
        
        <Divider />
        
        <Title level={5} style={{ marginTop: 24 }}>通知类型</Title>
        
        <Form.Item
          name="collaborationNotifications"
          label="协作通知"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
        <Text type="secondary">当有人邀请您协作或对共享资源进行更改时通知您</Text>
        
        <Form.Item
          name="systemNotifications"
          label="系统通知"
          valuePropName="checked"
          style={{ marginTop: 16 }}
        >
          <Switch />
        </Form.Item>
        <Text type="secondary">接收系统更新、维护和新功能通知</Text>
        
        <Form.Item
          name="reminderNotifications"
          label="提醒通知"
          valuePropName="checked"
          style={{ marginTop: 16 }}
        >
          <Switch />
        </Form.Item>
        <Text type="secondary">接收关于截止日期和计划事件的提醒</Text>
        
        <Form.Item style={{ marginTop: 24 }}>
          <Button type="primary" htmlType="submit" loading={loading}>
            保存通知设置
          </Button>
        </Form.Item>
      </Form>
    );
  };

  // 渲染安全设置表单
  const renderSecurityForm = () => {
    return (
      <Form
        form={securityForm}
        layout="vertical"
        onFinish={handleUpdatePassword}
      >
        <Alert
          message="账户安全"
          description="定期更改密码并启用双因素认证可以提高您账户的安全性。"
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />
        
        <Form.Item
          name="currentPassword"
          label="当前密码"
          rules={[{ required: true, message: '请输入当前密码' }]}
        >
          <Input.Password placeholder="输入当前密码" />
        </Form.Item>
        
        <Form.Item
          name="newPassword"
          label="新密码"
          rules={[
            { required: true, message: '请输入新密码' },
            { min: 8, message: '密码长度不能少于8个字符' },
            {
              pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
              message: '密码必须包含大小写字母、数字和特殊字符'
            }
          ]}
        >
          <Input.Password placeholder="输入新密码" />
        </Form.Item>
        
        <Form.Item
          name="confirmPassword"
          label="确认新密码"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: '请确认新密码' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('两次输入的密码不一致'));
              },
            }),
          ]}
        >
          <Input.Password placeholder="再次输入新密码" />
        </Form.Item>
        
        <Form.Item style={{ marginTop: 24 }}>
          <Button type="primary" htmlType="submit" loading={loading}>
            更新密码
          </Button>
        </Form.Item>
        
        <Divider />
        
        <Title level={5}>双因素认证</Title>
        <Paragraph>
          双因素认证为您的账户提供额外的安全层。启用后，除了密码外，您还需要输入手机验证码才能登录。
        </Paragraph>
        
        <Form.Item>
          <Button type="default">
            {preferences.twoFactorEnabled ? '管理双因素认证' : '启用双因素认证'}
          </Button>
        </Form.Item>
        
        <Divider />
        
        <Title level={5}>登录历史</Title>
        <Paragraph>
          查看您的账户最近的登录活动，如果发现可疑活动，请立即更改密码。
        </Paragraph>
        
        <Form.Item>
          <Button type="default">查看登录历史</Button>
        </Form.Item>
      </Form>
    );
  };

  return (
    <div className="user-settings-page">
      <Card
        title={
          <Space>
            <UserOutlined />
            用户设置
          </Space>
        }
        style={{ marginBottom: 24 }}
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane 
            tab={
              <span>
                <UserOutlined />
                个人资料
              </span>
            } 
            key="profile"
          >
            {renderProfileForm()}
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <SettingOutlined />
                偏好设置
              </span>
            } 
            key="preferences"
          >
            {renderPreferencesForm()}
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <BellOutlined />
                通知设置
              </span>
            } 
            key="notifications"
          >
            {renderNotificationsForm()}
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <LockOutlined />
                安全设置
              </span>
            } 
            key="security"
          >
            {renderSecurityForm()}
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default UserSettings; 