import React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Simple Error Boundary component for production debugging
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'white', background: '#1a1a1a', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h1>Something went wrong.</h1>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#ff5555' }}>
            {this.state.error?.toString()}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            style={{ padding: '10px 20px', marginTop: '20px', cursor: 'pointer' }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  document.body.innerHTML = '<div style="color:red; padding:20px;">CRITICAL: Root element not found!</div>';
} else {
  try {
    createRoot(rootElement).render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );
  } catch (e) {
    document.body.innerHTML = `<div style="color:red; padding:20px;">CRITICAL RENDER ERROR: ${e}</div>`;
  }
}
