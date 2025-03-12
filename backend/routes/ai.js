const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const sanitizeHtml = require('sanitize-html');
const { Configuration, OpenAIApi } = require('openai');
const auth = require('../middleware/auth');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const { getLLMConfig, selectModelForTask, logModelUsage, autoAdjustParameters } = require('../config/llmConfig');
const logger = require('../utils/logger');
const DbOptimizer = require('../utils/dbOptimizer');
const cacheService = require('../services/cacheService');
const { aiValidationRules, queryValidationRules, checkValidationResult } = require('../middleware/validator');
const { aiLimiter } = require('../middleware/rateLimit');
const { apiCsrfProtection, handleCsrfError } = require('../middleware/csrf');
const promptTemplateService = require('../services/promptTemplateService');

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/temp');
    
    // 确保目录存在
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  // 允许的文件类型
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'audio/mpeg', 'audio/wav', 'audio/ogg',
    'application/pdf'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('不支持的文件类型'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5 // 最多5个文件
  }
});

// 初始化OpenAI配置
const initializeOpenAI = (config) => {
  const configuration = new Configuration({
    apiKey: config.apiKey,
  });
  return new OpenAIApi(configuration);
};

// 文本聊天API
router.post(
  '/chat',
  auth,
  aiLimiter,
  apiCsrfProtection,
  aiValidationRules.chat,
  checkValidationResult,
  async (req, res) => {
    try {
      const { messages, conversationId, model, systemPrompt } = req.body;
      const userId = req.user.id;
      
      // 选择合适的模型配置
      const modelConfig = model ? 
        getLLMConfig(model) : 
        selectModelForTask('chat', { messages, userId });
      
      // 初始化OpenAI
      const openai = initializeOpenAI(modelConfig);
      
      // 准备消息
      let processedMessages = [...messages];
      
      // 添加系统提示
      if (systemPrompt) {
        processedMessages.unshift({
          role: 'system',
          content: systemPrompt
        });
      }
      
      // 清理消息内容
      processedMessages = processedMessages.map(msg => ({
        role: msg.role,
        content: sanitizeHtml(msg.content, {
          allowedTags: [],
          allowedAttributes: {}
        })
      }));
      
      // 记录请求开始时间
      const startTime = Date.now();
      
      // 调用API
      const completion = await openai.createChatCompletion({
        model: modelConfig.model,
        messages: processedMessages,
        temperature: modelConfig.temperature,
        max_tokens: modelConfig.max_tokens,
        top_p: modelConfig.top_p,
        frequency_penalty: modelConfig.frequency_penalty,
        presence_penalty: modelConfig.presence_penalty
      });
      
      // 计算响应时间
      const responseTime = Date.now() - startTime;
      
      // 获取响应
      const responseMessage = completion.data.choices[0].message;
      
      // 记录模型使用情况
      await logModelUsage({
        userId,
        model: modelConfig.model,
        promptTokens: completion.data.usage.prompt_tokens,
        completionTokens: completion.data.usage.completion_tokens,
        totalTokens: completion.data.usage.total_tokens,
        responseTime,
        success: true
      });
      
      // 保存或更新会话
      let conversation;
      if (conversationId) {
        // 更新现有会话
        conversation = await Conversation.findOneAndUpdate(
          { _id: conversationId, userId },
          { 
            $push: { 
              messages: [
                ...messages.filter(m => !m.isHistory),
                responseMessage
              ]
            },
            $set: { 
              updatedAt: new Date(),
              model: modelConfig.model
            }
          },
          { new: true }
        );
      } else {
        // 创建新会话
        const title = messages[0].content.substring(0, 50) + (messages[0].content.length > 50 ? '...' : '');
        conversation = await Conversation.create({
          userId,
          title,
          messages: [...messages, responseMessage],
          model: modelConfig.model,
          systemPrompt: systemPrompt || ''
        });
      }
      
      // 返回响应
      res.json({
        message: responseMessage,
        conversationId: conversation._id,
        model: modelConfig.model,
        usage: completion.data.usage
      });
    } catch (error) {
      logger.error('聊天API错误:', error);
      
      // 记录失败的使用情况
      if (req.user && req.body.model) {
        await logModelUsage({
          userId: req.user.id,
          model: req.body.model,
          success: false,
          error: error.message
        });
      }
      
      // 根据错误类型返回适当的状态码和消息
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 429) {
          return res.status(429).json({ 
            error: '请求过于频繁，请稍后再试',
            details: data
          });
        }
        
        return res.status(status).json({ 
          error: '模型服务错误', 
          details: data
        });
      }
      
      res.status(500).json({ 
        error: '处理请求时出错', 
        details: error.message
      });
    }
  }
);

// 多模态聊天API（支持图像、音频等）
router.post(
  '/multimodal-chat',
  auth,
  aiLimiter,
  apiCsrfProtection,
  upload.array('files', 5),
  aiValidationRules.multimodalChat,
  checkValidationResult,
  async (req, res) => {
    const uploadedFiles = req.files || [];
    const filesToDelete = [];
    
    try {
      const { messages, conversationId, model, systemPrompt } = req.body;
      const userId = req.user.id;
      
      // 解析消息（可能是JSON字符串）
      const parsedMessages = typeof messages === 'string' ? 
        JSON.parse(messages) : messages;
      
      // 选择支持多模态的模型配置
      const modelConfig = model ? 
        getLLMConfig(model) : 
        selectModelForTask('multimodal', { userId });
      
      // 初始化OpenAI
      const openai = initializeOpenAI(modelConfig);
      
      // 准备消息，处理上传的文件
      let processedMessages = [...parsedMessages];
      
      // 添加系统提示
      if (systemPrompt) {
        processedMessages.unshift({
          role: 'system',
          content: systemPrompt
        });
      }
      
      // 处理上传的文件
      for (const file of uploadedFiles) {
        filesToDelete.push(file.path);
        
        // 找到对应的消息并添加文件内容
        const messageIndex = processedMessages.findIndex(
          msg => msg.fileReference === file.originalname
        );
        
        if (messageIndex !== -1) {
          const message = processedMessages[messageIndex];
          
          // 根据文件类型处理
          if (file.mimetype.startsWith('image/')) {
            // 图像文件
            const base64Image = fs.readFileSync(file.path, { encoding: 'base64' });
            const dataURI = `data:${file.mimetype};base64,${base64Image}`;
            
            processedMessages[messageIndex] = {
              role: message.role,
              content: [
                { type: 'text', text: message.content },
                { type: 'image_url', image_url: { url: dataURI } }
              ]
            };
          } else if (file.mimetype.startsWith('audio/')) {
            // 音频文件 - 使用Whisper API转录
            const audioResponse = await openai.createTranscription(
              fs.createReadStream(file.path),
              'whisper-1'
            );
            
            processedMessages[messageIndex] = {
              role: message.role,
              content: `${message.content}\n\n[音频转录]: ${audioResponse.data.text}`
            };
          } else if (file.mimetype === 'application/pdf') {
            // PDF文件 - 简单提取文本（实际项目中可能需要更复杂的PDF解析）
            processedMessages[messageIndex] = {
              role: message.role,
              content: `${message.content}\n\n[PDF文件]: ${file.originalname}`
            };
          }
        }
      }
      
      // 记录请求开始时间
      const startTime = Date.now();
      
      // 调用API
      const completion = await openai.createChatCompletion({
        model: modelConfig.model,
        messages: processedMessages,
        temperature: modelConfig.temperature,
        max_tokens: modelConfig.max_tokens,
        top_p: modelConfig.top_p,
        frequency_penalty: modelConfig.frequency_penalty,
        presence_penalty: modelConfig.presence_penalty
      });
      
      // 计算响应时间
      const responseTime = Date.now() - startTime;
      
      // 获取响应
      const responseMessage = completion.data.choices[0].message;
      
      // 记录模型使用情况
      await logModelUsage({
        userId,
        model: modelConfig.model,
        promptTokens: completion.data.usage.prompt_tokens,
        completionTokens: completion.data.usage.completion_tokens,
        totalTokens: completion.data.usage.total_tokens,
        responseTime,
        success: true,
        isMultimodal: true
      });
      
      // 保存或更新会话
      let conversation;
      if (conversationId) {
        // 更新现有会话
        conversation = await Conversation.findOneAndUpdate(
          { _id: conversationId, userId },
          { 
            $push: { 
              messages: [
                ...parsedMessages.filter(m => !m.isHistory),
                responseMessage
              ]
            },
            $set: { 
              updatedAt: new Date(),
              model: modelConfig.model,
              isMultimodal: true
            }
          },
          { new: true }
        );
      } else {
        // 创建新会话
        const title = typeof parsedMessages[0].content === 'string' 
          ? parsedMessages[0].content.substring(0, 50) + (parsedMessages[0].content.length > 50 ? '...' : '')
          : '多模态会话';
          
        conversation = await Conversation.create({
          userId,
          title,
          messages: [...parsedMessages, responseMessage],
          model: modelConfig.model,
          systemPrompt: systemPrompt || '',
          isMultimodal: true
        });
      }
      
      // 返回响应
      res.json({
        message: responseMessage,
        conversationId: conversation._id,
        model: modelConfig.model,
        usage: completion.data.usage
      });
    } catch (error) {
      logger.error('多模态聊天API错误:', error);
      
      // 记录失败的使用情况
      if (req.user && req.body.model) {
        await logModelUsage({
          userId: req.user.id,
          model: req.body.model,
          success: false,
          error: error.message,
          isMultimodal: true
        });
      }
      
      // 根据错误类型返回适当的状态码和消息
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        return res.status(status).json({ 
          error: '模型服务错误', 
          details: data
        });
      }
      
      res.status(500).json({ 
        error: '处理请求时出错', 
        details: error.message
      });
    } finally {
      // 清理临时文件
      for (const filePath of filesToDelete) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          logger.error('删除临时文件失败:', err);
        }
      }
    }
  }
);

// 获取会话历史
router.get(
  '/conversations',
  auth,
  queryValidationRules.pagination,
  queryValidationRules.search,
  checkValidationResult,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20, search, sort = 'updatedAt', order = 'desc' } = req.query;
      
      // 构建查询
      const query = { userId };
      
      // 添加搜索条件
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { 'messages.content': { $regex: search, $options: 'i' } }
        ];
      }
      
      // 使用优化的分页查询
      const result = await DbOptimizer.paginatedQuery(Conversation, query, {
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy: sort,
        sortOrder: order,
        select: ['title', 'updatedAt', 'createdAt', 'model', 'isMultimodal'],
        // 只获取第一条消息用于预览
        populate: []
      });
      
      res.json(result);
    } catch (error) {
      logger.error('获取会话历史错误:', error);
      res.status(500).json({ error: '获取会话历史失败', details: error.message });
    }
  }
);

// 获取单个会话详情
router.get(
  '/conversations/:id',
  auth,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const conversationId = req.params.id;
      
      // 查找会话
      const conversation = await Conversation.findOne({
        _id: conversationId,
        userId
      });
      
      if (!conversation) {
        return res.status(404).json({ error: '会话不存在' });
      }
      
      res.json(conversation);
    } catch (error) {
      logger.error('获取会话详情错误:', error);
      res.status(500).json({ error: '获取会话详情失败', details: error.message });
    }
  }
);

// 删除会话
router.delete(
  '/conversations/:id',
  auth,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const conversationId = req.params.id;
      
      // 删除会话
      const result = await Conversation.deleteOne({
        _id: conversationId,
        userId
      });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: '会话不存在或无权删除' });
      }
      
      res.json({ message: '会话已删除' });
    } catch (error) {
      logger.error('删除会话错误:', error);
      res.status(500).json({ error: '删除会话失败', details: error.message });
    }
  }
);

// 更新会话标题
router.put(
  '/conversations/:id/title',
  auth,
  aiValidationRules.updateTitle,
  checkValidationResult,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const conversationId = req.params.id;
      const { title } = req.body;
      
      // 更新会话标题
      const conversation = await Conversation.findOneAndUpdate(
        { _id: conversationId, userId },
        { $set: { title, updatedAt: new Date() } },
        { new: true }
      );
      
      if (!conversation) {
        return res.status(404).json({ error: '会话不存在或无权更新' });
      }
      
      res.json({ message: '会话标题已更新', conversation });
    } catch (error) {
      logger.error('更新会话标题错误:', error);
      res.status(500).json({ error: '更新会话标题失败', details: error.message });
    }
  }
);

// 获取提示模板
router.get(
  '/prompt-templates',
  auth,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { category } = req.query;
      
      // 获取提示模板
      const templates = await promptTemplateService.getTemplates(userId, category);
      
      res.json(templates);
    } catch (error) {
      logger.error('获取提示模板错误:', error);
      res.status(500).json({ error: '获取提示模板失败', details: error.message });
    }
  }
);

// 获取模型使用统计
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    // 只允许管理员访问
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: '没有权限访问此资源' });
    }
    
    // 获取缓存的统计数据
    const cacheKey = 'ai:stats';
    let stats = await cacheService.get(cacheKey);
    
    if (!stats) {
      // 如果缓存中没有，从数据库获取
      stats = await DbOptimizer.optimizedAggregate(ModelUsage, [
        {
          $group: {
            _id: '$model',
            totalCalls: { $sum: 1 },
            totalTokens: { $sum: '$totalTokens' },
            avgResponseTime: { $avg: '$responseTime' },
            successRate: {
              $avg: { $cond: [{ $eq: ['$success', true] }, 1, 0] }
            }
          }
        },
        {
          $project: {
            model: '$_id',
            totalCalls: 1,
            totalTokens: 1,
            avgResponseTime: 1,
            successRate: { $multiply: ['$successRate', 100] }
          }
        },
        { $sort: { totalCalls: -1 } }
      ]);
      
      // 缓存结果（1小时）
      await cacheService.set(cacheKey, stats, { ttl: 3600 });
    }
    
    res.json(stats);
  } catch (error) {
    logger.error('获取模型使用统计错误:', error);
    res.status(500).json({ error: '获取模型使用统计失败', details: error.message });
  }
});

module.exports = router;