import apiService from './apiService';

class CostControlService {
  constructor() {
    this.usageData = {};
    this.costData = {};
    this.budgets = {};
    this.priceRates = {};
    this.initialized = false;
  }
  
  // 初始化
  async initialize() {
    if (this.initialized) return;
    
    try {
      // 获取价格费率
      const rates = await apiService.get('/llm/price-rates');
      this.priceRates = rates;
      
      // 获取预算设置
      const budgets = await apiService.get('/llm/budgets');
      this.budgets = budgets;
      
      // 获取使用数据
      const usage = await apiService.get('/llm/usage');
      this.usageData = usage;
      
      // 计算成本
      this.calculateCosts();
      
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize cost control service:', error);
      // 使用默认值
      this.initializeDefaults();
      this.initialized = true;
    }
  }
  
  // 使用默认值初始化
  initializeDefaults() {
    // 默认价格费率（每1000个token的价格，单位：元）
    this.priceRates = {
      'openai': { input: 0.5, output: 1.5 },
      'deepseek': { input: 0.3, output: 0.9 },
      'douban': { input: 0.2, output: 0.6 },
      'kimi': { input: 0.25, output: 0.75 },
      'qianwen': { input: 0.2, output: 0.6 }
    };
    
    // 默认预算
    this.budgets = {
      monthly: 1000, // 每月预算（元）
      daily: 50,     // 每日预算（元）
      alerts: {
        monthly: 800, // 月预算警告阈值
        daily: 40     // 日预算警告阈值
      }
    };
    
    // 默认使用数据
    this.usageData = {
      providers: {},
      daily: {},
      monthly: {}
    };
  }
  
  // 记录API调用
  async logApiCall(provider, taskType, inputTokens, outputTokens) {
    await this.initialize();
    
    const timestamp = new Date().toISOString();
    const date = timestamp.split('T')[0];
    const month = date.substring(0, 7); // YYYY-MM
    
    // 更新提供商使用数据
    if (!this.usageData.providers[provider]) {
      this.usageData.providers[provider] = {
        inputTokens: 0,
        outputTokens: 0,
        calls: 0
      };
    }
    
    this.usageData.providers[provider].inputTokens += inputTokens;
    this.usageData.providers[provider].outputTokens += outputTokens;
    this.usageData.providers[provider].calls += 1;
    
    // 更新日使用数据
    if (!this.usageData.daily[date]) {
      this.usageData.daily[date] = {
        inputTokens: 0,
        outputTokens: 0,
        calls: 0,
        providers: {}
      };
    }
    
    this.usageData.daily[date].inputTokens += inputTokens;
    this.usageData.daily[date].outputTokens += outputTokens;
    this.usageData.daily[date].calls += 1;
    
    if (!this.usageData.daily[date].providers[provider]) {
      this.usageData.daily[date].providers[provider] = {
        inputTokens: 0,
        outputTokens: 0,
        calls: 0
      };
    }
    
    this.usageData.daily[date].providers[provider].inputTokens += inputTokens;
    this.usageData.daily[date].providers[provider].outputTokens += outputTokens;
    this.usageData.daily[date].providers[provider].calls += 1;
    
    // 更新月使用数据
    if (!this.usageData.monthly[month]) {
      this.usageData.monthly[month] = {
        inputTokens: 0,
        outputTokens: 0,
        calls: 0,
        providers: {}
      };
    }
    
    this.usageData.monthly[month].inputTokens += inputTokens;
    this.usageData.monthly[month].outputTokens += outputTokens;
    this.usageData.monthly[month].calls += 1;
    
    if (!this.usageData.monthly[month].providers[provider]) {
      this.usageData.monthly[month].providers[provider] = {
        inputTokens: 0,
        outputTokens: 0,
        calls: 0
      };
    }
    
    this.usageData.monthly[month].providers[provider].inputTokens += inputTokens;
    this.usageData.monthly[month].providers[provider].outputTokens += outputTokens;
    this.usageData.monthly[month].providers[provider].calls += 1;
    
    // 计算成本
    this.calculateCosts();
    
    // 检查预算
    this.checkBudget();
    
    // 将使用数据发送到服务器
    try {
      await apiService.post('/llm/log-usage', {
        provider,
        taskType,
        inputTokens,
        outputTokens,
        timestamp
      });
    } catch (error) {
      console.error('Failed to log API usage:', error);
    }
    
    return {
      cost: this.calculateCallCost(provider, inputTokens, outputTokens),
      budgetStatus: this.getBudgetStatus()
    };
  }
  
  // 计算单次调用成本
  calculateCallCost(provider, inputTokens, outputTokens) {
    if (!this.priceRates[provider]) {
      return 0;
    }
    
    const inputCost = (inputTokens / 1000) * this.priceRates[provider].input;
    const outputCost = (outputTokens / 1000) * this.priceRates[provider].output;
    
    return inputCost + outputCost;
  }
  
  // 计算所有成本
  calculateCosts() {
    this.costData = {
      providers: {},
      daily: {},
      monthly: {}
    };
    
    // 计算提供商成本
    for (const provider in this.usageData.providers) {
      const usage = this.usageData.providers[provider];
      
      if (!this.priceRates[provider]) {
        this.costData.providers[provider] = 0;
        continue;
      }
      
      const inputCost = (usage.inputTokens / 1000) * this.priceRates[provider].input;
      const outputCost = (usage.outputTokens / 1000) * this.priceRates[provider].output;
      
      this.costData.providers[provider] = inputCost + outputCost;
    }
    
    // 计算日成本
    for (const date in this.usageData.daily) {
      this.costData.daily[date] = 0;
      
      for (const provider in this.usageData.daily[date].providers) {
        const usage = this.usageData.daily[date].providers[provider];
        
        if (!this.priceRates[provider]) {
          continue;
        }
        
        const inputCost = (usage.inputTokens / 1000) * this.priceRates[provider].input;
        const outputCost = (usage.outputTokens / 1000) * this.priceRates[provider].output;
        
        this.costData.daily[date] += inputCost + outputCost;
      }
    }
    
    // 计算月成本
    for (const month in this.usageData.monthly) {
      this.costData.monthly[month] = 0;
      
      for (const provider in this.usageData.monthly[month].providers) {
        const usage = this.usageData.monthly[month].providers[provider];
        
        if (!this.priceRates[provider]) {
          continue;
        }
        
        const inputCost = (usage.inputTokens / 1000) * this.priceRates[provider].input;
        const outputCost = (usage.outputTokens / 1000) * this.priceRates[provider].output;
        
        this.costData.monthly[month] += inputCost + outputCost;
      }
    }
  }
  
  // 检查预算
  checkBudget() {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = today.substring(0, 7);
    
    const dailyCost = this.costData.daily[today] || 0;
    const monthlyCost = this.costData.monthly[currentMonth] || 0;
    
    const budgetStatus = {
      daily: {
        cost: dailyCost,
        budget: this.budgets.daily,
        percentage: (dailyCost / this.budgets.daily) * 100,
        exceeded: dailyCost > this.budgets.daily,
        warning: dailyCost > this.budgets.alerts.daily
      },
      monthly: {
        cost: monthlyCost,
        budget: this.budgets.monthly,
        percentage: (monthlyCost / this.budgets.monthly) * 100,
        exceeded: monthlyCost > this.budgets.monthly,
        warning: monthlyCost > this.budgets.alerts.monthly
      }
    };
    
    return budgetStatus;
  }
  
  // 获取预算状态
  getBudgetStatus() {
    return this.checkBudget();
  }
  
  // 设置预算
  async setBudget(budgetType, amount) {
    if (budgetType !== 'daily' && budgetType !== 'monthly') {
      throw new Error('Invalid budget type');
    }
    
    this.budgets[budgetType] = amount;
    
    // 更新警告阈值（默认为预算的80%）
    this.budgets.alerts[budgetType] = amount * 0.8;
    
    // 将预算设置发送到服务器
    try {
      await apiService.post('/llm/set-budget', {
        type: budgetType,
        amount
      });
    } catch (error) {
      console.error('Failed to set budget:', error);
      throw error;
    }
  }
  
  // 设置价格费率
  async setPriceRate(provider, inputRate, outputRate) {
    if (!this.priceRates[provider]) {
      this.priceRates[provider] = {};
    }
    
    this.priceRates[provider].input = inputRate;
    this.priceRates[provider].output = outputRate;
    
    // 重新计算成本
    this.calculateCosts();
    
    // 将价格费率发送到服务器
    try {
      await apiService.post('/llm/set-price-rate', {
        provider,
        inputRate,
        outputRate
      });
    } catch (error) {
      console.error('Failed to set price rate:', error);
      throw error;
    }
  }
  
  // 获取使用数据
  getUsageData() {
    return this.usageData;
  }
  
  // 获取成本数据
  getCostData() {
    return this.costData;
  }
  
  // 获取价格费率
  getPriceRates() {
    return this.priceRates;
  }
  
  // 获取预算
  getBudgets() {
    return this.budgets;
  }
  
  // 清除使用数据
  async clearUsageData() {
    this.usageData = {
      providers: {},
      daily: {},
      monthly: {}
    };
    
    this.calculateCosts();
    
    // 将清除请求发送到服务器
    try {
      await apiService.post('/llm/clear-usage');
    } catch (error) {
      console.error('Failed to clear usage data:', error);
      throw error;
    }
  }
}

// 导出单例实例
const costControlService = new CostControlService();
export default costControlService; 