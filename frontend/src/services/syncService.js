import { useState, useEffect } from 'react';
import apiService from './apiService';

// 设备同步状态
export const useDeviceSyncStatus = () => {
  const [devices, setDevices] = useState([]);
  const [syncStatus, setSyncStatus] = useState({
    lastSync: null,
    syncing: false,
    error: null
  });
  
  // 加载设备列表
  const loadDevices = async () => {
    try {
      const response = await apiService.get('/user/devices');
      setDevices(response);
    } catch (error) {
      console.error('加载设备列表失败', error);
    }
  };
  
  // 初始加载
  useEffect(() => {
    loadDevices();
    
    // 检查上次同步时间
    const lastSync = localStorage.getItem('lastSyncTime');
    if (lastSync) {
      setSyncStatus(prev => ({
        ...prev,
        lastSync: new Date(lastSync)
      }));
    }
  }, []);
  
  // 同步数据
  const syncData = async () => {
    setSyncStatus(prev => ({
      ...prev,
      syncing: true,
      error: null
    }));
    
    try {
      // 获取本地修改
      const localChanges = JSON.parse(localStorage.getItem('pendingChanges') || '[]');
      
      // 发送到服务器
      await apiService.post('/sync', { changes: localChanges });
      
      // 获取服务器更新
      const { updates } = await apiService.get('/sync/updates');
      
      // 应用服务器更新
      if (updates && updates.length > 0) {
        // 应用更新逻辑...
      }
      
      // 更新同步时间
      const now = new Date();
      localStorage.setItem('lastSyncTime', now.toISOString());
      localStorage.removeItem('pendingChanges');
      
      setSyncStatus({
        lastSync: now,
        syncing: false,
        error: null
      });
      
      return true;
    } catch (error) {
      console.error('同步数据失败', error);
      setSyncStatus(prev => ({
        ...prev,
        syncing: false,
        error: error.message || '同步失败'
      }));
      return false;
    }
  };
  
  // 记录本地修改
  const recordChange = (change) => {
    const pendingChanges = JSON.parse(localStorage.getItem('pendingChanges') || '[]');
    pendingChanges.push({
      ...change,
      timestamp: Date.now(),
      deviceId: localStorage.getItem('deviceId')
    });
    localStorage.setItem('pendingChanges', JSON.stringify(pendingChanges));
  };
  
  return {
    devices,
    syncStatus,
    syncData,
    recordChange,
    refreshDevices: loadDevices
  };
};

// 设备注册
export const registerDevice = async () => {
  // 检查是否已有设备ID
  let deviceId = localStorage.getItem('deviceId');
  
  if (!deviceId) {
    try {
      // 注册新设备
      const response = await apiService.post('/user/devices/register', {
        deviceType: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
        deviceName: navigator.platform,
        browserInfo: navigator.userAgent
      });
      
      deviceId = response.deviceId;
      localStorage.setItem('deviceId', deviceId);
    } catch (error) {
      console.error('设备注册失败', error);
    }
  }
  
  return deviceId;
}; 