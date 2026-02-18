/**
 * Pill Design - Rounded badge style
 *
 * Features:
 * - Pill-shaped badges for each stage
 * - Flexible layout that wraps on mobile
 * - Compact and modern appearance
 */

import * as React from 'react';
import { makeStyles, mergeClasses } from '@fluentui/react-components';
import type { IBPFDesignProps } from '../../types';
import { useBPFDesignHelpers } from './hooks/useBPFDesignHelpers';
import { TRANSITION_DURATION, PULSE_DURATION } from './designConstants';

const usePillStyles = makeStyles({
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    width: '100%',
  },
  containerMobile: {
    flexWrap: 'wrap',
  },
  pill: {
    flex: 1,
    minWidth: 0,
    padding: '6px 12px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 600,
    textAlign: 'center',
    transitionProperty: 'all',
    transitionDuration: TRANSITION_DURATION,
  },
  pillMobile: {
    flex: 'none',
    padding: '4px 8px',
    fontSize: '10px',
  },
  label: {
    display: 'block',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
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

const PillDesignComponent: React.FC<IBPFDesignProps> = ({
  stages,
  displayMode,
  colors,
  showPulse,
  isMobile,
}) => {
  const styles = usePillStyles();
  const { stageMetadata } = useBPFDesignHelpers(stages, displayMode, colors, showPulse);

  return (
    <div className={mergeClasses(styles.container, isMobile && styles.containerMobile)}>
      {stageMetadata.map(({ stage, status, stageColor, label, shouldPulse }) => (
        <div
          key={stage.stageId}
          className={mergeClasses(
            styles.pill,
            isMobile && styles.pillMobile,
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
      ))}
    </div>
  );
};

// Memoized export to prevent unnecessary re-renders
export const PillDesign = React.memo(PillDesignComponent);
