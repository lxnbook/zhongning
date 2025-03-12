const csrf = require('csurf');
const logger = require('../utils/logger');

/**
 * CSRF保护配置
 * 使用cookie存储CSRF令牌
 */
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 3600 // 1小时过期
  }
});

/**
 * CSRF错误处理中间件
 * 处理CSRF令牌验证失败的情况
 */
const handleCsrfError = (err, req, res, next) => {
  if (err.code !== 'EBADCSRFTOKEN') {
    return next(err);
  }
  
  // 记录CSRF验证失败
  logger.warn('CSRF验证失败:', {
    ip: req.ip,
    path: req.path,
    method: req.method,
    userAgent: req.headers['user-agent'],
    referrer: req.headers.referer || req.headers.referrer
  });
  
  // 返回403错误
  return res.status(403).json({
    error: '无效的请求令牌',
    message: '可能是由于会话过期或跨站请求伪造尝试',
    code: 'CSRF_ERROR'
  });
};

/**
 * 为API路由创建CSRF中间件
 * 跳过某些不需要CSRF保护的路由
 */
const apiCsrfProtection = (req, res, next) => {
  // 跳过不需要CSRF保护的路由
  const skipPaths = [
    '/api/health',
    '/api/webhook'
  ];
  
  // 跳过GET、HEAD、OPTIONS请求
  const skipMethods = ['GET', 'HEAD', 'OPTIONS'];
  
  if (
    skipPaths.some(path => req.path.startsWith(path)) ||
    skipMethods.includes(req.method)
  ) {
    return next();
  }
  
  // 应用CSRF保护
  return csrfProtection(req, res, next);
};

/**
 * 生成CSRF令牌中间件
 * 用于客户端获取CSRF令牌
 */
const generateCsrfToken = (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
};

module.exports = {
  csrfProtection,
  handleCsrfError,
  apiCsrfProtection,
  generateCsrfToken
}; 