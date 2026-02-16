/**
 * BPF Viewer Component
 * 
 * Main wrapper component with FluentProvider for theming
 */

import * as React from 'react';
import { FluentProvider, webLightTheme, makeStyles, tokens, Spinner, Button, Theme } from '@fluentui/react-components';
import { ArrowClockwiseRegular, ErrorCircleRegular } from '@fluentui/react-icons';
import { IBPFViewerProps } from '../types';
import { BPFRow } from './BPFRow';
import { debounce } from '../utils/debounce';
import { ErrorBoundary } from './ErrorBoundary';

const useStyles = makeStyles({
  container: {
    width: '100%',
    height: '100%',
    overflow: 'auto',
    backgroundColor: tokens.colorNeutralBackground1,
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    gap: '12px',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    gap: '12px',
    color: tokens.colorStatusDangerForeground1,
    textAlign: 'center',
  },
  errorIcon: {
    fontSize: '32px',
  },
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    color: tokens.colorNeutralForeground2,
    textAlign: 'center',
    minHeight: '100px',
    fontSize: '14px',
  },
  recordsList: {
    display: 'flex',
    flexDirection: 'column',
  },
});

// Hook to detect mobile viewport
const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    const debouncedCheck = debounce(checkMobile, 150);

    // Initial check (not debounced)
    checkMobile();

    // Debounced resize listener (prevents excessive re-renders)
    window.addEventListener('resize', debouncedCheck);
    return () => window.removeEventListener('resize', debouncedCheck);
  }, []);

  return isMobile;
};

// Inner component (with Fluent context)
const BPFViewerInner: React.FC<IBPFViewerProps> = ({
  records,
  settings,
  colors,
  isLoading,
  error,
  onNavigate,
  onRefresh,
}) => {
  const styles = useStyles();
  const isMobile = useIsMobile();

  // Global loading state
  if (isLoading && records.length === 0) {
    return (
      <div className={styles.loadingContainer} role="status" aria-live="polite">
        <Spinner size="medium" label="Loading records..." />
      </div>
    );
  }

  // Global error state
  if (error && records.length === 0) {
    return (
      <div className={styles.errorContainer} role="alert" aria-live="polite">
        <ErrorCircleRegular className={styles.errorIcon} />
        <div>{error}</div>
        {onRefresh && (
          <Button
            appearance="secondary"
            icon={<ArrowClockwiseRegular />}
            onClick={onRefresh}
            aria-label="Retry loading records"
          >
            Retry
          </Button>
        )}
      </div>
    );
  }

  // Empty state
  if (records.length === 0) {
    return (
      <div className={styles.emptyContainer} role="status">
        <div>No records to display</div>
      </div>
    );
  }

  // Records list
  return (
    <div 
      className={styles.recordsList}
      role="list"
      aria-label={`${records.length} record${records.length !== 1 ? 's' : ''} with business process flow`}
    >
      {records.map((record) => (
        <div key={record.recordId} role="listitem">
          <BPFRow
            record={record}
            settings={settings}
            colors={colors}
            isMobile={isMobile}
            onNavigate={onNavigate}
          />
        </div>
      ))}
    </div>
  );
};

// Main component with FluentProvider
export interface IBPFViewerWithProviderProps extends IBPFViewerProps {
  platformTheme?: Theme;
}

export const BPFViewer: React.FC<IBPFViewerWithProviderProps> = ({
  platformTheme,
  ...props
}) => {
  const styles = useStyles();
  
  // Use platform theme if available, otherwise detect system preference
  const theme = platformTheme || webLightTheme;

  return (
    <FluentProvider theme={theme}>
      <ErrorBoundary>
        <div className={styles.container}>
          <BPFViewerInner {...props} />
        </div>
      </ErrorBoundary>
    </FluentProvider>
  );
};
