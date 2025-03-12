const axios = require('axios');
const llmConfig = require('../config/llmConfig');

/**
 * LLM服务类
 * 封装对不同大语言模型的调用
 */
class LLMService {
  /**
   * 获取模型配置
   * @param {string} feature - 功能名称
   * @returns {object} 模型配置
   */
  static getModelConfig(feature) {
    return llmConfig[feature] || llmConfig.default;
  }
  
  /**
   * 调用LLM模型
   * @param {string} feature - 功能名称
   * @param {object} params - 请求参数
   * @returns {Promise<object>} 模型响应
   */
  static async callModel(feature, params) {
    const config = this.getModelConfig(feature);
    let response;
    
    try {
      response = await this._makeRequest(config, params);
    } catch (error) {
      console.error(`Error calling ${config.provider} ${config.model}:`, error);
      
      // 如果有备用模型，尝试使用备用模型
      if (config.fallback) {
        console.log(`Trying fallback model: ${config.fallback.provider} ${config.fallback.model}`);
        response = await this._makeRequest(config.fallback, params);
      } else {
        throw error;
      }
    }
    
    return response;
  }
  
  /**
   * 发送请求到LLM提供商
   * @private
   * @param {object} config - 模型配置
   * @param {object} params - 请求参数
   * @returns {Promise<object>} 模型响应
   */
  static async _makeRequest(config, params) {
    let url, headers, data;
    
    // 根据不同提供商构建请求
    switch (config.provider) {
      case 'openai':
        url = 'https://api.openai.com/v1/chat/completions';
        headers = {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        };
        data = {
          model: config.model,
          messages: params.messages,
          temperature: params.temperature || config.temperature,
          max_tokens: params.max_tokens || config.max_tokens
        };
        break;
        
      case 'anthropic':
        url = 'https://api.anthropic.com/v1/messages';
        headers = {
          'x-api-key': config.apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        };
        data = {
          model: config.model,
          messages: params.messages,
          temperature: params.temperature || config.temperature,
          max_tokens: params.max_tokens || config.max_tokens
        };
        break;
        
      // 可以添加其他提供商的支持
      default:
        throw new Error(`Unsupported provider: ${config.provider}`);
    }
    
    const response = await axios.post(url, data, { headers });
    return this._formatResponse(config.provider, response.data);
  }
  
  /**
   * 格式化不同提供商的响应为统一格式
   * @private
   * @param {string} provider - 提供商名称
   * @param {object} data - 原始响应数据
   * @returns {object} 格式化后的响应
   */
  static _formatResponse(provider, data) {
    switch (provider) {
      case 'openai':
        return {
          content: data.choices[0].message.content,
          model: data.model,
          usage: data.usage
        };
        
      case 'anthropic':
        return {
          content: data.content[0].text,
          model: data.model,
          usage: {
            prompt_tokens: data.usage?.input_tokens || 0,
            completion_tokens: data.usage?.output_tokens || 0,
            total_tokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)
          }
        };
        
      default:
        return data;
    }
  }
}

module.exports = LLMService; 