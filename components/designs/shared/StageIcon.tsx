import * as React from 'react';
import { CheckmarkFilled } from '@fluentui/react-icons';
import type { StageStatus } from '../hooks/useBPFDesignHelpers';

export interface IStageIconProps {
  /**
   * Status of the stage (completed/active/inactive)
   */
  status: StageStatus;

  /**
   * Stage number (1-based) for display
   */
  stageNumber: number;

  /**
   * Size of the icon
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Whether to show the number for inactive/active stages
   */
  showNumber?: boolean;
}

/**
 * Reusable stage status icon component
 *
 * Displays appropriate icon or number based on stage status:
 * - Completed: Checkmark icon
 * - Active: Stage number (for visual indication)
 * - Inactive: Stage number (muted)
 *
 * This component improves accessibility by:
 * - Using icons for visual distinction
 * - Adding aria-labels for screen readers
 * - Providing both visual and text-based status indication
 *
 * @param props - Component props
 * @returns React element
 */
export const StageIcon: React.FC<IStageIconProps> = ({
  status,
  stageNumber,
  size = 'medium',
  showNumber = true,
}) => {
  // Map size to icon font size
  const iconSize = size === 'small' ? 12 : size === 'medium' ? 16 : 20;

  // Completed stage shows checkmark
  if (status === 'completed') {
    return (
      <CheckmarkFilled
        fontSize={iconSize}
        aria-label={`Stage ${stageNumber} - Completed`}
      />
    );
  }

  // Active/Inactive stages show number if enabled
  if (showNumber) {
    const ariaLabel =
      status === 'active'
        ? `Active - Stage ${stageNumber}`
        : `Stage ${stageNumber}`;

    return (
      <span aria-label={ariaLabel} role="img">
        {stageNumber}
      </span>
    );
  }

  // Empty placeholder if not showing numbers
  return null;
};
