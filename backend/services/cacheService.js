/**
 * 缓存服务
 * 提供内存缓存和Redis缓存的统一接口
 */
const NodeCache = require('node-cache');
const Redis = require('ioredis');
const logger = require('../utils/logger');

// 创建内存缓存实例
const memoryCache = new NodeCache({
  stdTTL: 600, // 默认缓存时间10分钟
  checkperiod: 120, // 每2分钟检查过期的缓存
  useClones: false // 不克隆对象，提高性能
});

// Redis客户端
let redisClient = null;

// 初始化Redis客户端
try {
  if (process.env.REDIS_URL) {
    redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });
    
    redisClient.on('error', (err) => {
      logger.error('Redis连接错误:', err);
      // 如果Redis连接失败，回退到内存缓存
      redisClient = null;
    });
    
    redisClient.on('connect', () => {
      logger.info('Redis连接成功');
    });
  }
} catch (error) {
  logger.error('Redis初始化错误:', error);
  redisClient = null;
}

/**
 * 缓存服务
 */
const cacheService = {
  /**
   * 设置缓存
   * @param {string} key - 缓存键
   * @param {any} value - 缓存值
   * @param {Object} options - 缓存选项
   * @param {number} options.ttl - 过期时间（秒）
   * @returns {Promise<boolean>} 是否成功
   */
  async set(key, value, options = {}) {
    try {
      const ttl = options.ttl || 600; // 默认10分钟
      
      // 如果Redis可用，优先使用Redis
      if (redisClient) {
        const serializedValue = JSON.stringify(value);
        await redisClient.set(key, serializedValue, 'EX', ttl);
      } else {
        // 否则使用内存缓存
        memoryCache.set(key, value, ttl);
      }
      
      return true;
    } catch (error) {
      logger.error('缓存设置错误:', error);
      // 出错时回退到内存缓存
      memoryCache.set(key, value, options.ttl || 600);
      return false;
    }
  },
  
  /**
   * 获取缓存
   * @param {string} key - 缓存键
   * @returns {Promise<any>} 缓存值，不存在则返回null
   */
  async get(key) {
    try {
      // 如果Redis可用，优先使用Redis
      if (redisClient) {
        const value = await redisClient.get(key);
        if (value === null) return null;
        return JSON.parse(value);
      } else {
        // 否则使用内存缓存
        return memoryCache.get(key);
      }
    } catch (error) {
      logger.error('缓存获取错误:', error);
      // 出错时回退到内存缓存
      return memoryCache.get(key);
    }
  },
  
  /**
   * 删除缓存
   * @param {string} key - 缓存键
   * @returns {Promise<boolean>} 是否成功
   */
  async del(key) {
    try {
      // 如果Redis可用，优先使用Redis
      if (redisClient) {
        await redisClient.del(key);
      }
      
      // 同时也从内存缓存中删除
      memoryCache.del(key);
      
      return true;
    } catch (error) {
      logger.error('缓存删除错误:', error);
      // 出错时至少尝试从内存缓存中删除
      memoryCache.del(key);
      return false;
    }
  },
  
  /**
   * 清空所有缓存
   * @returns {Promise<boolean>} 是否成功
   */
  async flush() {
    try {
      // 如果Redis可用，清空Redis
      if (redisClient) {
        await redisClient.flushdb();
      }
      
      // 清空内存缓存
      memoryCache.flushAll();
      
      return true;
    } catch (error) {
      logger.error('缓存清空错误:', error);
      // 出错时至少尝试清空内存缓存
      memoryCache.flushAll();
      return false;
    }
  },
  
  /**
   * 获取缓存统计信息
   * @returns {Promise<Object>} 统计信息
   */
  async getStats() {
    const stats = {
      memory: memoryCache.getStats(),
      redis: null,
      provider: redisClient ? 'redis' : 'memory'
    };
    
    if (redisClient) {
      try {
        const info = await redisClient.info();
        const keyspace = await redisClient.info('keyspace');
        stats.redis = { info, keyspace };
      } catch (error) {
        logger.error('获取Redis统计信息错误:', error);
      }
    }
    
    return stats;
  },
  
  /**
   * 检查键是否存在
   * @param {string} key - 缓存键
   * @returns {Promise<boolean>} 是否存在
   */
  async exists(key) {
    try {
      // 如果Redis可用，优先使用Redis
      if (redisClient) {
        const exists = await redisClient.exists(key);
        return exists === 1;
      } else {
        // 否则使用内存缓存
        return memoryCache.has(key);
      }
    } catch (error) {
      logger.error('缓存检查错误:', error);
      // 出错时回退到内存缓存
      return memoryCache.has(key);
    }
  },
  
  /**
   * 设置缓存过期时间
   * @param {string} key - 缓存键
   * @param {number} ttl - 过期时间（秒）
   * @returns {Promise<boolean>} 是否成功
   */
  async expire(key, ttl) {
    try {
      // 如果Redis可用，优先使用Redis
      if (redisClient) {
        await redisClient.expire(key, ttl);
      }
      
      // 对于内存缓存，需要先获取值然后重新设置
      const value = memoryCache.get(key);
      if (value !== undefined) {
        memoryCache.set(key, value, ttl);
      }
      
      return true;
    } catch (error) {
      logger.error('设置缓存过期时间错误:', error);
      return false;
    }
  },
  
  /**
   * 获取缓存剩余过期时间
   * @param {string} key - 缓存键
   * @returns {Promise<number>} 剩余时间（秒），-1表示永不过期，-2表示不存在
   */
  async ttl(key) {
    try {
      // 如果Redis可用，优先使用Redis
      if (redisClient) {
        return await redisClient.ttl(key);
      } else {
        // 内存缓存不支持直接获取TTL，返回-1
        return memoryCache.has(key) ? -1 : -2;
      }
    } catch (error) {
      logger.error('获取缓存过期时间错误:', error);
      return -2;
    }
  }
};

module.exports = cacheService; 