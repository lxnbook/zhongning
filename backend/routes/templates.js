const express = require('express');
const router = express.Router();
const Template = require('../models/Template');
const auth = require('../middleware/auth');

// 分享模板
router.post('/share', auth, async (req, res) => {
  try {
    const { templateId, isPublic, sharedWith } = req.body;
    
    const template = await Template.findById(templateId);
    
    if (!template) {
      return res.status(404).json({ message: '模板不存在' });
    }
    
    // 检查权限
    if (template.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: '没有权限分享此模板' });
    }
    
    template.isPublic = isPublic;
    template.sharedWith = sharedWith || [];
    
    await template.save();
    
    res.json({ message: '模板分享成功', template });
  } catch (error) {
    console.error('分享模板失败:', error);
    res.status(500).json({ message: '分享模板失败' });
  }
});

module.exports = router; 