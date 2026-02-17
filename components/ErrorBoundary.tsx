/**
 * Error Boundary Component
 *
 * Catches errors in design components and displays a fallback UI
 * instead of crashing the entire control.
 */

import * as React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('[BPF Viewer] Error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      // Custom fallback or default error message
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            padding: '12px',
            backgroundColor: '#FEF0F0',
            border: '1px solid #D13438',
            borderRadius: '4px',
            color: '#A4262C',
            fontSize: '12px',
          }}
          role="alert"
        >
          <strong>⚠️ Error displaying Business Process Flow</strong>
          <div style={{ marginTop: '4px', fontSize: '11px' }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </div>
          <button
            onClick={this.handleRetry}
            style={{
              marginTop: '8px',
              padding: '4px 12px',
              fontSize: '11px',
              backgroundColor: '#D13438',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
            aria-label="Retry rendering"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
