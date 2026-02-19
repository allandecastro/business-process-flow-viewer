/**
 * Fraction Design - Compact fraction display with progress bar
 *
 * Features:
 * - Compact "X/Y" fraction display
 * - Progress bar showing completion
 * - Current stage name display
 * - Minimal space usage
 */

import * as React from 'react';
import { makeStyles } from '@fluentui/react-components';
import type { IBPFDesignProps } from '../../types';
import { useBPFDesignHelpers } from './hooks/useBPFDesignHelpers';
import { getStageLabel } from '../../utils/themeUtils';
import { PROGRESS_TRANSITION_DURATION } from './designConstants';

const useFractionStyles = makeStyles({
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
  },
  fractionText: {
    fontSize: '16px',
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },
  fractionTextMobile: {
    fontSize: '14px',
  },
  progressContainer: {
    flex: 1,
    minWidth: 0,
  },
  stageName: {
    fontSize: '12px',
    marginBottom: '4px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  stageNameMobile: {
    fontSize: '10px',
  },
  progressBar: {
    height: '8px',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    transitionProperty: 'width',
    transitionDuration: PROGRESS_TRANSITION_DURATION,
    transitionTimingFunction: 'ease-in-out',
  },
});

const FractionDesignComponent: React.FC<IBPFDesignProps> = ({
  stages,
  displayMode,
  colors,
}) => {
  const styles = useFractionStyles();
  const { a11yMetadata } = useBPFDesignHelpers(stages, displayMode, colors, false);

  if (stages.length === 0) {
    return (
      <div className={styles.container} role="status" aria-label="No stages available">
        <div className={styles.fractionText} style={{ color: colors.inactiveText }}>
          0/0
        </div>
      </div>
    );
  }

  const currentStage = a11yMetadata.activeStage || stages[stages.length - 1];
  const currentStepNumber = a11yMetadata.activeStageIndex + 1;
  const progressPercent = a11yMetadata.progressPercent;
  const label = getStageLabel(currentStage.stageName, currentStage.stageCategoryName, displayMode);

  return (
    <div
      className={styles.container}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={a11yMetadata.totalCount}
      aria-valuenow={a11yMetadata.completedCount}
      aria-label={`Business process flow: ${a11yMetadata.completedCount} of ${a11yMetadata.totalCount} stages complete. Current: ${label}`}
    >
      <div
        className={styles.fractionText}
        style={{ color: colors.active }}
      >
        <span>{currentStepNumber}</span>
        <span style={{ color: colors.inactiveText }}>/{stages.length}</span>
      </div>
      <div className={styles.progressContainer}>
        <div
          className={styles.stageName}
          style={{ color: colors.active }}
          title={label}
        >
          {label}
        </div>
        <div className={styles.progressBar} style={{ backgroundColor: colors.track }}>
          <div
            className={styles.progressFill}
            style={{
              width: `${progressPercent}%`,
              backgroundColor: colors.completed,
            }}
            role="presentation"
          />
        </div>
      </div>
    </div>
  );
};

// Memoized export to prevent unnecessary re-renders
export const FractionDesign = React.memo(FractionDesignComponent);
