import React, { useState, useEffect } from 'react';
import { Typography, Breadcrumb, Spin, message } from 'antd';
import { HomeOutlined, CalendarOutlined } from '@ant-design/icons';
import LessonPlanner from '../components/LessonPlanner';
import apiService from '../services/apiService';

const { Title } = Typography;

const LessonPlannerPage = () => {
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 获取学科列表
        const subjectsData = await apiService.get('/subjects');
        setSubjects(subjectsData);
        
        // 获取班级列表
        const classesData = await apiService.get('/classes');
        setClasses(classesData);
        
        setLoading(false);
      } catch (error) {
        console.error('获取数据失败:', error);
        message.error('获取数据失败');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleSave = async (lessonPlan) => {
    try {
      // 保存课程计划
      await apiService.post('/lesson-plans', lessonPlan);
      message.success('课程计划保存成功');
    } catch (error) {
      console.error('保存失败:', error);
      message.error('保存失败');
    }
  };
  
  return (
    <div>
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item href="/">
          <HomeOutlined />
          <span>首页</span>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <CalendarOutlined />
          <span>课程规划</span>
        </Breadcrumb.Item>
      </Breadcrumb>
      
      <Title level={2}>智能课程规划</Title>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <LessonPlanner 
          subjects={subjects}
          classes={classes}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default LessonPlannerPage; 