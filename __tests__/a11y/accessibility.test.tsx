/**
 * Accessibility Tests
 *
 * Automated WCAG 2.1 AA compliance testing using jest-axe
 */

import * as React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { BPFViewer } from '../../components/BPFViewer';
import { BPFRow } from '../../components/BPFRow';
import {
  createMockRecordBPFData,
  createMockBPFInstance,
  createMockBPFStage,
  createMockStageColors,
} from '../setup/testUtils';
import type { IControlSettings } from '../../types';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe('Accessibility Tests (WCAG 2.1 AA)', () => {
  const mockSettings: IControlSettings = {
    designStyle: 'chevron',
    displayMode: 'stage',
    recordNameSize: 'medium',
    showEntityName: true,
    enableNavigation: false,
    showPulseAnimation: true,
    usePlatformTheme: false,
  };

  const navSettings = { ...mockSettings, enableNavigation: true as const };

  const mockColors = createMockStageColors();

  describe('BPFViewer Component', () => {
    it('should have no accessibility violations in loading state', async () => {
      const { container } = render(
        <BPFViewer
          records={[]}
          settings={mockSettings}
          colors={mockColors}
          isLoading={true}
          error={null}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations in error state', async () => {
      const { container } = render(
        <BPFViewer
          records={[]}
          settings={mockSettings}
          colors={mockColors}
          isLoading={false}
          error="An error occurred"
          onRefresh={() => {}}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations in empty state', async () => {
      const { container } = render(
        <BPFViewer
          records={[]}
          settings={mockSettings}
          colors={mockColors}
          isLoading={false}
          error={null}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with records', async () => {
      const stages = [
        createMockBPFStage('stage1', 'Qualify', 'Qualify', 0, 0, true, false),
        createMockBPFStage('stage2', 'Develop', 'Develop', 1, 1, false, true),
        createMockBPFStage('stage3', 'Propose', 'Propose', 2, 2, false, false),
      ];

      const bpfInstance = createMockBPFInstance(
        'process1',
        'Sales Process',
        'opportunitysalesprocess',
        stages,
        'stage2'
      );

      const records = [
        createMockRecordBPFData(
          'record1',
          'Test Opportunity',
          'opportunity',
          'Opportunity',
          bpfInstance
        ),
      ];

      const { container } = render(
        <BPFViewer
          records={records}
          settings={mockSettings}
          colors={mockColors}
          isLoading={false}
          error={null}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('BPFRow Component', () => {
    it('should have no accessibility violations with BPF data', async () => {
      const stages = [
        createMockBPFStage('stage1', 'Qualify', 'Qualify', 0, 0, true, false),
        createMockBPFStage('stage2', 'Develop', 'Develop', 1, 1, false, true),
        createMockBPFStage('stage3', 'Propose', 'Propose', 2, 2, false, false),
      ];

      const bpfInstance = createMockBPFInstance(
        'process1',
        'Sales Process',
        'opportunitysalesprocess',
        stages,
        'stage2'
      );

      const record = createMockRecordBPFData(
        'record1',
        'Test Opportunity',
        'opportunity',
        'Opportunity',
        bpfInstance
      );

      const { container } = render(
        <BPFRow
          record={record}
          settings={mockSettings}
          colors={mockColors}
          isMobile={false}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations in loading state', async () => {
      const record = createMockRecordBPFData(
        'record1',
        'Test Opportunity',
        'opportunity',
        'Opportunity',
        null,
        true
      );

      const { container } = render(
        <BPFRow
          record={record}
          settings={mockSettings}
          colors={mockColors}
          isMobile={false}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with error', async () => {
      const record = createMockRecordBPFData(
        'record1',
        'Test Opportunity',
        'opportunity',
        'Opportunity',
        null,
        false,
        'Failed to load'
      );

      const { container } = render(
        <BPFRow
          record={record}
          settings={mockSettings}
          colors={mockColors}
          isMobile={false}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations without BPF instance', async () => {
      const record = createMockRecordBPFData(
        'record1',
        'Test Opportunity',
        'opportunity',
        'Opportunity',
        null
      );

      const { container } = render(
        <BPFRow
          record={record}
          settings={mockSettings}
          colors={mockColors}
          isMobile={false}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations in mobile view', async () => {
      const stages = [
        createMockBPFStage('stage1', 'Qualify', 'Qualify', 0, 0, true, false),
        createMockBPFStage('stage2', 'Develop', 'Develop', 1, 1, false, true),
      ];

      const bpfInstance = createMockBPFInstance(
        'process1',
        'Sales Process',
        'opportunitysalesprocess',
        stages,
        'stage2'
      );

      const record = createMockRecordBPFData(
        'record1',
        'Test Opportunity',
        'opportunity',
        'Opportunity',
        bpfInstance
      );

      const { container } = render(
        <BPFRow
          record={record}
          settings={mockSettings}
          colors={mockColors}
          isMobile={true}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should have focusable elements for navigation', () => {
      const stages = [
        createMockBPFStage('stage1', 'Qualify', 'Qualify', 0, 0, true, false),
        createMockBPFStage('stage2', 'Develop', 'Develop', 1, 1, false, true),
      ];

      const bpfInstance = createMockBPFInstance(
        'process1',
        'Sales Process',
        'opportunitysalesprocess',
        stages,
        'stage2'
      );

      const record = createMockRecordBPFData(
        'record1',
        'Test Opportunity',
        'opportunity',
        'Opportunity',
        bpfInstance
      );

      const { container } = render(
        <BPFRow
          record={record}
          settings={navSettings}
          colors={mockColors}
          isMobile={false}
          onNavigate={jest.fn()}
        />
      );

      // Should have a focusable element when navigation is enabled
      const focusableElements = container.querySelectorAll('[tabindex="0"]');
      expect(focusableElements.length).toBeGreaterThan(0);
    });
  });

  describe('ARIA Labels and Roles', () => {
    it('should have proper ARIA labels for screen readers', () => {
      const stages = [
        createMockBPFStage('stage1', 'Qualify', 'Qualify', 0, 0, true, false),
        createMockBPFStage('stage2', 'Develop', 'Develop', 1, 1, false, true),
      ];

      const bpfInstance = createMockBPFInstance(
        'process1',
        'Sales Process',
        'opportunitysalesprocess',
        stages,
        'stage2'
      );

      const record = createMockRecordBPFData(
        'record1',
        'Test Opportunity',
        'opportunity',
        'Opportunity',
        bpfInstance
      );

      const { getByRole } = render(
        <BPFRow
          record={record}
          settings={navSettings}
          colors={mockColors}
          isMobile={false}
          onNavigate={jest.fn()}
        />
      );

      // Should have proper role (button when navigation enabled)
      const rowElement = getByRole('button');
      expect(rowElement).toHaveAttribute('aria-label');
    });

    it('should mark current stage with aria-current', () => {
      const stages = [
        createMockBPFStage('stage1', 'Qualify', 'Qualify', 0, 0, true, false),
        createMockBPFStage('stage2', 'Develop', 'Develop', 1, 1, false, true),
        createMockBPFStage('stage3', 'Propose', 'Propose', 2, 2, false, false),
      ];

      const bpfInstance = createMockBPFInstance(
        'process1',
        'Sales Process',
        'opportunitysalesprocess',
        stages,
        'stage2'
      );

      const record = createMockRecordBPFData(
        'record1',
        'Test Opportunity',
        'opportunity',
        'Opportunity',
        bpfInstance
      );

      const { container } = render(
        <BPFRow
          record={record}
          settings={mockSettings}
          colors={mockColors}
          isMobile={false}
        />
      );

      // Should have aria-current="step" on active stage
      const currentSteps = container.querySelectorAll('[aria-current="step"]');
      expect(currentSteps.length).toBeGreaterThan(0);
    });
  });
});
