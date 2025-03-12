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
  Popconfirm,
  Typography,
  Divider,
  Tag
} from 'antd';
import { 
  UserAddOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  LockOutlined,
  UnlockOutlined,
  SearchOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;
const { Title, Paragraph } = Typography;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [form] = Form.useForm();
  const [editingUser, setEditingUser] = useState(null);
  
  // 获取用户列表
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Fetch users error:', error);
      message.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  // 打开添加用户模态框
  const showAddModal = () => {
    setModalTitle('添加用户');
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };
  
  // 打开编辑用户模态框
  const showEditModal = (user) => {
    setModalTitle('编辑用户');
    setEditingUser(user);
    form.setFieldsValue({
      username: user.username,
      name: user.name,
      role: user.role,
      organization: user.organization,
      position: user.position,
      email: user.email,
      phone: user.phone
    });
    setModalVisible(true);
  };
  
  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingUser) {
        // 更新用户
        await axios.put(`/api/users/${editingUser.id}`, values);
        message.success('用户更新成功');
      } else {
        // 添加用户
        await axios.post('/api/users', values);
        message.success('用户添加成功');
      }
      
      setModalVisible(false);
      fetchUsers();
    } catch (error) {
      console.error('Submit form error:', error);
      message.error('操作失败: ' + (error.response?.data?.message || '未知错误'));
    }
  };
  
  // 删除用户
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/users/${id}`);
      message.success('用户删除成功');
      fetchUsers();
    } catch (error) {
      console.error('Delete user error:', error);
      message.error('删除用户失败');
    }
  };
  
  // 重置密码
  const handleResetPassword = async (id) => {
    try {
      await axios.post(`/api/users/${id}/reset-password`);
      message.success('密码重置成功');
    } catch (error) {
      console.error('Reset password error:', error);
      message.error('密码重置失败');
    }
  };
  
  // 锁定/解锁用户
  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await axios.put(`/api/users/${id}/status`, {
        status: currentStatus === 'active' ? 'locked' : 'active'
      });
      message.success(`用户${currentStatus === 'active' ? '锁定' : '解锁'}成功`);
      fetchUsers();
    } catch (error) {
      console.error('Toggle user status error:', error);
      message.error('操作失败');
    }
  };
  
  // 表格列定义
  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        let color = 'blue';
        let text = '教师';
        
        switch (role) {
          case 'admin':
            color = 'red';
            text = '管理员';
            break;
          case 'education_bureau':
            color = 'purple';
            text = '教育局';
            break;
          case 'school_admin':
            color = 'orange';
            text = '学校管理员';
            break;
          default:
            break;
        }
        
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: '所属机构',
      dataIndex: 'organization',
      key: 'organization',
    },
    {
      title: '职位',
      dataIndex: 'position',
      key: 'position',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '正常' : '锁定'}
        </Tag>
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
            onClick={() => showEditModal(record)}
          />
          <Popconfirm
            title="确定要重置密码吗？"
            onConfirm={() => handleResetPassword(record.id)}
          >
            <Button 
              type="text" 
              icon={<LockOutlined />} 
            />
          </Popconfirm>
          <Popconfirm
            title={`确定要${record.status === 'active' ? '锁定' : '解锁'}该用户吗？`}
            onConfirm={() => handleToggleStatus(record.id, record.status)}
          >
            <Button 
              type="text" 
              icon={record.status === 'active' ? <LockOutlined /> : <UnlockOutlined />} 
            />
          </Popconfirm>
          <Popconfirm
            title="确定要删除该用户吗？"
            onConfirm={() => handleDelete(record.id)}
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
  
  return (
    <div>
      <Title level={2}>用户管理</Title>
      <Paragraph>管理系统用户，包括添加、编辑、删除和权限设置</Paragraph>
      <Divider />
      
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <Input.Search
              placeholder="搜索用户"
              allowClear
              style={{ width: 200, marginRight: 8 }}
              onSearch={(value) => console.log(value)}
            />
            <Select 
              placeholder="角色筛选" 
              style={{ width: 150, marginRight: 8 }}
              allowClear
            >
              <Option value="admin">管理员</Option>
              <Option value="education_bureau">教育局</Option>
              <Option value="school_admin">学校管理员</Option>
              <Option value="teacher">教师</Option>
            </Select>
            <Select 
              placeholder="状态筛选" 
              style={{ width: 120 }}
              allowClear
            >
              <Option value="active">正常</Option>
              <Option value="locked">锁定</Option>
            </Select>
          </div>
          <Button 
            type="primary" 
            icon={<UserAddOutlined />} 
            onClick={showAddModal}
          >
            添加用户
          </Button>
        </div>
        
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
      
      <Modal
        title={modalTitle}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 4, message: '用户名至少4个字符' }
            ]}
          >
            <Input placeholder="请输入用户名" disabled={!!editingUser} />
          </Form.Item>
          
          {!editingUser && (
            <Form.Item
              name="password"
              label="密码"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6个字符' }
              ]}
            >
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
          )}
          
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>
          
          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="请选择角色">
              <Option value="admin">管理员</Option>
              <Option value="education_bureau">教育局</Option>
              <Option value="school_admin">学校管理员</Option>
              <Option value="teacher">教师</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="organization"
            label="所属机构"
            rules={[{ required: true, message: '请输入所属机构' }]}
          >
            <Input placeholder="请输入所属机构" />
          </Form.Item>
          
          <Form.Item
            name="position"
            label="职位"
          >
            <Input placeholder="请输入职位" />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          
          <Form.Item
            name="phone"
            label="手机号"
          >
            <Input placeholder="请输入手机号" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement; 