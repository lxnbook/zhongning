// 创建全局错误处理服务
const errorHandler = {
  // 处理 API 错误
  handleApiError: (error, fallbackMessage = '操作失败，请稍后重试') => {
    console.error('API 错误:', error);
    
    let errorMessage = fallbackMessage;
    
    if (error.response) {
      // 服务器返回错误
      const { status, data } = error.response;
      
      if (status === 401) {
        errorMessage = '会话已过期，请重新登录';
        // 可以在这里触发重定向到登录页
      } else if (status === 403) {
        errorMessage = '您没有权限执行此操作';
      } else if (status === 404) {
        errorMessage = '请求的资源不存在';
      } else if (status >= 500) {
        errorMessage = '服务器错误，请稍后重试';
      } else if (data && data.message) {
        errorMessage = data.message;
      }
    } else if (error.request) {
      // 请求发送但没有收到响应
      errorMessage = '网络连接错误，请检查您的网络连接';
    }
    
    message.error(errorMessage);
    return errorMessage;
  },
  
  // 处理 LLM 错误
  handleLLMError: (error) => {
    console.error('LLM 错误:', error);
    
    let errorMessage = '生成内容失败，请稍后重试';
    
    if (error.message.includes('rate limit')) {
      errorMessage = 'AI 服务调用次数已达上限，请稍后再试';
    } else if (error.message.includes('timeout')) {
      errorMessage = 'AI 服务响应超时，请稍后再试';
    } else if (error.message.includes('content filter')) {
      errorMessage = '内容被过滤，请修改您的请求';
    }
    
    message.error(errorMessage);
    return errorMessage;
  }
};

export default errorHandler; 