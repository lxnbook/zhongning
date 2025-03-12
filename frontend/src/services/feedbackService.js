import { useState } from 'react';
import apiService from './apiService';

// 用户反馈收集
export const useFeedbackCollection = () => {
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // 提交反馈
  const submitFeedback = async (data) => {
    setSubmitting(true);
    try {
      await apiService.post('/feedback', {
        ...data,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      });
      setFeedbackVisible(false);
      return true;
    } catch (error) {
      console.error('提交反馈失败', error);
      return false;
    } finally {
      setSubmitting(false);
    }
  };
  
  return {
    feedbackVisible,
    setFeedbackVisible,
    submitting,
    submitFeedback
  };
};

// 用户行为跟踪
export const trackUserAction = (action, details = {}) => {
  try {
    // 记录用户行为
    const data = {
      action,
      details,
      url: window.location.href,
      timestamp: new Date().toISOString()
    };
    
    // 使用Beacon API在页面卸载时也能发送数据
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics/track', JSON.stringify(data));
    } else {
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        keepalive: true
      });
    }
  } catch (error) {
    console.error('跟踪用户行为失败', error);
  }
};

// 错误监控
export const setupErrorMonitoring = () => {
  window.addEventListener('error', (event) => {
    try {
      const errorData = {
        message: event.message,
        source: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        url: window.location.href,
        timestamp: new Date().toISOString()
      };
      
      fetch('/api/monitoring/error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(errorData),
        keepalive: true
      });
    } catch (e) {
      console.error('报告错误失败', e);
    }
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    try {
      const errorData = {
        message: event.reason?.message || 'Unhandled Promise Rejection',
        stack: event.reason?.stack,
        url: window.location.href,
        timestamp: new Date().toISOString()
      };
      
      fetch('/api/monitoring/error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(errorData),
        keepalive: true
      });
    } catch (e) {
      console.error('报告Promise拒绝失败', e);
    }
  });
}; 