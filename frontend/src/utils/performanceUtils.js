import { useState, useEffect, useCallback } from 'react';

// 组件懒加载追踪
export const useLazyLoadTracking = () => {
  const [lazyComponents, setLazyComponents] = useState({});
  
  // 记录组件加载时间
  const trackComponentLoad = useCallback((componentName, loadTime) => {
    setLazyComponents(prev => ({
      ...prev,
      [componentName]: {
        loadTime,
        timestamp: Date.now()
      }
    }));
  }, []);
  
  return { lazyComponents, trackComponentLoad };
};

// 资源预加载
export const useResourcePreload = (resources) => {
  useEffect(() => {
    // 预加载关键资源
    if (Array.isArray(resources) && resources.length > 0) {
      resources.forEach(resource => {
        if (resource.type === 'image') {
          const img = new Image();
          img.src = resource.url;
        } else if (resource.type === 'script') {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = 'script';
          link.href = resource.url;
          document.head.appendChild(link);
        }
      });
    }
  }, [resources]);
};

// 组件渲染性能监控
export const useRenderPerformance = (componentName) => {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // 记录渲染时间超过阈值的组件
      if (renderTime > 50) {
        console.warn(`${componentName} 渲染时间: ${renderTime.toFixed(2)}ms`);
        // 可以将这些数据发送到后端进行分析
      }
    };
  }, [componentName]);
}; 