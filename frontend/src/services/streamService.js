import apiService from './apiService';

class StreamService {
  constructor() {
    this.activeStreams = new Map();
    this.abortControllers = new Map();
  }
  
  // 创建流式请求
  async createStream(provider, taskType, prompt, options = {}) {
    // 创建一个唯一的流ID
    const streamId = `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 创建一个AbortController，用于取消请求
    const abortController = new AbortController();
    this.abortControllers.set(streamId, abortController);
    
    // 创建一个Promise，用于返回流的结果
    let resolvePromise, rejectPromise;
    const resultPromise = new Promise((resolve, reject) => {
      resolvePromise = resolve;
      rejectPromise = reject;
    });
    
    // 存储流的状态
    this.activeStreams.set(streamId, {
      id: streamId,
      provider,
      taskType,
      prompt,
      options,
      status: 'connecting',
      content: '',
      error: null,
      startTime: Date.now(),
      endTime: null,
      onProgress: options.onProgress || (() => {}),
      onComplete: options.onComplete || (() => {}),
      onError: options.onError || (() => {}),
      resolve: resolvePromise,
      reject: rejectPromise
    });
    
    // 启动流式请求
    this.startStream(streamId);
    
    // 返回流ID和结果Promise
    return {
      streamId,
      resultPromise
    };
  }
  
  // 启动流式请求
  async startStream(streamId) {
    const stream = this.activeStreams.get(streamId);
    if (!stream) {
      throw new Error(`Stream ${streamId} not found`);
    }
    
    try {
      // 更新状态
      stream.status = 'streaming';
      
      // 获取AbortController
      const abortController = this.abortControllers.get(streamId);
      
      // 发送请求
      const response = await fetch(`${apiService.baseURL}/llm/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiService.getToken()}`
        },
        body: JSON.stringify({
          provider: stream.provider,
          taskType: stream.taskType,
          prompt: stream.prompt,
          options: stream.options
        }),
        signal: abortController.signal
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      if (!response.body) {
        throw new Error('ReadableStream not supported');
      }
      
      // 处理流式响应
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let content = '';
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }
        
        // 解码数据
        const chunk = decoder.decode(value, { stream: true });
        
        // 处理数据块
        // 假设服务器发送的是JSON格式的数据，每行一个JSON对象
        const lines = chunk.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          try {
            if (line === '[DONE]') {
              // 流结束
              break;
            }
            
            const data = JSON.parse(line);
            
            if (data.error) {
              throw new Error(data.error);
            }
            
            // 更新内容
            content += data.content || '';
            
            // 更新流状态
            stream.content = content;
            
            // 调用进度回调
            stream.onProgress({
              content,
              done: false
            });
          } catch (error) {
            console.error('Error parsing stream data:', error, line);
          }
        }
      }
      
      // 流结束
      stream.status = 'completed';
      stream.endTime = Date.now();
      
      // 调用完成回调
      stream.onComplete({
        content,
        done: true
      });
      
      // 解决Promise
      stream.resolve({
        content,
        done: true
      });
      
      // 清理
      this.abortControllers.delete(streamId);
    } catch (error) {
      // 处理错误
      stream.status = 'error';
      stream.error = error.message;
      stream.endTime = Date.now();
      
      // 调用错误回调
      stream.onError(error);
      
      // 拒绝Promise
      stream.reject(error);
      
      // 清理
      this.abortControllers.delete(streamId);
    } finally {
      // 一段时间后从活动流中移除
      setTimeout(() => {
        this.activeStreams.delete(streamId);
      }, 60000); // 1分钟后移除
    }
  }
  
  // 取消流式请求
  cancelStream(streamId) {
    const abortController = this.abortControllers.get(streamId);
    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(streamId);
      
      const stream = this.activeStreams.get(streamId);
      if (stream) {
        stream.status = 'cancelled';
        stream.endTime = Date.now();
        
        // 拒绝Promise
        stream.reject(new Error('Stream cancelled'));
      }
    }
  }
  
  // 获取流状态
  getStreamStatus(streamId) {
    const stream = this.activeStreams.get(streamId);
    if (!stream) {
      return null;
    }
    
    return {
      id: stream.id,
      provider: stream.provider,
      taskType: stream.taskType,
      status: stream.status,
      content: stream.content,
      error: stream.error,
      startTime: stream.startTime,
      endTime: stream.endTime
    };
  }
  
  // 获取所有活动流
  getAllActiveStreams() {
    return Array.from(this.activeStreams.values()).map(stream => ({
      id: stream.id,
      provider: stream.provider,
      taskType: stream.taskType,
      status: stream.status,
      startTime: stream.startTime,
      endTime: stream.endTime
    }));
  }
}

// 导出单例实例
const streamService = new StreamService();
export default streamService; 