import React, { useState, useEffect } from 'react';
import { 
  Card, 
  List, 
  Avatar, 
  Button, 
  Input, 
  Modal, 
  Form, 
  Select, 
  message, 
  Tabs, 
  Badge, 
  Tooltip, 
  Typography,
  Space,
  Divider,
  Empty,
  Tag,
  Popconfirm,
  DatePicker,
  Table,
  Switch,
  Drawer,
  Timeline
} from 'antd';
import { 
  TeamOutlined, 
  ShareAltOutlined, 
  UserAddOutlined, 
  MailOutlined,
  BellOutlined,
  FileTextOutlined,
  CommentOutlined,
  StarOutlined,
  StarFilled,
  DeleteOutlined,
  EditOutlined,
  HistoryOutlined,
  CopyOutlined,
  LinkOutlined,
  LockOutlined,
  UnlockOutlined,
  EyeOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import apiService from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';
import moment from 'moment';

const { TabPane } = Tabs;
const { Search } = Input;
const { Option } = Select;
const { Text, Title, Paragraph } = Typography;
const { RangePicker } = DatePicker;

const Collaboration = ({ resourceType, resourceId, onCollaborationChange }) => {
  const [collaborators, setCollaborators] = useState([]);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('collaborators');
  const [sharedResources, setSharedResources] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [shareLinks, setShareLinks] = useState([]);
  const [historyDrawerVisible, setHistoryDrawerVisible] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [form] = Form.useForm();
  const [shareForm] = Form.useForm();
  const { user } = useAuth();

  // 加载协作者
  useEffect(() => {
    if (resourceId) {
      fetchCollaborators();
      fetchShareLinks();
    }
  }, [resourceId]);

  // 加载共享资源和通知
  useEffect(() => {
    fetchSharedResources();
    fetchNotifications();
  }, []);

  // 获取协作者列表
  const fetchCollaborators = async () => {
    setLoading(true);
    try {
      const response = await apiService.get(`/collaboration/${resourceType}/${resourceId}/collaborators`);
      setCollaborators(response);
    } catch (error) {
      console.error('获取协作者失败:', error);
      message.error('获取协作者列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取分享链接
  const fetchShareLinks = async () => {
    try {
      const response = await apiService.get(`/collaboration/${resourceType}/${resourceId}/share-links`);
      setShareLinks(response);
    } catch (error) {
      console.error('获取分享链接失败:', error);
    }
  };

  // 获取共享给我的资源
  const fetchSharedResources = async () => {
    try {
      const response = await apiService.get('/collaboration/shared-with-me');
      setSharedResources(response);
    } catch (error) {
      console.error('获取共享资源失败:', error);
    }
  };

  // 获取协作通知
  const fetchNotifications = async () => {
    try {
      const response = await apiService.get('/collaboration/notifications');
      setNotifications(response);
    } catch (error) {
      console.error('获取协作通知失败:', error);
    }
  };

  // 搜索用户
  const handleUserSearch = async (value) => {
    if (!value || value.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await apiService.get('/users/search', { query: value });
      setSearchResults(response);
    } catch (error) {
      console.error('搜索用户失败:', error);
      message.error('搜索用户失败');
    }
  };

  // 邀请协作者
  const handleInvite = () => {
    setInviteModalVisible(true);
    form.resetFields();
    setSearchResults([]);
  };

  // 提交邀请
  const handleInviteSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      setLoading(true);
      await apiService.post(`/collaboration/${resourceType}/${resourceId}/invite`, {
        users: values.users,
        permission: values.permission,
        message: values.message
      });
      
      message.success('邀请发送成功');
      setInviteModalVisible(false);
      fetchCollaborators();
      
      if (onCollaborationChange) {
        onCollaborationChange();
      }
    } catch (error) {
      console.error('邀请协作者失败:', error);
      message.error('邀请协作者失败');
    } finally {
      setLoading(false);
    }
  };

  // 创建分享链接
  const handleCreateShareLink = () => {
    setShareModalVisible(true);
    shareForm.resetFields();
  };

  // 提交分享链接
  const handleShareSubmit = async () => {
    try {
      const values = await shareForm.validateFields();
      
      // 处理自定义过期时间
      let expiresAt = values.expiresAt;
      if (expiresAt === 'custom' && values.customExpiresAt) {
        expiresAt = values.customExpiresAt.format();
      }
      
      setLoading(true);
      const response = await apiService.post(`/collaboration/${resourceType}/${resourceId}/share`, {
        shareType: values.shareType,
        password: values.password,
        expiresAt,
        permission: values.permission
      });
      
      message.success('分享链接创建成功');
      setShareModalVisible(false);
      fetchShareLinks();
      
      // 显示链接
      Modal.success({
        title: '分享链接已创建',
        content: (
          <div>
            <p>分享链接已生成，请复制并分享给他人：</p>
            <Input.Group compact>
              <Input 
                style={{ width: 'calc(100% - 32px)' }} 
                value={response.shareUrl} 
                readOnly 
              />
              <Tooltip title="复制链接">
                <Button 
                  icon={<CopyOutlined />} 
                  onClick={() => {
                    navigator.clipboard.writeText(response.shareUrl);
                    message.success('链接已复制到剪贴板');
                  }}
                />
              </Tooltip>
            </Input.Group>
            {response.password && (
              <div style={{ marginTop: 16 }}>
                <Text strong>访问密码：</Text> {response.password}
              </div>
            )}
          </div>
        ),
        okText: '关闭'
      });
      
      if (onCollaborationChange) {
        onCollaborationChange();
      }
    } catch (error) {
      console.error('创建分享链接失败:', error);
      message.error('创建分享链接失败');
    } finally {
      setLoading(false);
    }
  };

  // 移除协作者
  const handleRemoveCollaborator = async (userId) => {
    try {
      await apiService.delete(`/collaboration/${resourceType}/${resourceId}/collaborators/${userId}`);
      message.success('已移除协作者');
      fetchCollaborators();
      
      if (onCollaborationChange) {
        onCollaborationChange();
      }
    } catch (error) {
      console.error('移除协作者失败:', error);
      message.error('移除协作者失败');
    }
  };

  // 修改协作者权限
  const handleChangePermission = async (userId, permission) => {
    try {
      await apiService.put(`/collaboration/${resourceType}/${resourceId}/collaborators/${userId}`, {
        permission
      });
      message.success('权限修改成功');
      fetchCollaborators();
      
      if (onCollaborationChange) {
        onCollaborationChange();
      }
    } catch (error) {
      console.error('修改权限失败:', error);
      message.error('修改权限失败');
    }
  };

  // 删除分享链接
  const handleDeleteShareLink = async (linkId) => {
    try {
      await apiService.delete(`/collaboration/share-links/${linkId}`);
      message.success('分享链接已删除');
      fetchShareLinks();
    } catch (error) {
      console.error('删除分享链接失败:', error);
      message.error('删除分享链接失败');
    }
  };

  // 查看协作历史
  const handleViewHistory = async () => {
    setHistoryDrawerVisible(true);
    setHistoryLoading(true);
    
    try {
      const response = await apiService.get(`/collaboration/${resourceType}/${resourceId}/history`);
      setHistoryData(response);
    } catch (error) {
      console.error('获取协作历史失败:', error);
      message.error('获取协作历史失败');
    } finally {
      setHistoryLoading(false);
    }
  };

  // 标记通知为已读
  const handleMarkAsRead = async (notificationId) => {
    try {
      await apiService.put(`/collaboration/notifications/${notificationId}/read`);
      
      // 更新本地通知状态
      setNotifications(prev => 
        prev.map(item => 
          item.id === notificationId ? { ...item, read: true } : item
        )
      );
    } catch (error) {
      console.error('标记通知失败:', error);
    }
  };

  // 渲染协作者列表
  const renderCollaborators = () => {
    return (
      <List
        loading={loading}
        dataSource={collaborators}
        renderItem={item => (
          <List.Item
            actions={[
              <Select
                defaultValue={item.permission}
                style={{ width: 100 }}
                onChange={(value) => handleChangePermission(item.userId, value)}
                disabled={item.isOwner || (user && item.userId === user.id)}
              >
                <Option value="view">只读</Option>
                <Option value="edit">编辑</Option>
                <Option value="admin">管理</Option>
              </Select>,
              !item.isOwner && (user && item.userId !== user.id) && (
                <Popconfirm
                  title="确定要移除此协作者吗？"
                  onConfirm={() => handleRemoveCollaborator(item.userId)}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button 
                    type="text" 
                    danger 
                    icon={<DeleteOutlined />}
                  />
                </Popconfirm>
              )
            ]}
          >
            <List.Item.Meta
              avatar={
                <Avatar src={item.avatar}>
                  {!item.avatar && item.name.charAt(0)}
                </Avatar>
              }
              title={
                <Space>
                  {item.name}
                  {item.isOwner && <Tag color="blue">所有者</Tag>}
                  {user && item.userId === user.id && <Tag color="green">我</Tag>}
                </Space>
              }
              description={item.email}
            />
            <div>
              <Text type="secondary">
                {item.lastActive ? `最近活动: ${moment(item.lastActive).fromNow()}` : '尚未访问'}
              </Text>
            </div>
          </List.Item>
        )}
        locale={{ emptyText: '暂无协作者' }}
      />
    );
  };

  // 渲染分享链接
  const renderShareLinks = () => {
    return (
      <List
        dataSource={shareLinks}
        renderItem={item => (
          <List.Item
            actions={[
              <Button 
                type="text" 
                icon={<CopyOutlined />} 
                onClick={() => {
                  navigator.clipboard.writeText(item.shareUrl);
                  message.success('链接已复制到剪贴板');
                }}
              />,
              <Popconfirm
                title="确定要删除此分享链接吗？"
                onConfirm={() => handleDeleteShareLink(item.id)}
                okText="确定"
                cancelText="取消"
              >
                <Button 
                  type="text" 
                  danger 
                  icon={<DeleteOutlined />}
                />
              </Popconfirm>
            ]}
          >
            <List.Item.Meta
              avatar={
                <Avatar icon={
                  item.shareType === 'password' ? <LockOutlined /> : <LinkOutlined />
                } />
              }
              title={
                <Space>
                  分享链接
                  {item.shareType === 'password' && <Tag color="orange">密码保护</Tag>}
                  {item.shareType === 'domain' && <Tag color="blue">仅限本单位</Tag>}
                  {item.expiresAt && (
                    <Tag color={moment(item.expiresAt).isBefore(moment()) ? 'red' : 'green'}>
                      {moment(item.expiresAt).isBefore(moment()) ? '已过期' : `${moment(item.expiresAt).format('YYYY-MM-DD')}过期`}
                    </Tag>
                  )}
                </Space>
              }
              description={
                <div>
                  <Text copyable={{ text: item.shareUrl }} style={{ fontSize: 12 }}>
                    {item.shareUrl.length > 50 ? `${item.shareUrl.substring(0, 50)}...` : item.shareUrl}
                  </Text>
                  <div>
                    <Text type="secondary">
                      创建于 {moment(item.createdAt).format('YYYY-MM-DD HH:mm')}
                    </Text>
                  </div>
                </div>
              }
            />
            <div>
              <Text type="secondary">
                访问次数: {item.accessCount || 0}
              </Text>
            </div>
          </List.Item>
        )}
        locale={{ emptyText: '暂无分享链接' }}
      />
    );
  };

  // 渲染共享给我的资源
  const renderSharedWithMe = () => {
    return (
      <List
        dataSource={sharedResources}
        renderItem={item => (
          <List.Item
            actions={[
              <Button 
                type="link" 
                onClick={() => window.open(item.url, '_blank')}
              >
                打开
              </Button>,
              <Button
                type="text"
                icon={item.starred ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                onClick={async () => {
                  try {
                    await apiService.put(`/collaboration/shared-with-me/${item.id}/star`, {
                      starred: !item.starred
                    });
                    
                    // 更新本地状态
                    setSharedResources(prev => 
                      prev.map(resource => 
                        resource.id === item.id ? { ...resource, starred: !resource.starred } : resource
                      )
                    );
                  } catch (error) {
                    console.error('标记收藏失败:', error);
                  }
                }}
              />
            ]}
          >
            <List.Item.Meta
              avatar={
                <Avatar icon={
                  item.type === 'document' ? <FileTextOutlined /> :
                  item.type === 'teachPlan' ? <BookOutlined /> :
                  <FileOutlined />
                } />
              }
              title={item.title}
              description={
                <Space direction="vertical" size={0}>
                  <Text type="secondary">
                    分享者: {item.sharedBy.name}
                  </Text>
                  <Text type="secondary">
                    分享时间: {moment(item.sharedAt).format('YYYY-MM-DD HH:mm')}
                  </Text>
                </Space>
              }
            />
            <Space>
              <Tag color={
                item.permission === 'view' ? 'blue' :
                item.permission === 'edit' ? 'green' : 'purple'
              }>
                {item.permission === 'view' ? '只读' :
                 item.permission === 'edit' ? '可编辑' : '管理员'}
              </Tag>
              {item.lastViewed && (
                <Text type="secondary">
                  上次访问: {moment(item.lastViewed).fromNow()}
                </Text>
              )}
            </Space>
          </List.Item>
        )}
        locale={{ emptyText: <Empty description="暂无共享资源" /> }}
      />
    );
  };

  // 渲染协作通知
  const renderNotifications = () => {
    return (
      <List
        dataSource={notifications}
        renderItem={item => (
          <List.Item
            style={{ opacity: item.read ? 0.7 : 1 }}
            actions={[
              !item.read && (
                <Button 
                  type="text" 
                  size="small"
                  onClick={() => handleMarkAsRead(item.id)}
                >
                  标记为已读
                </Button>
              ),
              item.resourceUrl && (
                <Button 
                  type="link" 
                  size="small"
                  onClick={() => window.open(item.resourceUrl, '_blank')}
                >
                  查看
                </Button>
              )
            ]}
          >
            <List.Item.Meta
              avatar={
                <Badge dot={!item.read}>
                  <Avatar src={item.sender?.avatar}>
                    {!item.sender?.avatar && item.sender?.name?.charAt(0)}
                  </Avatar>
                </Badge>
              }
              title={
                <Text strong={!item.read}>
                  {item.title}
                </Text>
              }
              description={
                <div>
                  <div>{item.content}</div>
                  <div>
                    <Text type="secondary">
                      {moment(item.createdAt).fromNow()}
                    </Text>
                  </div>
                </div>
              }
            />
          </List.Item>
        )}
        locale={{ emptyText: <Empty description="暂无通知" /> }}
      />
    );
  };

  // 渲染协作历史
  const renderHistory = () => {
    return (
      <Timeline loading={historyLoading}>
        {historyData.map(item => (
          <Timeline.Item 
            key={item.id}
            dot={
              item.action === 'create' ? <FileTextOutlined /> :
              item.action === 'edit' ? <EditOutlined /> :
              item.action === 'share' ? <ShareAltOutlined /> :
              item.action === 'invite' ? <UserAddOutlined /> :
              <ClockCircleOutlined />
            }
            color={
              item.action === 'create' ? 'green' :
              item.action === 'edit' ? 'blue' :
              item.action === 'share' ? 'purple' :
              item.action === 'invite' ? 'orange' :
              'gray'
            }
          >
            <div>
              <Text strong>{item.user.name}</Text> {item.description}
            </div>
            <div>
              <Text type="secondary">{moment(item.timestamp).format('YYYY-MM-DD HH:mm:ss')}</Text>
            </div>
          </Timeline.Item>
        ))}
      </Timeline>
    );
  };

  return (
    <Card 
      title={
        <Space>
          <TeamOutlined />
          <span>协作与共享</span>
        </Space>
      }
      extra={
        <Space>
          <Button 
            icon={<HistoryOutlined />} 
            onClick={handleViewHistory}
          >
            协作历史
          </Button>
          <Button 
            icon={<UserAddOutlined />} 
            onClick={handleInvite}
          >
            邀请协作者
          </Button>
          <Button 
            icon={<ShareAltOutlined />} 
            onClick={handleCreateShareLink}
          >
            创建分享链接
          </Button>
        </Space>
      }
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane 
          tab={
            <span>
              <TeamOutlined />
              协作者
            </span>
          } 
          key="collaborators"
        >
          {renderCollaborators()}
        </TabPane>
        <TabPane 
          tab={
            <span>
              <LinkOutlined />
              分享链接
            </span>
          } 
          key="shareLinks"
        >
          {renderShareLinks()}
        </TabPane>
        <TabPane 
          tab={
            <span>
              <FileTextOutlined />
              共享给我的
            </span>
          } 
          key="sharedWithMe"
        >
          {renderSharedWithMe()}
        </TabPane>
        <TabPane 
          tab={
            <Badge count={notifications.filter(n => !n.read).length} size="small" offset={[5, -3]}>
              <BellOutlined />
              通知
            </Badge>
          } 
          key="notifications"
        >
          {renderNotifications()}
        </TabPane>
      </Tabs>

      {/* 邀请协作者对话框 */}
      <Modal
        title="邀请协作者"
        open={inviteModalVisible}
        onCancel={() => setInviteModalVisible(false)}
        onOk={handleInviteSubmit}
        confirmLoading={loading}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="users"
            label="选择用户"
            rules={[{ required: true, message: '请选择至少一个用户' }]}
          >
            <Select
              mode="multiple"
              placeholder="搜索用户"
              notFoundContent={null}
              filterOption={false}
              onSearch={handleUserSearch}
              style={{ width: '100%' }}
            >
              {searchResults.map(user => (
                <Option key={user.id} value={user.id}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar size="small" src={user.avatar}>
                      {!user.avatar && user.name.charAt(0)}
                    </Avatar>
                    <span style={{ marginLeft: 8 }}>{user.name}</span>
                    <span style={{ marginLeft: 8, fontSize: 12, color: '#999' }}>
                      ({user.email})
                    </span>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="permission"
            label="权限"
            initialValue="view"
          >
            <Select>
              <Option value="view">只读权限</Option>
              <Option value="edit">编辑权限</Option>
              <Option value="admin">管理权限</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="message"
            label="邀请消息"
          >
            <Input.TextArea 
              placeholder="可选：添加邀请消息" 
              rows={3}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 创建分享链接对话框 */}
      <Modal
        title="创建分享链接"
        open={shareModalVisible}
        onCancel={() => setShareModalVisible(false)}
        onOk={handleShareSubmit}
        confirmLoading={loading}
      >
        <Form
          form={shareForm}
          layout="vertical"
        >
          <Form.Item
            name="shareType"
            label="访问权限"
            initialValue="anyone"
          >
            <Select>
              <Option value="anyone">任何人可访问</Option>
              <Option value="password">需要密码</Option>
              <Option value="domain">仅限本单位</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="password"
            label="访问密码"
            rules={[
              ({ getFieldValue }) => ({
                required: getFieldValue('shareType') === 'password',
                message: '请设置访问密码'
              })
            ]}
          >
            <Input.Password 
              placeholder="设置访问密码" 
              disabled={shareForm.getFieldValue('shareType') !== 'password'}
            />
          </Form.Item>
          
          <Form.Item
            name="permission"
            label="权限"
            initialValue="view"
          >
            <Select>
              <Option value="view">只读权限</Option>
              <Option value="edit">编辑权限</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="expiresAt"
            label="过期时间"
            initialValue="never"
          >
            <Select>
              <Option value="never">永不过期</Option>
              <Option value="1d">1天后</Option>
              <Option value="7d">7天后</Option>
              <Option value="30d">30天后</Option>
              <Option value="custom">自定义</Option>
            </Select>
          </Form.Item>
          
          {shareForm.getFieldValue('expiresAt') === 'custom' && (
            <Form.Item
              name="customExpiresAt"
              label="自定义过期时间"
              rules={[{ required: true, message: '请选择过期时间' }]}
            >
              <DatePicker showTime style={{ width: '100%' }} />
            </Form.Item>
          )}
        </Form>
      </Modal>

      {/* 协作历史抽屉 */}
      <Drawer
        title="协作历史"
        placement="right"
        width={500}
        onClose={() => setHistoryDrawerVisible(false)}
        open={historyDrawerVisible}
      >
        {renderHistory()}
      </Drawer>
    </Card>
  );
};

export default Collaboration; 