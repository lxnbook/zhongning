const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const LearningPath = require('../models/LearningPath');
const LearningPathProgress = require('../models/LearningPathProgress');
const Resource = require('../models/Resource');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { getLLMConfig, selectModelForTask } = require('../config/llmConfig');
const { Configuration, OpenAIApi } = require('openai');
const logger = require('../utils/logger');
const DbOptimizer = require('../utils/dbOptimizer');
const cacheService = require('../services/cacheService');
const { aiLimiter } = require('../middleware/rateLimit');
const { learningPathValidationRules, checkValidationResult } = require('../middleware/validator');

// 初始化 OpenAI
const initializeOpenAI = () => {
  const config = getLLMConfig();
  const configuration = new Configuration({
    apiKey: config.apiKey,
  });
  return new OpenAIApi(configuration);
};

// 获取用户的所有学习路径 - 优化版本
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, subject, search, sort = 'updatedAt', order = 'desc', page = 1, limit = 20 } = req.query;
    
    // 构建缓存键
    const cacheKey = `learningPaths:${userId}:${status || ''}:${subject || ''}:${search || ''}:${sort}:${order}:${page}:${limit}`;
    
    // 尝试从缓存获取
    const cachedResult = await cacheService.get(cacheKey);
    if (cachedResult) {
      return res.json(cachedResult);
    }
    
    // 构建查询条件
    const query = {
      $or: [
        { createdBy: userId },
        { sharedWith: userId },
        { isPublic: true }
      ]
    };
    
    // 添加状态过滤
    if (status) {
      query.status = status;
    }
    
    // 添加学科过滤
    if (subject) {
      query.subject = subject;
    }
    
    // 添加搜索过滤
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }
    
    // 使用优化的分页查询
    const result = await DbOptimizer.paginatedQuery(LearningPath, query, {
      page,
      limit,
      sortBy: sort,
      sortOrder: order,
      populate: ['createdBy'],
      select: ['title', 'description', 'subject', 'targetAudience', 'difficulty', 'tags', 'isPublic', 'status', 'createdBy', 'createdAt', 'updatedAt']
    });
    
    // 获取每个学习路径的进度
    const pathsWithProgress = await Promise.all(
      result.data.map(async (path) => {
        // 为每个路径单独创建缓存键
        const progressCacheKey = `learningPathProgress:${userId}:${path._id}`;
        
        // 尝试从缓存获取进度
        let progress = await cacheService.get(progressCacheKey);
        
        if (!progress) {
          // 如果缓存未命中，从数据库获取
          const progressData = await LearningPathProgress.findOne({
            userId,
            pathId: path._id
          });
          
          progress = progressData ? {
            completedNodes: progressData.completedNodes,
            currentNode: progressData.currentNode,
            overallProgress: progressData.overallProgress,
            lastActivity: progressData.lastActivity
          } : null;
          
          // 缓存进度数据（10分钟）
          if (progress) {
            await cacheService.set(progressCacheKey, progress, { ttl: 600 });
          }
        }
        
        return {
          ...path.toObject(),
          id: path._id.toString(), // 确保ID字段一致性
          progress
        };
      })
    );
    
    const response = {
      paths: pathsWithProgress,
      pagination: result.pagination,
      meta: result.meta
    };
    
    // 缓存结果（5分钟）
    await cacheService.set(cacheKey, response, { ttl: 300 });
    
    res.json(response);
  } catch (error) {
    logger.error('获取学习路径错误:', error);
    res.status(500).json({ error: '获取学习路径失败', details: error.message });
  }
});

// 获取单个学习路径详情 - 优化版本
router.get('/:id', auth, async (req, res) => {
  try {
    const pathId = req.params.id;
    const userId = req.user.id;
    
    // 构建缓存键
    const cacheKey = `learningPath:${pathId}:${userId}`;
    
    // 尝试从缓存获取
    const cachedResult = await cacheService.get(cacheKey);
    if (cachedResult) {
      return res.json(cachedResult);
    }
    
    // 获取学习路径
    const learningPath = await LearningPath.findById(pathId)
      .populate('createdBy', 'name avatar')
      .populate('nodes.resources')
      .lean();
    
    if (!learningPath) {
      return res.status(404).json({ error: '学习路径不存在' });
    }
    
    // 检查访问权限
    const canAccess = 
      learningPath.createdBy._id.toString() === userId ||
      learningPath.sharedWith.includes(userId) ||
      learningPath.isPublic;
    
    if (!canAccess) {
      return res.status(403).json({ error: '没有权限访问此学习路径' });
    }
    
    // 获取学习进度
    const progress = await LearningPathProgress.findOne({
      userId,
      pathId
    });
    
    // 获取推荐资源
    const recommendedResources = await getRecommendedResources(userId, learningPath);
    
    // 确保ID字段一致性
    const response = {
      ...learningPath,
      id: learningPath._id.toString(),
      progress: progress ? {
        completedNodes: progress.completedNodes,
        currentNode: progress.currentNode,
        overallProgress: progress.overallProgress,
        lastActivity: progress.lastActivity,
        assessmentResults: progress.assessmentResults
      } : null,
      recommendedResources: recommendedResources.map(resource => ({
        ...resource,
        id: resource._id.toString()
      }))
    };
    
    // 缓存结果（10分钟）
    await cacheService.set(cacheKey, response, { ttl: 600 });
    
    res.json(response);
  } catch (error) {
    logger.error('获取学习路径详情错误:', error);
    res.status(500).json({ error: '获取学习路径详情失败', details: error.message });
  }
});

// 创建学习路径 - 添加验证
router.post('/', 
  auth, 
  learningPathValidationRules.create, 
  checkValidationResult, 
  async (req, res) => {
    try {
      const { title, description, subject, targetAudience, difficulty, nodes, isPublic, tags } = req.body;
      const userId = req.user.id;
      
      // 创建学习路径
      const learningPath = new LearningPath({
        title,
        description,
        subject,
        targetAudience,
        difficulty,
        nodes: nodes || [],
        isPublic: isPublic || false,
        tags: tags || [],
        createdBy: userId,
        status: 'active'
      });
      
      await learningPath.save();
      
      // 清除用户学习路径缓存
      await cacheService.del(`learningPaths:${userId}:*`);
      
      res.status(201).json({
        ...learningPath.toObject(),
        id: learningPath._id.toString() // 确保ID字段一致性
      });
    } catch (error) {
      logger.error('创建学习路径错误:', error);
      res.status(500).json({ error: '创建学习路径失败', details: error.message });
    }
  }
);

// 生成AI学习路径 - 添加速率限制
router.post('/generate', 
  auth, 
  aiLimiter, 
  async (req, res) => {
    try {
      const { topic, subject, difficulty, targetAudience } = req.body;
      const userId = req.user.id;
      
      // 验证必要参数
      if (!topic || !subject) {
        return res.status(400).json({ error: '主题和学科是必需的' });
      }
      
      // 构建缓存键
      const cacheKey = `aiLearningPath:${topic}:${subject}:${difficulty || 'medium'}:${targetAudience || 'general'}`;
      
      // 尝试从缓存获取
      const cachedResult = await cacheService.get(cacheKey);
      if (cachedResult) {
        // 创建新的学习路径实例，但使用缓存的内容
        const learningPath = new LearningPath({
          ...cachedResult,
          createdBy: userId,
          isPublic: false,
          status: 'active'
        });
        
        await learningPath.save();
        
        // 创建初始进度
        const progress = new LearningPathProgress({
          userId,
          pathId: learningPath._id,
          completedNodes: [],
          currentNode: learningPath.nodes[0]?._id || null,
          overallProgress: 0,
          lastActivity: Date.now(),
          assessmentResults: []
        });
        
        await progress.save();
        
        // 清除用户学习路径缓存
        await cacheService.del(`learningPaths:${userId}:*`);
        
        return res.status(201).json({
          learningPath: {
            ...learningPath.toObject(),
            id: learningPath._id.toString() // 确保ID字段一致性
          },
          progress,
          message: 'AI学习路径已成功生成（来自缓存）'
        });
      }
      
      // 如果缓存未命中，生成新的学习路径
      // 选择合适的模型
      const modelConfig = selectModelForTask('medium', 'education', false, {
        taskType: 'educational_content'
      });
      
      // 初始化 OpenAI
      const openai = initializeOpenAI();
      
      // 构建提示词
      const prompt = `请为主题"${topic}"设计一个完整的学习路径，学科领域是${subject}。
      
难度级别：${difficulty || '中等'}
目标受众：${targetAudience || '一般学习者'}

请提供以下内容：
1. 学习路径标题
2. 详细描述
3. 5-10个学习节点，每个节点包含：
   - 标题
   - 描述
   - 3-5个关键点
   - 预计学习时间（小时）
   - 2-3个资源建议（书籍、文章、视频等）
   - 2-3个练习或作业

请以JSON格式返回，结构如下：
{
  "title": "学习路径标题",
  "description": "详细描述",
  "subject": "${subject}",
  "targetAudience": "${targetAudience || '一般学习者'}",
  "difficulty": "${difficulty || '中等'}",
  "tags": ["相关标签"],
  "nodes": [
    {
      "title": "节点标题",
      "description": "节点描述",
      "keyPoints": ["关键点1", "关键点2", "关键点3"],
      "estimatedTime": 预计小时数,
      "resourceSuggestions": ["资源1", "资源2"],
      "exercises": ["练习1", "练习2"]
    }
  ]
}`;
      
      // 发送请求到 OpenAI
      const completion = await openai.createChatCompletion({
        model: modelConfig.model,
        messages: [
          { role: 'system', content: '你是一个专业的教育课程设计专家，擅长创建结构化的学习路径。' },
          { role: 'user', content: prompt }
        ],
        temperature: modelConfig.temperature,
        max_tokens: modelConfig.max_tokens,
        top_p: modelConfig.top_p,
        frequency_penalty: modelConfig.frequency_penalty,
        presence_penalty: modelConfig.presence_penalty
      });
      
      // 解析响应
      const aiResponse = completion.data.choices[0].message.content;
      let pathData;
      
      try {
        // 尝试解析JSON响应
        pathData = JSON.parse(aiResponse);
      } catch (error) {
        logger.error('AI响应解析错误:', error);
        return res.status(500).json({ 
          error: 'AI生成的学习路径格式无效', 
          details: '请重试或调整您的请求' 
        });
      }
      
      // 验证和清理数据
      if (!pathData.title || !pathData.description || !Array.isArray(pathData.nodes)) {
        return res.status(500).json({ 
          error: 'AI生成的学习路径数据不完整', 
          details: '请重试或调整您的请求' 
        });
      }
      
      // 处理节点数据
      const processedNodes = pathData.nodes.map((node, index) => ({
        title: node.title,
        description: node.description || '',
        keyPoints: Array.isArray(node.keyPoints) ? node.keyPoints : [],
        estimatedTime: typeof node.estimatedTime === 'number' ? node.estimatedTime : 1,
        resourceSuggestions: Array.isArray(node.resourceSuggestions) ? node.resourceSuggestions : [],
        exercises: Array.isArray(node.exercises) ? node.exercises : [],
        order: index + 1
      }));
      
      // 创建学习路径
      const learningPath = new LearningPath({
        title: pathData.title,
        description: pathData.description,
        subject: pathData.subject || subject,
        targetAudience: pathData.targetAudience || targetAudience || '一般学习者',
        difficulty: pathData.difficulty || difficulty || '中等',
        tags: Array.isArray(pathData.tags) ? pathData.tags : [topic, subject],
        nodes: processedNodes,
        createdBy: userId,
        isPublic: false,
        status: 'active',
        aiGenerated: true
      });
      
      await learningPath.save();
      
      // 创建初始进度
      const progress = new LearningPathProgress({
        userId,
        pathId: learningPath._id,
        completedNodes: [],
        currentNode: learningPath.nodes[0]?._id || null,
        overallProgress: 0,
        lastActivity: Date.now(),
        assessmentResults: []
      });
      
      await progress.save();
      
      // 缓存AI生成的学习路径（1天）
      await cacheService.set(cacheKey, {
        title: pathData.title,
        description: pathData.description,
        subject: pathData.subject || subject,
        targetAudience: pathData.targetAudience || targetAudience || '一般学习者',
        difficulty: pathData.difficulty || difficulty || '中等',
        tags: Array.isArray(pathData.tags) ? pathData.tags : [topic, subject],
        nodes: processedNodes,
        aiGenerated: true
      }, { ttl: 86400 });
      
      // 清除用户学习路径缓存
      await cacheService.del(`learningPaths:${userId}:*`);
      
      res.status(201).json({
        learningPath: {
          ...learningPath.toObject(),
          id: learningPath._id.toString() // 确保ID字段一致性
        },
        progress,
        message: 'AI学习路径已成功生成'
      });
    } catch (error) {
      logger.error('生成AI学习路径错误:', error);
      res.status(500).json({ error: '生成AI学习路径失败', details: error.message });
    }
  }
);

// 更新学习路径 - 添加验证
router.put('/:id', 
  auth, 
  learningPathValidationRules.update, 
  checkValidationResult, 
  async (req, res) => {
    try {
      const pathId = req.params.id;
      const userId = req.user.id;
      const updateData = req.body;
      
      // 查找学习路径
      const learningPath = await LearningPath.findById(pathId);
      
      if (!learningPath) {
        return res.status(404).json({ error: '学习路径不存在' });
      }
      
      // 检查权限
      if (learningPath.createdBy.toString() !== userId) {
        return res.status(403).json({ error: '没有权限更新此学习路径' });
      }
      
      // 更新字段
      const allowedFields = ['title', 'description', 'subject', 'targetAudience', 'difficulty', 'tags', 'isPublic', 'status', 'nodes'];
      
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          learningPath[field] = updateData[field];
        }
      });
      
      learningPath.updatedAt = Date.now();
      
      await learningPath.save();
      
      // 清除相关缓存
      await cacheService.del(`learningPath:${pathId}:*`);
      await cacheService.del(`learningPaths:${userId}:*`);
      
      res.json({
        ...learningPath.toObject(),
        id: learningPath._id.toString() // 确保ID字段一致性
      });
    } catch (error) {
      logger.error('更新学习路径错误:', error);
      res.status(500).json({ error: '更新学习路径失败', details: error.message });
    }
  }
);

// 删除学习路径
router.delete('/:id', auth, async (req, res) => {
  try {
    const pathId = req.params.id;
    const userId = req.user.id;
    
    // 查找学习路径
    const learningPath = await LearningPath.findById(pathId);
    
    if (!learningPath) {
      return res.status(404).json({ error: '学习路径不存在' });
    }
    
    // 检查权限
    if (learningPath.createdBy.toString() !== userId) {
      return res.status(403).json({ error: '没有权限删除此学习路径' });
    }
    
    // 删除相关进度
    await LearningPathProgress.deleteMany({ pathId });
    
    // 删除学习路径
    await LearningPath.deleteOne({ _id: pathId });
    
    // 清除相关缓存
    await cacheService.del(`learningPath:${pathId}:*`);
    await cacheService.del(`learningPaths:${userId}:*`);
    
    res.json({ message: '学习路径已成功删除' });
  } catch (error) {
    logger.error('删除学习路径错误:', error);
    res.status(500).json({ error: '删除学习路径失败', details: error.message });
  }
});

// 更新学习进度
router.put('/:id/progress', auth, async (req, res) => {
  try {
    const pathId = req.params.id;
    const userId = req.user.id;
    const { completedNodes, currentNode, assessmentResults } = req.body;
    
    // 查找学习路径
    const learningPath = await LearningPath.findById(pathId);
    
    if (!learningPath) {
      return res.status(404).json({ error: '学习路径不存在' });
    }
    
    // 查找或创建进度记录
    let progress = await LearningPathProgress.findOne({
      userId,
      pathId
    });
    
    if (!progress) {
      progress = new LearningPathProgress({
        userId,
        pathId,
        completedNodes: [],
        currentNode: learningPath.nodes[0]?._id || null,
        overallProgress: 0,
        lastActivity: Date.now(),
        assessmentResults: []
      });
    }
    
    // 更新进度
    if (completedNodes) {
      progress.completedNodes = completedNodes;
    }
    
    if (currentNode) {
      progress.currentNode = currentNode;
    }
    
    if (assessmentResults) {
      // 添加新的评估结果
      progress.assessmentResults = [
        ...progress.assessmentResults,
        ...assessmentResults
      ];
    }
    
    // 计算总体进度
    const totalNodes = learningPath.nodes.length;
    const completedCount = progress.completedNodes.length;
    progress.overallProgress = totalNodes > 0 ? Math.round((completedCount / totalNodes) * 100) : 0;
    
    // 更新最后活动时间
    progress.lastActivity = Date.now();
    
    await progress.save();
    
    // 清除进度缓存
    await cacheService.del(`learningPathProgress:${userId}:${pathId}`);
    
    res.json(progress);
  } catch (error) {
    logger.error('更新学习进度错误:', error);
    res.status(500).json({ error: '更新学习进度失败', details: error.message });
  }
});

// 分享学习路径
router.post('/:id/share', auth, async (req, res) => {
  try {
    const pathId = req.params.id;
    const userId = req.user.id;
    const { userIds, isPublic } = req.body;
    
    // 查找学习路径
    const learningPath = await LearningPath.findById(pathId);
    
    if (!learningPath) {
      return res.status(404).json({ error: '学习路径不存在' });
    }
    
    // 检查权限
    if (learningPath.createdBy.toString() !== userId) {
      return res.status(403).json({ error: '没有权限分享此学习路径' });
    }
    
    // 更新分享设置
    if (isPublic !== undefined) {
      learningPath.isPublic = isPublic;
    }
    
    if (userIds && Array.isArray(userIds)) {
      // 验证用户ID是否存在
      const validUserIds = await User.find({
        _id: { $in: userIds }
      }).distinct('_id');
      
      // 更新共享用户列表
      learningPath.sharedWith = [...new Set([...learningPath.sharedWith, ...validUserIds.map(id => id.toString())])];
    }
    
    await learningPath.save();
    
    // 清除相关缓存
    await cacheService.del(`learningPath:${pathId}:*`);
    
    res.json({
      ...learningPath.toObject(),
      id: learningPath._id.toString() // 确保ID字段一致性
    });
  } catch (error) {
    logger.error('分享学习路径错误:', error);
    res.status(500).json({ error: '分享学习路径失败', details: error.message });
  }
});

// 获取学习路径分析
router.get('/:id/analytics', auth, async (req, res) => {
  try {
    const pathId = req.params.id;
    const userId = req.user.id;
    
    // 构建缓存键
    const cacheKey = `learningPathAnalytics:${pathId}`;
    
    // 尝试从缓存获取
    const cachedResult = await cacheService.get(cacheKey);
    if (cachedResult) {
      return res.json(cachedResult);
    }
    
    // 获取学习路径
    const learningPath = await LearningPath.findById(pathId);
    
    if (!learningPath) {
      return res.status(404).json({ error: '学习路径不存在' });
    }
    
    // 检查权限
    if (learningPath.createdBy.toString() !== userId) {
      return res.status(403).json({ error: '没有权限查看此学习路径的分析数据' });
    }
    
    // 使用聚合查询获取所有用户的进度
    const allProgress = await DbOptimizer.optimizedAggregate(LearningPathProgress, [
      { $match: { pathId: mongoose.Types.ObjectId(pathId) } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          userId: 1,
          userName: '$user.name',
          completedNodes: 1,
          currentNode: 1,
          overallProgress: 1,
          lastActivity: 1,
          assessmentResults: 1
        }
      }
    ]);
    
    // 计算完成率
    const totalUsers = allProgress.length;
    const completedUsers = allProgress.filter(p => p.overallProgress === 100).length;
    const completionRate = totalUsers > 0 ? (completedUsers / totalUsers) * 100 : 0;
    
    // 计算平均进度
    const averageProgress = totalUsers > 0
      ? allProgress.reduce((sum, p) => sum + p.overallProgress, 0) / totalUsers
      : 0;
    
    // 计算节点完成情况
    const nodeCompletionStats = learningPath.nodes.map(node => {
      const nodeId = node._id.toString();
      const completedCount = allProgress.filter(p => 
        p.completedNodes.includes(nodeId)
      ).length;
      
      return {
        nodeId,
        title: node.title,
        completedCount,
        completionRate: totalUsers > 0 ? (completedCount / totalUsers) * 100 : 0
      };
    });
    
    // 计算评估结果统计
    const assessmentStats = {};
    allProgress.forEach(progress => {
      if (progress.assessmentResults && progress.assessmentResults.length > 0) {
        progress.assessmentResults.forEach(result => {
          const nodeId = result.nodeId.toString();
          if (!assessmentStats[nodeId]) {
            assessmentStats[nodeId] = {
              scores: [],
              averageScore: 0
            };
          }
          assessmentStats[nodeId].scores.push(result.score);
        });
      }
    });
    
    // 计算平均分数
    Object.keys(assessmentStats).forEach(nodeId => {
      const scores = assessmentStats[nodeId].scores;
      assessmentStats[nodeId].averageScore = scores.length > 0
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length
        : 0;
    });
    
    // 用户活跃度统计
    const userActivityStats = allProgress.map(p => ({
      userId: p.userId,
      userName: p.userName,
      lastActivity: p.lastActivity,
      progress: p.overallProgress
    }));
    
    const result = {
      pathId,
      totalUsers,
      completedUsers,
      completionRate,
      averageProgress,
      nodeCompletionStats,
      assessmentStats,
      userActivityStats
    };
    
    // 缓存结果（30分钟）
    await cacheService.set(cacheKey, result, { ttl: 1800 });
    
    res.json(result);
  } catch (error) {
    logger.error('获取学习路径分析错误:', error);
    res.status(500).json({ error: '获取学习路径分析失败', details: error.message });
  }
});

// 获取推荐资源
async function getRecommendedResources(userId, learningPath) {
  try {
    // 构建缓存键
    const cacheKey = `recommendedResources:${userId}:${learningPath._id}`;
    
    // 尝试从缓存获取
    const cachedResult = await cacheService.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }
    
    // 获取用户当前进度
    const progress = await LearningPathProgress.findOne({
      userId,
      pathId: learningPath._id
    });
    
    // 如果没有进度记录，返回空数组
    if (!progress) {
      return [];
    }
    
    // 获取当前节点
    const currentNodeId = progress.currentNode;
    if (!currentNodeId) {
      return [];
    }
    
    // 查找当前节点
    const currentNode = learningPath.nodes.find(
      node => node._id.toString() === currentNodeId.toString()
    );
    
    if (!currentNode) {
      return [];
    }
    
    // 基于当前节点的主题和关键点查找相关资源
    const keywords = [
      currentNode.title,
      ...currentNode.keyPoints,
      learningPath.subject,
      ...learningPath.tags
    ].filter(Boolean); // 过滤掉可能的null或undefined值
    
    // 构建查询条件
    const query = {
      $or: keywords.map(keyword => ({
        $or: [
          { title: { $regex: keyword, $options: 'i' } },
          { description: { $regex: keyword, $options: 'i' } },
          { tags: { $regex: keyword, $options: 'i' } }
        ]
      }))
    };
    
    // 使用优化的查询
    const resources = await DbOptimizer.paginatedQuery(Resource, query, {
      limit: 5,
      sortBy: 'rating',
      sortOrder: 'desc',
      populate: ['createdBy'],
      select: ['title', 'description', 'type', 'url', 'tags', 'rating', 'createdBy', 'createdAt']
    });
    
    // 缓存结果（1小时）
    await cacheService.set(cacheKey, resources.data, { ttl: 3600 });
    
    return resources.data;
  } catch (error) {
    logger.error('获取推荐资源错误:', error);
    return [];
  }
}

// 获取学习路径统计数据
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 构建缓存键
    const cacheKey = `learningPathStats:${userId}`;
    
    // 尝试从缓存获取
    const cachedResult = await cacheService.get(cacheKey);
    if (cachedResult) {
      return res.json(cachedResult);
    }
    
    // 获取用户创建的学习路径数量
    const createdPathsCount = await LearningPath.countDocuments({ createdBy: userId });
    
    // 获取用户参与的学习路径数量
    const participatedPathsCount = await LearningPathProgress.countDocuments({ userId });
    
    // 获取用户完成的学习路径数量
    const completedPathsCount = await LearningPathProgress.countDocuments({ 
      userId, 
      overallProgress: 100 
    });
    
    // 获取用户最近的学习活动
    const recentActivities = await LearningPathProgress.find({ userId })
      .sort({ lastActivity: -1 })
      .limit(5)
      .populate({
        path: 'pathId',
        select: 'title subject difficulty'
      });
    
    // 获取用户学习时间统计
    const timeStats = await DbOptimizer.optimizedAggregate(LearningPathProgress, [
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalTime: { $sum: '$totalTimeSpent' },
          avgTimePerPath: { $avg: '$totalTimeSpent' }
        }
      }
    ]);
    
    // 获取用户学科分布
    const subjectDistribution = await DbOptimizer.optimizedAggregate(LearningPathProgress, [
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: 'learningpaths',
          localField: 'pathId',
          foreignField: '_id',
          as: 'path'
        }
      },
      { $unwind: '$path' },
      {
        $group: {
          _id: '$path.subject',
          count: { $sum: 1 },
          avgProgress: { $avg: '$overallProgress' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    const result = {
      createdPathsCount,
      participatedPathsCount,
      completedPathsCount,
      completionRate: participatedPathsCount > 0 
        ? (completedPathsCount / participatedPathsCount) * 100 
        : 0,
      recentActivities: recentActivities.map(activity => ({
        pathId: activity.pathId._id,
        pathTitle: activity.pathId.title,
        subject: activity.pathId.subject,
        difficulty: activity.pathId.difficulty,
        progress: activity.overallProgress,
        lastActivity: activity.lastActivity
      })),
      timeStats: timeStats.length > 0 ? {
        totalTime: timeStats[0].totalTime || 0,
        avgTimePerPath: timeStats[0].avgTimePerPath || 0
      } : {
        totalTime: 0,
        avgTimePerPath: 0
      },
      subjectDistribution
    };
    
    // 缓存结果（1小时）
    await cacheService.set(cacheKey, result, { ttl: 3600 });
    
    res.json(result);
  } catch (error) {
    logger.error('获取学习路径统计错误:', error);
    res.status(500).json({ error: '获取学习路径统计失败', details: error.message });
  }
});

// 获取推荐学习路径
router.get('/recommended', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 构建缓存键
    const cacheKey = `recommendedPaths:${userId}`;
    
    // 尝试从缓存获取
    const cachedResult = await cacheService.get(cacheKey);
    if (cachedResult) {
      return res.json(cachedResult);
    }
    
    // 获取用户已参与的学习路径
    const userProgress = await LearningPathProgress.find({ userId });
    const participatedPathIds = userProgress.map(p => p.pathId.toString());
    
    // 获取用户偏好
    const userPreferences = await getUserPreferences(userId, userProgress);
    
    // 构建推荐查询
    const query = {
      _id: { $nin: participatedPathIds }, // 排除已参与的路径
      isPublic: true, // 只推荐公开的路径
      status: 'active' // 只推荐活跃的路径
    };
    
    // 如果有偏好的学科，优先推荐
    if (userPreferences.preferredSubjects && userPreferences.preferredSubjects.length > 0) {
      query.subject = { $in: userPreferences.preferredSubjects };
    }
    
    // 如果有偏好的难度，优先推荐
    if (userPreferences.preferredDifficulty) {
      query.difficulty = userPreferences.preferredDifficulty;
    }
    
    // 使用优化的查询
    const recommendedPaths = await DbOptimizer.paginatedQuery(LearningPath, query, {
      limit: 5,
      sortBy: 'rating',
      sortOrder: 'desc',
      populate: ['createdBy'],
      select: ['title', 'description', 'subject', 'targetAudience', 'difficulty', 'tags', 'rating', 'createdBy', 'createdAt']
    });
    
    // 如果推荐结果不足，添加热门路径
    if (recommendedPaths.data.length < 5) {
      const remainingCount = 5 - recommendedPaths.data.length;
      
      // 查询热门路径
      const popularQuery = {
        _id: { $nin: [...participatedPathIds, ...recommendedPaths.data.map(p => p._id)] },
        isPublic: true,
        status: 'active'
      };
      
      const popularPaths = await DbOptimizer.paginatedQuery(LearningPath, popularQuery, {
        limit: remainingCount,
        sortBy: 'popularity',
        sortOrder: 'desc',
        populate: ['createdBy'],
        select: ['title', 'description', 'subject', 'targetAudience', 'difficulty', 'tags', 'rating', 'createdBy', 'createdAt']
      });
      
      // 合并结果
      recommendedPaths.data = [...recommendedPaths.data, ...popularPaths.data];
    }
    
    // 确保ID字段一致性
    const formattedPaths = recommendedPaths.data.map(path => ({
      ...path.toObject(),
      id: path._id.toString()
    }));
    
    // 缓存结果（6小时）
    await cacheService.set(cacheKey, formattedPaths, { ttl: 21600 });
    
    res.json(formattedPaths);
  } catch (error) {
    logger.error('获取推荐学习路径错误:', error);
    res.status(500).json({ error: '获取推荐学习路径失败', details: error.message });
  }
});

// 获取用户偏好
async function getUserPreferences(userId, userProgress) {
  try {
    // 默认偏好
    const preferences = {
      preferredSubjects: [],
      preferredDifficulty: null,
      preferredTags: []
    };
    
    // 如果没有进度记录，返回默认偏好
    if (!userProgress || userProgress.length === 0) {
      return preferences;
    }
    
    // 获取用户参与的所有学习路径
    const pathIds = userProgress.map(p => p.pathId);
    const paths = await LearningPath.find({ _id: { $in: pathIds } });
    
    // 统计学科频率
    const subjectCounts = {};
    paths.forEach(path => {
      if (path.subject) {
        subjectCounts[path.subject] = (subjectCounts[path.subject] || 0) + 1;
      }
    });
    
    // 获取最常见的学科（最多3个）
    preferences.preferredSubjects = Object.entries(subjectCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([subject]) => subject);
    
    // 统计难度频率
    const difficultyCounts = {};
    paths.forEach(path => {
      if (path.difficulty) {
        difficultyCounts[path.difficulty] = (difficultyCounts[path.difficulty] || 0) + 1;
      }
    });
    
    // 获取最常见的难度
    if (Object.keys(difficultyCounts).length > 0) {
      preferences.preferredDifficulty = Object.entries(difficultyCounts)
        .sort((a, b) => b[1] - a[1])[0][0];
    }
    
    // 统计标签频率
    const tagCounts = {};
    paths.forEach(path => {
      if (path.tags && Array.isArray(path.tags)) {
        path.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });
    
    // 获取最常见的标签（最多5个）
    preferences.preferredTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);
    
    return preferences;
  } catch (error) {
    logger.error('获取用户偏好错误:', error);
    return {
      preferredSubjects: [],
      preferredDifficulty: null,
      preferredTags: []
    };
  }
}

module.exports = router;