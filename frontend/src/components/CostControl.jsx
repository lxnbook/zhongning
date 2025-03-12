import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Statistic, 
  Progress, 
  Tabs, 
  Table, 
  Button, 
  Space, 
  Typography, 
  Alert, 
  Form, 
  InputNumber, 
  Select, 
  DatePicker, 
  Row, 
  Col,
  Tooltip,
  Modal,
  Divider
} from 'antd';
import { 
  DollarOutlined, 
  WarningOutlined, 
  CheckCircleOutlined, 
  LineChartOutlined, 
  SettingOutlined, 
  ReloadOutlined,
  BarChartOutlined,
  CalendarOutlined,
  RobotOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import costControlService from '../services/costControlService';
import { Line, Pie } from '@ant-design/charts';
import moment from 'moment';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;

const CostControl = () => {
  const [loading, setLoading] = useState(true);
  const [usageData, setUsageData] = useState(null);
  const [costData, setCostData] = useState(null);
  const [budgetStatus, setBudgetStatus] = useState(null);
  const [priceRates, setPriceRates] = useState({});
  const [budgets, setBudgets] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState([moment().subtract(30, 'days'), moment()]);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  
  // 初始化
  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        await costControlService.initialize();
        
        setUsageData(costControlService.getUsageData());
        setCostData(costControlService.getCostData());
        setBudgetStatus(costControlService.getBudgetStatus());
        setPriceRates(costControlService.getPriceRates());
        setBudgets(costControlService.getBudgets());
        
        setLoading(false);
      } catch (error) {
        console.error('Failed to initialize cost control:', error);
        setLoading(false);
      }
    };
    
    initialize();
  }, []);
  
  // 刷新数据
  const refreshData = async () => {
    try {
      setLoading(true);
      await costControlService.initialize();
      
      setUsageData(costControlService.getUsageData());
      setCostData(costControlService.getCostData());
      setBudgetStatus(costControlService.getBudgetStatus());
      setPriceRates(costControlService.getPriceRates());
      setBudgets(costControlService.getBudgets());
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to refresh cost control data:', error);
      setLoading(false);
    }
  };
  
  // 设置预算
  const handleSetBudget = async (values) => {
    try {
      await costControlService.setBudget(values.budgetType, values.amount);
      setBudgets(costControlService.getBudgets());
      setBudgetStatus(costControlService.getBudgetStatus());
    } catch (error) {
      console.error('Failed to set budget:', error);
    }
  };
  
  // 设置价格费率
  const handleSetPriceRate = async (values) => {
    try {
      await costControlService.setPriceRate(
        values.provider, 
        values.inputRate, 
        values.outputRate
      );
      
      setPriceRates(costControlService.getPriceRates());
      setCostData(costControlService.getCostData());
      setBudgetStatus(costControlService.getBudgetStatus());
    } catch (error) {
      console.error('Failed to set price rate:', error);
    }
  };
  
  // 清除使用数据
  const handleClearUsageData = async () => {
    try {
      await costControlService.clearUsageData();
      
      setUsageData(costControlService.getUsageData());
      setCostData(costControlService.getCostData());
      setBudgetStatus(costControlService.getBudgetStatus());
    } catch (error) {
      console.error('Failed to clear usage data:', error);
    }
  };
  
  // 渲染概览
  const renderOverview = () => {
    if (!budgetStatus) {
      return <Spin />;
    }
    
    return (
      <div>
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={12}>
            <Card>
              <Statistic
                title="本月API调用成本"
                value={budgetStatus.monthly.cost}
                precision={2}
                valueStyle={{ color: budgetStatus.monthly.exceeded ? '#cf1322' : '#3f8600' }}
                prefix={<DollarOutlined />}
                suffix="元"
              />
              <Paragraph style={{ marginTop: 16 }}>
                <Text>月预算: {budgetStatus.monthly.budget}元</Text>
                <Progress 
                  percent={budgetStatus.monthly.percentage.toFixed(1)} 
                  status={
                    budgetStatus.monthly.exceeded ? 'exception' : 
                    budgetStatus.monthly.warning ? 'warning' : 'normal'
                  }
                />
              </Paragraph>
              
              {budgetStatus.monthly.exceeded && (
                <Alert
                  message="月预算已超出"
                  type="error"
                  showIcon
                  icon={<WarningOutlined />}
                  style={{ marginTop: 16 }}
                />
              )}
              
              {!budgetStatus.monthly.exceeded && budgetStatus.monthly.warning && (
                <Alert
                  message="月预算即将超出"
                  type="warning"
                  showIcon
                  icon={<WarningOutlined />}
                  style={{ marginTop: 16 }}
                />
              )}
            </Card>
          </Col>
          
          <Col span={12}>
            <Card>
              <Statistic
                title="今日API调用成本"
                value={budgetStatus.daily.cost}
                precision={2}
                valueStyle={{ color: budgetStatus.daily.exceeded ? '#cf1322' : '#3f8600' }}
                prefix={<DollarOutlined />}
                suffix="元"
              />
              <Paragraph style={{ marginTop: 16 }}>
                <Text>日预算: {budgetStatus.daily.budget}元</Text>
                <Progress 
                  percent={budgetStatus.daily.percentage.toFixed(1)} 
                  status={
                    budgetStatus.daily.exceeded ? 'exception' : 
                    budgetStatus.daily.warning ? 'warning' : 'normal'
                  }
                />
              </Paragraph>
              
              {budgetStatus.daily.exceeded && (
                <Alert
                  message="日预算已超出"
                  type="error"
                  showIcon
                  icon={<WarningOutlined />}
                  style={{ marginTop: 16 }}
                />
              )}
              
              {!budgetStatus.daily.exceeded && budgetStatus.daily.warning && (
                <Alert
                  message="日预算即将超出"
                  type="warning"
                  showIcon
                  icon={<WarningOutlined />}
                  style={{ marginTop: 16 }}
                />
              )}
            </Card>
          </Col>
        </Row>
        
        {renderProviderCostChart()}
      </div>
    );
  };
  
  // 渲染提供商成本图表
  const renderProviderCostChart = () => {
    if (!costData || !costData.providers) {
      return null;
    }
    
    const data = Object.entries(costData.providers).map(([provider, cost]) => ({
      type: provider,
      value: cost
    }));
    
    const config = {
      appendPadding: 10,
      data,
      angleField: 'value',
      colorField: 'type',
      radius: 0.8,
      label: {
        type: 'outer',
        content: '{name}: {value}元'
      },
      interactions: [{ type: 'element-active' }]
    };
    
    return (
      <Card title="提供商成本分布" style={{ marginBottom: 24 }}>
        <Pie {...config} />
      </Card>
    );
  };
  
  // 渲染使用统计
  const renderUsageStats = () => {
    if (!usageData || !costData) {
      return <Spin />;
    }
    
    return (
      <div>
        {renderDailyUsageChart()}
        {renderProviderUsageTable()}
        {renderMonthlyUsageTable()}
      </div>
    );
  };
  
  // 渲染每日使用图表
  const renderDailyUsageChart = () => {
    if (!usageData.daily || !costData.daily) {
      return null;
    }
    
    // 获取日期范围内的数据
    const startDate = dateRange[0].format('YYYY-MM-DD');
    const endDate = dateRange[1].format('YYYY-MM-DD');
    
    const data = [];
    let currentDate = moment(startDate);
    
    while (currentDate.isSameOrBefore(endDate)) {
      const dateStr = currentDate.format('YYYY-MM-DD');
      const cost = costData.daily[dateStr] || 0;
      const calls = usageData.daily[dateStr]?.calls || 0;
      
      data.push({
        date: dateStr,
        value: cost,
        category: '成本',
        calls
      });
      
      currentDate = currentDate.add(1, 'days');
    }
    
    const config = {
      data,
      xField: 'date',
      yField: 'value',
      seriesField: 'category',
      point: {
        size: 5,
        shape: 'diamond'
      },
      tooltip: {
        formatter: (datum) => {
          return { name: datum.category, value: `${datum.value.toFixed(2)}元 (${datum.calls}次调用)` };
        }
      }
    };
    
    return (
      <Card 
        title="每日使用统计" 
        style={{ marginBottom: 24 }}
        extra={
          <Space>
            <RangePicker 
              value={dateRange}
              onChange={setDateRange}
              allowClear={false}
            />
          </Space>
        }
      >
        <Line {...config} />
      </Card>
    );
  };
  
  // 渲染提供商使用表格
  const renderProviderUsageTable = () => {
    if (!usageData.providers || !costData.providers) {
      return null;
    }
    
    const columns = [
      {
        title: '提供商',
        dataIndex: 'provider',
        key: 'provider',
      },
      {
        title: 'API调用次数',
        dataIndex: 'calls',
        key: 'calls',
        sorter: (a, b) => a.calls - b.calls,
      },
      {
        title: '输入Token',
        dataIndex: 'inputTokens',
        key: 'inputTokens',
        sorter: (a, b) => a.inputTokens - b.inputTokens,
      },
      {
        title: '输出Token',
        dataIndex: 'outputTokens',
        key: 'outputTokens',
        sorter: (a, b) => a.outputTokens - b.outputTokens,
      },
      {
        title: '成本',
        dataIndex: 'cost',
        key: 'cost',
        sorter: (a, b) => a.cost - b.cost,
        render: (text) => `${text.toFixed(2)}元`
      }
    ];
    
    const data = Object.entries(usageData.providers).map(([provider, usage]) => ({
      key: provider,
      provider,
      calls: usage.calls,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      cost: costData.providers[provider] || 0
    }));
    
    return (
      <Card title="提供商使用统计" style={{ marginBottom: 24 }}>
        <Table 
          columns={columns} 
          dataSource={data} 
          pagination={false}
        />
      </Card>
    );
  };
  
  // 渲染月度使用表格
  const renderMonthlyUsageTable = () => {
    if (!usageData.monthly || !costData.monthly) {
      return null;
    }
    
    const columns = [
      {
        title: '月份',
        dataIndex: 'month',
        key: 'month',
      },
      {
        title: 'API调用次数',
        dataIndex: 'calls',
        key: 'calls',
        sorter: (a, b) => a.calls - b.calls,
      },
      {
        title: '输入Token',
        dataIndex: 'inputTokens',
        key: 'inputTokens',
        sorter: (a, b) => a.inputTokens - b.inputTokens,
      },
      {
        title: '输出Token',
        dataIndex: 'outputTokens',
        key: 'outputTokens',
        sorter: (a, b) => a.outputTokens - b.outputTokens,
      },
      {
        title: '成本',
        dataIndex: 'cost',
        key: 'cost',
        sorter: (a, b) => a.cost - b.cost,
        render: (text) => `${text.toFixed(2)}元`
      }
    ];
    
    const data = Object.entries(usageData.monthly).map(([month, usage]) => ({
      key: month,
      month,
      calls: usage.calls,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      cost: costData.monthly[month] || 0
    }));
    
    return (
      <Card title="月度使用统计">
        <Table 
          columns={columns} 
          dataSource={data} 
          pagination={false}
        />
      </Card>
    );
  };
  
  // 渲染设置
  const renderSettings = () => {
    return (
      <div>
        <Card title="预算设置" style={{ marginBottom: 24 }}>
          <Form layout="inline" onFinish={handleSetBudget}>
            <Form.Item
              name="budgetType"
              label="预算类型"
              rules={[{ required: true, message: '请选择预算类型' }]}
            >
              <Select style={{ width: 120 }}>
                <Option value="daily">日预算</Option>
                <Option value="monthly">月预算</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="amount"
              label="金额"
              rules={[{ required: true, message: '请输入金额' }]}
            >
              <InputNumber 
                min={0} 
                step={10} 
                style={{ width: 120 }} 
                formatter={value => `${value}元`}
                parser={value => value.replace('元', '')}
              />
            </Form.Item>
            
            <Form.Item>
              <Button type="primary" htmlType="submit">
                设置
              </Button>
            </Form.Item>
          </Form>
          
          <Divider />
          
          <Paragraph>
            <Text strong>当前预算设置：</Text>
          </Paragraph>
          
          <Row gutter={16}>
            <Col span={12}>
              <Statistic 
                title="月预算" 
                value={budgets.monthly || 0} 
                suffix="元" 
                precision={2}
              />
            </Col>
            <Col span={12}>
              <Statistic 
                title="日预算" 
                value={budgets.daily || 0} 
                suffix="元" 
                precision={2}
              />
            </Col>
          </Row>
        </Card>
        
        <Card title="价格费率设置" style={{ marginBottom: 24 }}>
          <Form layout="inline" onFinish={handleSetPriceRate}>
            <Form.Item
              name="provider"
              label="提供商"
              rules={[{ required: true, message: '请选择提供商' }]}
            >
              <Select style={{ width: 120 }}>
                {Object.keys(priceRates).map(provider => (
                  <Option key={provider} value={provider}>{provider}</Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item
              name="inputRate"
              label="输入费率"
              rules={[{ required: true, message: '请输入输入费率' }]}
            >
              <InputNumber 
                min={0} 
                step={0.01} 
                style={{ width: 120 }} 
                formatter={value => `${value}元/K`}
                parser={value => value.replace('元/K', '')}
              />
            </Form.Item>
            
            <Form.Item
              name="outputRate"
              label="输出费率"
              rules={[{ required: true, message: '请输入输出费率' }]}
            >
              <InputNumber 
                min={0} 
                step={0.01} 
                style={{ width: 120 }} 
                formatter={value => `${value}元/K`}
                parser={value => value.replace('元/K', '')}
              />
            </Form.Item>
            
            <Form.Item>
              <Button type="primary" htmlType="submit">
                设置
              </Button>
            </Form.Item>
          </Form>
          
          <Divider />
          
          <Paragraph>
            <Text strong>当前价格费率设置：</Text>
          </Paragraph>
          
          <Table
            dataSource={Object.entries(priceRates).map(([provider, rates]) => ({
              key: provider,
              provider,
              inputRate: rates.input,
              outputRate: rates.output
            }))}
            columns={[
              {
                title: '提供商',
                dataIndex: 'provider',
                key: 'provider'
              },
              {
                title: '输入费率',
                dataIndex: 'inputRate',
                key: 'inputRate',
                render: (text) => `${text}元/K`
              },
              {
                title: '输出费率',
                dataIndex: 'outputRate',
                key: 'outputRate',
                render: (text) => `${text}元/K`
              }
            ]}
            pagination={false}
          />
        </Card>
        
        <Card title="数据管理">
          <Button 
            type="danger" 
            icon={<ReloadOutlined />}
            onClick={() => {
              Modal.confirm({
                title: '确认清除使用数据',
                content: '这将清除所有使用数据和成本统计，此操作不可恢复。',
                onOk: handleClearUsageData
              });
            }}
          >
            清除使用数据
          </Button>
        </Card>
      </div>
    );
  };
  
  return (
    <Card
      title={
        <Space>
          <DollarOutlined />
          <span>API成本控制</span>
        </Space>
      }
      extra={
        <Space>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={refreshData}
            loading={loading}
          >
            刷新
          </Button>
          <Button 
            icon={<SettingOutlined />} 
            onClick={() => setSettingsModalVisible(true)}
          >
            设置
          </Button>
        </Space>
      }
    >
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
              <BarChartOutlined />
              使用统计
            </span>
          } 
          key="usage"
        >
          {renderUsageStats()}
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <SettingOutlined />
              设置
            </span>
          } 
          key="settings"
        >
          {renderSettings()}
        </TabPane>
      </Tabs>
      
      <Modal
        title="成本控制设置"
        visible={settingsModalVisible}
        onCancel={() => setSettingsModalVisible(false)}
        footer={null}
        width={800}
      >
        {renderSettings()}
      </Modal>
    </Card>
  );
};

export default CostControl; 