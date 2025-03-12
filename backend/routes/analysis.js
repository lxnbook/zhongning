const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// 获取成绩分析数据
router.get('/performance', async (req, res) => {
  try {
    const { classId, subject } = req.query;
    
    // 这里应该是从数据库获取数据
    // 以下是模拟数据
    const performanceData = [
      { name: '语文', 优秀: 15, 良好: 25, 及格: 10, 不及格: 5 },
      { name: '数学', 优秀: 20, 良好: 15, 及格: 15, 不及格: 5 },
      { name: '英语', 优秀: 18, 良好: 22, 及格: 12, 不及格: 3 },
      { name: '物理', 优秀: 12, 良好: 18, 及格: 20, 不及格: 5 },
      { name: '化学', 优秀: 10, 良好: 20, 及格: 18, 不及格: 7 },
    ];
    
    res.json(performanceData);
  } catch (error) {
    console.error('Get performance data error:', error);
    res.status(500).json({ message: '获取成绩分析数据失败' });
  }
});

// 获取出勤率数据
router.get('/attendance', async (req, res) => {
  try {
    const { classId, startDate, endDate } = req.query;
    
    // 这里应该是从数据库获取数据
    // 以下是模拟数据
    const attendanceData = [
      { name: '周一', 出勤率: 98 },
      { name: '周二', 出勤率: 96 },
      { name: '周三', 出勤率: 97 },
      { name: '周四', 出勤率: 95 },
      { name: '周五', 出勤率: 94 },
    ];
    
    res.json(attendanceData);
  } catch (error) {
    console.error('Get attendance data error:', error);
    res.status(500).json({ message: '获取出勤率数据失败' });
  }
});

// 获取学科分布数据
router.get('/subject-distribution', async (req, res) => {
  try {
    const { classId } = req.query;
    
    // 这里应该是从数据库获取数据
    // 以下是模拟数据
    const subjectDistribution = [
      { name: '语文', value: 25 },
      { name: '数学', value: 30 },
      { name: '英语', value: 20 },
      { name: '物理', value: 15 },
      { name: '化学', value: 10 },
    ];
    
    res.json(subjectDistribution);
  } catch (error) {
    console.error('Get subject distribution error:', error);
    res.status(500).json({ message: '获取学科分布数据失败' });
  }
});

// 获取学生详情数据
router.get('/students', async (req, res) => {
  try {
    const { classId } = req.query;
    
    // 这里应该是从数据库获取数据
    // 以下是模拟数据
    const studentData = [
      {
        id: 1,
        name: '张三',
        class: '高一(1)班',
        chinese: 85,
        math: 92,
        english: 88,
        physics: 78,
        chemistry: 82,
        attendance: 98,
      },
      {
        id: 2,
        name: '李四',
        class: '高一(1)班',
        chinese: 92,
        math: 78,
        english: 95,
        physics: 85,
        chemistry: 76,
        attendance: 100,
      },
      {
        id: 3,
        name: '王五',
        class: '高一(2)班',
        chinese: 75,
        math: 88,
        english: 82,
        physics: 90,
        chemistry: 85,
        attendance: 95,
      },
      {
        id: 4,
        name: '赵六',
        class: '高一(2)班',
        chinese: 68,
        math: 72,
        english: 75,
        physics: 65,
        chemistry: 70,
        attendance: 92,
      },
      {
        id: 5,
        name: '钱七',
        class: '高一(3)班',
        chinese: 95,
        math: 96,
        english: 92,
        physics: 88,
        chemistry: 90,
        attendance: 98,
      },
    ];
    
    res.json(studentData);
  } catch (error) {
    console.error('Get student data error:', error);
    res.status(500).json({ message: '获取学生详情数据失败' });
  }
});

// 获取教学质量评估
router.get('/teaching-quality', async (req, res) => {
  try {
    // 这里应该是从数据库获取数据或调用AI生成
    // 以下是模拟数据
    const teachingQuality = {
      advantages: [
        '英语教学效果显著，优秀率高于平均水平',
        '数学教学方法创新，学生参与度高',
        '出勤率保持在较高水平，学习氛围良好'
      ],
      improvements: [
        '物理实验教学有待加强',
        '化学科目不及格率较高，需调整教学策略',
        '部分学生学习积极性不高，需个性化关注'
      ],
      suggestions: [
        '组织物理学科教研活动，分享教学经验',
        '针对化学科目开展补习辅导',
        '加强师生互动，提高课堂参与度',
        '开展学习方法指导，提高学习效率'
      ]
    };
    
    res.json(teachingQuality);
  } catch (error) {
    console.error('Get teaching quality error:', error);
    res.status(500).json({ message: '获取教学质量评估失败' });
  }
});

module.exports = router; 