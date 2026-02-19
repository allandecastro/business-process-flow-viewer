/**
 * Error Boundary Component
 *
 * Catches errors in design components and displays a fallback UI
 * instead of crashing the entire control.
 */

import * as React from 'react';
import { makeStyles, tokens } from '@fluentui/react-components';
import { logger } from '../utils/logger';

const useErrorFallbackStyles = makeStyles({
  container: {
    padding: '12px',
    backgroundColor: tokens.colorStatusDangerBackground1,
    border: `1px solid ${tokens.colorStatusDangerBorder1}`,
    borderRadius: '4px',
    color: tokens.colorStatusDangerForeground1,
    fontSize: '12px',
  },
  message: {
    marginTop: '4px',
    fontSize: '11px',
  },
  retryButton: {
    marginTop: '8px',
    padding: '4px 12px',
    fontSize: '11px',
    backgroundColor: tokens.colorStatusDangerBackground3,
    color: tokens.colorNeutralForegroundOnBrand,
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
});

const ErrorFallbackUI: React.FC<{ error: Error | null; onRetry: () => void }> = ({ error, onRetry }) => {
  const styles = useErrorFallbackStyles();

  return (
    <div className={styles.container} role="alert">
      <strong>Error displaying Business Process Flow</strong>
      <div className={styles.message}>
        {error?.message || 'An unexpected error occurred'}
      </div>
      <button
        onClick={onRetry}
        className={styles.retryButton}
        aria-label="Retry rendering"
      >
        Retry
      </button>
    </div>
  );
};

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
    logger.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallbackUI error={this.state.error} onRetry={this.handleRetry} />;
    }

    return this.props.children;
  }
}
