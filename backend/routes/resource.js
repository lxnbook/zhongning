const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 配置文件存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
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

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 限制文件大小为50MB
  fileFilter: (req, file, cb) => {
    // 允许的文件类型
    const allowedTypes = [
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/jpeg', 'image/png', 'image/gif',
      'video/mp4', 'video/avi', 'video/quicktime',
      'audio/mpeg', 'audio/wav', 'audio/ogg',
      'application/zip', 'application/x-rar-compressed'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('不支持的文件类型'), false);
    }
  }
});

// 获取所有资源
router.get('/', async (req, res) => {
  try {
    const { grade, subject, type, search } = req.query;
    let query = {};
    
    // 添加筛选条件
    if (grade && grade !== 'all') query.grade = grade;
    if (subject && subject !== 'all') query.subject = subject;
    if (type && type !== 'all') query.type = type;
    
    // 添加搜索条件
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    const resources = await Resource.find(query)
      .sort({ createdAt: -1 })
      .populate('uploader', 'name');
    
    res.json(resources);
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({ message: '获取资源失败' });
  }
});

// 获取单个资源
router.get('/:id', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('uploader', 'name');
    
    if (!resource) {
      return res.status(404).json({ message: '资源不存在' });
    }
    
    // 更新查看次数
    resource.views += 1;
    await resource.save();
    
    res.json(resource);
  } catch (error) {
    console.error('Get resource error:', error);
    res.status(500).json({ message: '获取资源失败' });
  }
});

// 上传资源
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { title, type, grade, subject, description, tags } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: '请上传文件' });
    }
    
    // 获取文件信息
    const fileUrl = `/uploads/${req.file.filename}`;
    const fileSize = req.file.size / (1024 * 1024); // 转换为MB
    const fileType = path.extname(req.file.originalname).substring(1);
    
    // 创建资源记录
    const resource = new Resource({
      title,
      type,
      grade,
      subject,
      description,
      fileUrl,
      fileSize: parseFloat(fileSize.toFixed(2)),
      fileType,
      uploader: req.user.id, // 假设通过认证中间件获取用户ID
      organization: req.user.organization,
      tags: tags ? JSON.parse(tags) : [],
    });
    
    await resource.save();
    
    res.status(201).json(resource);
  } catch (error) {
    console.error('Upload resource error:', error);
    res.status(500).json({ message: '上传资源失败' });
  }
});

// 下载资源
router.get('/:id/download', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({ message: '资源不存在' });
    }
    
    // 更新下载次数
    resource.downloads += 1;
    await resource.save();
    
    // 获取文件路径
    const filePath = path.join(__dirname, '..', resource.fileUrl);
    
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: '文件不存在' });
    }
    
    // 设置响应头
    res.setHeader('Content-Disposition', `attachment; filename=${encodeURIComponent(resource.title)}.${resource.fileType}`);
    
    // 发送文件
    res.sendFile(filePath);
  } catch (error) {
    console.error('Download resource error:', error);
    res.status(500).json({ message: '下载资源失败' });
  }
});

// 删除资源
router.delete('/:id', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({ message: '资源不存在' });
    }
    
    // 检查权限（只有上传者或管理员可以删除）
    if (resource.uploader.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: '没有权限删除此资源' });
    }
    
    // 删除文件
    const filePath = path.join(__dirname, '..', resource.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // 删除数据库记录
    await Resource.findByIdAndDelete(req.params.id);
    
    res.json({ message: '资源已删除' });
  } catch (error) {
    console.error('Delete resource error:', error);
    res.status(500).json({ message: '删除资源失败' });
  }
});

module.exports = router; 