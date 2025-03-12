import React from 'react';
import { Result, Button } from 'antd';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // 可以在这里添加错误日志上报逻辑
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // 自定义错误UI
      return (
        <Result
          status="error"
          title="页面出错了"
          subTitle={this.state.error?.message || "发生了未知错误"}
          extra={[
            <Button type="primary" key="console" onClick={() => window.location.reload()}>
              刷新页面
            </Button>,
            <Button key="home" onClick={() => window.location.href = '/'}>
              返回首页
            </Button>,
          ]}
        >
          {process.env.NODE_ENV === 'development' && (
            <div style={{ textAlign: 'left', marginTop: 20 }}>
              <details style={{ whiteSpace: 'pre-wrap' }}>
                <summary>错误详情</summary>
                {this.state.error && this.state.error.toString()}
                <br />
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </details>
            </div>
          )}
        </Result>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 