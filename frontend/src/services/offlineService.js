import { openDB } from 'idb';
import { message } from 'antd';
import { useState, useEffect } from 'react';

// 初始化IndexedDB
const initDB = async () => {
  return openDB('eduAssistantDB', 1, {
    upgrade(db) {
      // 存储用户数据
      if (!db.objectStoreNames.contains('userData')) {
        db.createObjectStore('userData', { keyPath: 'id' });
      }
      
      // 存储教案
      if (!db.objectStoreNames.contains('teachPlans')) {
        db.createObjectStore('teachPlans', { keyPath: 'id' });
      }
      
      // 存储分析数据
      if (!db.objectStoreNames.contains('analysisData')) {
        db.createObjectStore('analysisData', { keyPath: 'id' });
      }
      
      // 存储同步队列
      if (!db.objectStoreNames.contains('syncQueue')) {
        db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
      }
    }
  });
};

// 保存数据到本地
export const saveOfflineData = async (storeName, data) => {
  try {
    const db = await initDB();
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    await store.put(data);
    await tx.done;
    return true;
  } catch (error) {
    console.error(`保存离线数据失败: ${storeName}`, error);
    return false;
  }
};

// 从本地获取数据
export const getOfflineData = async (storeName, id) => {
  try {
    const db = await initDB();
    return id 
      ? await db.get(storeName, id)
      : await db.getAll(storeName);
  } catch (error) {
    console.error(`获取离线数据失败: ${storeName}`, error);
    return null;
  }
};

// 添加到同步队列
export const addToSyncQueue = async (operation) => {
  try {
    const db = await initDB();
    const tx = db.transaction('syncQueue', 'readwrite');
    const store = tx.objectStore('syncQueue');
    await store.add({
      ...operation,
      timestamp: Date.now(),
      synced: false
    });
    await tx.done;
    return true;
  } catch (error) {
    console.error('添加到同步队列失败', error);
    return false;
  }
};

// 处理同步队列
export const processSyncQueue = async () => {
  try {
    const db = await initDB();
    const queue = await db.getAll('syncQueue');
    const unsynced = queue.filter(item => !item.synced);
    
    if (unsynced.length === 0) return;
    
    message.info(`正在同步 ${unsynced.length} 个离线操作...`);
    
    for (const item of unsynced) {
      try {
        // 执行API调用
        await fetch(item.url, {
          method: item.method,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(item.data)
        });
        
        // 标记为已同步
        const tx = db.transaction('syncQueue', 'readwrite');
        const store = tx.objectStore('syncQueue');
        await store.put({
          ...item,
          synced: true,
          syncedAt: Date.now()
        });
        await tx.done;
      } catch (error) {
        console.error(`同步操作失败: ${item.id}`, error);
      }
    }
    
    message.success('离线数据同步完成');
  } catch (error) {
    console.error('处理同步队列失败', error);
    message.error('离线数据同步失败');
  }
};

// 监听网络状态
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      processSyncQueue();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      message.warning('网络连接已断开，系统将以离线模式运行');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isOnline;
}; 