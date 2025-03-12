// 主题配置文件
const themeConfig = {
  // 颜色配置
  colors: {
    primary: '#1890ff',
    success: '#52c41a',
    warning: '#faad14',
    error: '#f5222d',
    info: '#1890ff',
    
    // 扩展颜色
    primaryLight: '#e6f7ff',
    primaryDark: '#096dd9',
    
    // 中性色
    textPrimary: 'rgba(0, 0, 0, 0.85)',
    textSecondary: 'rgba(0, 0, 0, 0.65)',
    textDisabled: 'rgba(0, 0, 0, 0.45)',
    borderColor: '#d9d9d9',
    
    // 背景色
    background: '#f0f2f5',
    componentBackground: '#ffffff',
    
    // 图表颜色
    chartColors: [
      '#1890ff', '#52c41a', '#faad14', '#f5222d', 
      '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16'
    ]
  },
  
  // 字体配置
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
    lineHeight: 1.5,
    
    // 标题
    h1: {
      fontSize: 38,
      lineHeight: 1.23,
      fontWeight: 600
    },
    h2: {
      fontSize: 30,
      lineHeight: 1.35,
      fontWeight: 600
    },
    h3: {
      fontSize: 24,
      lineHeight: 1.35,
      fontWeight: 600
    },
    h4: {
      fontSize: 20,
      lineHeight: 1.4,
      fontWeight: 600
    },
    h5: {
      fontSize: 16,
      lineHeight: 1.5,
      fontWeight: 600
    }
  },
  
  // 间距配置
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48
  },
  
  // 阴影配置
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  },
  
  // 圆角配置
  borderRadius: {
    sm: 2,
    md: 4,
    lg: 8,
    xl: 16,
    round: '50%'
  },
  
  // 过渡配置
  transitions: {
    default: 'all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)',
    fast: 'all 0.1s cubic-bezier(0.645, 0.045, 0.355, 1)',
    slow: 'all 0.5s cubic-bezier(0.645, 0.045, 0.355, 1)'
  },
  
  // 响应式断点
  breakpoints: {
    xs: 480,
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
    xxl: 1600
  },
  
  // Ant Design 主题覆盖
  antd: {
    'primary-color': '#1890ff',
    'link-color': '#1890ff',
    'success-color': '#52c41a',
    'warning-color': '#faad14',
    'error-color': '#f5222d',
    'font-size-base': '14px',
    'heading-color': 'rgba(0, 0, 0, 0.85)',
    'text-color': 'rgba(0, 0, 0, 0.65)',
    'text-color-secondary': 'rgba(0, 0, 0, 0.45)',
    'disabled-color': 'rgba(0, 0, 0, 0.25)',
    'border-radius-base': '4px',
    'border-color-base': '#d9d9d9',
    'box-shadow-base': '0 2px 8px rgba(0, 0, 0, 0.15)'
  }
};

export default themeConfig; 