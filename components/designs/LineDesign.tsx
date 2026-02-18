/**
 * Line Design - Minimal track with circular markers
 *
 * Features:
 * - Clean horizontal line
 * - Circular markers for each stage
 * - Labels below markers
 * - Fixed spacing bug with increased padding
 */

import * as React from 'react';
import { makeStyles, mergeClasses } from '@fluentui/react-components';
import { StageIcon } from "./shared/StageIcon";
import type { IBPFDesignProps } from '../../types';
import { useBPFDesignHelpers } from './hooks/useBPFDesignHelpers';
import { TRANSITION_DURATION, PULSE_DURATION, PROGRESS_TRANSITION_DURATION } from './designConstants';

const useLineStyles = makeStyles({
  container: {
    position: 'relative',
    width: '100%',
    paddingTop: '28px',
    paddingBottom: '100px', // Increased to prevent overlap with content below
  },
  trackContainer: {
    position: 'relative',
    height: '4px',
    borderRadius: '2px',
  },
  progressLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    borderRadius: '2px',
    transitionProperty: 'width',
    transitionDuration: PROGRESS_TRANSITION_DURATION,
    transitionTimingFunction: 'ease-in-out',
  },
  markersContainer: {
    position: 'absolute',
    top: '-10px',
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
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    transitionProperty: 'all',
    transitionDuration: TRANSITION_DURATION,
  },
  markerActive: {
    width: '28px',
    height: '28px',
    boxShadow: '0 0 0 4px rgba(0, 120, 212, 0.2)',
  },
  markerMobile: {
    width: '20px',
    height: '20px',
  },
  markerActiveMobile: {
    width: '22px',
    height: '22px',
  },
  label: {
    marginTop: '8px',
    fontSize: '11px',
    fontWeight: 500,
    textAlign: 'center',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '80px',
  },
  labelMobile: {
    marginTop: '6px',
    fontSize: '9px',
    maxWidth: '60px',
  },
  pulse: {
    animationName: {
      '0%': { transform: 'scale(1)', opacity: 1 },
      '50%': { transform: 'scale(1.1)', opacity: 0.8 },
      '100%': { transform: 'scale(1)', opacity: 1 },
    },
    animationDuration: PULSE_DURATION,
    animationIterationCount: 'infinite',
  },
});

const LineDesignComponent: React.FC<IBPFDesignProps> = ({
  stages,
  displayMode,
  colors,
  showPulse,
  isMobile,
}) => {
  const styles = useLineStyles();
  const { stageMetadata } = useBPFDesignHelpers(stages, displayMode, colors, showPulse);

  // Calculate progress width
  const progressWidth = React.useMemo(() => {
    const activeIndex = stageMetadata.findIndex((m) => m.stage.isActive);
    if (activeIndex === -1) return '100%';
    if (activeIndex === 0) return '0%';
    return `${(activeIndex / (stageMetadata.length - 1)) * 100}%`;
  }, [stageMetadata]);

  return (
    <div className={styles.container}>
      <div className={styles.trackContainer} style={{ backgroundColor: colors.track }}>
        <div
          className={styles.progressLine}
          style={{ width: progressWidth, backgroundColor: colors.completed }}
          role="presentation"
        />
        <div className={styles.markersContainer}>
          {stageMetadata.map(({ stage, status, stageColor, label, shouldPulse }, index) => (
            <div key={stage.stageId} className={styles.markerWrapper}>
              <div
                className={mergeClasses(
                  styles.marker,
                  stage.isActive && styles.markerActive,
                  isMobile && styles.markerMobile,
                  stage.isActive && isMobile && styles.markerActiveMobile,
                  shouldPulse && styles.pulse
                )}
                style={{
                  backgroundColor: stageColor.bg,
                  color: stageColor.text,
                  border: status === 'inactive' ? `2px solid ${colors.track}` : 'none',
                }}
                title={`${stage.stageName} (${stage.stageCategoryName}) - ${status}`}
                role="img"
                aria-label={`${label}: ${status}`}
                aria-current={stage.isActive ? 'step' : undefined}
              >
                <StageIcon status={status} stageNumber={index + 1} size={isMobile ? "small" : "medium"} showNumber={false} />
              </div>
              <span
                className={mergeClasses(styles.label, isMobile && styles.labelMobile)}
                style={{ color: colors.inactiveText }}
                title={label}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Memoized export to prevent unnecessary re-renders
export const LineDesign = React.memo(LineDesignComponent);
