import React, { useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  TextField, 
  Button, 
  IconButton, 
  Tooltip, 
  CircularProgress,
  Paper,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Send as SendIcon, 
  AttachFile as AttachFileIcon,
  Close as CloseIcon,
  Settings as SettingsIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  AudioFile as AudioIcon,
  InsertDriveFile as FileIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

// 样式化组件
const InputContainer = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2]
}));

const InputRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1)
}));

const FilePreviewContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1)
}));

const FilePreview = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: 100,
  height: 100,
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  border: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.background.default
}));

const FilePreviewImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover'
});

const FilePreviewIcon = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(1),
  textAlign: 'center'
}));

const RemoveFileButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  right: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  color: 'white',
  padding: theme.spacing(0.5),
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.7)'
  }
}));

/**
 * AI聊天输入组件
 * 处理用户文本输入和文件上传
 */
const AIChatInput = ({ 
  onSendMessage, 
  loading, 
  disabled,
  multimodal = true,
  availableTemplates = [],
  systemPrompt = '',
  onSystemPromptChange
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [localSystemPrompt, setLocalSystemPrompt] = useState(systemPrompt);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const fileInputRef = useRef(null);
  
  // 处理文本输入变化
  const handleMessageChange = useCallback((e) => {
    setMessage(e.target.value);
  }, []);
  
  // 处理文件选择
  const handleFileSelect = useCallback((e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // 验证文件类型和大小
    const validFiles = selectedFiles.filter(file => {
      const validTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'audio/mpeg', 'audio/wav', 'audio/ogg',
        'application/pdf'
      ];
      
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      if (!validTypes.includes(file.type)) {
        enqueueSnackbar(`不支持的文件类型: ${file.name}`, { variant: 'error' });
        return false;
      }
      
      if (file.size > maxSize) {
        enqueueSnackbar(`文件过大: ${file.name}`, { variant: 'error' });
        return false;
      }
      
      return true;
    });
    
    // 限制文件数量
    if (files.length + validFiles.length > 5) {
      enqueueSnackbar('最多只能上传5个文件', { variant: 'warning' });
      validFiles.splice(5 - files.length);
    }
    
    // 为每个文件创建预览URL
    const filesWithPreview = validFiles.map(file => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      type: file.type
    }));
    
    setFiles(prevFiles => [...prevFiles, ...filesWithPreview]);
    
    // 重置文件输入，以便可以再次选择相同的文件
    e.target.value = null;
  }, [files, enqueueSnackbar]);
  
  // 移除文件
  const handleRemoveFile = useCallback((index) => {
    setFiles(prevFiles => {
      const newFiles = [...prevFiles];
      
      // 如果文件有预览URL，释放它
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview);
      }
      
      newFiles.splice(index, 1);
      return newFiles;
    });
  }, []);
  
  // 发送消息
  const handleSendMessage = useCallback(() => {
    if ((!message.trim() && files.length === 0) || loading || disabled) {
      return;
    }
    
    // 准备文件数据
    const formData = new FormData();
    
    // 添加消息
    if (message.trim()) {
      formData.append('message', message.trim());
    }
    
    // 添加系统提示
    if (localSystemPrompt) {
      formData.append('systemPrompt', localSystemPrompt);
    }
    
    // 添加模板ID
    if (selectedTemplate) {
      formData.append('templateId', selectedTemplate);
    }
    
    // 添加文件
    files.forEach(fileObj => {
      formData.append('files', fileObj.file);
    });
    
    // 调用发送回调
    onSendMessage(formData);
    
    // 清空输入
    setMessage('');
    
    // 清空文件并释放预览URL
    files.forEach(fileObj => {
      if (fileObj.preview) {
        URL.revokeObjectURL(fileObj.preview);
      }
    });
    setFiles([]);
  }, [message, files, loading, disabled, localSystemPrompt, selectedTemplate, onSendMessage]);
  
  // 处理按键事件（Enter发送，Shift+Enter换行）
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);
  
  // 打开文件选择对话框
  const handleOpenFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);
  
  // 打开设置对话框
  const handleOpenSettings = useCallback(() => {
    setSettingsOpen(true);
  }, []);
  
  // 关闭设置对话框
  const handleCloseSettings = useCallback(() => {
    setSettingsOpen(false);
  }, []);
  
  // 保存设置
  const handleSaveSettings = useCallback(() => {
    if (onSystemPromptChange) {
      onSystemPromptChange(localSystemPrompt);
    }
    setSettingsOpen(false);
  }, [localSystemPrompt, onSystemPromptChange]);
  
  // 处理模板选择
  const handleTemplateChange = useCallback((e) => {
    setSelectedTemplate(e.target.value);
  }, []);
  
  // 获取文件图标
  const getFileIcon = useCallback((fileType) => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon fontSize="large" color="primary" />;
    } else if (fileType === 'application/pdf') {
      return <PdfIcon fontSize="large" color="error" />;
    } else if (fileType.startsWith('audio/')) {
      return <AudioIcon fontSize="large" color="secondary" />;
    } else {
      return <FileIcon fontSize="large" color="action" />;
    }
  }, []);
  
  // 获取文件类型标签
  const getFileTypeLabel = useCallback((fileType) => {
    if (fileType.startsWith('image/')) {
      return '图片';
    } else if (fileType === 'application/pdf') {
      return 'PDF';
    } else if (fileType.startsWith('audio/')) {
      return '音频';
    } else {
      return '文件';
    }
  }, []);
  
  return (
    <>
      <InputContainer elevation={3}>
        {files.length > 0 && (
          <FilePreviewContainer>
            {files.map((fileObj, index) => (
              <FilePreview key={index}>
                {fileObj.preview ? (
                  <FilePreviewImage src={fileObj.preview} alt="预览" />
                ) : (
                  <FilePreviewIcon>
                    {getFileIcon(fileObj.type)}
                    <Typography variant="caption">
                      {getFileTypeLabel(fileObj.type)}
                    </Typography>
                  </FilePreviewIcon>
                )}
                <RemoveFileButton
                  size="small"
                  onClick={() => handleRemoveFile(index)}
                >
                  <CloseIcon fontSize="small" />
                </RemoveFileButton>
              </FilePreview>
            ))}
          </FilePreviewContainer>
        )}
        
        {selectedTemplate && (
          <Box sx={{ mb: 1 }}>
            <Chip 
              label={`使用模板: ${availableTemplates.find(t => t.id === selectedTemplate)?.name || selectedTemplate}`}
              onDelete={() => setSelectedTemplate('')}
              color="primary"
              variant="outlined"
            />
          </Box>
        )}
        
        <InputRow>
          <TextField
            fullWidth
            multiline
            maxRows={5}
            placeholder="输入消息..."
            value={message}
            onChange={handleMessageChange}
            onKeyDown={handleKeyDown}
            disabled={loading || disabled}
            variant="outlined"
            size="small"
          />
          
          <Tooltip title="设置">
            <IconButton 
              onClick={handleOpenSettings}
              disabled={loading || disabled}
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>
          
          {multimodal && (
            <Tooltip title="上传文件">
              <IconButton 
                onClick={handleOpenFileDialog}
                disabled={loading || disabled || files.length >= 5}
              >
                <AttachFileIcon />
              </IconButton>
            </Tooltip>
          )}
          
          <Tooltip title="发送">
            <span>
              <IconButton 
                color="primary"
                onClick={handleSendMessage}
                disabled={(!message.trim() && files.length === 0) || loading || disabled}
              >
                {loading ? <CircularProgress size={24} /> : <SendIcon />}
              </IconButton>
            </span>
          </Tooltip>
        </InputRow>
      </InputContainer>
      
      {/* 隐藏的文件输入 */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        multiple
        accept="image/jpeg,image/png,image/gif,image/webp,audio/mpeg,audio/wav,audio/ogg,application/pdf"
        onChange={handleFileSelect}
      />
      
      {/* 设置对话框 */}
      <Dialog open={settingsOpen} onClose={handleCloseSettings}>
        <DialogTitle>聊天设置</DialogTitle>
        <DialogContent>
          <Box sx={{ minWidth: 400, mt: 1 }}>
            <TextField
              fullWidth
              label="系统提示"
              multiline
              rows={4}
              value={localSystemPrompt}
              onChange={(e) => setLocalSystemPrompt(e.target.value)}
              margin="normal"
              helperText="系统提示可以指导AI的行为和回答方式"
            />
            
            {availableTemplates.length > 0 && (
              <FormControl fullWidth margin="normal">
                <InputLabel>提示模板</InputLabel>
                <Select
                  value={selectedTemplate}
                  onChange={handleTemplateChange}
                  label="提示模板"
                >
                  <MenuItem value="">
                    <em>无</em>
                  </MenuItem>
                  {availableTemplates.map(template => (
                    <MenuItem key={template.id} value={template.id}>
                      {template.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSettings}>取消</Button>
          <Button onClick={handleSaveSettings} variant="contained">保存</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

AIChatInput.propTypes = {
  onSendMessage: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  multimodal: PropTypes.bool,
  availableTemplates: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    })
  ),
  systemPrompt: PropTypes.string,
  onSystemPromptChange: PropTypes.func
};

export default React.memo(AIChatInput);