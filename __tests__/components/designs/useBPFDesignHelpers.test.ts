/**
 * Tests for useBPFDesignHelpers hook
 */

import { renderHook } from '@testing-library/react-hooks';
import { useBPFDesignHelpers } from '../../../components/designs/hooks/useBPFDesignHelpers';
import { createMockBPFStage, createMockStageColors } from '../../setup/testUtils';
import type { DisplayMode, IBPFStage } from '../../../types';

describe('useBPFDesignHelpers', () => {
  const mockColors = createMockStageColors();
  const displayMode: DisplayMode = 'stage';

  describe('shouldPulse logic', () => {
    it('should pulse when stage is active and not the last stage', () => {
      const stages = [
        createMockBPFStage('stage1', 'Qualify', 'Qualify', 0, 0, true, false),
        createMockBPFStage('stage2', 'Develop', 'Develop', 1, 1, false, true), // Active middle stage
        createMockBPFStage('stage3', 'Propose', 'Propose', 2, 2, false, false),
      ];

      const { result } = renderHook(() =>
        useBPFDesignHelpers(stages, displayMode, mockColors, true)
      );

      // First stage (completed) should not pulse
      expect(result.current.stageMetadata[0].shouldPulse).toBe(false);

      // Second stage (active, but not last) should pulse
      expect(result.current.stageMetadata[1].shouldPulse).toBe(true);

      // Third stage (inactive) should not pulse
      expect(result.current.stageMetadata[2].shouldPulse).toBe(false);
    });

    it('should pulse when active stage is the last stage (process still in progress)', () => {
      const stages = [
        createMockBPFStage('stage1', 'Qualify', 'Qualify', 0, 0, true, false),
        createMockBPFStage('stage2', 'Develop', 'Develop', 1, 1, true, false),
        createMockBPFStage('stage3', 'Propose', 'Propose', 2, 2, false, true), // Active last stage
      ];

      const { result } = renderHook(() =>
        useBPFDesignHelpers(stages, displayMode, mockColors, true)
      );

      // Being on the last stage doesn't mean finished — user is still working on it
      expect(result.current.stageMetadata[0].shouldPulse).toBe(false);
      expect(result.current.stageMetadata[1].shouldPulse).toBe(false);
      expect(result.current.stageMetadata[2].shouldPulse).toBe(true); // Active stage should pulse
    });

    it('should NOT pulse when process is truly finished (no active stage, all completed)', () => {
      const stages = [
        createMockBPFStage('stage1', 'Qualify', 'Qualify', 0, 0, true, false), // Completed
        createMockBPFStage('stage2', 'Develop', 'Develop', 1, 1, true, false), // Completed
        createMockBPFStage('stage3', 'Propose', 'Propose', 2, 2, true, false), // Completed, not active
      ];

      const { result } = renderHook(() =>
        useBPFDesignHelpers(stages, displayMode, mockColors, true)
      );

      // No active stage + has completed stages = finished — no pulse
      expect(result.current.stageMetadata[0].shouldPulse).toBe(false);
      expect(result.current.stageMetadata[1].shouldPulse).toBe(false);
      expect(result.current.stageMetadata[2].shouldPulse).toBe(false);
    });

    it('should NOT pulse when showPulse is disabled', () => {
      const stages = [
        createMockBPFStage('stage1', 'Qualify', 'Qualify', 0, 0, true, false),
        createMockBPFStage('stage2', 'Develop', 'Develop', 1, 1, false, true), // Active
        createMockBPFStage('stage3', 'Propose', 'Propose', 2, 2, false, false),
      ];

      const { result } = renderHook(() =>
        useBPFDesignHelpers(stages, displayMode, mockColors, false) // showPulse = false
      );

      // No stages should pulse when showPulse is disabled
      expect(result.current.stageMetadata[0].shouldPulse).toBe(false);
      expect(result.current.stageMetadata[1].shouldPulse).toBe(false);
      expect(result.current.stageMetadata[2].shouldPulse).toBe(false);
    });

    it('should pulse on first stage when active', () => {
      const stages = [
        createMockBPFStage('stage1', 'Qualify', 'Qualify', 0, 0, false, true), // Active first stage
        createMockBPFStage('stage2', 'Develop', 'Develop', 1, 1, false, false),
        createMockBPFStage('stage3', 'Propose', 'Propose', 2, 2, false, false),
      ];

      const { result } = renderHook(() =>
        useBPFDesignHelpers(stages, displayMode, mockColors, true)
      );

      // First stage should pulse (not the last stage)
      expect(result.current.stageMetadata[0].shouldPulse).toBe(true);
      expect(result.current.stageMetadata[1].shouldPulse).toBe(false);
      expect(result.current.stageMetadata[2].shouldPulse).toBe(false);
    });

    it('should pulse on single-stage process when active', () => {
      const stages = [
        createMockBPFStage('stage1', 'Only Stage', 'Only Stage', 0, 0, false, true), // Active and only stage
      ];

      const { result } = renderHook(() =>
        useBPFDesignHelpers(stages, displayMode, mockColors, true)
      );

      // Single active stage is not finished (still active), should pulse
      expect(result.current.stageMetadata[0].shouldPulse).toBe(true);
    });

    it('should handle empty stages array', () => {
      const stages: IBPFStage[] = [];

      const { result } = renderHook(() =>
        useBPFDesignHelpers(stages, displayMode, mockColors, true)
      );

      expect(result.current.stageMetadata).toEqual([]);
    });
  });

  describe('stage status determination', () => {
    it('should correctly identify completed stages', () => {
      const stages = [
        createMockBPFStage('stage1', 'Qualify', 'Qualify', 0, 0, true, false), // Completed
        createMockBPFStage('stage2', 'Develop', 'Develop', 1, 1, false, true),
      ];

      const { result } = renderHook(() =>
        useBPFDesignHelpers(stages, displayMode, mockColors, true)
      );

      expect(result.current.stageMetadata[0].status).toBe('completed');
      expect(result.current.stageMetadata[1].status).toBe('active');
    });

    it('should correctly identify inactive stages', () => {
      const stages = [
        createMockBPFStage('stage1', 'Qualify', 'Qualify', 0, 0, false, false), // Inactive
        createMockBPFStage('stage2', 'Develop', 'Develop', 1, 1, false, true),
      ];

      const { result } = renderHook(() =>
        useBPFDesignHelpers(stages, displayMode, mockColors, true)
      );

      expect(result.current.stageMetadata[0].status).toBe('inactive');
      expect(result.current.stageMetadata[1].status).toBe('active');
    });
  });

  describe('accessibility metadata', () => {
    it('should calculate progress correctly', () => {
      const stages = [
        createMockBPFStage('stage1', 'Qualify', 'Qualify', 0, 0, true, false),
        createMockBPFStage('stage2', 'Develop', 'Develop', 1, 1, false, true),
        createMockBPFStage('stage3', 'Propose', 'Propose', 2, 2, false, false),
      ];

      const { result } = renderHook(() =>
        useBPFDesignHelpers(stages, displayMode, mockColors, true)
      );

      expect(result.current.a11yMetadata.completedCount).toBe(1);
      expect(result.current.a11yMetadata.totalCount).toBe(3);
      expect(result.current.a11yMetadata.progressPercent).toBe(33);
    });

    it('should identify active stage', () => {
      const stages = [
        createMockBPFStage('stage1', 'Qualify', 'Qualify', 0, 0, true, false),
        createMockBPFStage('stage2', 'Develop', 'Develop', 1, 1, false, true),
      ];

      const { result } = renderHook(() =>
        useBPFDesignHelpers(stages, displayMode, mockColors, true)
      );

      expect(result.current.a11yMetadata.activeStage?.stageId).toBe('stage2');
      expect(result.current.a11yMetadata.activeStage?.stageName).toBe('Develop');
    });

    it('should compute activeStageIndex correctly', () => {
      const stages = [
        createMockBPFStage('stage1', 'Qualify', 'Qualify', 0, 0, true, false),
        createMockBPFStage('stage2', 'Develop', 'Develop', 1, 1, false, true),
        createMockBPFStage('stage3', 'Propose', 'Propose', 2, 2, false, false),
      ];

      const { result } = renderHook(() =>
        useBPFDesignHelpers(stages, displayMode, mockColors, true)
      );

      expect(result.current.a11yMetadata.activeStageIndex).toBe(1);
    });

    it('should default activeStageIndex to last stage when no active stage', () => {
      const stages = [
        createMockBPFStage('stage1', 'Qualify', 'Qualify', 0, 0, true, false),
        createMockBPFStage('stage2', 'Develop', 'Develop', 1, 1, true, false),
        createMockBPFStage('stage3', 'Propose', 'Propose', 2, 2, false, false),
      ];

      const { result } = renderHook(() =>
        useBPFDesignHelpers(stages, displayMode, mockColors, true)
      );

      // No active stage, should fall back to last index
      expect(result.current.a11yMetadata.activeStageIndex).toBe(2);
    });
  });

  describe('display mode', () => {
    it('should use stage name in stage mode', () => {
      const stages = [
        createMockBPFStage('stage1', 'Qualify Lead', 'Qualify', 0, 0, false, true),
      ];

      const { result } = renderHook(() =>
        useBPFDesignHelpers(stages, 'stage', mockColors, true)
      );

      expect(result.current.stageMetadata[0].label).toBe('Qualify Lead');
    });

    it('should use category name in category mode', () => {
      const stages = [
        createMockBPFStage('stage1', 'Qualify Lead', 'Qualify', 0, 0, false, true),
      ];

      const { result } = renderHook(() =>
        useBPFDesignHelpers(stages, 'category', mockColors, true)
      );

      expect(result.current.stageMetadata[0].label).toBe('Qualify');
    });
  });
});
