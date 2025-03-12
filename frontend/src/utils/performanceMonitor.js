/**
 * 性能监控工具
 * 用于收集和分析应用性能指标
 */
class PerformanceMonitor {
  constructor(options = {}) {
    this.options = {
      sampleRate: 0.1, // 采样率，0.1表示10%的用户会被监控
      apiEndpoint: '/api/performance', // 性能数据上报接口
      ...options
    };
    
    this.metrics = {
      navigation: null,
      resources: [],
      paint: {},
      interactions: [],
      memory: [],
      errors: []
    };
    
    // 决定是否对当前用户进行采样
    this.shouldSample = Math.random() < this.options.sampleRate;
    
    if (this.shouldSample) {
      this.init();
    }
  }
  
  /**
   * 初始化性能监控
   */
  init() {
    // 监听页面加载性能
    window.addEventListener('load', () => this.captureNavigationTiming());
    
    // 监听资源加载性能
    this.observeResourceTiming();
    
    // 监听绘制性能
    this.observePaintTiming();
    
    // 监听用户交互
    this.observeInteractions();
    
    // 监听内存使用
    this.observeMemory();
    
    // 监听错误
    this.observeErrors();
    
    // 定期上报数据
    setInterval(() => this.sendMetrics(), 60000); // 每分钟上报一次
    
    // 页面卸载前上报数据
    window.addEventListener('beforeunload', () => this.sendMetrics());
  }
  
  /**
   * 捕获页面导航性能指标
   */
  captureNavigationTiming() {
    if (performance && performance.timing) {
      const timing = performance.timing;
      
      this.metrics.navigation = {
        // DNS查询时间
        dns: timing.domainLookupEnd - timing.domainLookupStart,
        
        // TCP连接时间
        tcp: timing.connectEnd - timing.connectStart,
        
        // 请求响应时间
        request: timing.responseEnd - timing.requestStart,
        
        // DOM解析时间
        dom: timing.domComplete - timing.domLoading,
        
        // 页面加载时间
        load: timing.loadEventEnd - timing.navigationStart,
        
        // 首次内容绘制时间
        firstContentfulPaint: this.metrics.paint.firstContentfulPaint || null,
        
        // 首次有意义绘制时间
        firstMeaningfulPaint: this.metrics.paint.firstMeaningfulPaint || null,
        
        // 首次交互时间
        timeToInteractive: this.getTimeToInteractive()
      };
    }
  }
  
  /**
   * 观察资源加载性能
   */
  observeResourceTiming() {
    if (performance && performance.getEntriesByType) {
      // 初始资源
      const initialResources = performance.getEntriesByType('resource');
      if (initialResources.length > 0) {
        this.processResourceEntries(initialResources);
      }
      
      // 使用PerformanceObserver监听新资源
      if (window.PerformanceObserver) {
        const observer = new PerformanceObserver(list => {
          this.processResourceEntries(list.getEntries());
        });
        
        observer.observe({ entryTypes: ['resource'] });
      }
    }
  }
  
  /**
   * 处理资源条目
   */
  processResourceEntries(entries) {
    entries.forEach(entry => {
      // 只关注关键资源类型
      if (['script', 'css', 'fetch', 'xmlhttprequest', 'img'].includes(entry.initiatorType)) {
        this.metrics.resources.push({
          name: entry.name,
          type: entry.initiatorType,
          duration: entry.duration,
          size: entry.transferSize || 0,
          timestamp: new Date().getTime()
        });
      }
    });
  }
  
  /**
   * 观察绘制性能
   */
  observePaintTiming() {
    if (window.PerformanceObserver) {
      const observer = new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          this.metrics.paint[entry.name] = entry.startTime;
        });
      });
      
      observer.observe({ entryTypes: ['paint'] });
    }
  }
  
  /**
   * 观察用户交互
   */
  observeInteractions() {
    // 监听点击事件
    document.addEventListener('click', event => {
      const target = event.target.tagName.toLowerCase();
      const time = performance.now();
      
      this.metrics.interactions.push({
        type: 'click',
        target,
        time,
        timestamp: new Date().getTime()
      });
    });
    
    // 监听输入事件
    document.addEventListener('input', event => {
      if (this.metrics.interactions.length < 100) { // 限制记录数量
        const target = event.target.tagName.toLowerCase();
        const time = performance.now();
        
        this.metrics.interactions.push({
          type: 'input',
          target,
          time,
          timestamp: new Date().getTime()
        });
      }
    });
  }
  
  /**
   * 观察内存使用
   */
  observeMemory() {
    if (performance && performance.memory) {
      // 每10秒采集一次内存数据
      setInterval(() => {
        this.metrics.memory.push({
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          timestamp: new Date().getTime()
        });
      }, 10000);
    }
  }
  
  /**
   * 观察错误
   */
  observeErrors() {
    // 监听JavaScript错误
    window.addEventListener('error', event => {
      this.metrics.errors.push({
        type: 'javascript',
        message: event.message,
        source: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        timestamp: new Date().getTime()
      });
    });
    
    // 监听未处理的Promise拒绝
    window.addEventListener('unhandledrejection', event => {
      this.metrics.errors.push({
        type: 'promise',
        message: event.reason?.message || 'Promise rejected',
        timestamp: new Date().getTime()
      });
    });
  }
  
  /**
   * 获取首次可交互时间
   */
  getTimeToInteractive() {
    // 这是一个简化的实现，实际TTI计算更复杂
    if (this.metrics.paint.firstContentfulPaint) {
      // 假设TTI是FCP后的2秒
      return this.metrics.paint.firstContentfulPaint + 2000;
    }
    return null;
  }
  
  /**
   * 发送性能指标
   */
  sendMetrics() {
    if (Object.keys(this.metrics).length === 0) return;
    
    // 克隆指标以避免发送过程中的修改
    const metricsToSend = JSON.parse(JSON.stringify(this.metrics));
    
    // 添加用户和环境信息
    const payload = {
      metrics: metricsToSend,
      context: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().getTime(),
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        connection: navigator.connection ? {
          effectiveType: navigator.connection.effectiveType,
          downlink: navigator.connection.downlink,
          rtt: navigator.connection.rtt
        } : null
      }
    };
    
    // 使用Beacon API发送数据，这样即使页面关闭也能发送成功
    if (navigator.sendBeacon) {
      navigator.sendBeacon(this.options.apiEndpoint, JSON.stringify(payload));
    } else {
      // 回退到fetch
      fetch(this.options.apiEndpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json'
        },
        keepalive: true
      }).catch(error => console.error('Failed to send metrics:', error));
    }
    
    // 清除已发送的资源和交互数据，保留其他指标
    this.metrics.resources = [];
    this.metrics.interactions = [];
    this.metrics.errors = [];
  }
}

// 创建单例
const performanceMonitor = new PerformanceMonitor();

export default performanceMonitor; 