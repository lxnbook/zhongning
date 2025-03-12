import React from 'react';
import {
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Box,
  Badge,
  Divider,
  Button,
  IconButton
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon
} from '@mui/icons-material';

const NotificationCenter = ({ anchorEl, open, onClose, notifications = [], onMarkAsRead }) => {
  const unreadCount = notifications.filter(n => !n.read).length;
  
  // 获取通知图标
  const getNotificationIcon = (notification) => {
    switch (notification.type) {
      case 'success':
        return <CheckCircleIcon color="success" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'info':
      default:
        return <InfoIcon color="info" />;
    }
  };
  
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
        sx: { width: 320, maxHeight: 400 }
      }}
    >
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          通知
          {unreadCount > 0 && (
            <Badge
              badgeContent={unreadCount}
              color="error"
              sx={{ ml: 1 }}
            />
          )}
        </Typography>
        <Button size="small" onClick={() => notifications.forEach(n => onMarkAsRead(n.id))}>
          全部标为已读
        </Button>
      </Box>
      
      <Divider />
      
      {notifications.length === 0 ? (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography color="textSecondary">暂无通知</Typography>
        </Box>
      ) : (
        <List sx={{ p: 0 }}>
          {notifications.map((notification) => (
            <React.Fragment key={notification.id}>
              <ListItem
                alignItems="flex-start"
                sx={{
                  backgroundColor: notification.read ? 'inherit' : 'action.hover',
                  '&:hover': { backgroundColor: 'action.selected' }
                }}
                secondaryAction={
                  !notification.read && (
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() => onMarkAsRead(notification.id)}
                    >
                      <CheckCircleIcon fontSize="small" />
                    </IconButton>
                  )
                }
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'background.paper' }}>
                    {getNotificationIcon(notification)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={notification.title}
                  secondary={
                    <>
                      <Typography
                        component="span"
                        variant="body2"
                        color="textPrimary"
                      >
                        {notification.message}
                      </Typography>
                      <Typography
                        component="div"
                        variant="caption"
                        color="textSecondary"
                        sx={{ mt: 0.5 }}
                      >
                        {new Date(notification.timestamp).toLocaleString()}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))}
        </List>
      )}
      
      <Box sx={{ p: 1, textAlign: 'center' }}>
        <Button size="small" onClick={onClose}>
          关闭
        </Button>
      </Box>
    </Popover>
  );
};

export default NotificationCenter; 