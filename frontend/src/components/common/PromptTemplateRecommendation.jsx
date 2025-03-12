import React, { useState, useEffect } from 'react';
import { Card, List, Typography, Tag, Button, Skeleton } from 'antd';
import { StarOutlined, HistoryOutlined, FireOutlined } from '@ant-icons/material';
import apiService from '../../services/apiService';
import errorHandler from '../../services/errorHandler';

const { Text, Title } = Typography;

/**
 * 提示词模板推荐组件
 * 
 * @param {Object} props
 * @param {Function} props.onSelect - 选择模板后的回调函数
 * @param {string} props.userRole - 用户角色
 * @param {string} props.subject - 学科
 */
const PromptTemplateRecommendation = ({ onSelect, userRole, subject }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchRecommendations();
  }, [userRole, subject]);
  
  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const response = await apiService.get('/templates/recommendations');
      setRecommendations(response.data || []);
    } catch (error) {
      errorHandler.handleApiError(error, '获取推荐模板失败');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSelectTemplate = async (templateId) => {
    try {
      const response = await apiService.get(`/templates/${templateId}`);
      if (response.data && response.data.prompt) {
        onSelect(response.data.prompt);
      }
    } catch (error) {
      errorHandler.handleApiError(error, '获取模板详情失败');
    }
  };
  
  return (
    <Card title="为您推荐" extra={<Button type="link" onClick={fetchRecommendations}>刷新</Button>}>
      <Skeleton loading={loading} active>
        <List
          dataSource={recommendations}
          renderItem={item => (
            <List.Item
              actions={[
                <Button 
                  type="link" 
                  size="small"
                  onClick={() => handleSelectTemplate(item.id)}
                >
                  使用
                </Button>
              ]}
            >
              <List.Item.Meta
                title={item.name}
                description={
                  <>
                    {item.category === 'subjects' && (
                      <Tag color="blue">学科</Tag>
                    )}
                    {item.category === 'roles' && (
                      <Tag color="green">角色</Tag>
                    )}
                    {item.category === 'departments' && (
                      <Tag color="orange">部门</Tag>
                    )}
                    {item.category === 'functions' && (
                      <Tag color="purple">功能</Tag>
                    )}
                    <Text type="secondary">{item.description}</Text>
                    <div style={{ marginTop: 8 }}>
                      {item.tags.map(tag => (
                        <Tag key={tag} color="blue">{tag}</Tag>
                      ))}
                    </div>
                  </>
                }
              />
              {item.usageCount > 10 && (
                <Tag color="red" icon={<FireOutlined />}>
                  热门
                </Tag>
              )}
            </List.Item>
          )}
        />
      </Skeleton>
    </Card>
  );
};

export default PromptTemplateRecommendation; 