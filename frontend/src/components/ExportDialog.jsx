import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Box,
  Checkbox,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import { 
  Download as DownloadIcon,
  FileCopy as FileCopyIcon,
  PictureAsPdf as PdfIcon,
  TableChart as TableIcon,
  Code as CodeIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import apiService from '../services/apiService';

/**
 * 数据导出对话框组件
 * 
 * @param {Object} props
 * @param {boolean} props.open - 对话框是否打开
 * @param {Function} props.onClose - 关闭对话框的回调函数
 * @param {string} props.type - 导出数据类型 (users, resources, teachPlans, etc.)
 * @param {Array} props.selection - 选中的项目ID数组
 * @param {Object} props.filters - 当前应用的过滤条件
 */
const ExportDialog = ({ open, onClose, type, selection = [], filters = {} }) => {
  const [format, setFormat] = useState('csv');
  const [scope, setScope] = useState(selection.length > 0 ? 'selected' : 'all');
  const [includeDetails, setIncludeDetails] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);

  // 处理格式变更
  const handleFormatChange = (event) => {
    setFormat(event.target.value);
  };

  // 处理范围变更
  const handleScopeChange = (event) => {
    setScope(event.target.value);
  };

  // 处理导出
  const handleExport = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    setDownloadUrl(null);
    
    try {
      const params = {
        format,
        includeDetails,
        ...(scope === 'selected' && { ids: selection }),
        ...(scope === 'filtered' && { filters }),
      };
      
      const response = await apiService.post(`/export/${type}`, params, { 
        responseType: 'blob',
      });
      
      // 创建下载链接
      const blob = new Blob([response.data], { 
        type: getContentType(format) 
      });
      const url = window.URL.createObjectURL(blob);
      setDownloadUrl(url);
      
      // 自动下载
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_export_${new Date().toISOString().slice(0, 10)}.${format}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('导出失败:', error);
      setError('导出数据时发生错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };
  
  // 获取内容类型
  const getContentType = (format) => {
    switch (format) {
      case 'csv':
        return 'text/csv';
      case 'xlsx':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'pdf':
        return 'application/pdf';
      case 'json':
        return 'application/json';
      default:
        return 'text/plain';
    }
  };
  
  // 获取导出类型的显示名称
  const getTypeDisplayName = () => {
    switch (type) {
      case 'users':
        return '用户数据';
      case 'resources':
        return '资源数据';
      case 'teachPlans':
        return '教案数据';
      case 'conversations':
        return '对话数据';
      case 'activities':
        return '活动数据';
      default:
        return '数据';
    }
  };
  
  // 获取格式图标
  const getFormatIcon = (format) => {
    switch (format) {
      case 'csv':
      case 'xlsx':
        return <TableIcon />;
      case 'pdf':
        return <PdfIcon />;
      case 'json':
        return <CodeIcon />;
      default:
        return <FileCopyIcon />;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        导出{getTypeDisplayName()}
      </DialogTitle>
      
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            导出成功！
          </Alert>
        )}
        
        <Typography variant="subtitle1" gutterBottom>
          请选择导出选项：
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <FormControl component="fieldset">
            <FormLabel component="legend">导出格式</FormLabel>
            <RadioGroup
              value={format}
              onChange={handleFormatChange}
            >
              <FormControlLabel value="csv" control={<Radio />} label="CSV" />
              <FormControlLabel value="xlsx" control={<Radio />} label="Excel (XLSX)" />
              <FormControlLabel value="pdf" control={<Radio />} label="PDF" />
              <FormControlLabel value="json" control={<Radio />} label="JSON" />
            </RadioGroup>
          </FormControl>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ mb: 3 }}>
          <FormControl component="fieldset">
            <FormLabel component="legend">导出范围</FormLabel>
            <RadioGroup
              value={scope}
              onChange={handleScopeChange}
            >
              <FormControlLabel 
                value="selected" 
                control={<Radio />} 
                label={`选中的项目 (${selection.length})`}
                disabled={selection.length === 0}
              />
              <FormControlLabel 
                value="filtered" 
                control={<Radio />} 
                label="当前筛选结果"
              />
              <FormControlLabel value="all" control={<Radio />} label="全部数据" />
            </RadioGroup>
          </FormControl>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            导出预览：
          </Typography>
          
          <List>
            <ListItem>
              <ListItemIcon>
                {getFormatIcon(format)}
              </ListItemIcon>
              <ListItemText 
                primary={`${getTypeDisplayName()}.${format}`}
                secondary={`${scope === 'selected' ? '选中的' : scope === 'filtered' ? '筛选的' : '全部'}${getTypeDisplayName()}`}
              />
            </ListItem>
          </List>
        </Box>
        
        <Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={includeDetails}
                onChange={(e) => setIncludeDetails(e.target.checked)}
                disabled={loading}
              />
            }
            label="包含详细信息"
          />
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          取消
        </Button>
        <Button
          onClick={handleExport}
          color="primary"
          startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
          disabled={loading}
        >
          导出
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportDialog; 