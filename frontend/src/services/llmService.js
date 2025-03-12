import apiService from './apiService';
import streamService from './streamService';

// LLM提供商配置
const LLM_PROVIDERS = {
  OPENAI: 'openai',
  DEEPSEEK: 'deepseek',
  DOUBAN: 'douban', // 豆包
  KIMI: 'kimi',
  QIANWEN: 'qianwen', // 千问
  BAIDU: 'baidu',
  GOOGLE: 'google',
  ANTHROPIC: 'anthropic',
  HUNYUAN: 'hunyuan', // 腾讯混元
  ZHIPU: 'zhipu', // 智谱AI
  MINIMAX: 'minimax'
};

// 不同任务类型
const TASK_TYPES = {
  CONTENT_GENERATION: 'content_generation',
  LESSON_PLANNING: 'lesson_planning',
  ASSESSMENT_CREATION: 'assessment_creation',
  FEEDBACK_ANALYSIS: 'feedback_analysis',
  STUDENT_EVALUATION: 'student_evaluation',
  QUESTION_ANSWERING: 'question_answering',
  SUMMARIZATION: 'summarization',
  TRANSLATION: 'translation',
  CODE_GENERATION: 'code_generation',
  CREATIVE_WRITING: 'creative_writing'
};

class LLMService {
  constructor() {
    this.defaultProvider = null;
    this.providerConfigs = {};
    this.taskProviderMapping = {};
    this.initialized = false;
    this.providerErrorCounts = {};
    
    // 缓存相关
    this.cache = new Map();
    this.cacheEnabled = true;
    this.cacheTTL = 30 * 60 * 1000; // 缓存有效期（30分钟）
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      // 从后端获取LLM配置
      const config = await apiService.get('/settings/llm-config');
      
      this.defaultProvider = config.defaultProvider;
      this.providerConfigs = config.providers || {};
      this.taskProviderMapping = config.taskMapping || {};
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize LLM service:', error);
      // 使用默认配置
      this.defaultProvider = LLM_PROVIDERS.OPENAI;
      this.providerConfigs = {
        [LLM_PROVIDERS.OPENAI]: { enabled: true }
      };
      this.initialized = true;
    }
  }

  // 获取特定任务的最佳提供商
  getProviderForTask(taskType) {
    if (!this.initialized) {
      throw new Error('LLM service not initialized');
    }
    
    // 检查任务是否有指定的提供商
    const provider = this.taskProviderMapping[taskType];
    
    // 如果有指定提供商且该提供商已启用，则使用它
    if (provider && this.providerConfigs[provider]?.enabled) {
      return provider;
    }
    
    // 否则使用默认提供商
    return this.defaultProvider;
  }

  // 发送请求到LLM
  async sendRequest(taskType, prompt, options = {}) {
    await this.initialize();
    
    const provider = options.provider || this.getProviderForTask(taskType);
    
    if (!provider || !this.providerConfigs[provider]?.enabled) {
      throw new Error(`Provider ${provider} is not available`);
    }
    
    // 如果没有禁用缓存，尝试从缓存获取结果
    if (!options.skipCache) {
      const cachedResult = this.getCachedResult(taskType, prompt, provider);
      if (cachedResult) {
        console.log(`Using cached result for ${provider}:${taskType}`);
        return cachedResult;
      }
    }
    
    try {
      // 发送请求到后端，后端将处理与不同LLM API的通信
      const response = await apiService.post('/llm/generate', {
        provider,
        taskType,
        prompt,
        options
      });
      
      // 缓存结果
      if (!options.skipCache) {
        this.setCachedResult(taskType, prompt, provider, response);
      }
      
      return response;
    } catch (error) {
      console.error(`Error with LLM request (${provider}):`, error);
      throw error;
    }
  }

  // 带回退的请求方法
  async sendRequestWithFallback(taskType, prompt, options = {}) {
    await this.initialize();
    
    // 获取主要提供商
    const primaryProvider = options.provider || this.getProviderForTask(taskType);
    
    // 尝试使用主要提供商
    try {
      return await this.sendRequest(taskType, prompt, { ...options, provider: primaryProvider });
    } catch (primaryError) {
      console.error(`Error with primary provider ${primaryProvider}:`, primaryError);
      
      // 记录错误详情
      this.logProviderError(primaryProvider, taskType, primaryError);
      
      // 如果指定了不使用回退，则直接抛出错误
      if (options.noFallback) {
        throw primaryError;
      }
      
      // 获取可用的回退提供商（排除主要提供商）
      const fallbackProviders = this.getAvailableProviders()
        .filter(p => p !== primaryProvider);
      
      if (fallbackProviders.length === 0) {
        throw new Error(`主要提供商 ${primaryProvider} 失败，且没有可用的回退提供商`);
      }
      
      // 尝试回退提供商
      for (const fallbackProvider of fallbackProviders) {
        try {
          // 通知用户正在使用回退提供商
          if (options.onFallback) {
            options.onFallback(primaryProvider, fallbackProvider, primaryError);
          }
          
          return await this.sendRequest(taskType, prompt, { ...options, provider: fallbackProvider });
        } catch (fallbackError) {
          console.error(`Fallback provider ${fallbackProvider} also failed:`, fallbackError);
          this.logProviderError(fallbackProvider, taskType, fallbackError);
          // 继续尝试下一个回退提供商
        }
      }
      
      // 所有回退都失败了
      throw new Error(`所有提供商都失败了。主要错误: ${primaryError.message}`);
    }
  }

  // 记录提供商错误
  logProviderError(provider, taskType, error) {
    // 存储错误信息
    const errorLog = {
      provider,
      taskType,
      timestamp: new Date().toISOString(),
      message: error.message,
      details: error.details || {},
      stack: error.stack
    };
    
    // 可以将错误日志发送到服务器或存储在本地
    console.error('LLM Provider Error:', errorLog);
    
    // 如果需要，可以将错误信息发送到后端进行记录
    try {
      apiService.post('/llm/error-log', errorLog).catch(e => {
        console.error('Failed to log LLM error to server:', e);
      });
    } catch (e) {
      console.error('Failed to send error log:', e);
    }
    
    // 更新提供商状态
    if (!this.providerErrorCounts) {
      this.providerErrorCounts = {};
    }
    
    if (!this.providerErrorCounts[provider]) {
      this.providerErrorCounts[provider] = 0;
    }
    
    this.providerErrorCounts[provider]++;
  }

  // 获取错误统计
  getProviderErrorStats() {
    return this.providerErrorCounts || {};
  }

  // 重置错误计数
  resetErrorStats(provider = null) {
    if (provider) {
      if (this.providerErrorCounts) {
        this.providerErrorCounts[provider] = 0;
      }
    } else {
      this.providerErrorCounts = {};
    }
  }

  // 生成教学内容
  async generateContent(prompt, options = {}) {
    return this.sendRequestWithFallback(TASK_TYPES.CONTENT_GENERATION, prompt, options);
  }

  // 生成课程计划
  async generateLessonPlan(prompt, options = {}) {
    return this.sendRequestWithFallback(TASK_TYPES.LESSON_PLANNING, prompt, options);
  }

  // 生成评估内容
  async generateAssessment(prompt, options = {}) {
    return this.sendRequestWithFallback(TASK_TYPES.ASSESSMENT_CREATION, prompt, options);
  }

  // 分析学生反馈
  async analyzeFeedback(feedback, options = {}) {
    return this.sendRequestWithFallback(TASK_TYPES.FEEDBACK_ANALYSIS, feedback, options);
  }

  // 评估学生作业
  async evaluateStudentWork(work, criteria, options = {}) {
    const prompt = {
      work,
      criteria
    };
    return this.sendRequestWithFallback(TASK_TYPES.STUDENT_EVALUATION, prompt, options);
  }

  // 回答问题
  async answerQuestion(question, context = null, options = {}) {
    const prompt = {
      question,
      context
    };
    return this.sendRequestWithFallback(TASK_TYPES.QUESTION_ANSWERING, prompt, options);
  }

  // 获取可用的LLM提供商列表
  getAvailableProviders() {
    return Object.keys(this.providerConfigs)
      .filter(key => this.providerConfigs[key].enabled);
  }

  // 获取所有任务类型
  getAllTaskTypes() {
    return Object.values(TASK_TYPES);
  }

  // 生成缓存键
  generateCacheKey(taskType, prompt, provider) {
    // 将对象转换为排序后的JSON字符串，确保相同内容生成相同的键
    const promptStr = typeof prompt === 'object' 
      ? JSON.stringify(prompt, Object.keys(prompt).sort()) 
      : String(prompt);
    
    return `${provider}:${taskType}:${promptStr}`;
  }

  // 从缓存获取结果
  getCachedResult(taskType, prompt, provider) {
    if (!this.cacheEnabled) return null;
    
    const cacheKey = this.generateCacheKey(taskType, prompt, provider);
    const cachedItem = this.cache.get(cacheKey);
    
    if (!cachedItem) return null;
    
    // 检查缓存是否过期
    if (Date.now() - cachedItem.timestamp > this.cacheTTL) {
      this.cache.delete(cacheKey);
      return null;
    }
    
    return cachedItem.result;
  }

  // 将结果存入缓存
  setCachedResult(taskType, prompt, provider, result) {
    if (!this.cacheEnabled) return;
    
    const cacheKey = this.generateCacheKey(taskType, prompt, provider);
    this.cache.set(cacheKey, {
      result,
      timestamp: Date.now()
    });
  }

  // 清除缓存
  clearCache(taskType = null, provider = null) {
    if (!taskType && !provider) {
      // 清除所有缓存
      this.cache.clear();
      return;
    }
    
    // 清除特定任务类型或提供商的缓存
    for (const key of this.cache.keys()) {
      const [keyProvider, keyTaskType] = key.split(':');
      
      if ((provider && keyProvider === provider) || 
          (taskType && keyTaskType === taskType)) {
        this.cache.delete(key);
      }
    }
  }

  // 设置缓存开关
  setCacheEnabled(enabled) {
    this.cacheEnabled = enabled;
  }

  // 设置缓存有效期
  setCacheTTL(ttlInMilliseconds) {
    this.cacheTTL = ttlInMilliseconds;
  }

  // 获取缓存统计信息
  getCacheStats() {
    return {
      enabled: this.cacheEnabled,
      size: this.cache.size,
      ttl: this.cacheTTL
    };
  }

  // 发送流式请求
  async sendStreamRequest(taskType, prompt, options = {}) {
    await this.initialize();
    
    const provider = options.provider || this.getProviderForTask(taskType);
    
    if (!provider || !this.providerConfigs[provider]?.enabled) {
      throw new Error(`Provider ${provider} is not available`);
    }
    
    // 使用 streamService 创建流
    return streamService.createStream(provider, taskType, prompt, options);
  }

  // 生成流式内容
  async generateStreamContent(prompt, options = {}) {
    return this.sendStreamRequest(TASK_TYPES.CONTENT_GENERATION, prompt, options);
  }

  // 生成流式课程计划
  async generateStreamLessonPlan(prompt, options = {}) {
    return this.sendStreamRequest(TASK_TYPES.LESSON_PLANNING, prompt, options);
  }

  // 生成流式评估内容
  async generateStreamAssessment(prompt, options = {}) {
    return this.sendStreamRequest(TASK_TYPES.ASSESSMENT_CREATION, prompt, options);
  }

  // 流式回答问题
  async answerStreamQuestion(question, context = null, options = {}) {
    const prompt = {
      question,
      context
    };
    return this.sendStreamRequest(TASK_TYPES.QUESTION_ANSWERING, prompt, options);
  }
}

// 导出单例实例
const llmService = new LLMService();
export default llmService;

// 导出常量供其他组件使用
export { LLM_PROVIDERS, TASK_TYPES }; 