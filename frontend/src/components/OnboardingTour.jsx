import React, { useState, useEffect } from 'react';
import { Tour, Button, Space, Typography } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useLocation } from 'react-router-dom';

const { Text } = Typography;

const OnboardingTour = () => {
  const [open, setOpen] = useState(false);
  const [steps, setSteps] = useState([]);
  const location = useLocation();

  // 根据当前路径设置不同的引导步骤
  useEffect(() => {
    const path = location.pathname;
    
    if (path === '/dashboard') {
      setSteps([
        {
          title: '欢迎使用教育智能助手',
          description: '这是您的个人仪表盘，您可以在这里查看重要信息和快速访问常用功能。',
          target: () => document.querySelector('.dashboard-header'),
        },
        {
          title: '快速操作',
          description: '这里提供了常用功能的快捷入口，点击即可快速进入相应功能。',
          target: () => document.querySelector('.quick-actions'),
        },
        {
          title: '最近活动',
          description: '这里显示您最近的操作记录，方便您快速回顾和继续之前的工作。',
          target: () => document.querySelector('.recent-activities'),
        }
      ]);
    } else if (path === '/teach-plan') {
      setSteps([
        {
          title: '智能教案生成',
          description: '在这里您可以生成智能教案，只需填写基本信息，AI将为您创建完整的教案。',
          target: () => document.querySelector('.teach-plan-form'),
        },
        {
          title: '自定义选项',
          description: '使用这些选项来精确控制生成内容，使教案更符合您的教学风格和需求。',
          target: () => document.querySelector('.custom-options'),
        },
        {
          title: '教案模板',
          description: '选择不同的模板风格，以适应不同的教学场景和学科特点。',
          target: () => document.querySelector('.template-selector'),
        }
      ]);
    } else if (path === '/data-analysis') {
      setSteps([
        {
          title: '数据分析中心',
          description: '这里提供了丰富的数据分析工具，帮助您深入了解学生的学习情况。',
          target: () => document.querySelector('.analysis-header'),
        },
        {
          title: '筛选条件',
          description: '使用这些筛选器来选择要分析的班级、科目和时间范围。',
          target: () => document.querySelector('.filter-section'),
        },
        {
          title: 'AI分析洞察',
          description: '点击"生成分析"按钮，AI将根据当前数据生成深度教学分析和建议。',
          target: () => document.querySelector('.ai-insights-card'),
        }
      ]);
    }
  }, [location.pathname]);

  // 检查是否是新用户或首次访问特定页面
  useEffect(() => {
    const path = location.pathname;
    const visitedPages = JSON.parse(localStorage.getItem('visitedPages') || '{}');
    
    if (!visitedPages[path]) {
      setOpen(true);
      // 记录已访问页面
      visitedPages[path] = true;
      localStorage.setItem('visitedPages', JSON.stringify(visitedPages));
    }
  }, [location.pathname]);

  return (
    <>
      <Tour
        open={open}
        onClose={() => setOpen(false)}
        steps={steps}
        type="primary"
      />
      <div style={{ position: 'fixed', right: 20, bottom: 20, zIndex: 1000 }}>
        <Button
          type="primary"
          shape="circle"
          icon={<QuestionCircleOutlined />}
          size="large"
          onClick={() => setOpen(true)}
          title="查看页面引导"
        />
      </div>
    </>
  );
};

export default OnboardingTour; 