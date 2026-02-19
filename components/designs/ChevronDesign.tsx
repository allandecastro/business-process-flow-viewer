/**
 * Chevron Design - Classic ribbon arrows
 *
 * Features:
 * - Arrow-shaped chevron stages
 * - Responsive sizing for mobile
 * - Accessible with ARIA attributes
 * - Pulse animation on active stage
 * - Dynamic label padding to account for arrow clip-path
 */

import * as React from 'react';
import { useMemo } from 'react';
import { makeStyles, mergeClasses } from '@fluentui/react-components';
import type { IBPFDesignProps } from '../../types';
import { useBPFDesignHelpers } from './hooks/useBPFDesignHelpers';
import { getStageLabel } from '../../utils/themeUtils';
import { TRANSITION_DURATION, PULSE_DURATION } from './designConstants';

const useChevronStyles = makeStyles({
  container: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    height: '36px',
  },
  containerMobile: {
    height: '28px',
  },
  stage: {
    flex: 1,
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 600,
    transitionProperty: 'all',
    transitionDuration: TRANSITION_DURATION,
    minWidth: 0,
  },
  stageMobile: {
    fontSize: '10px',
  },
  label: {
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

const ChevronDesignComponent: React.FC<IBPFDesignProps> = ({
  stages,
  displayMode,
  colors,
  showPulse,
  isMobile,
}) => {
  const styles = useChevronStyles();
  const { stageMetadata, a11yMetadata } = useBPFDesignHelpers(stages, displayMode, colors, showPulse);

  // Memoize arrow size based on mobile state
  const arrowPx = isMobile ? 12 : 15;
  const arrowSize = `${arrowPx}px`;

  // Helper to generate clip path for chevron shape
  const getClipPath = useMemo(
    () => (index: number, total: number) => {
      const isFirst = index === 0;
      const isLast = index === total - 1;

      if (isFirst) {
        return `polygon(0 0, calc(100% - ${arrowSize}) 0, 100% 50%, calc(100% - ${arrowSize}) 100%, 0 100%)`;
      }
      if (isLast) {
        return `polygon(0 0, 100% 0, 100% 100%, 0 100%, ${arrowSize} 50%)`;
      }
      return `polygon(0 0, calc(100% - ${arrowSize}) 0, 100% 50%, calc(100% - ${arrowSize}) 100%, 0 100%, ${arrowSize} 50%)`;
    },
    [arrowSize]
  );

  // Label padding must account for the arrow clip-path indent.
  // Middle stages lose arrowPx on both left (indent) and right (point).
  // First stage only loses on the right, last stage only on the left.
  const getLabelPadding = useMemo(
    () => (index: number, total: number) => {
      const basePad = 4;
      const isFirst = index === 0;
      const isLast = index === total - 1;
      const left = isFirst ? basePad : arrowPx + basePad;
      const right = isLast ? basePad : arrowPx + basePad;
      return { paddingLeft: `${left}px`, paddingRight: `${right}px` };
    },
    [arrowPx]
  );

  return (
    <div
      className={mergeClasses(styles.container, isMobile && styles.containerMobile)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={a11yMetadata.totalCount}
      aria-valuenow={a11yMetadata.completedCount}
      aria-label={`Business process flow: ${a11yMetadata.completedCount} of ${a11yMetadata.totalCount} stages complete${
        a11yMetadata.activeStage
          ? `. Current stage: ${getStageLabel(
              a11yMetadata.activeStage.stageName,
              a11yMetadata.activeStage.stageCategoryName,
              displayMode
            )}`
          : ''
      }`}
    >
      {stageMetadata.map(({ stage, status, stageColor, label, shouldPulse }, index) => (
        <div
          key={stage.stageId}
          className={mergeClasses(
            styles.stage,
            isMobile && styles.stageMobile,
            shouldPulse && styles.pulse
          )}
          style={{
            backgroundColor: stageColor.bg,
            color: stageColor.text,
            clipPath: getClipPath(index, stageMetadata.length),
            marginLeft: 0,
            marginRight: isMobile ? '2px' : '4px',
            zIndex: 1,
          }}
          title={`${stage.stageName} (${stage.stageCategoryName}) - ${status}`}
          role="img"
          aria-label={`${label}: ${status}${stage.isActive ? ' (current)' : ''}`}
          aria-current={stage.isActive ? 'step' : undefined}
        >
          <span
            className={styles.label}
            style={getLabelPadding(index, stageMetadata.length)}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  );
};

// Memoized export to prevent unnecessary re-renders
export const ChevronDesign = React.memo(ChevronDesignComponent);
