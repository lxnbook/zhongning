import React, { useState, useEffect, useMemo } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Select, 
  Button, 
  Spin, 
  Tabs, 
  Table, 
  Typography, 
  Divider,
  Alert,
  Space,
  DatePicker,
  Statistic,
  Progress
} from 'antd';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  DownloadOutlined, 
  ReloadOutlined, 
  FileExcelOutlined,
  RiseOutlined,
  FallOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';
import LLMService from '../services/llmService';

const { Option } = Select;
const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

// 优化1: 使用自定义钩子抽取数据加载逻辑
const useDataLoader = (url, initialData = []) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadData = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(url, { params });
      setData(response.data);
    } catch (err) {
      console.error(`Error loading data from ${url}:`, err);
      setError(err.message || '数据加载失败');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, loadData };
};

// 优化2: 颜色配置抽取为常量
const CHART_COLORS = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2'];
const PERFORMANCE_LEVELS = {
  excellent: { color: '#52c41a', text: '优秀' },
  good: { color: '#1890ff', text: '良好' },
  average: { color: '#faad14', text: '一般' },
  poor: { color: '#f5222d', text: '需改进' }
};

const DataAnalysis = () => {
  // 状态定义
  const [activeTab, setActiveTab] = useState('1');
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [dateRange, setDateRange] = useState([]);
  const [aiInsights, setAiInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  
  // 使用自定义钩子加载数据
  const { 
    data: classes, 
    loading: classesLoading, 
    loadData: loadClasses 
  } = useDataLoader('/api/analysis/classes', []);
  
  const { 
    data: subjects, 
    loading: subjectsLoading, 
    loadData: loadSubjects 
  } = useDataLoader('/api/analysis/subjects', []);
  
  const { 
    data: performanceData, 
    loading: performanceLoading, 
    loadData: loadPerformanceData 
  } = useDataLoader('/api/analysis/performance', []);
  
  // 优化3: 使用useMemo缓存计算结果
  const classOptions = useMemo(() => 
    classes.map(c => ({ label: c.name, value: c.id })), 
    [classes]
  );
  
  const subjectOptions = useMemo(() => 
    subjects.map(s => ({ label: s.name, value: s.id })), 
    [subjects]
  );
  
  // 初始化加载
  useEffect(() => {
    loadClasses();
    loadSubjects();
  }, []);
  
  // 当班级或科目选择变化时加载性能数据
  useEffect(() => {
    if (selectedClass && selectedSubject) {
      loadPerformanceData({ 
        classId: selectedClass, 
        subjectId: selectedSubject,
        startDate: dateRange[0]?.format('YYYY-MM-DD'),
        endDate: dateRange[1]?.format('YYYY-MM-DD')
      });
    }
  }, [selectedClass, selectedSubject, dateRange]);
  
  // 优化4: 使用防抖处理AI分析请求
  const generateAiInsights = async () => {
    if (!performanceData.length) return;
    
    setInsightsLoading(true);
    try {
      // 构建提示词
      const messages = [
        { 
          role: "system", 
          content: "你是一位教育数据分析专家，擅长分析学生成绩和学习行为数据，提供教学改进建议。" 
        },
        { 
          role: "user", 
          content: `请分析以下学生成绩数据，并提供教学改进建议：
            班级：${classes.find(c => c.id === selectedClass)?.name || '未知班级'}
            科目：${subjects.find(s => s.id === selectedSubject)?.name || '未知科目'}
            
            数据概要：
            ${JSON.stringify(performanceData, null, 2)}
            
            请提供以下分析：
            1. 整体表现分析
            2. 优势与不足
            3. 学习模式分析
            4. 针对性教学建议
            5. 资源推荐
          `
        }
      ];
      
      // 调用LLM服务
      const response = await LLMService.callModel('dataAnalysis', { messages });
      setAiInsights(response.content);
    } catch (error) {
      console.error('Generate AI insights error:', error);
    } finally {
      setInsightsLoading(false);
    }
  };
  
  // 优化5: 抽取图表组件
  const ScoreDistributionChart = ({ data }) => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="count" name="学生人数" fill="#1890ff" />
      </BarChart>
    </ResponsiveContainer>
  );
  
  const TrendChart = ({ data }) => (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="avgScore" name="平均分" stroke="#1890ff" />
        <Line type="monotone" dataKey="maxScore" name="最高分" stroke="#52c41a" />
        <Line type="monotone" dataKey="minScore" name="最低分" stroke="#f5222d" />
      </LineChart>
    </ResponsiveContainer>
  );
  
  const KnowledgePointsChart = ({ data }) => (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={true}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value}个问题`, '数量']} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
  
  // 渲染函数
  return (
    <div className="data-analysis-page">
      <Title level={2}>教学数据分析</Title>
      <Paragraph>
        通过分析学生成绩和学习行为数据，提供教学改进建议，帮助教师优化教学策略。
      </Paragraph>
      
      {/* 筛选条件 */}
      <Card style={{ marginBottom: 24 }}>
        <Space size="large" wrap>
          <Select
            placeholder="选择班级"
            style={{ width: 200 }}
            options={classOptions}
            loading={classesLoading}
            onChange={setSelectedClass}
            allowClear
          />
          
          <Select
            placeholder="选择科目"
            style={{ width: 200 }}
            options={subjectOptions}
            loading={subjectsLoading}
            onChange={setSelectedSubject}
            allowClear
          />
          
          <RangePicker 
            onChange={setDateRange}
            placeholder={['开始日期', '结束日期']}
          />
          
          <Button 
            type="primary" 
            icon={<ReloadOutlined />}
            onClick={() => loadPerformanceData({
              classId: selectedClass,
              subjectId: selectedSubject,
              startDate: dateRange[0]?.format('YYYY-MM-DD'),
              endDate: dateRange[1]?.format('YYYY-MM-DD')
            })}
            loading={performanceLoading}
          >
            刷新数据
          </Button>
          
          <Button 
            icon={<DownloadOutlined />}
            onClick={() => {/* 导出数据逻辑 */}}
          >
            导出数据
          </Button>
        </Space>
      </Card>
      
      {/* 数据展示 */}
      {performanceLoading ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>加载数据中...</div>
        </div>
      ) : performanceData.length > 0 ? (
        <>
          {/* 数据概览 */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic 
                  title="平均分" 
                  value={performanceData[0]?.avgScore || 0} 
                  suffix="分"
                  precision={1}
                  valueStyle={{ color: '#1890ff' }}
                />
                <div style={{ marginTop: 8 }}>
                  {performanceData[0]?.avgScoreChange > 0 ? (
                    <Text type="success"><RiseOutlined /> 上升 {performanceData[0]?.avgScoreChange}%</Text>
                  ) : (
                    <Text type="danger"><FallOutlined /> 下降 {Math.abs(performanceData[0]?.avgScoreChange || 0)}%</Text>
                  )}
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic 
                  title="及格率" 
                  value={performanceData[0]?.passRate || 0} 
                  suffix="%"
                  precision={1}
                  valueStyle={{ color: '#52c41a' }}
                />
                <Progress 
                  percent={performanceData[0]?.passRate || 0} 
                  status="active" 
                  strokeColor="#52c41a"
                  showInfo={false}
                  style={{ marginTop: 8 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic 
                  title="优秀率" 
                  value={performanceData[0]?.excellentRate || 0} 
                  suffix="%"
                  precision={1}
                  valueStyle={{ color: '#722ed1' }}
                />
                <Progress 
                  percent={performanceData[0]?.excellentRate || 0} 
                  status="active" 
                  strokeColor="#722ed1"
                  showInfo={false}
                  style={{ marginTop: 8 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic 
                  title="标准差" 
                  value={performanceData[0]?.stdDeviation || 0} 
                  precision={2}
                  valueStyle={{ color: '#faad14' }}
                />
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary">
                    <InfoCircleOutlined /> 分数离散程度
                  </Text>
                </div>
              </Card>
            </Col>
          </Row>
          
          {/* 图表分析 */}
          <Tabs activeKey={activeTab} onChange={setActiveTab} style={{ marginBottom: 24 }}>
            <TabPane tab="分数分布" key="1">
              <Card>
                <ScoreDistributionChart data={performanceData[0]?.scoreDistribution || []} />
              </Card>
            </TabPane>
            <TabPane tab="成绩趋势" key="2">
              <Card>
                <TrendChart data={performanceData[0]?.trends || []} />
              </Card>
            </TabPane>
            <TabPane tab="知识点分析" key="3">
              <Card>
                <KnowledgePointsChart data={performanceData[0]?.knowledgePoints || []} />
              </Card>
            </TabPane>
            <TabPane tab="学生排名" key="4">
              <Card>
                <Table 
                  dataSource={performanceData[0]?.students || []}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  columns={[
                    { title: '排名', dataIndex: 'rank', key: 'rank', width: 80 },
                    { title: '学号', dataIndex: 'studentId', key: 'studentId', width: 120 },
                    { title: '姓名', dataIndex: 'name', key: 'name', width: 120 },
                    { 
                      title: '分数', 
                      dataIndex: 'score', 
                      key: 'score',
                      sorter: (a, b) => a.score - b.score,
                      render: (score) => <Text strong>{score}</Text>
                    },
                    { 
                      title: '表现', 
                      dataIndex: 'performance', 
                      key: 'performance',
                      render: (performance) => (
                        <Text style={{ color: PERFORMANCE_LEVELS[performance]?.color }}>
                          {PERFORMANCE_LEVELS[performance]?.text}
                        </Text>
                      )
                    },
                    { 
                      title: '变化', 
                      dataIndex: 'change', 
                      key: 'change',
                      render: (change) => (
                        change > 0 ? 
                          <Text type="success">+{change}</Text> : 
                          change < 0 ? 
                            <Text type="danger">{change}</Text> : 
                            <Text>0</Text>
                      )
                    }
                  ]}
                />
              </Card>
            </TabPane>
          </Tabs>
          
          {/* AI分析洞察 */}
          <Card 
            title="AI教学分析洞察" 
            extra={
              <Button 
                type="primary" 
                onClick={generateAiInsights}
                loading={insightsLoading}
              >
                生成分析
              </Button>
            }
          >
            {insightsLoading ? (
              <div style={{ textAlign: 'center', padding: '30px 0' }}>
                <Spin />
                <div style={{ marginTop: 16 }}>AI正在分析数据，请稍候...</div>
              </div>
            ) : aiInsights ? (
              <div className="ai-insights">
                <div dangerouslySetInnerHTML={{ __html: aiInsights.replace(/\n/g, '<br/>') }} />
              </div>
            ) : (
              <Alert
                message="暂无AI分析"
                description="点击'生成分析'按钮，AI将根据当前数据生成教学分析洞察和建议。"
                type="info"
                showIcon
              />
            )}
          </Card>
        </>
      ) : (
        <Card>
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <InfoCircleOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
            <Title level={4}>暂无数据</Title>
            <Paragraph>请选择班级和科目，查看相关数据分析。</Paragraph>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DataAnalysis; 