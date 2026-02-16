/**
 * Error Boundary Component
 * 
 * Catches React errors and displays fallback UI
 */

import * as React from 'react';
import { makeStyles, tokens } from '@fluentui/react-components';
import { ErrorCircleRegular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    gap: '12px',
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorStatusDangerForeground1,
    textAlign: 'center',
    minHeight: '100px',
    width: '100%',
  },
  icon: {
    fontSize: '32px',
  },
  title: {
    fontSize: '16px',
    fontWeight: 600,
  },
  message: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground2,
  },
});

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error.message || 'An unexpected error occurred',
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const styles = useStyles();
      return (
        <div className={styles.container} role="alert" aria-live="polite">
          <ErrorCircleRegular className={styles.icon} />
          <div className={styles.title}>Component Error</div>
          <div className={styles.message}>{this.state.errorMessage}</div>
        </div>
      );
    }

    return this.props.children;
  }
}
