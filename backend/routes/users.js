const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

// 获取所有用户 (需要管理员权限)
router.get('/', auth, async (req, res) => {
  try {
    // 检查权限
    if (req.user.role !== 'admin' && req.user.role !== 'school_admin') {
      return res.status(403).json({ message: '没有权限访问此资源' });
    }
    
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: '获取用户列表失败' });
  }
});

// 获取单个用户
router.get('/:id', auth, async (req, res) => {
  try {
    // 检查权限 (只能查看自己或管理员可查看所有)
    if (req.params.id !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'school_admin') {
      return res.status(403).json({ message: '没有权限访问此资源' });
    }
    
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: '获取用户信息失败' });
  }
});

// 创建用户 (需要管理员权限)
router.post('/', auth, async (req, res) => {
  try {
    // 检查权限
    if (req.user.role !== 'admin' && req.user.role !== 'school_admin') {
      return res.status(403).json({ message: '没有权限创建用户' });
    }
    
    const { username, password, name, role, organization, position, email, phone } = req.body;
    
    // 检查用户名是否已存在
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: '用户名已存在' });
    }
    
    // 创建新用户
    const newUser = new User({
      username,
      password, // 密码会在模型的pre save钩子中自动加密
      name,
      role,
      organization,
      position,
      email,
      phone,
      status: 'active'
    });
    
    await newUser.save();
    
    res.status(201).json({
      message: '用户创建成功',
      user: {
        id: newUser._id,
        username: newUser.username,
        name: newUser.name,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: '创建用户失败' });
  }
});

// 更新用户
router.put('/:id', auth, async (req, res) => {
  try {
    // 检查权限 (只能更新自己或管理员可更新所有)
    if (req.params.id !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'school_admin') {
      return res.status(403).json({ message: '没有权限更新此用户' });
    }
    
    const { name, role, organization, position, email, phone } = req.body;
    
    // 如果不是管理员，不能修改自己的角色
    if (req.params.id === req.user.id && role && role !== req.user.role && req.user.role !== 'admin') {
      return res.status(403).json({ message: '不能修改自己的角色' });
    }
    
    // 查找并更新用户
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        name,
        role,
        organization,
        position,
        email,
        phone
      },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    res.json({
      message: '用户更新成功',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: '更新用户失败' });
  }
});

// 删除用户 (需要管理员权限)
router.delete('/:id', auth, async (req, res) => {
  try {
    // 检查权限
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: '没有权限删除用户' });
    }
    
    // 不能删除自己
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: '不能删除当前登录的用户' });
    }
    
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    
    if (!deletedUser) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    res.json({ message: '用户删除成功' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: '删除用户失败' });
  }
});

// 重置密码 (需要管理员权限或用户本人)
router.post('/:id/reset-password', auth, async (req, res) => {
  try {
    // 检查权限 (只能重置自己的密码或管理员可重置所有)
    if (req.params.id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: '没有权限重置此用户密码' });
    }
    
    // 如果是管理员重置他人密码，生成随机密码
    let newPassword;
    let message;
    
    if (req.params.id !== req.user.id && req.user.role === 'admin') {
      // 生成随机密码
      newPassword = Math.random().toString(36).slice(-8);
      message = `密码重置成功，新密码: ${newPassword}`;
    } else {
      // 用户重置自己的密码
      const { oldPassword, newPassword: userNewPassword } = req.body;
      
      // 验证旧密码
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: '用户不存在' });
      }
      
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: '旧密码不正确' });
      }
      
      newPassword = userNewPassword;
      message = '密码修改成功';
    }
    
    // 加密新密码
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // 更新用户密码
    await User.findByIdAndUpdate(
      req.params.id,
      { password: hashedPassword }
    );
    
    res.json({ message });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: '重置密码失败' });
  }
});

// 修改用户状态 (锁定/解锁，需要管理员权限)
router.put('/:id/status', auth, async (req, res) => {
  try {
    // 检查权限
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: '没有权限修改用户状态' });
    }
    
    // 不能修改自己的状态
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: '不能修改当前登录用户的状态' });
    }
    
    const { status } = req.body;
    
    if (status !== 'active' && status !== 'locked') {
      return res.status(400).json({ message: '无效的状态值' });
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    res.json({
      message: `用户${status === 'active' ? '解锁' : '锁定'}成功`,
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: '修改用户状态失败' });
  }
});

module.exports = router; 