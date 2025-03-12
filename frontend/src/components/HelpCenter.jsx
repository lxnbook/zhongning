import React from 'react';
import {
  Popover,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
  Link
} from '@mui/material';
import {
  Help as HelpIcon,
  Book as BookIcon,
  VideoLibrary as VideoLibraryIcon,
  Forum as ForumIcon,
  Email as EmailIcon
} from '@mui/icons-material';

const HelpCenter = ({ anchorEl, open, onClose }) => {
  // 帮助资源列表
  const helpResources = [
    {
      title: '用户指南',
      description: '查看详细的用户手册和操作指南',
      icon: <BookIcon color="primary" />,
      link: '/help/guide'
    },
    {
      title: '视频教程',
      description: '观看操作演示和功能介绍视频',
      icon: <VideoLibraryIcon color="primary" />,
      link: '/help/videos'
    },
    {
      title: '常见问题',
      description: '查找常见问题的解答',
      icon: <HelpIcon color="primary" />,
      link: '/help/faq'
    },
    {
      title: '社区论坛',
      description: '加入用户社区，分享经验和解决方案',
      icon: <ForumIcon color="primary" />,
      link: '/help/forum'
    },
    {
      title: '联系支持',
      description: '联系技术支持团队获取帮助',
      icon: <EmailIcon color="primary" />,
      link: '/help/support'
    }
  ];
  
  return (
    <Popover
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      PaperProps={{
        sx: { width: 320, maxHeight: 500 }
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6">帮助中心</Typography>
        <Typography variant="body2" color="textSecondary">
          获取使用帮助和支持
        </Typography>
      </Box>
      
      <Divider />
      
      <List sx={{ p: 0 }}>
        {helpResources.map((resource, index) => (
          <React.Fragment key={index}>
            <ListItem
              button
              component={Link}
              href={resource.link}
              onClick={(e) => {
                e.preventDefault();
                // 这里可以添加导航逻辑
                onClose();
              }}
            >
              <ListItemIcon>
                {resource.icon}
              </ListItemIcon>
              <ListItemText
                primary={resource.title}
                secondary={resource.description}
              />
            </ListItem>
            {index < helpResources.length - 1 && <Divider component="li" />}
          </React.Fragment>
        ))}
      </List>
      
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<EmailIcon />}
          onClick={() => {
            window.location.href = 'mailto:support@example.com';
            onClose();
          }}
        >
          发送反馈
        </Button>
      </Box>
    </Popover>
  );
};

export default HelpCenter; 