import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Select, 
  Button, 
  Switch, 
  Collapse, 
  Typography, 
  Space, 
  Divider,
  Alert,
  message,
  Spin,
  List,
  Tag
} from 'antd';
import { 
  GlobalOutlined, 
  BookOutlined, 
  SettingOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import apiService from '../services/apiService';

const { Option, OptGroup } = Select;
const { Panel } = Collapse;
const { Title, Paragraph, Text } = Typography;

const LocalizationSettings = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [regions, setRegions] = useState([]);
  const [curriculums, setCurriculums] = useState([]);
  const [settings, setSettings] = useState({
    region: 'mainland',
    curriculum: 'pep',
    useLocalTerms: true,
    adaptContent: true,
    adaptAssessment: true
  });
  const [form] = Form.useForm();

  // 加载区域和课程数据
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [regionsResponse, curriculumsResponse, settingsResponse] = await Promise.all([
          apiService.get('/localization/regions'),
          apiService.get('/localization/curriculums'),
          apiService.get('/user/localization-settings')
        ]);
        
        setRegions(regionsResponse);
        setCurriculums(curriculumsResponse);
        
        if (settingsResponse) {
          setSettings(settingsResponse);
          form.setFieldsValue(settingsResponse);
        }
      } catch (error) {
        console.error('Failed to load localization data:', error);
        message.error('加载本地化数据失败');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [form]);

  // 保存设置
  const handleSave = async (values) => {
    setSaving(true);
    try {
      await apiService.put('/user/localization-settings', values);
      setSettings(values);
      message.success('本地化设置已更新');
    } catch (error) {
      console.error('Failed to save localization settings:', error);
      message.error('保存本地化设置失败');
    } finally {
      setSaving(false);
    }
  };

  // 处理区域变化
  const handleRegionChange = (value) => {
    // 根据选择的区域筛选可用的课程
    const filteredCurriculums = curriculums.filter(c => c.regions.includes(value));
    
    // 如果当前选择的课程不在筛选结果中，则选择第一个可用课程
    if (filteredCurriculums.length > 0 && !filteredCurriculums.some(c => c.id === form.getFieldValue('curriculum'))) {
      form.setFieldsValue({ curriculum: filteredCurriculums[0].id });
    }
  };

  // 渲染区域选项
  const renderRegionOptions = () => {
    const regionGroups = {};
    
    regions.forEach(region => {
      if (!regionGroups[region.group]) {
        regionGroups[region.group] = [];
      }
      regionGroups[region.group].push(region);
    });
    
    return Object.entries(regionGroups).map(([group, items]) => (
      <OptGroup key={group} label={group}>
        {items.map(region => (
          <Option key={region.id} value={region.id}>{region.name}</Option>
        ))}
      </OptGroup>
    ));
  };

  // 渲染课程选项
  const renderCurriculumOptions = () => {
    const selectedRegion = form.getFieldValue('region');
    const filteredCurriculums = selectedRegion 
      ? curriculums.filter(c => c.regions.includes(selectedRegion))
      : curriculums;
    
    return filteredCurriculums.map(curriculum => (
      <Option key={curriculum.id} value={curriculum.id}>
        {curriculum.name}
        {curriculum.isOfficial && <Tag color="green" style={{ marginLeft: 8 }}>官方</Tag>}
      </Option>
    ));
  };

  return (
    <Card
      title={
        <Space>
          <GlobalOutlined />
          本地化设置
        </Space>
      }
      extra={
        <Button 
          type="link" 
          href="/help/localization" 
          target="_blank"
        >
          了解更多
        </Button>
      }
    >
      <Spin spinning={loading}>
        <Alert
          message="本地化设置可以帮助系统更好地适应您所在地区的教育特点和教学大纲"
          description="选择您所在的地区和使用的课程体系，系统将自动调整内容和功能，以提供更符合您需求的体验。"
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />
        
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={settings}
        >
          <Form.Item
            name="region"
            label="地区"
            rules={[{ required: true, message: '请选择地区' }]}
          >
            <Select 
              placeholder="选择您所在的地区" 
              onChange={handleRegionChange}
              style={{ maxWidth: 400 }}
            >
              {renderRegionOptions()}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="curriculum"
            label="课程体系"
            rules={[{ required: true, message: '请选择课程体系' }]}
          >
            <Select 
              placeholder="选择您使用的课程体系"
              style={{ maxWidth: 400 }}
            >
              {renderCurriculumOptions()}
            </Select>
          </Form.Item>
          
          <Divider />
          
          <Title level={5}>高级设置</Title>
          <Paragraph type="secondary" style={{ marginBottom: 16 }}>
            以下设置可以进一步优化系统的本地化体验
          </Paragraph>
          
          <Form.Item
            name="useLocalTerms"
            valuePropName="checked"
          >
            <Switch checkedChildren="开启" unCheckedChildren="关闭" /> 
            <Text style={{ marginLeft: 8 }}>使用本地教育术语</Text>
            <div>
              <Text type="secondary">系统将使用您所在地区常用的教育术语和表达方式</Text>
            </div>
          </Form.Item>
          
          <Form.Item
            name="adaptContent"
            valuePropName="checked"
          >
            <Switch checkedChildren="开启" unCheckedChildren="关闭" /> 
            <Text style={{ marginLeft: 8 }}>内容本地化适配</Text>
            <div>
              <Text type="secondary">AI生成的内容将根据您所在地区的教育特点和文化背景进行调整</Text>
            </div>
          </Form.Item>
          
          <Form.Item
            name="adaptAssessment"
            valuePropName="checked"
          >
            <Switch checkedChildren="开启" unCheckedChildren="关闭" /> 
            <Text style={{ marginLeft: 8 }}>评估标准本地化</Text>
            <div>
              <Text type="secondary">系统将根据您所在地区的评估标准和要求调整分析和建议</Text>
            </div>
          </Form.Item>
          
          <Divider />
          
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={saving}>
              保存设置
            </Button>
          </Form.Item>
        </Form>
        
        <Collapse ghost style={{ marginTop: 24 }}>
          <Panel header="查看当前适配的教学大纲" key="curriculum">
            {settings.curriculum && (
              <List
                size="small"
                bordered
                dataSource={curriculums.find(c => c.id === settings.curriculum)?.outlines || []}
                renderItem={item => (
                  <List.Item>
                    <Space>
                      <BookOutlined />
                      <Text>{item.subject}</Text>
                      <Text type="secondary">{item.grade}</Text>
                    </Space>
                    <Text type="secondary">{item.version}</Text>
                  </List.Item>
                )}
                locale={{ emptyText: '暂无教学大纲信息' }}
              />
            )}
          </Panel>
        </Collapse>
      </Spin>
    </Card>
  );
};

export default LocalizationSettings; 