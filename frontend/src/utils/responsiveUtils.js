import { useEffect, useState } from 'react';
import themeConfig from '../theme/themeConfig';

/**
 * 使用窗口尺寸钩子
 * 返回当前窗口尺寸和响应式断点
 */
export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
    breakpoint: 'lg'
  });
  
  useEffect(() => {
    // 处理窗口大小变化
    function handleResize() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // 确定当前断点
      let breakpoint = 'xxl';
      const { breakpoints } = themeConfig;
      
      if (width < breakpoints.xs) {
        breakpoint = 'xxs'; // 超小屏幕
      } else if (width < breakpoints.sm) {
        breakpoint = 'xs';
      } else if (width < breakpoints.md) {
        breakpoint = 'sm';
      } else if (width < breakpoints.lg) {
        breakpoint = 'md';
      } else if (width < breakpoints.xl) {
        breakpoint = 'lg';
      } else if (width < breakpoints.xxl) {
        breakpoint = 'xl';
      }
      
      setWindowSize({
        width,
        height,
        breakpoint
      });
    }
    
    // 添加事件监听
    window.addEventListener('resize', handleResize);
    
    // 初始调用一次
    handleResize();
    
    // 清理函数
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return windowSize;
};

/**
 * 检查是否为移动设备
 */
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * 获取设备方向
 * 返回 'portrait' 或 'landscape'
 */
export const useDeviceOrientation = () => {
  const [orientation, setOrientation] = useState('portrait');
  
  useEffect(() => {
    const handleOrientationChange = () => {
      const isPortrait = window.matchMedia("(orientation: portrait)").matches;
      setOrientation(isPortrait ? 'portrait' : 'landscape');
    };
    
    // 添加事件监听
    window.addEventListener('orientationchange', handleOrientationChange);
    
    // 初始调用一次
    handleOrientationChange();
    
    // 清理函数
    return () => window.removeEventListener('orientationchange', handleOrientationChange);
  }, []);
  
  return orientation;
};

/**
 * 响应式图表配置生成器
 * 根据屏幕尺寸生成适合的图表配置
 */
export const getResponsiveChartConfig = (baseConfig, windowSize) => {
  const { breakpoint } = windowSize;
  
  // 基础配置的深拷贝
  const config = JSON.parse(JSON.stringify(baseConfig));
  
  // 根据断点调整配置
  switch (breakpoint) {
    case 'xxs':
    case 'xs':
      // 超小屏幕和小屏幕
      config.legend = { ...config.legend, orient: 'horizontal', bottom: 0 };
      config.grid = { ...config.grid, top: 30, right: 10, bottom: 60, left: 40 };
      config.tooltip = { ...config.tooltip, confine: true };
      
      // 如果有标题，调整标题大小
      if (config.title) {
        config.title = { ...config.title, textStyle: { fontSize: 14 } };
      }
      
      // 如果有x轴标签，调整角度
      if (config.xAxis) {
        config.xAxis = Array.isArray(config.xAxis) 
          ? config.xAxis.map(axis => ({ ...axis, axisLabel: { ...axis.axisLabel, rotate: 45 } }))
          : { ...config.xAxis, axisLabel: { ...config.xAxis.axisLabel, rotate: 45 } };
      }
      break;
      
    case 'sm':
      // 中小屏幕
      config.grid = { ...config.grid, top: 40, right: 20, bottom: 40, left: 50 };
      break;
      
    case 'md':
    case 'lg':
    case 'xl':
    case 'xxl':
      // 中大屏幕，使用默认配置
      break;
      
    default:
      break;
  }
  
  return config;
};

/**
 * 响应式表格列配置生成器
 * 根据屏幕尺寸调整表格列的显示
 */
export const getResponsiveTableColumns = (allColumns, windowSize) => {
  const { breakpoint } = windowSize;
  
  // 根据断点筛选列
  switch (breakpoint) {
    case 'xxs':
      // 超小屏幕只显示最重要的2-3列
      return allColumns.filter(col => col.priority === 'high');
      
    case 'xs':
      // 小屏幕显示高优先级和中优先级的列
      return allColumns.filter(col => ['high', 'medium'].includes(col.priority));
      
    case 'sm':
      // 中小屏幕可以显示更多列，但排除低优先级
      return allColumns.filter(col => col.priority !== 'low');
      
    case 'md':
    case 'lg':
    case 'xl':
    case 'xxl':
      // 中大屏幕显示所有列
      return allColumns;
      
    default:
      return allColumns;
  }
};

/**
 * 响应式布局工具
 * 根据屏幕尺寸返回适合的布局配置
 */
export const getResponsiveLayout = (windowSize) => {
  const { breakpoint } = windowSize;
  
  // 默认布局配置
  const layout = {
    siderWidth: 200,
    collapsedWidth: 80,
    defaultCollapsed: false,
    contentPadding: 24,
    cardSpacing: 16,
    showSiderOnMobile: false
  };
  
  // 根据断点调整布局
  switch (breakpoint) {
    case 'xxs':
      // 超小屏幕
      layout.siderWidth = 0;
      layout.collapsedWidth = 0;
      layout.defaultCollapsed = true;
      layout.contentPadding = 8;
      layout.cardSpacing = 8;
      layout.showSiderOnMobile = false;
      break;
      
    case 'xs':
      // 小屏幕
      layout.siderWidth = 180;
      layout.collapsedWidth = 0;
      layout.defaultCollapsed = true;
      layout.contentPadding = 12;
      layout.cardSpacing = 12;
      layout.showSiderOnMobile = false;
      break;
      
    case 'sm':
      // 中小屏幕
      layout.siderWidth = 180;
      layout.collapsedWidth = 60;
      layout.defaultCollapsed = true;
      layout.contentPadding = 16;
      layout.showSiderOnMobile = true;
      break;
      
    case 'md':
      // 中屏幕
      layout.defaultCollapsed = true;
      break;
      
    case 'lg':
    case 'xl':
    case 'xxl':
      // 大屏幕使用默认配置
      break;
      
    default:
      break;
  }
  
  return layout;
}; 