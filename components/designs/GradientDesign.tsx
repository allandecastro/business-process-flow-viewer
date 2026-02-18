/**
 * Gradient Design - Progress bar with gradient fill and markers
 *
 * Features:
 * - Single progress bar with gradient
 * - Circular markers at stage positions
 * - Labels below markers
 * - Smooth visual flow
 */

import { StageIcon } from "./shared/StageIcon";
import * as React from 'react';
import { useMemo } from 'react';
import { makeStyles, mergeClasses } from '@fluentui/react-components';
import type { IBPFDesignProps } from '../../types';
import { useBPFDesignHelpers } from './hooks/useBPFDesignHelpers';
import { TRANSITION_DURATION, PULSE_DURATION, PROGRESS_TRANSITION_DURATION } from './designConstants';

const useGradientStyles = makeStyles({
  container: {
    position: 'relative',
    width: '100%',
    paddingTop: '8px',
    paddingBottom: '30px',
  },
  trackContainer: {
    position: 'relative',
    height: '6px',
    borderRadius: '3px',
  },
  progressBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    borderRadius: '3px',
    transitionProperty: 'width',
    transitionDuration: PROGRESS_TRANSITION_DURATION,
    transitionTimingFunction: 'ease-in-out',
  },
  markersContainer: {
    position: 'absolute',
    top: '-7px',
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'space-between',
  },
  markerWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
  },
  marker: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: 700,
    zIndex: 2,
    transitionProperty: 'all',
    transitionDuration: TRANSITION_DURATION,
  },
  markerMobile: {
    width: '16px',
    height: '16px',
    fontSize: '8px',
  },
  label: {
    marginTop: '6px',
    fontSize: '10px',
    textAlign: 'center',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '60px',
  },
  pulse: {
    animationName: {
      '0%, 100%': { opacity: 1 },
      '50%': { opacity: 0.7 },
    },
    animationDuration: PULSE_DURATION,
    animationIterationCount: 'infinite',
  },
});

const GradientDesignComponent: React.FC<IBPFDesignProps> = ({
  stages,
  displayMode,
  colors,
  showPulse,
  isMobile,
}) => {
  const styles = useGradientStyles();
  const { stageMetadata } = useBPFDesignHelpers(stages, displayMode, colors, showPulse);

  // Calculate progress width
  const progressWidth = useMemo(() => {
    if (stageMetadata.length === 0) return '0%';
    const completedIndex = stageMetadata.findIndex((m) => m.stage.isActive);
    if (completedIndex === -1) return '100%';
    const progress = (completedIndex / (stageMetadata.length - 1)) * 100;
    return `${Math.max(0, Math.min(100, progress))}%`;
  }, [stageMetadata]);

  return (
    <div className={styles.container}>
      <div className={styles.trackContainer} style={{ backgroundColor: colors.track }}>
        <div
          className={styles.progressBar}
          style={{
            width: progressWidth,
            background: `linear-gradient(to right, ${colors.completed}, ${colors.active})`,
          }}
          role="presentation"
        />
        <div className={styles.markersContainer}>
          {stageMetadata.map(({ stage, status, stageColor, label, shouldPulse }, index) => (
            <div key={stage.stageId} className={styles.markerWrapper}>
              <div
                className={mergeClasses(
                  styles.marker,
                  isMobile && styles.markerMobile,
                  shouldPulse && styles.pulse
                )}
                style={{ backgroundColor: stageColor.bg, color: stageColor.text }}
                title={`${stage.stageName} (${stage.stageCategoryName}) - ${status}`}
                role="img"
                aria-label={`${label}: ${status}`}
                aria-current={stage.isActive ? 'step' : undefined}
              >
                <StageIcon status={status} stageNumber={index + 1} size={isMobile ? "small" : "medium"} showNumber={false} />
              </div>
              {!isMobile && (
                <span className={styles.label} style={{ color: colors.inactiveText }} title={label}>
                  {label}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Memoized export to prevent unnecessary re-renders
export const GradientDesign = React.memo(GradientDesignComponent);
