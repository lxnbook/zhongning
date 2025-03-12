import React, { useState, useEffect, useRef } from 'react';
import { 
  Card, 
  Select, 
  Button, 
  Radio, 
  DatePicker, 
  Spin, 
  Empty, 
  Tabs, 
  Typography, 
  Space, 
  Tooltip, 
  Divider,
  Row,
  Col,
  Statistic,
  Alert,
  Dropdown,
  Menu,
  Switch,
  Slider
} from 'antd';
import { 
  BarChartOutlined, 
  LineChartOutlined, 
  PieChartOutlined, 
  DownloadOutlined,
  ReloadOutlined,
  SettingOutlined,
  InfoCircleOutlined,
  RiseOutlined,
  FallOutlined,
  EyeOutlined,
  FilterOutlined,
  FullscreenOutlined,
  TableOutlined
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import apiService from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

const DataVisualization = ({
  dataType = 'performance', // 'performance', 'attendance', 'activity', 'progress'
  subjectId,
  classId,
  timeRange,
  height = 500,
  showControls = true,
  onDataLoaded
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [chartType, setChartType] = useState('bar');
  const [selectedClass, setSelectedClass] = useState(classId);
  const [selectedSubject, setSelectedSubject] = useState(subjectId);
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange || 'semester');
  const [dateRange, setDateRange] = useState(null);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [compareMode, setCompareMode] = useState(false);
  const [compareTarget, setCompareTarget] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [chartSettings, setChartSettings] = useState({
    showLegend: true,
    showDataLabels: true,
    enableAnimation: true,
    colorScheme: 'default',
    stackMode: false
  });
  
  const chartRef = useRef(null);
  const { user } = useAuth();

  // 加载班级和科目数据
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [classesResponse, subjectsResponse] = await Promise.all([
          apiService.get('/classes'),
          apiService.get('/subjects')
        ]);
        setClasses(classesResponse);
        setSubjects(subjectsResponse);
      } catch (error) {
        console.error('加载元数据失败:', error);
      }
    };

    fetchMetadata();
  }, []);

  // 当选择的班级、科目或时间范围变化时，加载数据
  useEffect(() => {
    if (selectedClass && selectedSubject) {
      fetchData();
    }
  }, [selectedClass, selectedSubject, selectedTimeRange, dateRange, compareMode, compareTarget]);

  // 获取数据
  const fetchData = async () => {
    setLoading(true);
    try {
      let endpoint;
      const params = {
        classId: selectedClass,
        subjectId: selectedSubject,
        timeRange: selectedTimeRange
      };

      if (dateRange) {
        params.startDate = dateRange[0].format('YYYY-MM-DD');
        params.endDate = dateRange[1].format('YYYY-MM-DD');
      }

      if (compareMode && compareTarget) {
        params.compareTarget = compareTarget;
      }

      switch (dataType) {
        case 'performance':
          endpoint = '/analytics/performance';
          break;
        case 'attendance':
          endpoint = '/analytics/attendance';
          break;
        case 'activity':
          endpoint = '/analytics/activity';
          break;
        case 'progress':
          endpoint = '/analytics/progress';
          break;
        default:
          endpoint = '/analytics/performance';
      }

      const response = await apiService.get(endpoint, { params });
      setData(response);
      
      if (onDataLoaded) {
        onDataLoaded(response);
      }
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 下载图表为图片
  const downloadAsImage = () => {
    if (chartRef.current) {
      const echartInstance = chartRef.current.getEchartsInstance();
      const url = echartInstance.getDataURL({
        type: 'png',
        pixelRatio: 2,
        backgroundColor: '#fff'
      });
      
      const link = document.createElement('a');
      link.download = `${dataType}_chart_${new Date().toISOString().split('T')[0]}.png`;
      link.href = url;
      link.click();
    }
  };

  // 下载为PDF
  const downloadAsPDF = async () => {
    if (chartRef.current) {
      const element = chartRef.current.ele;
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#fff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${dataType}_report_${new Date().toISOString().split('T')[0]}.pdf`);
    }
  };

  // 获取图表配置
  const getChartOption = () => {
    if (!data) return {};

    const { colorScheme, showLegend, showDataLabels, enableAnimation, stackMode } = chartSettings;
    
    // 颜色方案
    const colorMaps = {
      default: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4'],
      blue: ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896'],
      green: ['#2ca02c', '#98df8a', '#d62728', '#ff9896', '#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78'],
      warm: ['#ff7f0e', '#ffbb78', '#d62728', '#ff9896', '#1f77b4', '#aec7e8', '#2ca02c', '#98df8a']
    };
    
    const colors = colorMaps[colorScheme] || colorMaps.default;
    
    // 基本配置
    const baseOption = {
      color: colors,
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        show: showLegend,
        top: 'bottom',
        data: []
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '8%',
        containLabel: true
      },
      animation: enableAnimation,
      animationDuration: 1000,
      animationEasing: 'elasticOut'
    };
    
    // 根据数据类型和图表类型生成不同的配置
    switch (dataType) {
      case 'performance':
        return getPerformanceChartOption(baseOption);
      case 'attendance':
        return getAttendanceChartOption(baseOption);
      case 'activity':
        return getActivityChartOption(baseOption);
      case 'progress':
        return getProgressChartOption(baseOption);
      default:
        return baseOption;
    }
  };

  // 获取成绩分析图表配置
  const getPerformanceChartOption = (baseOption) => {
    if (!data || !data.performance) return baseOption;
    
    const { performance } = data;
    const { showDataLabels, stackMode } = chartSettings;
    
    // 提取数据
    const categories = performance.map(item => item.name);
    const series = [];
    
    // 确定所有可能的系列名称
    const allSeriesNames = new Set();
    performance.forEach(item => {
      Object.keys(item).forEach(key => {
        if (key !== 'name') {
          allSeriesNames.add(key);
        }
      });
    });
    
    // 为每个系列创建数据
    allSeriesNames.forEach(seriesName => {
      if (seriesName !== 'name') {
        const seriesData = performance.map(item => item[seriesName] || 0);
        
        series.push({
          name: seriesName,
          type: chartType,
          stack: stackMode ? 'total' : undefined,
          data: seriesData,
          label: {
            show: showDataLabels,
            position: 'top'
          }
        });
      }
    });
    
    // 更新图例数据
    baseOption.legend.data = Array.from(allSeriesNames).filter(name => name !== 'name');
    
    return {
      ...baseOption,
      xAxis: {
        type: 'category',
        data: categories,
        axisLabel: {
          rotate: categories.length > 5 ? 45 : 0
        }
      },
      yAxis: {
        type: 'value',
        name: '分数',
        nameLocation: 'end'
      },
      series
    };
  };

  // 获取出勤率图表配置
  const getAttendanceChartOption = (baseOption) => {
    if (!data || !data.attendance) return baseOption;
    
    const { attendance } = data;
    const { showDataLabels } = chartSettings;
    
    // 提取数据
    const categories = attendance.map(item => item.date);
    
    // 根据图表类型创建不同的配置
    if (chartType === 'pie') {
      // 饼图展示平均出勤率
      const attendanceData = attendance.map(item => ({
        name: item.date,
        value: item.rate
      }));
      
      return {
        ...baseOption,
        series: [{
          name: '出勤率',
          type: 'pie',
          radius: '60%',
          center: ['50%', '50%'],
          data: attendanceData,
          label: {
            show: showDataLabels,
            formatter: '{b}: {c}%'
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
      };
    } else {
      // 柱状图或折线图
      return {
        ...baseOption,
        xAxis: {
          type: 'category',
          data: categories,
          axisLabel: {
            rotate: categories.length > 10 ? 45 : 0
          }
        },
        yAxis: {
          type: 'value',
          name: '出勤率 (%)',
          min: 0,
          max: 100
        },
        series: [{
          name: '出勤率',
          type: chartType,
          data: attendance.map(item => item.rate),
          label: {
            show: showDataLabels,
            position: 'top',
            formatter: '{c}%'
          }
        }]
      };
    }
  };

  // 获取活动参与图表配置
  const getActivityChartOption = (baseOption) => {
    if (!data || !data.activities) return baseOption;
    
    const { activities } = data;
    const { showDataLabels, stackMode } = chartSettings;
    
    // 提取数据
    const categories = activities.map(item => item.name);
    const participationData = activities.map(item => item.participation);
    const completionData = activities.map(item => item.completion);
    
    // 根据图表类型创建不同的配置
    if (chartType === 'pie') {
      // 饼图展示平均参与率
      const totalParticipation = participationData.reduce((sum, val) => sum + val, 0);
      const avgParticipation = totalParticipation / participationData.length;
      
      return {
        ...baseOption,
        series: [{
          name: '活动参与',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '50%'],
          data: [
            { name: '参与', value: avgParticipation },
            { name: '未参与', value: 100 - avgParticipation }
          ],
          label: {
            show: showDataLabels,
            formatter: '{b}: {c}%'
          }
        }]
      };
    } else {
      // 柱状图或折线图
      return {
        ...baseOption,
        xAxis: {
          type: 'category',
          data: categories,
          axisLabel: {
            rotate: categories.length > 5 ? 45 : 0
          }
        },
        yAxis: {
          type: 'value',
          name: '百分比 (%)',
          min: 0,
          max: 100
        },
        series: [
          {
            name: '参与率',
            type: chartType,
            stack: stackMode ? 'total' : undefined,
            data: participationData,
            label: {
              show: showDataLabels,
              position: 'top',
              formatter: '{c}%'
            }
          },
          {
            name: '完成率',
            type: chartType,
            stack: stackMode ? 'total' : undefined,
            data: completionData,
            label: {
              show: showDataLabels,
              position: 'top',
              formatter: '{c}%'
            }
          }
        ]
      };
    }
  };

  // 获取学习进度图表配置
  const getProgressChartOption = (baseOption) => {
    if (!data || !data.progress) return baseOption;
    
    const { progress } = data;
    const { showDataLabels } = chartSettings;
    
    // 提取数据
    const categories = progress.map(item => item.module);
    const completionData = progress.map(item => item.completion);
    const masteryData = progress.map(item => item.mastery);
    
    return {
      ...baseOption,
      xAxis: {
        type: 'category',
        data: categories,
        axisLabel: {
          rotate: categories.length > 5 ? 45 : 0
        }
      },
      yAxis: {
        type: 'value',
        name: '百分比 (%)',
        min: 0,
        max: 100
      },
      series: [
        {
          name: '完成度',
          type: chartType,
          data: completionData,
          label: {
            show: showDataLabels,
            position: 'top',
            formatter: '{c}%'
          }
        },
        {
          name: '掌握度',
          type: chartType,
          data: masteryData,
          label: {
            show: showDataLabels,
            position: 'top',
            formatter: '{c}%'
          }
        }
      ]
    };
  };

  // 渲染图表控制面板
  const renderControls = () => {
    if (!showControls) return null;
    
    return (
      <div style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6} lg={4}>
            <Select
              placeholder="选择班级"
              style={{ width: '100%' }}
              value={selectedClass}
              onChange={setSelectedClass}
            >
              {classes.map(cls => (
                <Option key={cls.id} value={cls.id}>{cls.name}</Option>
              ))}
            </Select>
          </Col>
          
          <Col xs={24} sm={12} md={6} lg={4}>
            <Select
              placeholder="选择科目"
              style={{ width: '100%' }}
              value={selectedSubject}
              onChange={setSelectedSubject}
            >
              {subjects.map(subject => (
                <Option key={subject.id} value={subject.id}>{subject.name}</Option>
              ))}
            </Select>
          </Col>
          
          <Col xs={24} sm={12} md={6} lg={4}>
            <Select
              placeholder="时间范围"
              style={{ width: '100%' }}
              value={selectedTimeRange}
              onChange={setSelectedTimeRange}
            >
              <Option value="week">本周</Option>
              <Option value="month">本月</Option>
              <Option value="semester">本学期</Option>
              <Option value="year">本学年</Option>
              <Option value="custom">自定义</Option>
            </Select>
          </Col>
          
          {selectedTimeRange === 'custom' && (
            <Col xs={24} sm={12} md={8} lg={6}>
              <RangePicker 
                style={{ width: '100%' }} 
                value={dateRange}
                onChange={setDateRange}
              />
            </Col>
          )}
          
          <Col xs={24} sm={12} md={6} lg={4}>
            <Radio.Group 
              value={chartType} 
              onChange={e => setChartType(e.target.value)}
              buttonStyle="solid"
            >
              <Tooltip title="柱状图">
                <Radio.Button value="bar"><BarChartOutlined /></Radio.Button>
              </Tooltip>
              <Tooltip title="折线图">
                <Radio.Button value="line"><LineChartOutlined /></Radio.Button>
              </Tooltip>
              <Tooltip title="饼图">
                <Radio.Button value="pie"><PieChartOutlined /></Radio.Button>
              </Tooltip>
            </Radio.Group>
          </Col>
          
          <Col xs={24} sm={12} md={6} lg={4}>
            <Space>
              <Tooltip title="刷新数据">
                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={fetchData}
                />
              </Tooltip>
              
              <Dropdown
                overlay={
                  <Menu>
                    <Menu.Item key="png" onClick={downloadAsImage}>
                      下载为PNG图片
                    </Menu.Item>
                    <Menu.Item key="pdf" onClick={downloadAsPDF}>
                      下载为PDF报告
                    </Menu.Item>
                  </Menu>
                }
              >
                <Button icon={<DownloadOutlined />}>
                  导出
                </Button>
              </Dropdown>
              
              <Tooltip title="图表设置">
                <Button 
                  icon={<SettingOutlined />} 
                  onClick={() => setShowSettings(!showSettings)}
                  type={showSettings ? 'primary' : 'default'}
                />
              </Tooltip>
            </Space>
          </Col>
        </Row>
        
        {showSettings && (
          <Card size="small" style={{ marginTop: 16 }}>
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <div>
                  <Text>显示图例</Text>
                  <Switch 
                    checked={chartSettings.showLegend} 
                    onChange={checked => setChartSettings({...chartSettings, showLegend: checked})}
                    style={{ marginLeft: 8 }}
                  />
                </div>
              </Col>
              
              <Col span={8}>
                <div>
                  <Text>显示数据标签</Text>
                  <Switch 
                    checked={chartSettings.showDataLabels} 
                    onChange={checked => setChartSettings({...chartSettings, showDataLabels: checked})}
                    style={{ marginLeft: 8 }}
                  />
                </div>
              </Col>
              
              <Col span={8}>
                <div>
                  <Text>启用动画</Text>
                  <Switch 
                    checked={chartSettings.enableAnimation} 
                    onChange={checked => setChartSettings({...chartSettings, enableAnimation: checked})}
                    style={{ marginLeft: 8 }}
                  />
                </div>
              </Col>
              
              <Col span={8}>
                <div>
                  <Text>堆叠模式</Text>
                  <Switch 
                    checked={chartSettings.stackMode} 
                    onChange={checked => setChartSettings({...chartSettings, stackMode: checked})}
                    style={{ marginLeft: 8 }}
                    disabled={chartType === 'pie'}
                  />
                </div>
              </Col>
              
              <Col span={16}>
                <div>
                  <Text>颜色方案</Text>
                  <Radio.Group 
                    value={chartSettings.colorScheme} 
                    onChange={e => setChartSettings({...chartSettings, colorScheme: e.target.value})}
                    style={{ marginLeft: 8 }}
                  >
                    <Radio.Button value="default">默认</Radio.Button>
                    <Radio.Button value="blue">蓝色</Radio.Button>
                    <Radio.Button value="green">绿色</Radio.Button>
                    <Radio.Button value="warm">暖色</Radio.Button>
                  </Radio.Group>
                </div>
              </Col>
            </Row>
          </Card>
        )}
        
        {compareMode && (
          <div style={{ marginTop: 16 }}>
            <Alert
              message="对比模式已启用"
              description={
                <Space direction="vertical">
                  <Text>当前正在与 {compareTarget === 'average' ? '班级平均水平' : '上一时段'} 进行对比</Text>
                  <Radio.Group 
                    value={compareTarget} 
                    onChange={e => setCompareTarget(e.target.value)}
                  >
                    <Radio.Button value="average">班级平均</Radio.Button>
                    <Radio.Button value="previous">上一时段</Radio.Button>
                  </Radio.Group>
                </Space>
              }
              type="info"
              showIcon
              closable
              onClose={() => setCompareMode(false)}
            />
          </div>
        )}
      </div>
    );
  };

  // 渲染统计信息
  const renderStats = () => {
    if (!data) return null;
    
    let stats = [];
    
    switch (dataType) {
      case 'performance':
        if (data.stats) {
          stats = [
            { title: '平均分', value: data.stats.average, suffix: '分', color: '#1890ff', icon: <RiseOutlined /> },
            { title: '最高分', value: data.stats.highest, suffix: '分', color: '#52c41a', icon: <RiseOutlined /> },
            { title: '最低分', value: data.stats.lowest, suffix: '分', color: '#f5222d', icon: <FallOutlined /> },
            { title: '及格率', value: data.stats.passRate, suffix: '%', color: '#722ed1', icon: <RiseOutlined /> }
          ];
        }
        break;
        
      case 'attendance':
        if (data.stats) {
          stats = [
            { title: '平均出勤率', value: data.stats.averageRate, suffix: '%', color: '#1890ff', icon: <RiseOutlined /> },
            { title: '最高出勤日', value: data.stats.highestDay, suffix: '', color: '#52c41a', icon: <RiseOutlined /> },
            { title: '最低出勤日', value: data.stats.lowestDay, suffix: '', color: '#f5222d', icon: <FallOutlined /> },
            { title: '缺勤学生数', value: data.stats.absentCount, suffix: '人', color: '#fa8c16', icon: <EyeOutlined /> }
          ];
        }
        break;
        
      case 'activity':
        if (data.stats) {
          stats = [
            { title: '平均参与率', value: data.stats.averageParticipation, suffix: '%', color: '#1890ff', icon: <RiseOutlined /> },
            { title: '平均完成率', value: data.stats.averageCompletion, suffix: '%', color: '#52c41a', icon: <RiseOutlined /> },
            { title: '最活跃活动', value: data.stats.mostActive, suffix: '', color: '#722ed1', icon: <RiseOutlined /> },
            { title: '最不活跃活动', value: data.stats.leastActive, suffix: '', color: '#f5222d', icon: <FallOutlined /> }
          ];
        }
        break;
        
      case 'progress':
        if (data.stats) {
          stats = [
            { title: '整体完成度', value: data.stats.overallCompletion, suffix: '%', color: '#1890ff', icon: <RiseOutlined /> },
            { title: '整体掌握度', value: data.stats.overallMastery, suffix: '%', color: '#52c41a', icon: <RiseOutlined /> },
            { title: '最难模块', value: data.stats.hardestModule, suffix: '', color: '#f5222d', icon: <FallOutlined /> },
            { title: '最易模块', value: data.stats.easiestModule, suffix: '', color: '#722ed1', icon: <RiseOutlined /> }
          ];
        }
        break;
        
      default:
        break;
    }
    
    if (stats.length === 0) return null;
    
    return (
      <Row gutter={16} style={{ marginBottom: 16 }}>
        {stats.map((stat, index) => (
          <Col key={index} xs={12} sm={12} md={6} lg={6}>
            <Card size="small">
              <Statistic
                title={stat.title}
                value={stat.value}
                suffix={stat.suffix}
                valueStyle={{ color: stat.color }}
                prefix={stat.icon}
              />
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  // 渲染图表
  const renderChart = () => {
    if (loading) {
      return (
        <div style={{ height, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Spin size="large" />
        </div>
      );
    }
    
    if (!data) {
      return (
        <Empty 
          description="暂无数据" 
          style={{ height, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
        />
      );
    }
    
    return (
      <ReactECharts
        ref={chartRef}
        option={getChartOption()}
        style={{ height }}
        notMerge={true}
        lazyUpdate={true}
      />
    );
  };

  // 渲染内容
  const renderContent = () => {
    return (
      <>
        {renderControls()}
        {renderStats()}
        {renderChart()}
      </>
    );
  };

  return (
    <Card
      title={
        <Space>
          {dataType === 'performance' && <BarChartOutlined />}
          {dataType === 'attendance' && <LineChartOutlined />}
          {dataType === 'activity' && <PieChartOutlined />}
          {dataType === 'progress' && <RiseOutlined />}
          <span>
            {dataType === 'performance' && '成绩分析'}
            {dataType === 'attendance' && '出勤分析'}
            {dataType === 'activity' && '活动参与分析'}
            {dataType === 'progress' && '学习进度分析'}
          </span>
        </Space>
      }
      extra={
        <Space>
          {!compareMode && (
            <Button 
              type="link" 
              onClick={() => {
                setCompareMode(true);
                setCompareTarget('average');
              }}
            >
              启用对比
            </Button>
          )}
          <Tooltip title="全屏查看">
            <Button icon={<FullscreenOutlined />} />
          </Tooltip>
        </Space>
      }
    >
      {renderContent()}
    </Card>
  );
};

export default DataVisualization; 