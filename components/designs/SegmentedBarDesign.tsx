/**
 * Segmented Bar Design - Single progress bar divided into segments
 *
 * Features:
 * - Unified progress bar with clear segments
 * - Compact single-line layout
 * - Clear visual progress indication
 */

import * as React from 'react';
import { makeStyles, mergeClasses } from '@fluentui/react-components';
import type { IBPFDesignProps } from '../../types';
import { useBPFDesignHelpers } from './hooks/useBPFDesignHelpers';
import { TRANSITION_DURATION, PULSE_DURATION } from './designConstants';

const useSegmentedStyles = makeStyles({
  container: {
    display: 'flex',
    width: '100%',
    height: '32px',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  containerMobile: {
    height: '24px',
  },
  segment: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: 600,
    transitionProperty: 'all',
    transitionDuration: TRANSITION_DURATION,
    borderRight: '2px solid rgba(255,255,255,0.3)',
  },
  segmentLast: {
    borderRight: 'none',
  },
  segmentMobile: {
    fontSize: '9px',
  },
  label: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    paddingRight: '4px',
    paddingLeft: '4px',
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

const SegmentedBarDesignComponent: React.FC<IBPFDesignProps> = ({
  stages,
  displayMode,
  colors,
  showPulse,
  isMobile,
}) => {
  const styles = useSegmentedStyles();
  const { stageMetadata } = useBPFDesignHelpers(stages, displayMode, colors, showPulse);

  return (
    <div className={mergeClasses(styles.container, isMobile && styles.containerMobile)}>
      {stageMetadata.map(({ stage, status, stageColor, label, shouldPulse }, index) => {
        const isLast = index === stageMetadata.length - 1;

        return (
          <div
            key={stage.stageId}
            className={mergeClasses(
              styles.segment,
              isLast && styles.segmentLast,
              isMobile && styles.segmentMobile,
              shouldPulse && styles.pulse
            )}
            style={{ backgroundColor: stageColor.bg, color: stageColor.text }}
            title={`${stage.stageName} (${stage.stageCategoryName}) - ${status}`}
            role="img"
            aria-label={`${label}: ${status}`}
            aria-current={stage.isActive ? 'step' : undefined}
          >
            <span className={styles.label}>{label}</span>
          </div>
        );
      })}
    </div>
  );
};

// Memoized export to prevent unnecessary re-renders
export const SegmentedBarDesign = React.memo(SegmentedBarDesignComponent);
