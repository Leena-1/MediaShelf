import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught React Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', fontFamily: 'sans-serif', backgroundColor: '#0b0f19', color: '#fff', minHeight: '100vh' }}>
          <h1 style={{ color: '#ef4444', fontSize: '24px', fontWeight: 'bold' }}>⚠️ React Application Error</h1>
          <p style={{ margin: '16px 0', color: '#9ca3af' }}>
            An unexpected error occurred on the frontend:
          </p>
          <pre style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '8px', overflowX: 'auto', color: '#f87171' }}>
            {this.state.error && this.state.error.toString()}
            {'\n'}
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
