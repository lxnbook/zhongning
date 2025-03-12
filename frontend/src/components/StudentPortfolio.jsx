import React, { useState } from 'react';
import { Drawer, List, Avatar, Space, Text, Paragraph, Divider, Timeline, Tag, Empty, Rate } from 'antd';
import { StarOutlined, CommentOutlined, FileTextOutlined } from '@ant-design/icons';
import moment from 'moment';

const StudentPortfolio = () => {
  const [selectedWork, setSelectedWork] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [historyVisible, setHistoryVisible] = useState(false);

  const handleWorkSelect = (work) => {
    setSelectedWork(work);
    // Fetch assessments and feedback for the selected work
    // This is a placeholder and should be replaced with actual API calls
    setAssessments([]);
    setFeedback([]);
  };

  return (
    <Card>
      {/* 作品集抽屉 */}
      <Drawer
        title="作品集"
        placement="right"
        width={500}
        onClose={() => setSelectedWork(null)}
        open={selectedWork}
      >
        {/* 作品集内容 */}
      </Drawer>
      
      {/* 评估抽屉 */}
      <Drawer
        title="作品评估"
        placement="right"
        width={500}
        onClose={() => setSelectedWork(null)}
        open={selectedWork}
      >
        {selectedWork && (
          <>
            <Title level={5}>作品评估</Title>
            {assessments.filter(a => a.workId === selectedWork.id).length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={assessments.filter(a => a.workId === selectedWork.id)}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<StarOutlined />} />}
                      title={
                        <Space>
                          <span>{item.title || '评估'}</span>
                          <Rate disabled value={item.score} />
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size={0}>
                          <Text type="secondary">
                            评估人: {item.assessorName} | 日期: {moment(item.date).format('YYYY-MM-DD')}
                          </Text>
                          <Paragraph>{item.comments}</Paragraph>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="暂无相关评估" />
            )}
            
            <Divider />
            
            <Title level={5}>教师反馈</Title>
            {feedback.filter(f => f.workId === selectedWork.id).length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={feedback.filter(f => f.workId === selectedWork.id)}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<CommentOutlined />} />}
                      title={
                        <Space>
                          <span>{item.title}</span>
                          <Tag color="blue">{item.type}</Tag>
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size={0}>
                          <Text type="secondary">
                            反馈人: {item.teacherName} | 日期: {moment(item.createdAt).format('YYYY-MM-DD')}
                          </Text>
                          <Paragraph>{item.content}</Paragraph>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="暂无相关反馈" />
            )}
          </>
        )}
      </Drawer>
      
      {/* 历史记录抽屉 */}
      <Drawer
        title="作品集历史记录"
        placement="right"
        width={500}
        onClose={() => setHistoryVisible(false)}
        open={historyVisible}
      >
        <Timeline>
          {[...works, ...assessments, ...feedback]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((item, index) => (
              <Timeline.Item 
                key={index}
                color={
                  item.type === 'assessment' ? 'green' :
                  item.title ? 'blue' : 'red'
                }
                dot={
                  item.type === 'assessment' ? <StarOutlined /> :
                  item.title ? <FileTextOutlined /> : <CommentOutlined />
                }
              >
                <p>
                  <Text strong>
                    {item.type === 'assessment' ? '添加了评估' :
                     item.title ? `添加了作品《${item.title}》` : '添加了反馈'}
                  </Text>
                  <br />
                  <Text type="secondary">
                    {moment(item.createdAt).format('YYYY-MM-DD HH:mm')}
                  </Text>
                </p>
              </Timeline.Item>
            ))}
        </Timeline>
      </Drawer>
    </Card>
  );
};

export default StudentPortfolio; 