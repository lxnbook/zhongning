import apiService from './apiService';
import llmService, { LLM_PROVIDERS, TASK_TYPES } from './llmService';

class ModelEvaluationService {
  constructor() {
    this.evaluationResults = {};
    this.benchmarks = {};
  }
  
  // 运行基准测试
  async runBenchmark(taskType, options = {}) {
    try {
      // 获取所有可用的提供商
      const providers = llmService.getAvailableProviders();
      
      if (providers.length === 0) {
        throw new Error('没有可用的LLM提供商');
      }
      
      // 获取基准测试数据
      const benchmarkData = await this.getBenchmarkData(taskType);
      
      // 存储结果
      const results = {};
      
      // 对每个提供商运行测试
      for (const provider of providers) {
        if (options.onProgress) {
          options.onProgress(provider, providers.indexOf(provider), providers.length);
        }
        
        const providerResults = await this.evaluateProvider(provider, taskType, benchmarkData);
        results[provider] = providerResults;
      }
      
      // 计算综合评分
      for (const provider in results) {
        results[provider].overallScore = this.calculateOverallScore(results[provider]);
      }
      
      // 保存结果
      this.evaluationResults[taskType] = results;
      
      // 如果需要，将结果保存到服务器
      if (!options.skipSave) {
        await apiService.post('/llm/evaluation-results', {
          taskType,
          results
        });
      }
      
      return results;
    } catch (error) {
      console.error('Benchmark failed:', error);
      throw error;
    }
  }
  
  // 获取基准测试数据
  async getBenchmarkData(taskType) {
    // 如果已经有缓存的基准数据，直接使用
    if (this.benchmarks[taskType]) {
      return this.benchmarks[taskType];
    }
    
    // 否则从服务器获取
    try {
      const data = await apiService.get(`/llm/benchmarks/${taskType}`);
      this.benchmarks[taskType] = data;
      return data;
    } catch (error) {
      console.error(`Failed to get benchmark data for ${taskType}:`, error);
      
      // 使用默认的基准数据
      return this.getDefaultBenchmarkData(taskType);
    }
  }
  
  // 获取默认的基准测试数据
  getDefaultBenchmarkData(taskType) {
    // 根据任务类型返回默认的基准测试数据
    const defaultBenchmarks = {
      [TASK_TYPES.CONTENT_GENERATION]: [
        { prompt: { subject: '数学', topic: '分数', grade: '小学五年级' }, expectedLength: 500 },
        { prompt: { subject: '语文', topic: '古诗词赏析', grade: '初中' }, expectedLength: 800 }
      ],
      [TASK_TYPES.LESSON_PLANNING]: [
        { prompt: { subject: '物理', topic: '牛顿运动定律', grade: '高中' }, expectedSections: 5 }
      ],
      // 其他任务类型的默认基准数据...
    };
    
    return defaultBenchmarks[taskType] || [];
  }
  
  // 评估单个提供商
  async evaluateProvider(provider, taskType, benchmarkData) {
    const results = {
      accuracy: 0,
      relevance: 0,
      completeness: 0,
      speed: 0,
      reliability: 0,
      samples: []
    };
    
    // 对每个基准样本进行测试
    for (const sample of benchmarkData) {
      const startTime = Date.now();
      
      try {
        // 使用提供商生成内容
        const response = await llmService.sendRequest(
          taskType, 
          sample.prompt, 
          { provider, skipCache: true, noFallback: true }
        );
        
        const endTime = Date.now();
        const timeElapsed = endTime - startTime;
        
        // 评估结果
        const evaluation = this.evaluateSample(response, sample, timeElapsed);
        
        // 添加到样本结果
        results.samples.push({
          prompt: sample.prompt,
          response,
          evaluation
        });
        
        // 更新总体指标
        results.accuracy += evaluation.accuracy;
        results.relevance += evaluation.relevance;
        results.completeness += evaluation.completeness;
        results.speed += evaluation.speed;
        results.reliability += 1; // 成功完成
      } catch (error) {
        console.error(`Evaluation failed for ${provider}:`, error);
        
        // 记录失败
        results.samples.push({
          prompt: sample.prompt,
          error: error.message,
          evaluation: {
            accuracy: 0,
            relevance: 0,
            completeness: 0,
            speed: 0,
            reliability: 0
          }
        });
        
        // 可靠性降低
        results.reliability += 0;
      }
    }
    
    // 计算平均值
    const sampleCount = benchmarkData.length;
    if (sampleCount > 0) {
      results.accuracy /= sampleCount;
      results.relevance /= sampleCount;
      results.completeness /= sampleCount;
      results.speed /= sampleCount;
      results.reliability /= sampleCount;
    }
    
    return results;
  }
  
  // 评估单个样本
  evaluateSample(response, sample, timeElapsed) {
    // 这里是一个简化的评估逻辑，实际应用中可能需要更复杂的评估
    const evaluation = {
      accuracy: 0,
      relevance: 0,
      completeness: 0,
      speed: 0
    };
    
    // 根据响应内容长度评估完整性
    if (sample.expectedLength) {
      const contentLength = typeof response.content === 'string' 
        ? response.content.length 
        : JSON.stringify(response.content).length;
      
      evaluation.completeness = Math.min(contentLength / sample.expectedLength, 1) * 100;
    } else {
      evaluation.completeness = 80; // 默认值
    }
    
    // 根据响应时间评估速度
    // 假设理想响应时间是2秒，超过10秒则为0分
    const idealTime = 2000;
    const maxTime = 10000;
    evaluation.speed = Math.max(0, 100 - (timeElapsed - idealTime) / (maxTime - idealTime) * 100);
    
    // 其他指标需要更复杂的评估，这里使用默认值
    evaluation.accuracy = 80;
    evaluation.relevance = 80;
    
    return evaluation;
  }
  
  // 计算综合评分
  calculateOverallScore(results) {
    // 各指标的权重
    const weights = {
      accuracy: 0.3,
      relevance: 0.25,
      completeness: 0.2,
      speed: 0.1,
      reliability: 0.15
    };
    
    // 计算加权平均分
    let overallScore = 0;
    for (const metric in weights) {
      overallScore += results[metric] * weights[metric];
    }
    
    return overallScore;
  }
  
  // 获取评估结果
  getEvaluationResults(taskType) {
    return this.evaluationResults[taskType] || null;
  }
  
  // 获取所有评估结果
  getAllEvaluationResults() {
    return this.evaluationResults;
  }
  
  // 清除评估结果
  clearEvaluationResults(taskType = null) {
    if (taskType) {
      delete this.evaluationResults[taskType];
    } else {
      this.evaluationResults = {};
    }
  }
}

// 导出单例实例
const modelEvaluationService = new ModelEvaluationService();
export default modelEvaluationService; 