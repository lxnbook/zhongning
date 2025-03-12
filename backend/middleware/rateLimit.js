const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');
const logger = require('../utils/logger');

// 创建Redis客户端（如果配置了Redis）
let redisClient;
try {
  if (process.env.REDIS_URL) {
    redisClient = new Redis(process.env.REDIS_URL);
    logger.info('Redis连接已建立，用于速率限制');
  }
} catch (error) {
  logger.error('Redis连接失败:', error);
}

// 创建存储
const createLimiterStore = () => {
  if (redisClient) {
    return new RedisStore({
      // @ts-expect-error - Known issue: the typings are outdated
      sendCommand: (...args) => redisClient.call(...args),
      prefix: 'rl:'
    });
  }
  return undefined; // 使用默认的内存存储
};

// 通用API限制器
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个IP每15分钟最多100个请求
  standardHeaders: true,
  legacyHeaders: false,
  store: createLimiterStore(),
  message: {
    error: '请求过于频繁，请稍后再试',
    retryAfter: '15分钟'
  },
  skip: (req) => {
    // 跳过内部请求或特定路径
    return req.ip === '127.0.0.1' || req.path.startsWith('/api/health');
  }
});

// AI请求限制器（更严格）
const aiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5分钟
  max: 20, // 每个IP每5分钟最多20个AI请求
  standardHeaders: true,
  legacyHeaders: false,
  store: createLimiterStore(),
  message: {
    error: 'AI请求过于频繁，请稍后再试',
    retryAfter: '5分钟'
  },
  keyGenerator: (req) => {
    // 使用用户ID作为键（如果已认证）
    return req.user ? req.user.id : req.ip;
  }
});

// 登录限制器（防止暴力破解）
const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1小时
  max: 10, // 每个IP每小时最多10次失败的登录尝试
  standardHeaders: true,
  legacyHeaders: false,
  store: createLimiterStore(),
  message: {
    error: '登录尝试过多，请稍后再试',
    retryAfter: '1小时'
  },
  skipSuccessfulRequests: true // 成功的请求不计入限制
});

module.exports = {
  apiLimiter,
  aiLimiter,
  loginLimiter
}; 