/**
 * Circle Design - Connected circles with labels
 *
 * Features:
 * - Circular stage indicators with numbers/checkmarks
 * - Connecting lines between stages
 * - Labels below circles (hidden on mobile)
 * - Accessible with ARIA attributes
 */

import * as React from 'react';
import { makeStyles, mergeClasses } from '@fluentui/react-components';
import { StageIcon } from "./shared/StageIcon";
import type { IBPFDesignProps } from '../../types';
import { useBPFDesignHelpers } from './hooks/useBPFDesignHelpers';
import { TRANSITION_DURATION, PULSE_DURATION, CONNECTOR } from './designConstants';

const useCircleStyles = makeStyles({
  container: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    paddingRight: '4px',
    paddingLeft: '4px',
  },
  stageWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flexShrink: 0,
    minWidth: '50px',
  },
  stageWrapperMobile: {
    minWidth: '40px',
  },
  circle: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 700,
    transitionProperty: 'all',
    transitionDuration: TRANSITION_DURATION,
  },
  circleMobile: {
    width: '24px',
    height: '24px',
    fontSize: '10px',
  },
  label: {
    fontSize: '10px',
    marginTop: '4px',
    textAlign: 'center',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    width: '100%',
    maxWidth: '60px',
    paddingRight: '2px',
    paddingLeft: '2px',
  },
  connector: {
    flex: 1,
    height: CONNECTOR.height,
    minWidth: CONNECTOR.minWidth,
  },
  connectorDesktop: {
    marginTop: '-20px',
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

const CircleDesignComponent: React.FC<IBPFDesignProps> = ({
  stages,
  displayMode,
  colors,
  showPulse,
  isMobile,
}) => {
  const styles = useCircleStyles();
  const { stageMetadata } = useBPFDesignHelpers(stages, displayMode, colors, showPulse);

  return (
    <div className={styles.container}>
      {stageMetadata.map(({ stage, status, stageColor, label, shouldPulse }, index) => {
        const isLast = index === stageMetadata.length - 1;

        return (
          <React.Fragment key={stage.stageId}>
            <div className={mergeClasses(styles.stageWrapper, isMobile && styles.stageWrapperMobile)}>
              <div
                className={mergeClasses(
                  styles.circle,
                  isMobile && styles.circleMobile,
                  shouldPulse && styles.pulse
                )}
                style={{ backgroundColor: stageColor.bg, color: stageColor.text }}
                title={`${stage.stageName} (${stage.stageCategoryName}) - ${status}`}
                role="img"
                aria-label={`Stage ${index + 1}: ${label} - ${status}`}
                aria-current={stage.isActive ? 'step' : undefined}
              >
                <StageIcon status={status} stageNumber={index + 1} size={isMobile ? "small" : "medium"} />
              </div>
              {!isMobile && (
                <span className={styles.label} style={{ color: colors.inactiveText }} title={label}>
                  {label}
                </span>
              )}
            </div>
            {!isLast && (
              <div
                className={mergeClasses(styles.connector, !isMobile && styles.connectorDesktop)}
                style={{ backgroundColor: stage.isCompleted ? colors.completed : colors.track }}
                role="presentation"
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// Memoized export to prevent unnecessary re-renders
export const CircleDesign = React.memo(CircleDesignComponent);
