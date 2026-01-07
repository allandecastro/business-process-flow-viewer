/**
 * BPF Design Components
 * 
 * 6 visual styles for displaying BPF stages:
 * - Chevron: Classic ribbon arrows
 * - Circles: Connected circles with labels
 * - Pills: Rounded badge style
 * - Segmented: Single progress bar
 * - Timeline: Horizontal flow with arrows
 * - Stepper: Numbered boxes with connectors
 */

import * as React from 'react';
import { IBPFDesignProps, IBPFStage } from '../../types';
import { getStageColor, getStageLabel } from '../../utils/themeUtils';
import { CheckmarkFilled } from '@fluentui/react-icons';
import { makeStyles, shorthands, mergeClasses } from '@fluentui/react-components';

// ============================================
// Shared Styles
// ============================================

const useSharedStyles = makeStyles({
  container: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  truncate: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
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

// ============================================
// DESIGN 1: CHEVRON ARROWS
// ============================================

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
    ...shorthands.padding('0', '8px'),
  },
});

export const ChevronDesign: React.FC<IBPFDesignProps> = ({
  stages,
  displayMode,
  colors,
  showPulse,
  isMobile,
}) => {
  const styles = useChevronStyles();
  const sharedStyles = useSharedStyles();

  return (
    <div className={mergeClasses(styles.container, isMobile && styles.containerMobile)}>
      {stages.map((stage: IBPFStage, index: number) => {
        const isFirst = index === 0;
        const isLast = index === stages.length - 1;
        const status = stage.isCompleted ? 'completed' : stage.isActive ? 'active' : 'inactive';
        const stageColor = getStageColor(status, colors);
        const label = getStageLabel(stage.stageName, stage.stageCategoryName, displayMode);

        const clipPath = isFirst
          ? 'polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%)'
          : isLast
          ? 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 10px 50%)'
          : 'polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%, 10px 50%)';

        return (
          <div
            key={stage.stageId}
            className={mergeClasses(
              styles.stage,
              isMobile && styles.stageMobile,
              stage.isActive && showPulse && sharedStyles.pulse
            )}
            style={{
              backgroundColor: stageColor.bg,
              color: stageColor.text,
              clipPath,
              marginLeft: isFirst ? 0 : '-5px',
              zIndex: stages.length - index,
            }}
            title={`${stage.stageName} (${stage.stageCategoryName}) - ${status}`}
          >
            <span className={styles.label}>{label}</span>
          </div>
        );
      })}
    </div>
  );
};

// ============================================
// DESIGN 2: CONNECTED CIRCLES
// ============================================

const useCircleStyles = makeStyles({
  container: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    ...shorthands.padding('0', '4px'),
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
    ...shorthands.borderRadius('50%'),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 700,
    transitionProperty: 'all',
    transitionDuration: '0.2s',
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
    ...shorthands.padding('0', '2px'),
  },
  connector: {
    flex: 1,
    height: '2px',
    minWidth: '8px',
    ...shorthands.margin('0', '2px'),
  },
  connectorDesktop: {
    marginTop: '-16px',
  },
});

export const CircleDesign: React.FC<IBPFDesignProps> = ({
  stages,
  displayMode,
  colors,
  showPulse,
  isMobile,
}) => {
  const styles = useCircleStyles();
  const sharedStyles = useSharedStyles();

  return (
    <div className={styles.container}>
      {stages.map((stage: IBPFStage, index: number) => {
        const isLast = index === stages.length - 1;
        const status = stage.isCompleted ? 'completed' : stage.isActive ? 'active' : 'inactive';
        const stageColor = getStageColor(status, colors);
        const label = getStageLabel(stage.stageName, stage.stageCategoryName, displayMode);

        return (
          <React.Fragment key={stage.stageId}>
            <div className={mergeClasses(styles.stageWrapper, isMobile && styles.stageWrapperMobile)}>
              <div
                className={mergeClasses(
                  styles.circle,
                  isMobile && styles.circleMobile,
                  stage.isActive && showPulse && sharedStyles.pulse
                )}
                style={{ backgroundColor: stageColor.bg, color: stageColor.text }}
                title={`${stage.stageName} (${stage.stageCategoryName}) - ${status}`}
              >
                {stage.isCompleted ? <CheckmarkFilled fontSize={isMobile ? 12 : 16} /> : index + 1}
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
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ============================================
// DESIGN 3: PILLS / BADGES
// ============================================

const usePillStyles = makeStyles({
  container: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('6px'),
    width: '100%',
  },
  containerMobile: {
    flexWrap: 'wrap',
  },
  pill: {
    flex: 1,
    minWidth: 0,
    ...shorthands.padding('6px', '12px'),
    ...shorthands.borderRadius('999px'),
    fontSize: '12px',
    fontWeight: 600,
    textAlign: 'center',
    transitionProperty: 'all',
    transitionDuration: '0.2s',
  },
  pillMobile: {
    flex: 'none',
    ...shorthands.padding('4px', '8px'),
    fontSize: '10px',
  },
  label: {
    display: 'block',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
});

export const PillDesign: React.FC<IBPFDesignProps> = ({
  stages,
  displayMode,
  colors,
  showPulse,
  isMobile,
}) => {
  const styles = usePillStyles();
  const sharedStyles = useSharedStyles();

  return (
    <div className={mergeClasses(styles.container, isMobile && styles.containerMobile)}>
      {stages.map((stage: IBPFStage) => {
        const status = stage.isCompleted ? 'completed' : stage.isActive ? 'active' : 'inactive';
        const stageColor = getStageColor(status, colors);
        const label = getStageLabel(stage.stageName, stage.stageCategoryName, displayMode);

        return (
          <div
            key={stage.stageId}
            className={mergeClasses(
              styles.pill,
              isMobile && styles.pillMobile,
              stage.isActive && showPulse && sharedStyles.pulse
            )}
            style={{ backgroundColor: stageColor.bg, color: stageColor.text }}
            title={`${stage.stageName} (${stage.stageCategoryName}) - ${status}`}
          >
            <span className={styles.label}>{label}</span>
          </div>
        );
      })}
    </div>
  );
};

// ============================================
// DESIGN 4: SEGMENTED BAR
// ============================================

const useSegmentedStyles = makeStyles({
  container: {
    width: '100%',
  },
  bar: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    height: '32px',
    ...shorthands.borderRadius('8px'),
    ...shorthands.overflow('hidden'),
  },
  barMobile: {
    height: '24px',
  },
  segment: {
    flex: 1,
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: 600,
    transitionProperty: 'all',
    transitionDuration: '0.2s',
  },
  segmentMobile: {
    fontSize: '9px',
  },
  label: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    ...shorthands.padding('0', '4px'),
  },
});

export const SegmentedBarDesign: React.FC<IBPFDesignProps> = ({
  stages,
  displayMode,
  colors,
  showPulse,
  isMobile,
}) => {
  const styles = useSegmentedStyles();
  const sharedStyles = useSharedStyles();

  return (
    <div className={styles.container}>
      <div
        className={mergeClasses(styles.bar, isMobile && styles.barMobile)}
        style={{ backgroundColor: colors.track }}
      >
        {stages.map((stage: IBPFStage, index: number) => {
          const isLast = index === stages.length - 1;
          const status = stage.isCompleted ? 'completed' : stage.isActive ? 'active' : 'inactive';
          const stageColor = getStageColor(status, colors);
          const label = getStageLabel(stage.stageName, stage.stageCategoryName, displayMode);

          return (
            <div
              key={stage.stageId}
              className={mergeClasses(
                styles.segment,
                isMobile && styles.segmentMobile,
                stage.isActive && showPulse && sharedStyles.pulse
              )}
              style={{
                backgroundColor: stageColor.bg,
                color: stageColor.text,
                borderRight: !isLast ? '2px solid rgba(255,255,255,0.3)' : 'none',
              }}
              title={`${stage.stageName} (${stage.stageCategoryName}) - ${status}`}
            >
              <span className={styles.label}>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================
// DESIGN 5: TIMELINE
// ============================================

const useTimelineStyles = makeStyles({
  container: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    ...shorthands.gap('4px'),
  },
  containerMobile: {
    flexWrap: 'wrap',
  },
  stage: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('6px'),
    ...shorthands.padding('4px', '8px'),
    ...shorthands.borderRadius('4px'),
    transitionProperty: 'all',
    transitionDuration: '0.2s',
  },
  dot: {
    width: '10px',
    height: '10px',
    ...shorthands.borderRadius('50%'),
    flexShrink: 0,
  },
  dotMobile: {
    width: '8px',
    height: '8px',
  },
  label: {
    fontSize: '11px',
    fontWeight: 500,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  labelMobile: {
    fontSize: '10px',
  },
  arrow: {
    fontSize: '10px',
    flexShrink: 0,
  },
});

export const TimelineDesign: React.FC<IBPFDesignProps> = ({
  stages,
  displayMode,
  colors,
  showPulse,
  isMobile,
}) => {
  const styles = useTimelineStyles();
  const sharedStyles = useSharedStyles();

  return (
    <div className={mergeClasses(styles.container, isMobile && styles.containerMobile)}>
      {stages.map((stage: IBPFStage, index: number) => {
        const isLast = index === stages.length - 1;
        const status = stage.isCompleted ? 'completed' : stage.isActive ? 'active' : 'inactive';
        const stageColor = getStageColor(status, colors);
        const label = getStageLabel(stage.stageName, stage.stageCategoryName, displayMode);
        const isInactive = status === 'inactive';

        return (
          <React.Fragment key={stage.stageId}>
            <div
              className={mergeClasses(
                styles.stage,
                stage.isActive && showPulse && sharedStyles.pulse
              )}
              style={{
                backgroundColor: !isInactive ? `${stageColor.bg}20` : 'transparent',
              }}
              title={`${stage.stageName} (${stage.stageCategoryName}) - ${status}`}
            >
              <div
                className={mergeClasses(styles.dot, isMobile && styles.dotMobile)}
                style={{ backgroundColor: stageColor.bg }}
              />
              <span
                className={mergeClasses(styles.label, isMobile && styles.labelMobile)}
                style={{ color: isInactive ? colors.inactiveText : stageColor.bg }}
              >
                {label}
              </span>
            </div>
            {!isLast && !isMobile && (
              <span className={styles.arrow} style={{ color: colors.inactiveText }}>
                →
              </span>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ============================================
// DESIGN 6: STEPPER
// ============================================

const useStepperStyles = makeStyles({
  container: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  stageWrapper: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('8px'),
    minWidth: 0,
    flexShrink: 0,
  },
  box: {
    width: '28px',
    height: '28px',
    ...shorthands.borderRadius('4px'),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 700,
    flexShrink: 0,
    transitionProperty: 'all',
    transitionDuration: '0.2s',
  },
  boxMobile: {
    width: '20px',
    height: '20px',
    fontSize: '10px',
  },
  label: {
    fontSize: '12px',
    fontWeight: 500,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '70px',
  },
  labelMobile: {
    fontSize: '10px',
    maxWidth: '50px',
  },
  connector: {
    flex: 1,
    height: '2px',
    minWidth: '6px',
    ...shorthands.margin('0', '4px'),
  },
});

export const StepperDesign: React.FC<IBPFDesignProps> = ({
  stages,
  displayMode,
  colors,
  showPulse,
  isMobile,
}) => {
  const styles = useStepperStyles();
  const sharedStyles = useSharedStyles();

  return (
    <div className={styles.container}>
      {stages.map((stage: IBPFStage, index: number) => {
        const isLast = index === stages.length - 1;
        const status = stage.isCompleted ? 'completed' : stage.isActive ? 'active' : 'inactive';
        const stageColor = getStageColor(status, colors);
        const label = getStageLabel(stage.stageName, stage.stageCategoryName, displayMode);

        return (
          <React.Fragment key={stage.stageId}>
            <div className={styles.stageWrapper}>
              <div
                className={mergeClasses(
                  styles.box,
                  isMobile && styles.boxMobile,
                  stage.isActive && showPulse && sharedStyles.pulse
                )}
                style={{ backgroundColor: stageColor.bg, color: stageColor.text }}
                title={`${stage.stageName} (${stage.stageCategoryName}) - ${status}`}
              >
                {stage.isCompleted ? '✓' : index + 1}
              </div>
              {!isMobile && (
                <span
                  className={mergeClasses(styles.label, isMobile && styles.labelMobile)}
                  style={{ color: status === 'inactive' ? colors.inactiveText : stageColor.bg }}
                  title={label}
                >
                  {label}
                </span>
              )}
            </div>
            {!isLast && (
              <div
                className={styles.connector}
                style={{ backgroundColor: stage.isCompleted ? colors.completed : colors.track }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ============================================
// DESIGN SELECTOR
// ============================================

export const DESIGN_COMPONENTS = {
  chevron: ChevronDesign,
  circles: CircleDesign,
  pills: PillDesign,
  segmented: SegmentedBarDesign,
  timeline: TimelineDesign,
  stepper: StepperDesign,
} as const;

export function getDesignComponent(designStyle: string): React.FC<IBPFDesignProps> {
  return DESIGN_COMPONENTS[designStyle as keyof typeof DESIGN_COMPONENTS] || ChevronDesign;
}
