/**
 * BPF Design Components
 * 
 * 10 visual styles for displaying BPF stages:
 * - Chevron: Classic ribbon arrows
 * - Circles: Connected circles with labels
 * - Pills: Rounded badge style
 * - Segmented: Single progress bar
 * - Stepper: Numbered boxes with connectors
 * - Gradient: Progress bar with gradient fill
 * - Path: Horizontal connected nodes
 * - Line: Minimal track with circular markers
 * - Fraction: Compact fraction display with progress bar
 */

import * as React from 'react';
import { IBPFDesignProps, IBPFStage } from '../../types';
import { getStageColor, getStageLabel } from '../../utils/themeUtils';
import { CheckmarkFilled } from '@fluentui/react-icons';
import { makeStyles, mergeClasses } from '@fluentui/react-components';

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
    paddingRight: '8px',
    paddingLeft: '8px',
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
  
  // Find active stage for accessibility
  const activeStage = stages.find(s => s.isActive);
  const completedCount = stages.filter(s => s.isCompleted).length;

  return (
    <div 
      className={mergeClasses(styles.container, isMobile && styles.containerMobile)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={stages.length}
      aria-valuenow={completedCount}
      aria-label={`Business process flow: ${completedCount} of ${stages.length} stages complete${activeStage ? `. Current stage: ${getStageLabel(activeStage.stageName, activeStage.stageCategoryName, displayMode)}` : ''}`}
    >
      {stages.map((stage: IBPFStage, index: number) => {
        const isFirst = index === 0;
        const isLast = index === stages.length - 1;
        const status = stage.isCompleted ? 'completed' : stage.isActive ? 'active' : 'inactive';
        const stageColor = getStageColor(status, colors);
        const label = getStageLabel(stage.stageName, stage.stageCategoryName, displayMode);

        // Arrow size for the chevron point
        const arrowSize = isMobile ? '12px' : '15px';
        
        const clipPath = isFirst
          ? `polygon(0 0, calc(100% - ${arrowSize}) 0, 100% 50%, calc(100% - ${arrowSize}) 100%, 0 100%)`
          : isLast
          ? `polygon(0 0, 100% 0, 100% 100%, 0 100%, ${arrowSize} 50%)`
          : `polygon(0 0, calc(100% - ${arrowSize}) 0, 100% 50%, calc(100% - ${arrowSize}) 100%, 0 100%, ${arrowSize} 50%)`;

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
              marginLeft: 0,
              marginRight: isMobile ? '2px' : '4px',
              zIndex: 1,
            }}
            title={`${stage.stageName} (${stage.stageCategoryName}) - ${status}`}
            role="img"
            aria-label={`${label}: ${status}${stage.isActive ? ' (current)' : ''}`}
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
    paddingRight: '2px',
    paddingLeft: '2px',
  },
  connector: {
    flex: 1,
    height: '2px',
    minWidth: '8px',
  },
  connectorDesktop: {
    marginTop: '-20px',
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
    transitionDuration: '0.2s',
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
    borderRadius: '8px',
    overflow: 'hidden',
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
    textAlign: 'center',
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
    gap: '8px',
    minWidth: 0,
    flexShrink: 0,
  },
  box: {
    width: '28px',
    height: '28px',
    borderRadius: '4px',
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
    marginRight: '4px',
    marginLeft: '4px',
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
// DESIGN 7: GRADIENT BAR
// ============================================

const useGradientStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  barContainer: {
    position: 'relative',
    width: '100%',
    height: '28px',
    backgroundColor: '#E1E1E1',
    borderRadius: '14px',
    overflow: 'hidden',
  },
  barContainerMobile: {
    height: '20px',
  },
  progressBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    transitionProperty: 'width',
    transitionDuration: '0.5s',
    transitionTimingFunction: 'ease-in-out',
  },
  labelsContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '8px',
  },
  labelWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    gap: '4px',
  },
  label: {
    fontSize: '11px',
    fontWeight: 500,
    textAlign: 'center',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    width: '100%',
  },
  labelMobile: {
    fontSize: '9px',
  },
  indicator: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '8px',
    lineHeight: '1',
  },
  indicatorMobile: {
    width: '10px',
    height: '10px',
    fontSize: '6px',
    lineHeight: '1',
  },
});

export const GradientDesign: React.FC<IBPFDesignProps> = ({
  stages,
  displayMode,
  colors,
  showPulse,
  isMobile,
}) => {
  const styles = useGradientStyles();
  const sharedStyles = useSharedStyles();

  // Calculate active stage index
  const activeIndex = stages.findIndex(s => s.isActive);
  const progressPercent = activeIndex >= 0 ? ((activeIndex + 1) / stages.length) * 100 : 0;

  return (
    <div className={styles.container}>
      <div className={mergeClasses(styles.barContainer, isMobile && styles.barContainerMobile)}>
        <div
          className={styles.progressBar}
          style={{
            width: `${progressPercent}%`,
            background: `linear-gradient(to right, ${colors.completed}, ${colors.active})`,
          }}
        />
      </div>
      <div className={styles.labelsContainer}>
        {stages.map((stage: IBPFStage) => {
          const status = stage.isCompleted ? 'completed' : stage.isActive ? 'active' : 'inactive';
          const stageColor = getStageColor(status, colors);
          const label = getStageLabel(stage.stageName, stage.stageCategoryName, displayMode);

          return (
            <div key={stage.stageId} className={styles.labelWrapper}>
              <div
                className={mergeClasses(
                  styles.indicator,
                  isMobile && styles.indicatorMobile,
                  stage.isActive && showPulse && sharedStyles.pulse
                )}
                style={{
                  backgroundColor: stageColor.bg,
                  color: stageColor.text,
                }}
                title={`${stage.stageName} (${stage.stageCategoryName}) - ${status}`}
              >
                {stage.isCompleted ? '✓' : stage.isActive ? '●' : '○'}
              </div>
              <span
                className={mergeClasses(styles.label, isMobile && styles.labelMobile)}
                style={{ color: colors.inactiveText }}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================
// DESIGN 8: LINE + MARKERS
// ============================================

const useLineStyles = makeStyles({
  container: {
    position: 'relative',
    width: '100%',
    paddingTop: '28px',
    paddingBottom: '0',
  },
  trackContainer: {
    position: 'relative',
    height: '4px',
    backgroundColor: '#E1E1E1',
    borderRadius: '2px',
  },
  progressLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    borderRadius: '2px',
    transitionProperty: 'width',
    transitionDuration: '0.5s',
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
    transitionDuration: '0.2s',
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
    marginTop: '36px',
    fontSize: '11px',
    fontWeight: 500,
    textAlign: 'center',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '80px',
  },
  labelMobile: {
    marginTop: '32px',
    fontSize: '9px',
    maxWidth: '60px',
  },
});

export const LineDesign: React.FC<IBPFDesignProps> = ({
  stages,
  displayMode,
  colors,
  showPulse,
  isMobile,
}) => {
  const styles = useLineStyles();
  const sharedStyles = useSharedStyles();

  // Calculate progress percentage
  const activeIndex = stages.findIndex(s => s.isActive);
  const progressPercent = activeIndex >= 0 ? (activeIndex / (stages.length - 1)) * 100 : 0;

  return (
    <div className={styles.container}>
      <div className={styles.trackContainer}>
        <div
          className={styles.progressLine}
          style={{
            width: `${progressPercent}%`,
            background: `linear-gradient(to right, ${colors.completed}, ${colors.active})`,
          }}
        />
        <div className={styles.markersContainer}>
          {stages.map((stage: IBPFStage) => {
            const status = stage.isCompleted ? 'completed' : stage.isActive ? 'active' : 'inactive';
            const stageColor = getStageColor(status, colors);
            const label = getStageLabel(stage.stageName, stage.stageCategoryName, displayMode);

            return (
              <div key={stage.stageId} className={styles.markerWrapper}>
                <div
                  className={mergeClasses(
                    styles.marker,
                    stage.isActive && styles.markerActive,
                    isMobile && styles.markerMobile,
                    stage.isActive && isMobile && styles.markerActiveMobile,
                    stage.isActive && showPulse && sharedStyles.pulse
                  )}
                  style={{
                    backgroundColor: stageColor.bg,
                    color: stageColor.text,
                    border: status === 'inactive' ? `2px solid ${colors.track}` : 'none',
                  }}
                  title={`${stage.stageName} (${stage.stageCategoryName}) - ${status}`}
                >
                  {stage.isCompleted ? <CheckmarkFilled fontSize={isMobile ? 10 : 12} /> : null}
                </div>
                <span
                  className={mergeClasses(styles.label, isMobile && styles.labelMobile)}
                  style={{ color: status === 'inactive' ? colors.inactiveText : stageColor.bg }}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ============================================
// DESIGN 10: FRACTION
// ============================================

const useFractionStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    width: '100%',
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  fraction: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#0078D4',
    flexShrink: 0,
  },
  fractionMobile: {
    fontSize: '18px',
  },
  currentLabel: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#333',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  currentLabelMobile: {
    fontSize: '12px',
  },
  barContainer: {
    position: 'relative',
    width: '100%',
    height: '8px',
    backgroundColor: '#E1E1E1',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    transitionProperty: 'width',
    transitionDuration: '0.5s',
    transitionTimingFunction: 'ease-in-out',
  },
});

export const FractionDesign: React.FC<IBPFDesignProps> = ({
  stages,
  displayMode,
  colors,
  isMobile,
}) => {
  const styles = useFractionStyles();

  // Find active or last completed stage
  const activeIndex = stages.findIndex(s => s.isActive);
  const currentIndex = activeIndex >= 0 ? activeIndex : stages.findIndex(s => !s.isCompleted);
  const currentStage = stages[currentIndex >= 0 ? currentIndex : stages.length - 1];
  const currentStepNumber = (currentIndex >= 0 ? currentIndex : stages.length - 1) + 1;
  const progressPercent = (currentStepNumber / stages.length) * 100;
  const label = getStageLabel(currentStage.stageName, currentStage.stageCategoryName, displayMode);

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <span className={mergeClasses(styles.fraction, isMobile && styles.fractionMobile)}>
          {currentStepNumber}/{stages.length}
        </span>
        <span className={mergeClasses(styles.currentLabel, isMobile && styles.currentLabelMobile)} title={label}>
          {label}
        </span>
      </div>
      <div className={styles.barContainer}>
        <div
          className={styles.progressBar}
          style={{
            width: `${progressPercent}%`,
            background: `linear-gradient(to right, ${colors.completed}, ${colors.active})`,
          }}
        />
      </div>
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
  stepper: StepperDesign,
  gradient: GradientDesign,
  line: LineDesign,
  fraction: FractionDesign,
} as const;

export function getDesignComponent(designStyle: string): React.FC<IBPFDesignProps> {
  return DESIGN_COMPONENTS[designStyle as keyof typeof DESIGN_COMPONENTS] || ChevronDesign;
}
