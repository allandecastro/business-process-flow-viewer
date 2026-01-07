/**
 * BPF Row Component
 * 
 * Displays a single record with its BPF stages
 */

import * as React from 'react';
import { IBPFRowProps } from '../types';
import { getDesignComponent } from './designs';
import { RECORD_NAME_SIZES } from '../utils/themeUtils';
import { makeStyles, shorthands, Spinner, tokens } from '@fluentui/react-components';
import { OpenRegular, ErrorCircleRegular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  row: {
    ...shorthands.padding('12px'),
    ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralStroke2),
    backgroundColor: tokens.colorNeutralBackground1,
    transitionProperty: 'background-color',
    transitionDuration: '0.15s',
    cursor: 'default',
  },
  rowMobile: {
    ...shorthands.padding('8px'),
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
    marginBottom: '8px',
    ...shorthands.gap('8px'),
  },
  headerMobile: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  nameWrapper: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('8px'),
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
    ...shorthands.padding('2px', '6px'),
    ...shorthands.borderRadius('4px'),
    backgroundColor: tokens.colorNeutralBackground3,
    color: tokens.colorNeutralForeground3,
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    flexShrink: 0,
  },
  metaWrapper: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('8px'),
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
    ...shorthands.padding('8px'),
  },
  errorWrapper: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('8px'),
    ...shorthands.padding('8px'),
    ...shorthands.borderRadius('4px'),
    backgroundColor: tokens.colorStatusDangerBackground1,
    color: tokens.colorStatusDangerForeground1,
    fontSize: '12px',
  },
  noBpfWrapper: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.padding('8px'),
    ...shorthands.borderRadius('4px'),
    backgroundColor: tokens.colorNeutralBackground3,
    color: tokens.colorNeutralForeground3,
    fontSize: '12px',
  },
});

export const BPFRow: React.FC<IBPFRowProps> = ({
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
        <div className={styles.errorWrapper}>
          <ErrorCircleRegular />
          <span>{record.error}</span>
        </div>
      );
    }

    // No BPF instance
    if (!record.bpfInstance || record.bpfInstance.stages.length === 0) {
      return (
        <div className={styles.noBpfWrapper}>
          <span>No active business process flow</span>
        </div>
      );
    }

    // Render design component
    return (
      <DesignComponent
        stages={record.bpfInstance.stages}
        displayMode={settings.displayMode}
        colors={colors}
        showPulse={settings.showPulseAnimation}
        isMobile={isMobile}
      />
    );
  };

  return (
    <div
      className={`${styles.row} ${isMobile ? styles.rowMobile : ''} ${
        settings.enableNavigation ? styles.rowClickable : ''
      }`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={settings.enableNavigation ? 'button' : undefined}
      tabIndex={settings.enableNavigation ? 0 : undefined}
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
            title={record.recordName}
          >
            {record.recordName}
          </span>
          {settings.showEntityName && (
            <span className={styles.entityBadge}>{record.entityDisplayName}</span>
          )}
        </div>
        {!isMobile && (
          <div className={styles.metaWrapper}>
            {record.bpfInstance && (
              <span className={styles.processName}>{record.bpfInstance.processName}</span>
            )}
            {settings.enableNavigation && <OpenRegular className={styles.navIcon} />}
          </div>
        )}
      </div>

      {/* BPF Content */}
      {renderBPFContent()}
    </div>
  );
};
