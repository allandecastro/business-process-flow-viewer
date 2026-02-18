/**
 * Stepper Design - Numbered boxes with connectors
 *
 * Features:
 * - Clear numbered steps in boxes
 * - Horizontal connecting lines
 * - Labels below steps
 * - Classic stepper appearance
 */

import { StageIcon } from "./shared/StageIcon";
import * as React from 'react';
import { makeStyles, mergeClasses } from '@fluentui/react-components';
import type { IBPFDesignProps } from '../../types';
import { useBPFDesignHelpers } from './hooks/useBPFDesignHelpers';
import { TRANSITION_DURATION, PULSE_DURATION, CONNECTOR } from './designConstants';

const useStepperStyles = makeStyles({
  container: {
    display: 'flex',
    alignItems: 'flex-start',
    width: '100%',
    paddingTop: '4px',
  },
  stageWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  step: {
    width: '28px',
    height: '28px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: 700,
    transitionProperty: 'all',
    transitionDuration: TRANSITION_DURATION,
  },
  stepMobile: {
    width: '22px',
    height: '22px',
    fontSize: '10px',
  },
  label: {
    fontSize: '10px',
    marginTop: '6px',
    textAlign: 'center',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    width: '100%',
    maxWidth: '60px',
  },
  connector: {
    flex: 1,
    height: CONNECTOR.height,
    marginTop: '14px',
    marginRight: '4px',
    marginLeft: '4px',
    minWidth: CONNECTOR.minWidth,
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

const StepperDesignComponent: React.FC<IBPFDesignProps> = ({
  stages,
  displayMode,
  colors,
  showPulse,
  isMobile,
}) => {
  const styles = useStepperStyles();
  const { stageMetadata } = useBPFDesignHelpers(stages, displayMode, colors, showPulse);

  return (
    <div className={styles.container}>
      {stageMetadata.map(({ stage, status, stageColor, label, shouldPulse }, index) => {
        const isLast = index === stageMetadata.length - 1;

        return (
          <React.Fragment key={stage.stageId}>
            <div className={styles.stageWrapper}>
              <div
                className={mergeClasses(
                  styles.step,
                  isMobile && styles.stepMobile,
                  shouldPulse && styles.pulse
                )}
                style={{ backgroundColor: stageColor.bg, color: stageColor.text }}
                title={`${stage.stageName} (${stage.stageCategoryName}) - ${status}`}
                role="img"
                aria-label={`Step ${index + 1}: ${label} - ${status}`}
                aria-current={stage.isActive ? 'step' : undefined}
              >
                <StageIcon status={status} stageNumber={index + 1} size={isMobile ? "small" : "medium"} />
              </div>
              <span className={styles.label} style={{ color: colors.inactiveText }} title={label}>
                {label}
              </span>
            </div>
            {!isLast && (
              <div
                className={styles.connector}
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
export const StepperDesign = React.memo(StepperDesignComponent);
