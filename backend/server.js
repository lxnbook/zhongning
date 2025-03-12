const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { apiLimiter } = require('./middleware/rateLimit');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const logger = require('./utils/logger');

// 路由导入
const authRoutes = require('./routes/auth');
const teachPlanRoutes = require('./routes/teachPlan');
const resourceRoutes = require('./routes/resource');
const analysisRoutes = require('./routes/analysis');

// 加载环境变量
dotenv.config();

const app = express();

// 中间件
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// 安全头信息
app.use(helmet());
app.use(xss());
app.use(mongoSanitize());

// 请求速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100 // 每个IP在windowMs内最多100个请求
});
app.use('/api/', limiter);

// 应用全局API速率限制
app.use(apiLimiter);

// 添加请求日志中间件
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });
  next();
});

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/teach-plan', teachPlanRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/analysis', analysisRoutes);

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 数据库连接
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// 生产环境静态文件服务
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

// 添加错误处理中间件
app.use((err, req, res, next) => {
  logger.error('服务器错误:', err);
  
  // 不在生产环境中暴露错误详情
  const errorMessage = process.env.NODE_ENV === 'production' 
    ? '服务器内部错误' 
    : err.message;
  
  res.status(err.status || 500).json({
    error: errorMessage,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 