import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Table, 
  Progress, 
  Tabs, 
  Space, 
  Typography, 
  Alert, 
  Spin, 
  Tag, 
  Tooltip,
  Select,
  Empty,
  Statistic,
  Row,
  Col,
  Divider
} from 'antd';
import { 
  ExperimentOutlined, 
  RobotOutlined, 
  SyncOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  InfoCircleOutlined,
  LineChartOutlined,
  ThunderboltOutlined,
  StarOutlined
} from '@ant-design/icons';
import modelEvaluationService from '../services/modelEvaluationService';
import { TASK_TYPES } from '../services/llmService';
import { Bar } from '@ant-design/charts';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const ModelEvaluation = () => {
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [currentTaskType, setCurrentTaskType] = useState(TASK_TYPES.CONTENT_GENERATION);
  const [evaluationResults, setEvaluationResults] = useState(null);
  const [progressInfo, setProgressInfo] = useState({ provider: '', current: 0, total: 0 });
  const [activeTab, setActiveTab] = useState('overview');
  
  // 加载评估结果
  useEffect(() => {
    const results = modelEvaluationService.getEvaluationResults(currentTaskType);
    setEvaluationResults(results);
  }, [currentTaskType]);
  
  // 运行基准测试
  const runBenchmark = async () => {
    try {
      setEvaluating(true);
      
      const results = await modelEvaluationService.runBenchmark(currentTaskType, {
        onProgress: (provider, current, total) => {
          setProgressInfo({ provider, current, total });
        }
      });
      
      setEvaluationResults(results);
    } catch (error) {
      console.error('Benchmark failed:', error);
    } finally {
      setEvaluating(false);
    }
  };
  
  // 获取任务类型的友好名称
  const getTaskTypeName = (type) => {
    const taskNames = {
      content_generation: '内容生成',
      lesson_planning: '课程规划',
      assessment_creation: '评估创建',
      feedback_analysis: '反馈分析',
      student_evaluation: '学生评估',
      question_answering: '问题回答',
      summarization: '内容总结',
      translation: '翻译',
      code_generation: '代码生成',
      creative_writing: '创意写作'
    };
    
    return taskNames[type] || type;
  };
  
  // 渲染概览
  const renderOverview = () => {
    if (!evaluationResults) {
      return (
        <Empty 
          description="暂无评估数据" 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      );
    }
    
    // 准备图表数据
    const chartData = [];
    for (const provider in evaluationResults) {
      const result = evaluationResults[provider];
      
      chartData.push({
        provider,
        metric: '准确性',
        value: result.accuracy
      });
      
      chartData.push({
        provider,
        metric: '相关性',
        value: result.relevance
      });
      
      chartData.push({
        provider,
        metric: '完整性',
        value: result.completeness
      });
      
      chartData.push({
        provider,
        metric: '速度',
        value: result.speed
      });
      
      chartData.push({
        provider,
        metric: '可靠性',
        value: result.reliability
      });
    }
    
    // 图表配置
    const config = {
      data: chartData,
      isGroup: true,
      xField: 'metric',
      yField: 'value',
      seriesField: 'provider',
      label: {
        position: 'middle',
        layout: [
          { type: 'interval-adjust-position' },
          { type: 'interval-hide-overlap' },
          { type: 'adjust-color' }
        ]
      }
    };
    
    // 准备排名数据
    const rankingData = Object.entries(evaluationResults)
      .map(([provider, result]) => ({
        provider,
        overallScore: result.overallScore
      }))
      .sort((a, b) => b.overallScore - a.overallScore);
    
    return (
      <div>
        <Row gutter={16} style={{ marginBottom: 24 }}>
          {rankingData.map((item, index) => (
            <Col span={8} key={item.provider}>
              <Card>
                <Statistic
                  title={
                    <Space>
                      {index === 0 && <StarOutlined style={{ color: '#faad14' }} />}
                      <span>{item.provider}</span>
                    </Space>
                  }
                  value={item.overallScore.toFixed(1)}
                  suffix="/100"
                  valueStyle={{ color: index === 0 ? '#3f8600' : undefined }}
                />
                <Progress 
                  percent={item.overallScore} 
                  status={index === 0 ? 'success' : 'normal'} 
                  showInfo={false}
                />
              </Card>
            </Col>
          ))}
        </Row>
        
        <Card title="性能对比" style={{ marginBottom: 24 }}>
          <Bar {...config} />
        </Card>
        
        <Card title="评估结论">
          <Paragraph>
            基于对{Object.keys(evaluationResults).length}个LLM模型在{getTaskTypeName(currentTaskType)}任务上的评估，
            我们得出以下结论：
          </Paragraph>
          
          {rankingData.length > 0 && (
            <Alert
              message={`${rankingData[0].provider} 在此任务中表现最佳，综合评分为 ${rankingData[0].overallScore.toFixed(1)}/100`}
              type="success"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}
          
          <Paragraph>
            <ul>
              {rankingData.map((item, index) => (
                <li key={item.provider}>
                  <Text strong>{item.provider}</Text>: 
                  {index === 0 && ' 表现最佳，'}
                  {index === 1 && ' 表现良好，'}
                  {index > 1 && ' 表现一般，'}
                  综合评分 {item.overallScore.toFixed(1)}/100
                </li>
              ))}
            </ul>
          </Paragraph>
        </Card>
      </div>
    );
  };
  
  // 渲染详细结果
  const renderDetails = () => {
    if (!evaluationResults) {
      return (
        <Empty 
          description="暂无评估数据" 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      );
    }
    
    const columns = [
      {
        title: '提供商',
        dataIndex: 'provider',
        key: 'provider',
        render: text => <Tag color="blue">{text}</Tag>
      },
      {
        title: '准确性',
        dataIndex: 'accuracy',
        key: 'accuracy',
        render: value => <Progress percent={value.toFixed(1)} size="small" />
      },
      {
        title: '相关性',
        dataIndex: 'relevance',
        key: 'relevance',
        render: value => <Progress percent={value.toFixed(1)} size="small" />
      },
      {
        title: '完整性',
        dataIndex: 'completeness',
        key: 'completeness',
        render: value => <Progress percent={value.toFixed(1)} size="small" />
      },
      {
        title: '速度',
        dataIndex: 'speed',
        key: 'speed',
        render: value => <Progress percent={value.toFixed(1)} size="small" />
      },
      {
        title: '可靠性',
        dataIndex: 'reliability',
        key: 'reliability',
        render: value => <Progress percent={value.toFixed(1)} size="small" />
      },
      {
        title: '综合评分',
        dataIndex: 'overallScore',
        key: 'overallScore',
        sorter: (a, b) => a.overallScore - b.overallScore,
        defaultSortOrder: 'descend',
        render: value => (
          <Text strong style={{ color: value > 80 ? '#3f8600' : undefined }}>
            {value.toFixed(1)}
          </Text>
        )
      }
    ];
    
    const data = Object.entries(evaluationResults).map(([provider, result]) => ({
      key: provider,
      provider,
      ...result
    }));
    
    return (
      <Table 
        columns={columns} 
        dataSource={data} 
        pagination={false}
      />
    );
  };
  
  return (
    <Card
      title={
        <Space>
          <ExperimentOutlined />
          <span>LLM模型评估</span>
        </Space>
      }
      extra={
        <Space>
          <Select
            value={currentTaskType}
            onChange={setCurrentTaskType}
            style={{ width: 150 }}
            disabled={evaluating}
          >
            {Object.values(TASK_TYPES).map(type => (
              <Option key={type} value={type}>{getTaskTypeName(type)}</Option>
            ))}
          </Select>
          
          <Button
            type="primary"
            icon={<ExperimentOutlined />}
            onClick={runBenchmark}
            loading={evaluating}
          >
            运行基准测试
          </Button>
        </Space>
      }
    >
      {evaluating && (
        <Alert
          message="正在评估中..."
          description={
            <div>
              <Text>正在评估 {progressInfo.provider} ({progressInfo.current + 1}/{progressInfo.total})</Text>
              <Progress percent={((progressInfo.current + 1) / progressInfo.total * 100).toFixed(0)} />
            </div>
          }
          type="info"
          showIcon
          icon={<SyncOutlined spin />}
          style={{ marginBottom: 16 }}
        />
      )}
      
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane 
          tab={
            <span>
              <LineChartOutlined />
              概览
            </span>
          } 
          key="overview"
        >
          {renderOverview()}
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <ThunderboltOutlined />
              详细结果
            </span>
          } 
          key="details"
        >
          {renderDetails()}
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default ModelEvaluation; 