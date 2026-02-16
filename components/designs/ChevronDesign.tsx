/**
 * Chevron Design - Classic ribbon arrows
 *
 * Features:
 * - Arrow-shaped chevron stages
 * - Responsive sizing for mobile
 * - Accessible with ARIA attributes
 * - Pulse animation on active stage
 */

import * as React from 'react';
import { useMemo } from 'react';
import { makeStyles, mergeClasses } from '@fluentui/react-components';
import type { IBPFDesignProps } from '../../types';
import { useBPFDesignHelpers } from './hooks/useBPFDesignHelpers';
import { getStageLabel } from '../../utils/themeUtils';

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
    transitionDuration: '0.2s',
    minWidth: 0,
  },
  stageMobile: {
    fontSize: '10px',
  },
  label: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    paddingRight: '8px',
    paddingLeft: '8px',
  },
  pulse: {
    animationName: {
      '0%, 100%': { opacity: 1 },
      '50%': { opacity: 0.7 },
    },
    animationDuration: '2s',
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
  const arrowSize = useMemo(() => (isMobile ? '12px' : '15px'), [isMobile]);

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
          <span className={styles.label}>{label}</span>
        </div>
      ))}
    </div>
  );
};

// Memoized export to prevent unnecessary re-renders
export const ChevronDesign = React.memo(ChevronDesignComponent);
