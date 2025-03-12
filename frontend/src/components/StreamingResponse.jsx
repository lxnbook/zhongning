import React, { useState, useEffect, useRef } from 'react';
import { 
  Card, 
  Typography, 
  Button, 
  Space, 
  Spin, 
  Alert, 
  Progress, 
  Tooltip 
} from 'antd';
import { 
  SyncOutlined, 
  StopOutlined, 
  CopyOutlined, 
  CheckOutlined, 
  RobotOutlined 
} from '@ant-design/icons';
import streamService from '../services/streamService';
import llmService from '../services/llmService';
import { TASK_TYPES } from '../services/llmService';
import ReactMarkdown from 'react-markdown';

const { Text, Paragraph } = Typography;

const StreamingResponse = ({ 
  provider, 
  taskType = TASK_TYPES.CONTENT_GENERATION, 
  prompt, 
  options = {},
  onComplete = () => {},
  autoStart = true,
  showControls = true
}) => {
  const [streamId, setStreamId] = useState(null);
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('idle'); // idle, streaming, completed, error
  const [error, setError] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [copied, setCopied] = useState(false);
  
  const timerRef = useRef(null);
  
  // 自动开始流
  useEffect(() => {
    if (autoStart && prompt) {
      startStream();
    }
    
    return () => {
      if (streamId) {
        streamService.cancelStream(streamId);
      }
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [prompt, autoStart]);
  
  // 更新计时器
  useEffect(() => {
    if (status === 'streaming' && startTime) {
      timerRef.current = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 100);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [status, startTime]);
  
  // 开始流式请求
  const startStream = async () => {
    try {
      setStatus('streaming');
      setContent('');
      setError(null);
      setStartTime(Date.now());
      setElapsedTime(0);
      
      // 如果没有指定提供商，使用任务类型的默认提供商
      const selectedProvider = provider || llmService.getProviderForTask(taskType);
      
      // 创建流
      const { streamId: newStreamId, resultPromise } = await streamService.createStream(
        selectedProvider,
        taskType,
        prompt,
        {
          ...options,
          onProgress: (data) => {
            setContent(data.content);
            options.onProgress && options.onProgress(data);
          },
          onComplete: (data) => {
            setStatus('completed');
            setContent(data.content);
            onComplete(data);
            options.onComplete && options.onComplete(data);
          },
          onError: (error) => {
            setStatus('error');
            setError(error.message);
            options.onError && options.onError(error);
          }
        }
      );
      
      setStreamId(newStreamId);
      
      // 等待结果
      await resultPromise;
    } catch (error) {
      setStatus('error');
      setError(error.message);
    }
  };
  
  // 取消流式请求
  const cancelStream = () => {
    if (streamId) {
      streamService.cancelStream(streamId);
      setStatus('cancelled');
    }
  };
  
  // 复制内容
  const copyContent = () => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  // 渲染控制按钮
  const renderControls = () => {
    if (!showControls) return null;
    
    return (
      <Space style={{ marginTop: 16 }}>
        {status === 'idle' && (
          <Button 
            type="primary" 
            icon={<RobotOutlined />} 
            onClick={startStream}
            disabled={!prompt}
          >
            开始生成
          </Button>
        )}
        
        {status === 'streaming' && (
          <Button 
            danger 
            icon={<StopOutlined />} 
            onClick={cancelStream}
          >
            停止生成
          </Button>
        )}
        
        {(status === 'completed' || status === 'error') && (
          <Button 
            icon={<SyncOutlined />} 
            onClick={startStream}
          >
            重新生成
          </Button>
        )}
        
        {content && (
          <Button 
            icon={copied ? <CheckOutlined /> : <CopyOutlined />} 
            onClick={copyContent}
          >
            {copied ? '已复制' : '复制内容'}
          </Button>
        )}
      </Space>
    );
  };
  
  // 渲染内容
  const renderContent = () => {
    if (status === 'idle') {
      return <Text type="secondary">等待生成...</Text>;
    }
    
    if (status === 'streaming') {
      return (
        <div>
          <div style={{ marginBottom: 16 }}>
            <Spin spinning={true} />
            <Text style={{ marginLeft: 8 }}>
              正在生成中... ({(elapsedTime / 1000).toFixed(1)}秒)
            </Text>
          </div>
          
          <div className="streaming-content">
            <ReactMarkdown>{content || '...'}</ReactMarkdown>
          </div>
        </div>
      );
    }
    
    if (status === 'error') {
      return (
        <Alert
          message="生成失败"
          description={error || '未知错误'}
          type="error"
          showIcon
        />
      );
    }
    
    if (status === 'cancelled') {
      return (
        <Alert
          message="已取消生成"
          description="流式生成已被用户取消"
          type="warning"
          showIcon
        />
      );
    }
    
    return (
      <div className="completed-content">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    );
  };
  
  return (
    <Card
      title={
        <Space>
          <RobotOutlined />
          <span>AI 流式响应</span>
          {status === 'completed' && (
            <Tooltip title={`生成耗时: ${(elapsedTime / 1000).toFixed(2)}秒`}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                ({(elapsedTime / 1000).toFixed(2)}秒)
              </Text>
            </Tooltip>
          )}
        </Space>
      }
      extra={renderControls()}
    >
      {renderContent()}
    </Card>
  );
};

export default StreamingResponse; 