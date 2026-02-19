import { useMemo } from 'react';
import type { IBPFStage, IStageColors, DisplayMode } from '../../../types';
import { getStageColor, getStageLabel, toTitleCase } from '../../../utils/themeUtils';

/**
 * Stage status type
 */
export type StageStatus = 'completed' | 'active' | 'inactive';

/**
 * Determines the status of a stage based on its state
 */
export function determineStageStatus(stage: IBPFStage): StageStatus {
  if (stage.isCompleted) return 'completed';
  if (stage.isActive) return 'active';
  return 'inactive';
}

/**
 * Stage metadata with computed values
 */
export interface IStageMetadata {
  stage: IBPFStage;
  status: StageStatus;
  stageColor: { bg: string; text: string };
  label: string;
  shouldPulse: boolean;
}

/**
 * Accessibility metadata for the entire BPF
 */
export interface IA11yMetadata {
  activeStage: IBPFStage | undefined;
  activeStageIndex: number;
  completedCount: number;
  totalCount: number;
  progressPercent: number;
}

/**
 * Custom hook providing shared logic for all design components
 *
 * This hook centralizes:
 * - Stage status determination (completed/active/inactive)
 * - Color resolution based on status
 * - Label generation (stage name or category)
 * - Pulse animation logic
 * - Accessibility metadata
 *
 * Benefits:
 * - Eliminates ~200 lines of duplicated code across 8 designs
 * - Centralizes business logic for easier maintenance
 * - Improves performance with memoization
 * - Ensures consistency across all designs
 *
 * @param stages - Array of BPF stages
 * @param displayMode - Whether to show stage name or category
 * @param colors - Color configuration for different stage states
 * @param showPulse - Whether to show pulse animation on active stage
 * @returns Object containing stage metadata and accessibility metadata
 */
export function useBPFDesignHelpers(
  stages: IBPFStage[],
  displayMode: DisplayMode,
  colors: IStageColors,
  showPulse: boolean
): {
  stageMetadata: IStageMetadata[];
  a11yMetadata: IA11yMetadata;
} {
  // Determine if the process is finished:
  // When statuscode=2 (Finished), all stages are marked completed with no active stage.
  // Detect by checking: no stage is active AND at least one is completed.
  const isProcessFinished = useMemo(() => {
    if (stages.length === 0) return false;
    const hasActiveStage = stages.some(s => s.isActive);
    const hasCompletedStages = stages.some(s => s.isCompleted);
    return !hasActiveStage && hasCompletedStages;
  }, [stages]);

  // Memoized stage metadata computation
  const stageMetadata = useMemo<IStageMetadata[]>(
    () =>
      stages.map((stage) => {
        const status = determineStageStatus(stage);
        const stageColor = getStageColor(status, colors);
        const label = getStageLabel(stage.stageName, stage.stageCategoryName, displayMode);

        // Title-case stage names so tooltips display consistently
        const titleCasedStage = {
          ...stage,
          stageName: toTitleCase(stage.stageName),
          stageCategoryName: toTitleCase(stage.stageCategoryName),
        };

        return {
          stage: titleCasedStage,
          status,
          stageColor,
          label,
          // Only pulse if: stage is active, pulse is enabled, and process is not finished
          shouldPulse: stage.isActive && showPulse && !isProcessFinished,
        };
      }),
    [stages, displayMode, colors, showPulse, isProcessFinished]
  );

  // Memoized accessibility metadata
  const a11yMetadata = useMemo<IA11yMetadata>(() => {
    const activeStageIdx = stages.findIndex((s) => s.isActive);
    const activeStage = activeStageIdx >= 0 ? stages[activeStageIdx] : undefined;
    const completedCount = stages.filter((s) => s.isCompleted).length;
    const totalCount = stages.length;
    const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return {
      activeStage,
      activeStageIndex: activeStageIdx >= 0 ? activeStageIdx : totalCount - 1,
      completedCount,
      totalCount,
      progressPercent,
    };
  }, [stages]);

  return { stageMetadata, a11yMetadata };
}
