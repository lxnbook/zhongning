const mongoose = require('mongoose');
const logger = require('./logger');

/**
 * 数据库查询优化工具
 * 提供优化的查询方法和性能监控
 */
class DbOptimizer {
  /**
   * 执行优化的分页查询
   * @param {mongoose.Model} model - Mongoose模型
   * @param {Object} query - 查询条件
   * @param {Object} options - 查询选项
   * @param {number} options.page - 页码（从1开始）
   * @param {number} options.limit - 每页数量
   * @param {string} options.sortBy - 排序字段
   * @param {string} options.sortOrder - 排序顺序 ('asc' 或 'desc')
   * @param {string[]} options.select - 要选择的字段
   * @param {string[]} options.populate - 要填充的关联字段
   * @returns {Promise<{data: any[], pagination: Object}>} 查询结果和分页信息
   */
  static async paginatedQuery(model, query = {}, options = {}) {
    const startTime = Date.now();
    
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = '_id',
        sortOrder = 'desc',
        select,
        populate
      } = options;
      
      // 创建查询
      let queryBuilder = model.find(query);
      
      // 应用选择字段
      if (select && select.length > 0) {
        queryBuilder = queryBuilder.select(select.join(' '));
      }
      
      // 应用排序
      const sortDirection = sortOrder.toLowerCase() === 'asc' ? 1 : -1;
      queryBuilder = queryBuilder.sort({ [sortBy]: sortDirection });
      
      // 获取总数（使用countDocuments而不是count以获得更好的性能）
      const total = await model.countDocuments(query).exec();
      
      // 应用分页
      const skip = (page - 1) * limit;
      queryBuilder = queryBuilder.skip(skip).limit(limit);
      
      // 应用填充
      if (populate && populate.length > 0) {
        populate.forEach(field => {
          queryBuilder = queryBuilder.populate(field);
        });
      }
      
      // 执行查询
      const data = await queryBuilder.exec();
      
      // 计算查询时间
      const queryTime = Date.now() - startTime;
      
      // 记录慢查询
      if (queryTime > 500) { // 超过500ms的查询被视为慢查询
        logger.warn('慢查询检测:', {
          model: model.modelName,
          query,
          options,
          queryTime,
          resultCount: data.length
        });
      }
      
      return {
        data,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        },
        meta: {
          queryTime
        }
      };
    } catch (error) {
      logger.error('数据库查询错误:', error);
      throw error;
    }
  }
  
  /**
   * 执行优化的聚合查询
   * @param {mongoose.Model} model - Mongoose模型
   * @param {Array} pipeline - 聚合管道
   * @param {Object} options - 聚合选项
   * @returns {Promise<any[]>} 聚合结果
   */
  static async optimizedAggregate(model, pipeline = [], options = {}) {
    const startTime = Date.now();
    
    try {
      // 添加优化选项
      const aggregateOptions = {
        allowDiskUse: true, // 允许使用磁盘（对于大型聚合）
        ...options
      };
      
      // 执行聚合
      const result = await model.aggregate(pipeline).option(aggregateOptions).exec();
      
      // 计算查询时间
      const queryTime = Date.now() - startTime;
      
      // 记录慢聚合
      if (queryTime > 1000) { // 超过1000ms的聚合被视为慢聚合
        logger.warn('慢聚合检测:', {
          model: model.modelName,
          pipelineLength: pipeline.length,
          queryTime,
          resultCount: result.length
        });
      }
      
      return result;
    } catch (error) {
      logger.error('聚合查询错误:', error);
      throw error;
    }
  }
  
  /**
   * 批量插入数据
   * @param {mongoose.Model} model - Mongoose模型
   * @param {Array} documents - 要插入的文档数组
   * @param {Object} options - 插入选项
   * @returns {Promise<any[]>} 插入的文档
   */
  static async bulkInsert(model, documents = [], options = {}) {
    const startTime = Date.now();
    
    try {
      // 使用insertMany进行批量插入
      const result = await model.insertMany(documents, {
        ordered: false, // 非顺序插入，提高性能
        ...options
      });
      
      // 计算操作时间
      const operationTime = Date.now() - startTime;
      
      logger.info('批量插入完成:', {
        model: model.modelName,
        count: documents.length,
        operationTime
      });
      
      return result;
    } catch (error) {
      logger.error('批量插入错误:', error);
      throw error;
    }
  }
  
  /**
   * 批量更新数据
   * @param {mongoose.Model} model - Mongoose模型
   * @param {Array<{filter: Object, update: Object}>} operations - 更新操作数组
   * @returns {Promise<Object>} 更新结果
   */
  static async bulkUpdate(model, operations = []) {
    const startTime = Date.now();
    
    try {
      // 创建批量写入操作
      const bulkOps = operations.map(op => ({
        updateOne: {
          filter: op.filter,
          update: op.update,
          upsert: op.upsert || false
        }
      }));
      
      // 执行批量操作
      const result = await model.bulkWrite(bulkOps);
      
      // 计算操作时间
      const operationTime = Date.now() - startTime;
      
      logger.info('批量更新完成:', {
        model: model.modelName,
        count: operations.length,
        operationTime,
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
      });
      
      return result;
    } catch (error) {
      logger.error('批量更新错误:', error);
      throw error;
    }
  }
  
  /**
   * 创建或更新索引
   * @param {mongoose.Model} model - Mongoose模型
   * @param {Object} indexSpec - 索引规范
   * @param {Object} options - 索引选项
   * @returns {Promise<string>} 索引名称
   */
  static async ensureIndex(model, indexSpec, options = {}) {
    try {
      const result = await model.collection.createIndex(indexSpec, options);
      logger.info('索引创建/更新成功:', {
        model: model.modelName,
        index: indexSpec,
        result
      });
      return result;
    } catch (error) {
      logger.error('索引创建/更新错误:', error);
      throw error;
    }
  }
  
  /**
   * 获取集合统计信息
   * @param {mongoose.Model} model - Mongoose模型
   * @returns {Promise<Object>} 集合统计信息
   */
  static async getCollectionStats(model) {
    try {
      const stats = await model.collection.stats();
      return stats;
    } catch (error) {
      logger.error('获取集合统计信息错误:', error);
      throw error;
    }
  }
}

module.exports = DbOptimizer; 