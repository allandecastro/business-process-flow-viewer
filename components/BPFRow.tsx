/**
 * BPF Row Component
 * 
 * Displays a single record with its BPF stages
 */

import * as React from 'react';
import { IBPFRowProps } from '../types';
import { getDesignComponent } from './designs';
import { ErrorBoundary } from './ErrorBoundary';
import { RECORD_NAME_SIZES } from '../utils/themeUtils';
import { sanitizeText } from '../utils/sanitize';
import { makeStyles, Spinner, tokens } from '@fluentui/react-components';
import { OpenRegular, ErrorCircleRegular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  row: {
    padding: '8px 12px',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
    transitionProperty: 'background-color',
    transitionDuration: '0.15s',
    cursor: 'default',
  },
  rowMobile: {
    padding: '6px 8px',
  },
  rowClickable: {
    cursor: 'pointer',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '4px',
    gap: '8px',
  },
  headerMobile: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  nameWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    minWidth: 0,
    flex: 1,
  },
  recordName: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: tokens.colorNeutralForeground1,
  },
  entityBadge: {
    fontSize: '10px',
    padding: '2px 6px',
    borderRadius: '4px',
    backgroundColor: tokens.colorNeutralBackground3,
    color: tokens.colorNeutralForeground3,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    flexShrink: 0,
  },
  metaWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0,
  },
  processName: {
    fontSize: '10px',
    color: tokens.colorNeutralForeground3,
  },
  navIcon: {
    color: tokens.colorNeutralForeground3,
    fontSize: '12px',
  },
  loadingWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px',
  },
  errorWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px',
    borderRadius: '4px',
    backgroundColor: tokens.colorStatusDangerBackground1,
    color: tokens.colorStatusDangerForeground1,
    fontSize: '12px',
  },
  noBpfWrapper: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px',
    borderRadius: '4px',
    backgroundColor: tokens.colorNeutralBackground3,
    color: tokens.colorNeutralForeground3,
    fontSize: '12px',
  },
});

export const BPFRow: React.FC<IBPFRowProps> = React.memo(({
  record,
  settings,
  colors,
  isMobile,
  onNavigate,
}) => {
  const styles = useStyles();
  const DesignComponent = getDesignComponent(settings.designStyle);
  const nameSize = RECORD_NAME_SIZES[settings.recordNameSize] || RECORD_NAME_SIZES.medium;

  const handleClick = () => {
    if (settings.enableNavigation && onNavigate) {
      onNavigate(record.entityName, record.recordId);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault(); // Prevent scroll on Space key
      handleClick();
    }
  };

  // Render BPF content based on state
  const renderBPFContent = () => {
    // Loading state
    if (record.isLoading) {
      return (
        <div className={styles.loadingWrapper}>
          <Spinner size="tiny" label="Loading BPF..." />
        </div>
      );
    }

    // Error state
    if (record.error) {
      return (
        <div className={styles.errorWrapper} role="alert">
          <ErrorCircleRegular />
          <span>{record.error}</span>
        </div>
      );
    }

    // No BPF instance
    if (!record.bpfInstance || record.bpfInstance.stages.length === 0) {
      return (
        <div className={styles.noBpfWrapper} role="status">
          <span>No active business process flow</span>
        </div>
      );
    }

    // Render design component with error boundary and suspense
    return (
      <ErrorBoundary>
        <React.Suspense fallback={<div className={styles.loadingWrapper}><Spinner size="tiny" label="Loading design..." /></div>}>
          <DesignComponent
            stages={record.bpfInstance.stages}
            displayMode={settings.displayMode}
            colors={colors}
            showPulse={settings.showPulseAnimation}
            isMobile={isMobile}
          />
        </React.Suspense>
      </ErrorBoundary>
    );
  };

  return (
    <div
      className={`${styles.row} ${isMobile ? styles.rowMobile : ''} ${
        settings.enableNavigation ? styles.rowClickable : ''
      }`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={settings.enableNavigation ? 'button' : 'article'}
      tabIndex={settings.enableNavigation ? 0 : undefined}
      aria-label={`${sanitizeText(record.recordName)} with business process flow`}
    >
      {/* Header */}
      <div className={`${styles.header} ${isMobile ? styles.headerMobile : ''}`}>
        <div className={styles.nameWrapper}>
          <span
            className={styles.recordName}
            style={{
              fontSize: nameSize.fontSize,
              fontWeight: nameSize.fontWeight,
            }}
            title={sanitizeText(record.recordName)}
          >
            {sanitizeText(record.recordName)}
          </span>
          {settings.showEntityName && (
            <span className={styles.entityBadge} aria-label={`Entity type: ${sanitizeText(record.entityDisplayName)}`}>
              {sanitizeText(record.entityDisplayName)}
            </span>
          )}
        </div>
        {!isMobile && (
          <div className={styles.metaWrapper}>
            {record.bpfInstance && (
              <span className={styles.processName} aria-label={`Process: ${sanitizeText(record.bpfInstance.processName)}`}>
                {sanitizeText(record.bpfInstance.processName)}
              </span>
            )}
            {settings.enableNavigation && (
              <OpenRegular className={styles.navIcon} aria-hidden="true" />
            )}
          </div>
        )}
      </div>

      {/* BPF Content */}
      {renderBPFContent()}
    </div>
  );
});
