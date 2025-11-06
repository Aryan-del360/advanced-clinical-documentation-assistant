import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Force synchronous rendering
const renderApp = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error("Root element not found");
    return;
  }

  class ErrorBoundary extends React.Component<{children?: React.ReactNode}, {hasError: boolean; error?: any}> {
    constructor(props: any) {
      super(props);
      this.state = { hasError: false, error: undefined };
    }
    static getDerivedStateFromError(error: any) {
      return { hasError: true, error };
    }
    componentDidCatch(error: any, info: any) {
      console.error('Unhandled error in app:', error, info);
    }
    render() {
      if (this.state.hasError) {
        return (
          <div style={{padding: 24, color: 'white', background: '#b91c1c', minHeight: '100vh'}}>
            <h1 style={{marginBottom: 8}}>Application Error</h1>
            <p style={{marginBottom: 8}}>An unexpected error occurred while loading the app. Check the browser console for details.</p>
            <pre style={{whiteSpace: 'pre-wrap', fontSize: 12}}>{String(this.state.error)}</pre>
          </div>
        );
      }
      // @ts-ignore
      return this.props.children;
    }
  }

  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );
    console.log('App rendered successfully');
  } catch (error) {
    console.error('Failed to render app:', error);
    rootElement.innerHTML = '<div style="color: red; padding: 20px;">Error loading application. Check console for details.</div>';
  }

  // Global error handlers to show something instead of blank
  window.addEventListener('error', (e) => {
    const rootEl = document.getElementById('root');
    if (rootEl) {
      rootEl.innerHTML = `<div style="padding:24px;color:#fff;background:#b91c1c;min-height:100vh;"><h1>Runtime Error</h1><p>Check the browser console for details.</p><pre style=\"white-space:pre-wrap;font-size:12px;\">${String(e.error || e.message)}</pre></div>`;
    }
  });
  window.addEventListener('unhandledrejection', (e) => {
    const rootEl = document.getElementById('root');
    if (rootEl) {
      rootEl.innerHTML = `<div style="padding:24px;color:#fff;background:#b91c1c;min-height:100vh;"><h1>Unhandled Promise Rejection</h1><p>Check the browser console for details.</p><pre style=\"white-space:pre-wrap;font-size:12px;\">${String((e && (e as any).reason) || 'Promise rejected')}</pre></div>`;
    }
    console.error('Unhandled promise rejection', e);
  });
};

// Render immediately when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderApp);
} else {
  renderApp();
}
