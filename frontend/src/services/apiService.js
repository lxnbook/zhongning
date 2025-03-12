import axios from 'axios';
import { message } from 'antd';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
apiClient.interceptors.request.use(
  config => {
    // 从localStorage获取token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  response => {
    return response.data;
  },
  error => {
    // 处理错误响应
    const { response } = error;
    
    if (response) {
      // 服务器返回了错误状态码
      const { status, data } = response;
      
      switch (status) {
        case 401:
          // 未授权，清除token并跳转到登录页
          localStorage.removeItem('token');
          window.location.href = '/login';
          message.error('登录已过期，请重新登录');
          break;
          
        case 403:
          message.error('没有权限访问此资源');
          break;
          
        case 404:
          message.error('请求的资源不存在');
          break;
          
        case 500:
          message.error('服务器错误，请稍后再试');
          break;
          
        default:
          message.error(data.message || `请求失败 (${status})`);
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      message.error('网络错误，无法连接到服务器');
    } else {
      // 请求配置出错
      message.error('请求配置错误');
    }
    
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// 带缓存的GET请求
const cache = new Map();

const apiService = {
  // 基本请求方法
  get: (url, params, config) => apiClient.get(url, { params, ...config }),
  post: (url, data, config) => apiClient.post(url, data, config),
  put: (url, data, config) => apiClient.put(url, data, config),
  delete: (url, config) => apiClient.delete(url, config),
  
  // 带缓存的GET请求
  getCached: (url, params, config = {}) => {
    const cacheKey = `${url}?${new URLSearchParams(params).toString()}`;
    const cachedResponse = cache.get(cacheKey);
    
    if (cachedResponse && !config.forceRefresh) {
      return Promise.resolve(cachedResponse);
    }
    
    return apiClient.get(url, { params, ...config }).then(response => {
      cache.set(cacheKey, response);
      return response;
    });
  },
  
  // 清除缓存
  clearCache: (url = null) => {
    if (url) {
      // 清除特定URL的缓存
      for (const key of cache.keys()) {
        if (key.startsWith(url)) {
          cache.delete(key);
        }
      }
    } else {
      // 清除所有缓存
      cache.clear();
    }
  }
};

export default apiService; 