import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Box, 
  Typography, 
  Paper, 
  Divider, 
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  TextField,
  InputAdornment,
  Tooltip,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Add as AddIcon,
  Menu as MenuIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import AIChatHistory from '../components/AIChatHistory';
import AIChatInput from '../components/AIChatInput';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import zhCN from 'date-fns/locale/zh-CN';

// 样式化组件
const ChatContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: 'calc(100vh - 80px)',
  padding: theme.spacing(2)
}));

const ChatHistoryContainer = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  marginBottom: theme.spacing(2),
  overflow: 'hidden'
}));

const ConversationsList = styled(List)(({ theme }) => ({
  overflowY: 'auto',
  padding: 0
}));

const ConversationItem = styled(ListItem)(({ theme, selected }) => ({
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(0.5),
  backgroundColor: selected ? theme.palette.action.selected : 'transparent',
  '&:hover': {
    backgroundColor: theme.palette.action.hover
  }
}));

/**
 * AI聊天页面
 * 集成聊天历史和输入组件，管理会话
 */
const AIChat = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [searchTerm, setSearchTerm] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [templates, setTemplates] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const drawerWidth = 280;
  
  // 获取会话列表
  const fetchConversations = useCallback(async (reset = false) => {
    if (loadingConversations) return;
    
    try {
      setLoadingConversations(true);
      const currentPage = reset ? 1 : page;
      
      const response = await api.get('/ai/conversations', {
        params: {
          page: currentPage,
          limit: 20,
          search: searchTerm
        }
      });
      
      const { conversations: newConversations, pagination } = response.data;
      
      if (reset) {
        setConversations(newConversations);
      } else {
        setConversations(prev => [...prev, ...newConversations]);
      }
      
      setHasMore(currentPage < pagination.totalPages);
      setPage(currentPage + 1);
    } catch (error) {
      console.error('获取会话列表失败:', error);
      enqueueSnackbar('获取会话列表失败', { variant: 'error' });
    } finally {
      setLoadingConversations(false);
    }
  }, [page, searchTerm, loadingConversations, enqueueSnackbar]);
  
  // 获取会话详情
  const fetchConversation = useCallback(async (id) => {
    try {
      setLoading(true);
      const response = await api.get(`/ai/conversations/${id}`);
      
      // 转换消息格式
      const conversationMessages = response.data.messages.map((msg, index) => ({
        id: `${id}-${index}`,
        role: msg.role,
        content: msg.content
      }));
      
      setMessages(conversationMessages);
    } catch (error) {
      console.error('获取会话详情失败:', error);
      enqueueSnackbar('获取会话详情失败', { variant: 'error' });
      navigate('/ai/chat');
    } finally {
      setLoading(false);
    }
  }, [navigate, enqueueSnackbar]);
  
  // 获取提示模板
  const fetchTemplates = useCallback(async () => {
    try {
      setLoadingTemplates(true);
      const response = await api.get('/ai/templates');
      setTemplates(response.data);
    } catch (error) {
      console.error('获取提示模板失败:', error);
      // 不显示错误通知，因为这不是关键功能
    } finally {
      setLoadingTemplates(false);
    }
  }, []);
  
  // 创建新会话
  const createNewConversation = useCallback(() => {
    setMessages([]);
    navigate('/ai/chat');
  }, [navigate]);
  
  // 发送消息
  const handleSendMessage = useCallback(async (formData) => {
    if (sending) return;
    
    try {
      setSending(true);
      
      // 如果有会话ID，添加到表单数据
      if (conversationId) {
        formData.append('conversationId', conversationId);
      }
      
      // 获取消息文本以显示在UI中
      const messageText = formData.get('message') || '[上传了文件]';
      
      // 添加用户消息到UI
      const userMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: messageText
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // 确定是否使用多模态API
      const hasFiles = Array.from(formData.getAll('files')).length > 0;
      const endpoint = hasFiles ? '/ai/multimodal' : '/ai/chat';
      
      // 发送请求
      const response = await api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // 添加AI响应到UI
      const aiMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.data.message
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // 如果是新会话，导航到新会话页面
      if (!conversationId && response.data.conversationId) {
        navigate(`/ai/chat/${response.data.conversationId}`, { replace: true });
      }
      
      // 刷新会话列表
      fetchConversations(true);
    } catch (error) {
      console.error('发送消息失败:', error);
      
      let errorMessage = '发送消息失败';
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 429) {
          errorMessage = '请求过于频繁，请稍后再试';
        } else if (data.error) {
          errorMessage = data.error;
          if (data.details) {
            errorMessage += `: ${data.details}`;
          }
        }
      }
      
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setSending(false);
    }
  }, [conversationId, sending, navigate, fetchConversations, enqueueSnackbar]);
  
  // 删除会话
  const handleDeleteConversation = useCallback(async (id, event) => {
    if (event) {
      event.stopPropagation();
    }
    
    try {
      await api.delete(`/ai/conversations/${id}`);
      
      // 更新会话列表
      setConversations(prev => prev.filter(conv => conv._id !== id));
      
      // 如果删除的是当前会话，创建新会话
      if (id === conversationId) {
        createNewConversation();
      }
      
      enqueueSnackbar('会话已删除', { variant: 'success' });
    } catch (error) {
      console.error('删除会话失败:', error);
      enqueueSnackbar('删除会话失败', { variant: 'error' });
    }
  }, [conversationId, createNewConversation, enqueueSnackbar]);
  
  // 重试消息
  const handleRetryMessage = useCallback((messageIndex) => {
    // 找到要重试的用户消息
    const userMessage = messages[messageIndex];
    if (!userMessage || userMessage.role !== 'user') return;
    
    // 创建表单数据
    const formData = new FormData();
    formData.append('message', userMessage.content);
    
    if (systemPrompt) {
      formData.append('systemPrompt', systemPrompt);
    }
    
    // 如果有会话ID，添加到表单数据
    if (conversationId) {
      formData.append('conversationId', conversationId);
    }
    
    // 删除这条消息之后的所有消息
    setMessages(prev => prev.slice(0, messageIndex));
    
    // 发送消息
    handleSendMessage(formData);
  }, [messages, systemPrompt, conversationId, handleSendMessage]);
  
  // 删除消息
  const handleDeleteMessage = useCallback((messageId) => {
    setMessages(prev => {
      const index = prev.findIndex(msg => msg.id === messageId);
      if (index === -1) return prev;
      
      // 如果是用户消息，同时删除下一条AI消息
      if (prev[index].role === 'user' && index + 1 < prev.length && prev[index + 1].role === 'assistant') {
        return [...prev.slice(0, index), ...prev.slice(index + 2)];
      }
      
      // 如果是AI消息，同时删除上一条用户消息
      if (prev[index].role === 'assistant' && index > 0 && prev[index - 1].role === 'user') {
        return [...prev.slice(0, index - 1), ...prev.slice(index + 1)];
      }
      
      // 否则只删除当前消息
      return [...prev.slice(0, index), ...prev.slice(index + 1)];
    });
  }, []);
  
  // 处理搜索
  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);
  
  // 执行搜索
  const executeSearch = useCallback(() => {
    setPage(1);
    fetchConversations(true);
  }, [fetchConversations]);
  
  // 处理搜索按键事件
  const handleSearchKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      executeSearch();
    }
  }, [executeSearch]);
  
  // 切换抽屉
  const toggleDrawer = useCallback(() => {
    setDrawerOpen(prev => !prev);
  }, []);
  
  // 选择会话
  const handleSelectConversation = useCallback((id) => {
    navigate(`/ai/chat/${id}`);
  }, [navigate]);
  
  // 处理系统提示变更
  const handleSystemPromptChange = useCallback((newPrompt) => {
    setSystemPrompt(newPrompt);
  }, []);
  
  // 初始化
  useEffect(() => {
    fetchConversations(true);
    fetchTemplates();
  }, [fetchConversations, fetchTemplates]);
  
  // 当会话ID变化时，获取会话详情
  useEffect(() => {
    if (conversationId) {
      fetchConversation(conversationId);
    } else {
      setMessages([]);
    }
  }, [conversationId, fetchConversation]);
  
  // 响应式处理
  useEffect(() => {
    if (isMobile) {
      setDrawerOpen(false);
    }
  }, [isMobile]);
  
  // 过滤会话列表
  const filteredConversations = conversations;
  
  return (
    <Container maxWidth="xl" sx={{ height: '100vh', py: 2 }}>
      <Box sx={{ display: 'flex', height: '100%' }}>
        {/* 会话列表抽屉 */}
        <Drawer
          variant={isMobile ? 'temporary' : 'persistent'}
          open={drawerOpen}
          onClose={toggleDrawer}
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              position: isMobile ? 'fixed' : 'relative',
              height: isMobile ? '100%' : 'auto'
            }
          }}
        >
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">会话列表</Typography>
              {isMobile && (
                <IconButton onClick={toggleDrawer}>
                  <CloseIcon />
                </IconButton>
              )}
            </Box>
            
            <Button
              variant="contained"
              fullWidth
              startIcon={<AddIcon />}
              onClick={createNewConversation}
              sx={{ mb: 2 }}
            >
              新会话
            </Button>
            
            <TextField
              fullWidth
              placeholder="搜索会话..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={handleSearch}
              onKeyDown={handleSearchKeyDown}
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      onClick={executeSearch}
                    >
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Box>
          
          <Divider />
          
          <ConversationsList>
            {filteredConversations.length === 0 ? (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {loadingConversations ? '加载中...' : '没有会话记录'}
                </Typography>
              </Box>
            ) : (
              <>
                {filteredConversations.map(conversation => (
                  <ConversationItem
                    key={conversation._id}
                    button
                    selected={conversation._id === conversationId}
                    onClick={() => handleSelectConversation(conversation._id)}
                  >
                    <ListItemText
                      primary={conversation.title}
                      secondary={formatDistanceToNow(new Date(conversation.updatedAt), {
                        addSuffix: true,
                        locale: zhCN
                      })}
                      primaryTypographyProps={{
                        noWrap: true,
                        style: { maxWidth: '180px' }
                      }}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={(e) => handleDeleteConversation(conversation._id, e)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ConversationItem>
                ))}
                
                {hasMore && (
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Button
                      variant="text"
                      onClick={() => fetchConversations()}
                      disabled={loadingConversations}
                    >
                      {loadingConversations ? (
                        <CircularProgress size={24} />
                      ) : (
                        '加载更多'
                      )}
                    </Button>
                  </Box>
                )}
              </>
            )}
          </ConversationsList>
        </Drawer>
        
        {/* 聊天区域 */}
        <Box
          sx={{
            flexGrow: 1,
            ml: drawerOpen && !isMobile ? 0 : 0,
            transition: theme.transitions.create('margin', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen
            })
          }}
        >
          <ChatContainer>
            {/* 顶部栏 */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              {!drawerOpen && (
                <IconButton onClick={toggleDrawer} sx={{ mr: 1 }}>
                  <MenuIcon />
                </IconButton>
              )}
              
              <Typography variant="h6">
                {conversationId ? (
                  filteredConversations.find(c => c._id === conversationId)?.title || '聊天'
                ) : (
                  '新会话'
                )}
              </Typography>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            {/* 聊天历史 */}
            <ChatHistoryContainer>
              <Paper
                elevation={0}
                sx={{
                  flexGrow: 1,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  bgcolor: 'background.default'
                }}
              >
                <AIChatHistory
                  messages={messages}
                  loading={sending}
                  onRetry={handleRetryMessage}
                  onDelete={handleDeleteMessage}
                />
              </Paper>
            </ChatHistoryContainer>
            
            {/* 输入区域 */}
            <AIChatInput
              onSendMessage={handleSendMessage}
              loading={sending}
              disabled={loading}
              multimodal={true}
              availableTemplates={templates}
              systemPrompt={systemPrompt}
              onSystemPromptChange={handleSystemPromptChange}
            />
          </ChatContainer>
        </Box>
      </Box>
    </Container>
  );
};

export default AIChat;