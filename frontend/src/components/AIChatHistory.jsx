import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Paper, Divider, CircularProgress, IconButton, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  ContentCopy as CopyIcon, 
  Check as CheckIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useSnackbar } from 'notistack';

// 样式化组件
const MessageContainer = styled(Paper)(({ theme, role }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  maxWidth: '90%',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: role === 'user' ? theme.palette.primary.light : theme.palette.background.paper,
  color: role === 'user' ? theme.palette.primary.contrastText : theme.palette.text.primary,
  alignSelf: role === 'user' ? 'flex-end' : 'flex-start',
  boxShadow: theme.shadows[1],
  position: 'relative',
  overflow: 'hidden',
  '&:hover .message-actions': {
    opacity: 1
  }
}));

const MessageActions = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(0.5),
  right: theme.spacing(0.5),
  display: 'flex',
  gap: theme.spacing(0.5),
  opacity: 0,
  transition: 'opacity 0.2s ease-in-out',
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(0.5)
}));

const ChatContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  overflowY: 'auto',
  padding: theme.spacing(2),
  height: '100%',
  maxHeight: 'calc(100vh - 200px)'
}));

const MarkdownContent = styled(Box)(({ theme }) => ({
  '& p': {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  '& h1, & h2, & h3, & h4, & h5, & h6': {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1)
  },
  '& ul, & ol': {
    paddingLeft: theme.spacing(3)
  },
  '& li': {
    marginBottom: theme.spacing(0.5)
  },
  '& pre': {
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(1),
    overflow: 'auto'
  },
  '& code': {
    fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.1)' 
      : 'rgba(0, 0, 0, 0.05)',
    padding: '2px 4px',
    borderRadius: 4
  },
  '& table': {
    borderCollapse: 'collapse',
    width: '100%',
    marginBottom: theme.spacing(2)
  },
  '& th, & td': {
    border: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(1)
  },
  '& blockquote': {
    borderLeft: `4px solid ${theme.palette.primary.main}`,
    margin: theme.spacing(1, 0),
    padding: theme.spacing(0, 2),
    color: theme.palette.text.secondary
  },
  '& img': {
    maxWidth: '100%',
    borderRadius: theme.shape.borderRadius
  },
  '& a': {
    color: theme.palette.primary.main,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline'
    }
  }
}));

/**
 * AI聊天历史组件
 * 显示用户和AI之间的对话历史
 */
const AIChatHistory = ({ 
  messages, 
  loading, 
  onRetry, 
  onDelete,
  scrollToBottom = true
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const chatContainerRef = useRef(null);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  
  // 记忆化处理的消息列表
  const processedMessages = useMemo(() => {
    return messages.map((message, index) => ({
      ...message,
      id: message.id || `msg-${index}-${Date.now()}`
    }));
  }, [messages]);
  
  // 复制消息内容
  const handleCopyMessage = useCallback((content, id) => {
    navigator.clipboard.writeText(content)
      .then(() => {
        setCopiedMessageId(id);
        enqueueSnackbar('内容已复制到剪贴板', { variant: 'success' });
        
        // 3秒后重置复制状态
        setTimeout(() => {
          setCopiedMessageId(null);
        }, 3000);
      })
      .catch(err => {
        console.error('复制失败:', err);
        enqueueSnackbar('复制失败，请重试', { variant: 'error' });
      });
  }, [enqueueSnackbar]);
  
  // 重试消息
  const handleRetry = useCallback((messageIndex) => {
    if (onRetry) {
      onRetry(messageIndex);
    }
  }, [onRetry]);
  
  // 删除消息
  const handleDelete = useCallback((messageId) => {
    if (onDelete) {
      onDelete(messageId);
    }
  }, [onDelete]);
  
  // 滚动到底部
  useEffect(() => {
    if (scrollToBottom && chatContainerRef.current) {
      const container = chatContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [processedMessages, loading, scrollToBottom]);
  
  // 自定义代码块渲染
  const CodeBlock = useCallback(({ node, inline, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';
    
    return !inline && match ? (
      <Box sx={{ position: 'relative', mb: 2 }}>
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 0, 
            right: 0, 
            zIndex: 1,
            p: 0.5,
            backgroundColor: 'rgba(0,0,0,0.7)',
            borderRadius: '0 4px 0 4px'
          }}
        >
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'white',
              fontFamily: 'monospace',
              mr: 1
            }}
          >
            {language}
          </Typography>
          <IconButton 
            size="small" 
            onClick={() => handleCopyMessage(String(children).replace(/\n$/, ''), 'code')}
            sx={{ color: 'white', p: 0.5 }}
          >
            {copiedMessageId === 'code' ? <CheckIcon fontSize="small" /> : <CopyIcon fontSize="small" />}
          </IconButton>
        </Box>
        <SyntaxHighlighter
          style={atomDark}
          language={language}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      </Box>
    ) : (
      <code className={className} {...props}>
        {children}
      </code>
    );
  }, [copiedMessageId, handleCopyMessage]);
  
  return (
    <ChatContainer ref={chatContainerRef}>
      {processedMessages.map((message, index) => (
        <MessageContainer 
          key={message.id} 
          role={message.role}
          elevation={1}
        >
          <MessageActions className="message-actions">
            <Tooltip title="复制">
              <IconButton 
                size="small" 
                onClick={() => handleCopyMessage(message.content, message.id)}
              >
                {copiedMessageId === message.id ? <CheckIcon fontSize="small" /> : <CopyIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
            
            {message.role === 'user' && onRetry && (
              <Tooltip title="重试">
                <IconButton 
                  size="small" 
                  onClick={() => handleRetry(index)}
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            
            {onDelete && (
              <Tooltip title="删除">
                <IconButton 
                  size="small" 
                  onClick={() => handleDelete(message.id)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </MessageActions>
          
          <Typography 
            variant="subtitle2" 
            sx={{ 
              mb: 1, 
              fontWeight: 'bold',
              color: message.role === 'user' ? 'inherit' : 'primary.main'
            }}
          >
            {message.role === 'user' ? '你' : 'AI助手'}
          </Typography>
          
          <Divider sx={{ mb: 1 }} />
          
          {message.role === 'user' ? (
            <Typography variant="body1">{message.content}</Typography>
          ) : (
            <MarkdownContent>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeSanitize]}
                components={{
                  code: CodeBlock,
                  a: ({ node, ...props }) => (
                    <a 
                      {...props} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    />
                  )
                }}
              >
                {message.content}
              </ReactMarkdown>
            </MarkdownContent>
          )}
        </MessageContainer>
      ))}
      
      {loading && (
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            p: 2 
          }}
        >
          <CircularProgress size={24} />
          <Typography variant="body2" sx={{ ml: 1 }}>
            AI正在思考...
          </Typography>
        </Box>
      )}
    </ChatContainer>
  );
};

AIChatHistory.propTypes = {
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      role: PropTypes.oneOf(['user', 'assistant', 'system']).isRequired,
      content: PropTypes.string.isRequired
    })
  ).isRequired,
  loading: PropTypes.bool,
  onRetry: PropTypes.func,
  onDelete: PropTypes.func,
  scrollToBottom: PropTypes.bool
};

export default React.memo(AIChatHistory); 