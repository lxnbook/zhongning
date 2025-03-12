import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  Chip,
  Divider,
  CircularProgress,
  Autocomplete,
  Tab,
  Tabs,
  Alert
} from '@mui/material';
import {
  Group as GroupIcon,
  PersonAdd as PersonAddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  PersonRemove as PersonRemoveIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';
import api from '../services/apiService';

const TeamManagementDialog = ({ open, onClose, teamId, onSave }) => {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // 加载团队详情
  useEffect(() => {
    if (open && teamId) {
      fetchTeamDetails();
    } else if (open && !teamId) {
      // 创建新团队
      setTeam(null);
      setTeamName('');
      setTeamDescription('');
      setEditMode(true);
      setLoading(false);
      fetchAvailableUsers();
    }
  }, [open, teamId]);

  const fetchTeamDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      if (teamId === 'new') {
        setTeam(null);
        setTeamName('');
        setTeamDescription('');
        setEditMode(true);
      } else {
        const teamData = await api.get(`/teams/${teamId}`);
        setTeam(teamData);
        setTeamName(teamData.name);
        setTeamDescription(teamData.description || '');
        setEditMode(false);
      }
      
      await fetchAvailableUsers();
      setLoading(false);
    } catch (error) {
      console.error('获取团队详情失败:', error);
      setError('获取团队详情失败，请稍后重试');
      setLoading(false);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const response = await api.get('/users', { 
        params: { 
          limit: 100,
          status: 'active'
        } 
      });
      setAvailableUsers(response.data || []);
    } catch (error) {
      console.error('获取可用用户失败:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSave = async () => {
    if (!teamName.trim()) {
      setError('团队名称不能为空');
      return;
    }

    setSaving(true);
    setError(null);
    
    try {
      const teamData = {
        name: teamName,
        description: teamDescription,
        members: team ? team.members.map(member => ({
          userId: member.userId,
          role: member.role
        })) : []
      };
      
      let response;
      if (team && team.id) {
        response = await api.put(`/teams/${team.id}`, teamData);
      } else {
        response = await api.post('/teams', teamData);
      }
      
      setSaving(false);
      if (onSave) {
        onSave(response.data);
      }
      onClose();
    } catch (error) {
      console.error('保存团队失败:', error);
      setError('保存团队失败: ' + (error.response?.data?.message || '未知错误'));
      setSaving(false);
    }
  };

  const handleAddMember = (user) => {
    if (!team) return;
    
    const updatedTeam = { ...team };
    if (!updatedTeam.members) {
      updatedTeam.members = [];
    }
    
    // 检查用户是否已经是成员
    if (!updatedTeam.members.some(member => member.userId === user.id)) {
      updatedTeam.members.push({
        userId: user.id,
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          avatar: user.avatar
        },
        role: 'member',
        joinedAt: new Date().toISOString()
      });
      
      setTeam(updatedTeam);
      setSelectedUsers([]);
    }
  };

  const handleRemoveMember = (userId) => {
    if (!team) return;
    
    const updatedTeam = { ...team };
    updatedTeam.members = updatedTeam.members.filter(
      member => member.userId !== userId
    );
    
    setTeam(updatedTeam);
  };

  const handleChangeMemberRole = (userId, newRole) => {
    if (!team) return;
    
    const updatedTeam = { ...team };
    const memberIndex = updatedTeam.members.findIndex(
      member => member.userId === userId
    );
    
    if (memberIndex !== -1) {
      updatedTeam.members[memberIndex].role = newRole;
      setTeam(updatedTeam);
    }
  };

  // 渲染团队基本信息
  const renderTeamInfo = () => {
    return (
      <Box sx={{ p: 2 }}>
        {editMode ? (
          <>
            <TextField
              label="团队名称"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              fullWidth
              margin="normal"
              required
              error={!teamName.trim()}
              helperText={!teamName.trim() ? '团队名称不能为空' : ''}
            />
            
            <TextField
              label="团队描述"
              value={teamDescription}
              onChange={(e) => setTeamDescription(e.target.value)}
              fullWidth
              margin="normal"
              multiline
              rows={4}
            />
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                startIcon={<CloseIcon />}
                onClick={() => {
                  if (team) {
                    setTeamName(team.name);
                    setTeamDescription(team.description || '');
                  }
                  setEditMode(false);
                }}
                sx={{ mr: 1 }}
              >
                取消
              </Button>
              
              <Button 
                startIcon={<SaveIcon />}
                variant="contained"
                onClick={handleSave}
                disabled={!teamName.trim() || saving}
              >
                保存
              </Button>
            </Box>
          </>
        ) : (
          <>
            <Typography variant="h6">{team?.name}</Typography>
            
            <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
              {team?.description || '暂无描述'}
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              <Chip 
                label={`${team?.members?.length || 0} 名成员`}
                icon={<GroupIcon />}
                sx={{ mr: 1 }}
              />
              
              <Chip 
                label={`创建于 ${new Date(team?.createdAt).toLocaleDateString()}`}
                variant="outlined"
              />
            </Box>
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                startIcon={<EditIcon />}
                onClick={() => setEditMode(true)}
              >
                编辑
              </Button>
            </Box>
          </>
        )}
      </Box>
    );
  };

  // 渲染团队成员
  const renderTeamMembers = () => {
    if (!team) return null;
    
    return (
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            团队成员
          </Typography>
          
          <Autocomplete
            options={availableUsers.filter(user => 
              !team.members?.some(member => member.userId === user.id)
            )}
            getOptionLabel={(option) => `${option.name} (${option.username})`}
            value={selectedUsers}
            onChange={(event, newValue) => {
              if (newValue) {
                handleAddMember(newValue);
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="添加成员"
                variant="outlined"
                size="small"
                sx={{ width: 250 }}
              />
            )}
          />
        </Box>
        
        <List>
          {team.members?.length > 0 ? (
            team.members.map((member) => (
              <React.Fragment key={member.userId}>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar src={member.user?.avatar}>
                      {member.user?.name ? member.user.name.charAt(0) : <PersonIcon />}
                    </Avatar>
                  </ListItemAvatar>
                  
                  <ListItemText
                    primary={member.user?.name || '未知用户'}
                    secondary={
                      <>
                        {member.user?.username}
                        <Chip
                          label={member.role === 'admin' ? '管理员' : 
                                 member.role === 'owner' ? '所有者' : '成员'}
                          size="small"
                          color={member.role === 'admin' ? 'primary' : 
                                 member.role === 'owner' ? 'secondary' : 'default'}
                          sx={{ ml: 1 }}
                        />
                      </>
                    }
                  />
                  
                  <ListItemSecondaryAction>
                    {member.role !== 'owner' && (
                      <>
                        <IconButton 
                          edge="end" 
                          onClick={() => handleChangeMemberRole(
                            member.userId, 
                            member.role === 'admin' ? 'member' : 'admin'
                          )}
                          title={member.role === 'admin' ? '降级为成员' : '升级为管理员'}
                        >
                          {member.role === 'admin' ? 
                            <ArrowDownwardIcon /> : 
                            <ArrowUpwardIcon />}
                        </IconButton>
                        
                        <IconButton 
                          edge="end" 
                          onClick={() => handleRemoveMember(member.userId)}
                          title="移除成员"
                        >
                          <PersonRemoveIcon />
                        </IconButton>
                      </>
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))
          ) : (
            <Typography variant="body2" color="textSecondary" sx={{ p: 2, textAlign: 'center' }}>
              暂无团队成员
            </Typography>
          )}
        </List>
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {teamId === 'new' ? '创建新团队' : '团队管理'}
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : (
          <>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
            >
              <Tab label="基本信息" />
              <Tab label="团队成员" />
            </Tabs>
            
            {tabValue === 0 && renderTeamInfo()}
            {tabValue === 1 && renderTeamMembers()}
          </>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>
          关闭
        </Button>
        
        {!editMode && (
          <Button 
            variant="contained" 
            onClick={handleSave}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            保存更改
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default TeamManagementDialog; 