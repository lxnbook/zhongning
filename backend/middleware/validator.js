const { body, param, query, validationResult } = require('express-validator');
const logger = require('../utils/logger');

/**
 * 通用验证结果检查中间件
 * 检查请求中的验证错误并返回适当的响应
 */
const checkValidationResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('输入验证失败:', {
      path: req.path,
      method: req.method,
      errors: errors.array(),
      body: req.body ? JSON.stringify(req.body).substring(0, 200) : null
    });
    
    return res.status(400).json({
      error: '输入验证失败',
      details: errors.array(),
      code: 'VALIDATION_ERROR'
    });
  }
  next();
};

/**
 * 自定义验证器
 * 提供常用的自定义验证规则
 */
const customValidators = {
  // 检查字符串是否是有效的MongoDB ObjectId
  isObjectId: value => {
    const objectIdPattern = /^[0-9a-fA-F]{24}$/;
    return objectIdPattern.test(value);
  },
  
  // 检查字符串是否是有效的URL
  isValidUrl: value => {
    try {
      new URL(value);
      return true;
    } catch (error) {
      return false;
    }
  },
  
  // 检查数组是否包含重复项
  hasNoDuplicates: array => {
    return new Set(array).size === array.length;
  },
  
  // 检查字符串是否只包含安全字符（字母、数字、下划线、连字符）
  isSafeString: value => {
    const safePattern = /^[a-zA-Z0-9_-]+$/;
    return safePattern.test(value);
  }
};

/**
 * 用户相关验证规则
 */
const userValidationRules = {
  // 注册验证
  register: [
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('姓名长度必须在2-50个字符之间')
      .matches(/^[a-zA-Z0-9\s\u4e00-\u9fa5_-]+$/)
      .withMessage('姓名只能包含字母、数字、空格、中文、下划线和连字符'),
    
    body('email')
      .trim()
      .isEmail()
      .withMessage('请提供有效的电子邮件地址')
      .normalizeEmail(),
    
    body('password')
      .isLength({ min: 8 })
      .withMessage('密码长度必须至少为8个字符')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('密码必须包含至少一个大写字母、一个小写字母和一个数字'),
    
    body('role')
      .optional()
      .isIn(['user', 'teacher', 'admin'])
      .withMessage('无效的角色类型'),
    
    body('organization')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('组织名称不能超过100个字符'),
    
    body('department')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('部门名称不能超过100个字符')
  ],
  
  // 登录验证
  login: [
    body('email')
      .trim()
      .isEmail()
      .withMessage('请提供有效的电子邮件地址')
      .normalizeEmail(),
    
    body('password')
      .notEmpty()
      .withMessage('密码不能为空')
  ],
  
  // 更新用户验证
  updateUser: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('姓名长度必须在2-50个字符之间')
      .matches(/^[a-zA-Z0-9\s\u4e00-\u9fa5_-]+$/)
      .withMessage('姓名只能包含字母、数字、空格、中文、下划线和连字符'),
    
    body('role')
      .optional()
      .isIn(['user', 'teacher', 'admin'])
      .withMessage('无效的角色类型'),
    
    body('status')
      .optional()
      .isIn(['active', 'suspended', 'inactive'])
      .withMessage('无效的状态值'),
    
    body('organization')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('组织名称不能超过100个字符'),
    
    body('department')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('部门名称不能超过100个字符')
  ],
  
  // 重置密码验证
  resetPassword: [
    body('email')
      .trim()
      .isEmail()
      .withMessage('请提供有效的电子邮件地址')
      .normalizeEmail()
  ],
  
  // 更改密码验证
  changePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('当前密码不能为空'),
    
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('新密码长度必须至少为8个字符')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('新密码必须包含至少一个大写字母、一个小写字母和一个数字')
      .custom((value, { req }) => {
        if (value === req.body.currentPassword) {
          throw new Error('新密码不能与当前密码相同');
        }
        return true;
      })
  ],
  
  // 用户ID参数验证
  userId: [
    param('userId')
      .custom(customValidators.isObjectId)
      .withMessage('无效的用户ID格式')
  ]
};

/**
 * AI相关验证规则
 */
const aiValidationRules = {
  // 聊天请求验证
  chat: [
    body('message')
      .optional()
      .isString()
      .withMessage('消息必须是字符串')
      .isLength({ max: 10000 })
      .withMessage('消息长度不能超过10000个字符'),
    
    body('conversationId')
      .optional()
      .custom(customValidators.isObjectId)
      .withMessage('无效的会话ID'),
    
    body('systemPrompt')
      .optional()
      .isString()
      .withMessage('系统提示必须是字符串')
      .isLength({ max: 2000 })
      .withMessage('系统提示长度不能超过2000个字符'),
    
    body('templateId')
      .optional()
      .isString()
      .withMessage('模板ID必须是字符串'),
    
    body('templateParams')
      .optional()
      .isObject()
      .withMessage('模板参数必须是对象')
  ],
  
  // 多模态请求验证
  multimodal: [
    body('message')
      .optional()
      .isString()
      .withMessage('消息必须是字符串')
      .isLength({ max: 10000 })
      .withMessage('消息长度不能超过10000个字符'),
    
    body('conversationId')
      .optional()
      .custom(customValidators.isObjectId)
      .withMessage('无效的会话ID'),
    
    body('systemPrompt')
      .optional()
      .isString()
      .withMessage('系统提示必须是字符串')
      .isLength({ max: 2000 })
      .withMessage('系统提示长度不能超过2000个字符')
  ],
  
  // 会话ID参数验证
  conversationId: [
    param('conversationId')
      .custom(customValidators.isObjectId)
      .withMessage('无效的会话ID格式')
  ]
};

/**
 * 学习路径相关验证规则
 */
const learningPathValidationRules = {
  // 创建学习路径验证
  create: [
    body('title')
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage('标题长度必须在3-100个字符之间'),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('描述长度不能超过1000个字符'),
    
    body('subject')
      .trim()
      .notEmpty()
      .withMessage('学科不能为空'),
    
    body('targetAudience')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('目标受众长度不能超过100个字符'),
    
    body('difficulty')
      .optional()
      .isIn(['beginner', 'intermediate', 'advanced'])
      .withMessage('难度级别必须是 beginner、intermediate 或 advanced'),
    
    body('isPublic')
      .optional()
      .isBoolean()
      .withMessage('isPublic必须是布尔值'),
    
    body('tags')
      .optional()
      .isArray()
      .withMessage('标签必须是数组')
      .custom(customValidators.hasNoDuplicates)
      .withMessage('标签不能重复'),
    
    body('tags.*')
      .optional()
      .isString()
      .withMessage('标签必须是字符串')
      .isLength({ min: 1, max: 30 })
      .withMessage('标签长度必须在1-30个字符之间'),
    
    body('nodes')
      .optional()
      .isArray()
      .withMessage('节点必须是数组'),
    
    body('nodes.*.title')
      .optional()
      .isString()
      .withMessage('节点标题必须是字符串')
      .isLength({ min: 1, max: 100 })
      .withMessage('节点标题长度必须在1-100个字符之间'),
    
    body('nodes.*.description')
      .optional()
      .isString()
      .withMessage('节点描述必须是字符串')
      .isLength({ max: 500 })
      .withMessage('节点描述长度不能超过500个字符'),
    
    body('nodes.*.estimatedTime')
      .optional()
      .isInt({ min: 1 })
      .withMessage('预计学习时间必须是大于0的整数')
  ],
  
  // 更新学习路径验证
  update: [
    body('title')
      .optional()
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage('标题长度必须在3-100个字符之间'),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('描述长度不能超过1000个字符'),
    
    body('subject')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('学科不能为空'),
    
    body('targetAudience')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('目标受众长度不能超过100个字符'),
    
    body('difficulty')
      .optional()
      .isIn(['beginner', 'intermediate', 'advanced'])
      .withMessage('难度级别必须是 beginner、intermediate 或 advanced'),
    
    body('isPublic')
      .optional()
      .isBoolean()
      .withMessage('isPublic必须是布尔值'),
    
    body('status')
      .optional()
      .isIn(['active', 'archived', 'draft'])
      .withMessage('状态必须是 active、archived 或 draft'),
    
    body('tags')
      .optional()
      .isArray()
      .withMessage('标签必须是数组')
      .custom(customValidators.hasNoDuplicates)
      .withMessage('标签不能重复'),
    
    body('nodes')
      .optional()
      .isArray()
      .withMessage('节点必须是数组')
  ],
  
  // 学习路径ID参数验证
  pathId: [
    param('id')
      .custom(customValidators.isObjectId)
      .withMessage('无效的学习路径ID格式')
  ],
  
  // 学习进度验证
  updateProgress: [
    body('completedNodes')
      .optional()
      .isArray()
      .withMessage('完成的节点必须是数组'),
    
    body('completedNodes.*')
      .optional()
      .custom(customValidators.isObjectId)
      .withMessage('节点ID格式无效'),
    
    body('currentNode')
      .optional()
      .custom(customValidators.isObjectId)
      .withMessage('当前节点ID格式无效'),
    
    body('assessmentResults')
      .optional()
      .isArray()
      .withMessage('评估结果必须是数组'),
    
    body('assessmentResults.*.nodeId')
      .optional()
      .custom(customValidators.isObjectId)
      .withMessage('节点ID格式无效'),
    
    body('assessmentResults.*.score')
      .optional()
      .isInt({ min: 0, max: 100 })
      .withMessage('分数必须是0-100之间的整数')
  ],
  
  // 分享学习路径验证
  share: [
    body('userIds')
      .optional()
      .isArray()
      .withMessage('用户ID列表必须是数组'),
    
    body('userIds.*')
      .optional()
      .custom(customValidators.isObjectId)
      .withMessage('用户ID格式无效'),
    
    body('isPublic')
      .optional()
      .isBoolean()
      .withMessage('isPublic必须是布尔值')
  ],
  
  // 生成AI学习路径验证
  generate: [
    body('topic')
      .notEmpty()
      .withMessage('主题不能为空')
      .isLength({ max: 100 })
      .withMessage('主题长度不能超过100个字符'),
    
    body('subject')
      .notEmpty()
      .withMessage('学科不能为空')
      .isLength({ max: 50 })
      .withMessage('学科长度不能超过50个字符'),
    
    body('difficulty')
      .optional()
      .isIn(['beginner', 'intermediate', 'advanced'])
      .withMessage('难度级别必须是 beginner、intermediate 或 advanced'),
    
    body('targetAudience')
      .optional()
      .isLength({ max: 100 })
      .withMessage('目标受众长度不能超过100个字符')
  ]
};

/**
 * 资源相关验证规则
 */
const resourceValidationRules = {
  // 创建资源验证
  create: [
    body('title')
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage('标题长度必须在3-100个字符之间'),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('描述长度不能超过1000个字符'),
    
    body('type')
      .isIn(['article', 'video', 'book', 'course', 'tool', 'other'])
      .withMessage('资源类型无效'),
    
    body('url')
      .optional()
      .custom(customValidators.isValidUrl)
      .withMessage('URL格式无效'),
    
    body('tags')
      .optional()
      .isArray()
      .withMessage('标签必须是数组')
      .custom(customValidators.hasNoDuplicates)
      .withMessage('标签不能重复'),
    
    body('tags.*')
      .optional()
      .isString()
      .withMessage('标签必须是字符串')
      .isLength({ min: 1, max: 30 })
      .withMessage('标签长度必须在1-30个字符之间'),
    
    body('isPublic')
      .optional()
      .isBoolean()
      .withMessage('isPublic必须是布尔值')
  ],
  
  // 更新资源验证
  update: [
    body('title')
      .optional()
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage('标题长度必须在3-100个字符之间'),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('描述长度不能超过1000个字符'),
    
    body('type')
      .optional()
      .isIn(['article', 'video', 'book', 'course', 'tool', 'other'])
      .withMessage('资源类型无效'),
    
    body('url')
      .optional()
      .custom(customValidators.isValidUrl)
      .withMessage('URL格式无效'),
    
    body('tags')
      .optional()
      .isArray()
      .withMessage('标签必须是数组')
      .custom(customValidators.hasNoDuplicates)
      .withMessage('标签不能重复'),
    
    body('isPublic')
      .optional()
      .isBoolean()
      .withMessage('isPublic必须是布尔值')
  ],
  
  // 资源ID参数验证
  resourceId: [
    param('id')
      .custom(customValidators.isObjectId)
      .withMessage('无效的资源ID格式')
  ]
};

/**
 * 查询参数验证规则
 */
const queryValidationRules = {
  // 分页查询验证
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('页码必须是大于0的整数'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('每页数量必须是1-100之间的整数'),
    
    query('sort')
      .optional()
      .isString()
      .withMessage('排序字段必须是字符串'),
    
    query('order')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('排序顺序必须是 asc 或 desc')
  ],
  
  // 搜索查询验证
  search: [
    query('search')
      .optional()
      .isString()
      .withMessage('搜索关键词必须是字符串')
      .isLength({ max: 100 })
      .withMessage('搜索关键词长度不能超过100个字符')
  ]
};

module.exports = {
  checkValidationResult,
  customValidators,
  userValidationRules,
  aiValidationRules,
  learningPathValidationRules,
  resourceValidationRules,
  queryValidationRules
};