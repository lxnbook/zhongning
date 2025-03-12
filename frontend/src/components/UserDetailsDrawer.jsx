import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Chip,
  IconButton,
  Tab,
  Tabs,
  CircularProgress,
  Paper,
  Grid
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  VpnKey as VpnKeyIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Delete as DeleteIcon,
  History as HistoryIcon,
  Group as GroupIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import UserStatsChart from './UserStatsChart';
import UserActivityTimeline from './UserActivityTimeline';
import api from '../services/apiService';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const UserDetailsDrawer = ({ open, onClose, userId, onEdit, onDelete, onLockToggle }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [activityData, setActivityData] = useState([]);
  const [statsData, setStatsData] = useState({
    logins: [],
    resources: [],
    conversations: []
  });

  // 加载用户详情
  useEffect(() => {
    if (open && userId) {
      fetchUserDetails();
    }
  }, [open, userId]);

  const fetchUserDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const userData = await api.get(`/users/${userId}`);
      setUser(userData);
      
      // 获取用户活动数据
      const activityResponse = await api.get(`/users/${userId}/activities`);
      setActivityData(activityResponse.data || []);
      
      // 获取用户统计数据
      const statsResponse = await api.get(`/users/${userId}/stats`);
      setStatsData(statsResponse.data || {
        logins: [],
        resources: [],
        conversations: []
      });
      
      setLoading(false);
    } catch (error) {
      console.error('获取用户详情失败:', error);
      setError('获取用户详情失败，请稍后重试');
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // 渲染用户基本信息
  const renderUserInfo = () => {
    if (!user) return null;
    
    return (
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            src={user.avatar}
            sx={{ width: 80, height: 80, mr: 2 }}
          >
            {user.name ? user.name.charAt(0) : <PersonIcon />}
          </Avatar>
          <Box>
            <Typography variant="h5">{user.name}</Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {user.username}
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Chip 
                label={user.role === 'admin' ? '管理员' : 
                       user.role === 'teacher' ? '教师' : 
                       user.role === 'school_admin' ? '学校管理员' : 
                       user.role === 'education_bureau' ? '教育局' : '用户'}
                color={user.role === 'admin' ? 'error' : 
                       user.role === 'school_admin' ? 'warning' : 
                       'primary'}
                size="small"
                sx={{ mr: 1 }}
              />
              <Chip 
                label={user.status === 'active' ? '正常' : '已锁定'}
                color={user.status === 'active' ? 'success' : 'default'}
                size="small"
              />
            </Box>
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <List dense>
          <ListItem>
            <ListItemIcon>
              <EmailIcon />
            </ListItemIcon>
            <ListItemText 
              primary="邮箱"
              secondary={user.email || '未设置'}
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <PhoneIcon />
            </ListItemIcon>
            <ListItemText 
              primary="电话"
              secondary={user.phone || '未设置'}
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <BusinessIcon />
            </ListItemIcon>
            <ListItemText 
              primary="所属机构"
              secondary={user.organization || '未设置'}
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <WorkIcon />
            </ListItemIcon>
            <ListItemText 
              primary="职位"
              secondary={user.position || '未设置'}
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <HistoryIcon />
            </ListItemIcon>
            <ListItemText 
              primary="创建时间"
              secondary={
                user.createdAt ? 
                `${new Date(user.createdAt).toLocaleDateString()} (${formatDistanceToNow(new Date(user.createdAt), { addSuffix: true, locale: zhCN })})` : 
                '未知'
              }
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <HistoryIcon />
            </ListItemIcon>
            <ListItemText 
              primary="最后登录"
              secondary={
                user.lastLoginAt ? 
                `${new Date(user.lastLoginAt).toLocaleDateString()} ${new Date(user.lastLoginAt).toLocaleTimeString()} (${formatDistanceToNow(new Date(user.lastLoginAt), { addSuffix: true, locale: zhCN })})` : 
                '从未登录'
              }
            />
          </ListItem>
        </List>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            startIcon={<EditIcon />}
            onClick={() => onEdit && onEdit(user)}
          >
            编辑
          </Button>
          
          <Button 
            startIcon={user.status === 'active' ? <LockIcon /> : <LockOpenIcon />}
            color={user.status === 'active' ? 'warning' : 'success'}
            onClick={() => onLockToggle && onLockToggle(user)}
          >
            {user.status === 'active' ? '锁定' : '解锁'}
          </Button>
          
          <Button 
            startIcon={<DeleteIcon />}
            color="error"
            onClick={() => onDelete && onDelete(user)}
          >
            删除
          </Button>
        </Box>
      </Box>
    );
  };

  // 渲染用户活动
  const renderUserActivity = () => {
    return (
      <Box sx={{ p: 2 }}>
        <UserActivityTimeline activities={activityData} />
      </Box>
    );
  };

  // 渲染用户统计
  const renderUserStats = () => {
    return (
      <Box sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>登录统计</Typography>
              <UserStatsChart 
                data={statsData.logins} 
                dataKey="count" 
                color="#8884d8" 
              />
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>资源使用</Typography>
              <UserStatsChart 
                data={statsData.resources} 
                dataKey="count" 
                color="#82ca9d" 
              />
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>AI对话</Typography>
              <UserStatsChart 
                data={statsData.conversations} 
                dataKey="count" 
                color="#ffc658" 
              />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 500 } }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
        <Typography variant="h6">用户详情</Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      
      <Divider />
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error">{error}</Typography>
          <Button 
            sx={{ mt: 2 }}
            onClick={fetchUserDetails}
          >
            重试
          </Button>
        </Box>
      ) : (
        <>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab icon={<PersonIcon />} label="基本信息" />
            <Tab icon={<HistoryIcon />} label="活动记录" />
            <Tab icon={<BarChartIcon />} label="使用统计" />
          </Tabs>
          
          <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
            {tabValue === 0 && renderUserInfo()}
            {tabValue === 1 && renderUserActivity()}
            {tabValue === 2 && renderUserStats()}
          </Box>
        </>
      )}
    </Drawer>
  );
};

export default UserDetailsDrawer; 