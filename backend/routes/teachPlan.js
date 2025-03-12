const express = require('express');
const router = express.Router();
const LLMService = require('../services/llmService');

// 生成教案
router.post('/generate', async (req, res) => {
  try {
    const { subject, grade, topic, goals, duration } = req.body;
    
    // 构建提示词
    const messages = [
      { role: "system", content: "你是一位经验丰富的教育专家，擅长设计教案。" },
      { role: "user", content: `请为以下教学内容设计一份详细的教案：
        学科：${subject}
        年级：${grade}
        主题：${topic}
        教学目标：${goals}
        课时：${duration}
        
        请包含以下内容：
        1. 教学目标
        2. 教学重点和难点
        3. 教学准备
        4. 教学过程（包括导入、新课讲授、巩固练习、总结）
        5. 板书设计
        6. 课后作业
        7. 教学反思
      `}
    ];
    
    // 调用LLM服务
    const response = await LLMService.callModel('teachPlan', { messages });
    
    res.json({
      teachPlan: response.content,
      model: response.model
    });
  } catch (error) {
    console.error('Generate teach plan error:', error);
    res.status(500).json({ message: '生成教案失败' });
  }
});

module.exports = router; 