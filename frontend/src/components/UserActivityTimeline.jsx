import React from 'react';
import {
  Box,
  Typography,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
  Paper
} from '@mui/material';
import {
  Login as LoginIcon,
  Logout as LogoutIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  Upload as UploadIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const UserActivityTimeline = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="textSecondary">暂无用户活动数据</Typography>
      </Box>
    );
  }

  // 获取活动图标
  const getActivityIcon = (type) => {
    switch (type) {
      case 'login':
        return <LoginIcon />;
      case 'logout':
        return <LogoutIcon />;
      case 'create':
        return <AddIcon />;
      case 'update':
        return <EditIcon />;
      case 'delete':
        return <DeleteIcon />;
      case 'settings':
        return <SettingsIcon />;
      case 'search':
        return <SearchIcon />;
      case 'download':
        return <DownloadIcon />;
      case 'upload':
        return <UploadIcon />;
      default:
        return <EditIcon />;
    }
  };

  // 获取活动颜色
  const getActivityColor = (type) => {
    switch (type) {
      case 'login':
        return 'success.main';
      case 'logout':
        return 'info.main';
      case 'create':
        return 'primary.main';
      case 'update':
        return 'warning.main';
      case 'delete':
        return 'error.main';
      case 'settings':
        return 'secondary.main';
      default:
        return 'grey.500';
    }
  };

  return (
    <Timeline position="alternate">
      {activities.map((activity, index) => (
        <TimelineItem key={activity.id || index}>
          <TimelineOppositeContent color="text.secondary">
            {formatDistanceToNow(new Date(activity.timestamp), { 
              addSuffix: true,
              locale: zhCN
            })}
          </TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineDot sx={{ bgcolor: getActivityColor(activity.type) }}>
              {getActivityIcon(activity.type)}
            </TimelineDot>
            {index < activities.length - 1 && <TimelineConnector />}
          </TimelineSeparator>
          <TimelineContent>
            <Paper elevation={3} sx={{ p: 2, bgcolor: 'background.default' }}>
              <Typography variant="h6" component="span">
                {activity.title}
              </Typography>
              <Typography>
                {activity.description}
              </Typography>
              {activity.details && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {activity.details}
                </Typography>
              )}
            </Paper>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
};

export default UserActivityTimeline; 