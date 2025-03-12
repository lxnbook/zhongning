/**
 * 大语言模型配置文件
 * 为不同功能配置最适合的模型
 */
const dotenv = require('dotenv');
const NodeCache = require('node-cache');
const logger = require('../utils/logger');
const mongoose = require('mongoose');
const ModelUsage = require('../models/ModelUsage');

// 加载环境变量
dotenv.config();

// 创建缓存实例，默认缓存时间10分钟
const responseCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

// 模型配置
const models = {
  default: {
    model: process.env.DEFAULT_MODEL || 'gpt-3.5-turbo',
    apiKey: process.env.OPENAI_API_KEY,
    temperature: 0.7,
    max_tokens: 2000,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    timeout: 30000, // 请求超时时间（毫秒）
  },
  fast: {
    model: process.env.FAST_MODEL || 'gpt-3.5-turbo',
    apiKey: process.env.OPENAI_API_KEY,
    temperature: 0.5,
    max_tokens: 1000,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    timeout: 15000,
  },
  advanced: {
    model: process.env.ADVANCED_MODEL || 'gpt-4',
    apiKey: process.env.OPENAI_API_KEY,
    temperature: 0.8,
    max_tokens: 4000,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    timeout: 60000,
  },
  creative: {
    model: process.env.CREATIVE_MODEL || 'gpt-4',
    apiKey: process.env.OPENAI_API_KEY,
    temperature: 1.0,
    max_tokens: 3000,
    top_p: 1,
    frequency_penalty: 0.2,
    presence_penalty: 0.2,
    timeout: 45000,
  },
  precise: {
    model: process.env.PRECISE_MODEL || 'gpt-4',
    apiKey: process.env.OPENAI_API_KEY,
    temperature: 0.2,
    max_tokens: 3000,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    timeout: 45000,
  },
  vision: {
    model: process.env.VISION_MODEL || 'gpt-4-vision-preview',
    apiKey: process.env.OPENAI_API_KEY,
    temperature: 0.7,
    max_tokens: 3000,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    timeout: 60000,
  }
};

// 备用API密钥
const fallbackApiKeys = process.env.FALLBACK_API_KEYS 
  ? process.env.FALLBACK_API_KEYS.split(',') 
  : [];

// 获取LLM配置
const getLLMConfig = (modelType = 'default') => {
  if (!models[modelType]) {
    logger.warn(`请求的模型类型 ${modelType} 不存在，使用默认模型`);
    modelType = 'default';
  }
  
  return { ...models[modelType] };
};

// 根据任务复杂度选择模型
const selectModelForTask = (complexity, domain = 'general', hasImages = false) => {
  // 如果包含图像，使用视觉模型
  if (hasImages) {
    return getLLMConfig('vision');
  }
  
  // 根据复杂度选择模型
  switch (complexity) {
    case 'high':
      return getLLMConfig('advanced');
    case 'medium':
      return getLLMConfig('default');
    case 'low':
      return getLLMConfig('fast');
    case 'creative':
      return getLLMConfig('creative');
    case 'precise':
      return getLLMConfig('precise');
    default:
      return getLLMConfig('default');
  }
};

// 生成缓存键
const generateCacheKey = (messages, modelConfig) => {
  // 创建一个包含消息内容和关键模型参数的对象
  const cacheObject = {
    messages: messages.map(msg => ({
      role: msg.role,
      content: msg.content
    })),
    model: modelConfig.model,
    temperature: modelConfig.temperature
  };
  
  // 将对象转换为字符串并返回
  return JSON.stringify(cacheObject);
};

// 从缓存获取响应
const getCachedResponse = (messages, modelConfig) => {
  const cacheKey = generateCacheKey(messages, modelConfig);
  return responseCache.get(cacheKey);
};

// 将响应存入缓存
const setCachedResponse = (messages, modelConfig, response) => {
  const cacheKey = generateCacheKey(messages, modelConfig);
  responseCache.set(cacheKey, response);
};

// 记录模型使用情况
const logModelUsage = async (userId, modelName, tokensUsed, responseTime, success) => {
  try {
    // 确保数据库连接已建立
    if (mongoose.connection.readyState !== 1) {
      logger.warn('数据库连接未就绪，无法记录模型使用情况');
      return;
    }
    
    const usage = new ModelUsage({
      userId,
      modelName,
      tokensUsed,
      responseTime,
      success
    });
    
    await usage.save();
  } catch (error) {
    logger.error('记录模型使用情况时出错:', error);
  }
};

// 自动调整模型参数
const autoAdjustParameters = (modelConfig, userPreference = {}, taskType = 'general') => {
  // 创建配置副本以避免修改原始配置
  const adjustedConfig = { ...modelConfig };
  
  // 应用用户偏好设置
  if (userPreference.temperature) {
    adjustedConfig.temperature = userPreference.temperature;
  }
  
  if (userPreference.max_tokens) {
    adjustedConfig.max_tokens = userPreference.max_tokens;
  }
  
  // 根据任务类型调整参数
  switch (taskType) {
    case 'creative_writing':
      // 提高创造性
      adjustedConfig.temperature = Math.min(adjustedConfig.temperature * 1.2, 1.0);
      adjustedConfig.frequency_penalty = 0.2;
      adjustedConfig.presence_penalty = 0.2;
      break;
      
    case 'factual_qa':
      // 提高准确性
      adjustedConfig.temperature = Math.max(adjustedConfig.temperature * 0.7, 0.2);
      adjustedConfig.frequency_penalty = 0;
      adjustedConfig.presence_penalty = 0;
      break;
      
    case 'code_generation':
      // 代码生成优化
      adjustedConfig.temperature = 0.3;
      adjustedConfig.frequency_penalty = 0;
      adjustedConfig.presence_penalty = 0;
      break;
      
    case 'summarization':
      // 摘要优化
      adjustedConfig.temperature = 0.5;
      adjustedConfig.frequency_penalty = 0.3;
      break;
      
    // 可以添加更多任务类型
  }
  
  return adjustedConfig;
};

// 处理API错误并尝试恢复
const handleApiError = async (error, messages, modelConfig, retryCount = 0) => {
  // 记录错误
  logger.error(`API错误 (重试 ${retryCount}): ${error.message}`);
  
  // 最大重试次数
  const MAX_RETRIES = 3;
  
  // 如果已达到最大重试次数，抛出错误
  if (retryCount >= MAX_RETRIES) {
    throw new Error(`达到最大重试次数 (${MAX_RETRIES}): ${error.message}`);
  }
  
  // 根据错误类型决定处理策略
  if (error.response) {
    const status = error.response.status;
    
    // 处理不同的错误状态码
    switch (status) {
      case 429: // 速率限制
        // 等待一段时间后重试
        const waitTime = (retryCount + 1) * 2000; // 递增等待时间
        logger.info(`速率限制，等待 ${waitTime}ms 后重试`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        
        // 如果有备用API密钥，尝试使用
        if (fallbackApiKeys.length > 0) {
          const fallbackKey = fallbackApiKeys[retryCount % fallbackApiKeys.length];
          const newConfig = { ...modelConfig, apiKey: fallbackKey };
          logger.info('使用备用API密钥重试');
          return { config: newConfig, shouldRetry: true };
        }
        
        return { config: modelConfig, shouldRetry: true };
        
      case 400: // 错误请求
        // 可能是参数问题，尝试调整参数
        logger.info('请求参数可能有问题，尝试调整参数');
        const adjustedConfig = { 
          ...modelConfig,
          max_tokens: Math.floor(modelConfig.max_tokens * 0.8), // 减少token数量
          temperature: 0.5 // 使用中等温度
        };
        return { config: adjustedConfig, shouldRetry: true };
        
      case 401: // 未授权
        // API密钥问题
        if (fallbackApiKeys.length > 0) {
          const fallbackKey = fallbackApiKeys[retryCount % fallbackApiKeys.length];
          logger.info('API密钥未授权，尝试使用备用密钥');
          const newConfig = { ...modelConfig, apiKey: fallbackKey };
          return { config: newConfig, shouldRetry: true };
        }
        throw new Error('API密钥未授权，且没有可用的备用密钥');
        
      case 500: // 服务器错误
      case 502: // 网关错误
      case 503: // 服务不可用
        // 服务器问题，等待后重试
        const serverWaitTime = (retryCount + 1) * 3000;
        logger.info(`服务器错误，等待 ${serverWaitTime}ms 后重试`);
        await new Promise(resolve => setTimeout(resolve, serverWaitTime));
        return { config: modelConfig, shouldRetry: true };
        
      default:
        // 其他错误，尝试降级到更简单的模型
        if (modelConfig.model.includes('gpt-4')) {
          logger.info('尝试降级到 GPT-3.5 模型');
          const downgradeConfig = { 
            ...modelConfig, 
            model: 'gpt-3.5-turbo',
            max_tokens: Math.min(modelConfig.max_tokens, 2000)
          };
          return { config: downgradeConfig, shouldRetry: true };
        }
        throw error; // 无法处理的错误
    }
  } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
    // 超时错误
    logger.info('请求超时，尝试简化请求');
    
    // 简化消息以减少处理时间
    const simplifiedMessages = messages.map(msg => {
      if (msg.role === 'user' && msg.content.length > 1000) {
        return {
          role: msg.role,
          content: msg.content.substring(0, 1000) + '...(内容已截断)'
        };
      }
      return msg;
    });
    
    // 减少最大token数并增加超时时间
    const timeoutConfig = {
      ...modelConfig,
      max_tokens: Math.floor(modelConfig.max_tokens * 0.7),
      timeout: modelConfig.timeout * 1.5
    };
    
    return { 
      config: timeoutConfig, 
      messages: simplifiedMessages,
      shouldRetry: true 
    };
  } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNRESET') {
    // 网络连接问题
    const networkWaitTime = (retryCount + 1) * 2000;
    logger.info(`网络连接问题，等待 ${networkWaitTime}ms 后重试`);
    await new Promise(resolve => setTimeout(resolve, networkWaitTime));
    return { config: modelConfig, shouldRetry: true };
  }
  
  // 默认情况，抛出原始错误
  throw error;
};

// 清除缓存
const clearCache = () => {
  responseCache.flushAll();
  logger.info('响应缓存已清除');
};

// 获取缓存统计信息
const getCacheStats = () => {
  return {
    keys: responseCache.keys(),
    stats: responseCache.getStats()
  };
};

module.exports = {
  getLLMConfig,
  selectModelForTask,
  getCachedResponse,
  setCachedResponse,
  logModelUsage,
  autoAdjustParameters,
  handleApiError,
  clearCache,
  getCacheStats
}; 