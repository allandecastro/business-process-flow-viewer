/**
 * Accessibility Tests
 *
 * Automated WCAG 2.1 AA compliance testing using jest-axe.
 * Tests all 8 design components, keyboard navigation, and ARIA attributes.
 */

import * as React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import { axe, toHaveNoViolations } from 'jest-axe';
import { BPFViewer } from '../../components/BPFViewer';
import { BPFRow } from '../../components/BPFRow';
import { ChevronDesign } from '../../components/designs/ChevronDesign';
import { CircleDesign } from '../../components/designs/CircleDesign';
import { PillDesign } from '../../components/designs/PillDesign';
import { SegmentedBarDesign } from '../../components/designs/SegmentedBarDesign';
import { StepperDesign } from '../../components/designs/StepperDesign';
import { GradientDesign } from '../../components/designs/GradientDesign';
import { LineDesign } from '../../components/designs/LineDesign';
import { FractionDesign } from '../../components/designs/FractionDesign';
import {
  createMockRecordBPFData,
  createMockBPFInstance,
  createMockBPFStage,
  createMockStageColors,
} from '../setup/testUtils';
import type { IControlSettings, IBPFDesignProps } from '../../types';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

function renderWithFluent(ui: React.ReactElement) {
  return render(
    <FluentProvider theme={webLightTheme}>{ui}</FluentProvider>
  );
}

const mockStages = [
  createMockBPFStage('stage1', 'Qualify', 'Qualify', 0, 0, true, false),
  createMockBPFStage('stage2', 'Develop', 'Develop', 1, 1, false, true),
  createMockBPFStage('stage3', 'Propose', 'Propose', 2, 2, false, false),
];

const mockColors = createMockStageColors();

const defaultDesignProps: IBPFDesignProps = {
  stages: mockStages,
  displayMode: 'stage',
  colors: mockColors,
  showPulse: true,
  isMobile: false,
};

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
      const bpfInstance = createMockBPFInstance(
        'process1',
        'Sales Process',
        'opportunitysalesprocess',
        mockStages,
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
      const bpfInstance = createMockBPFInstance(
        'process1',
        'Sales Process',
        'opportunitysalesprocess',
        mockStages,
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
      const bpfInstance = createMockBPFInstance(
        'process1',
        'Sales Process',
        'opportunitysalesprocess',
        mockStages.slice(0, 2),
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

  describe('Design Components - axe compliance', () => {
    const designs = [
      { name: 'ChevronDesign', Component: ChevronDesign },
      { name: 'CircleDesign', Component: CircleDesign },
      { name: 'PillDesign', Component: PillDesign },
      { name: 'SegmentedBarDesign', Component: SegmentedBarDesign },
      { name: 'StepperDesign', Component: StepperDesign },
      { name: 'GradientDesign', Component: GradientDesign },
      { name: 'LineDesign', Component: LineDesign },
      { name: 'FractionDesign', Component: FractionDesign },
    ] as const;

    designs.forEach(({ name, Component }) => {
      it(`${name} should have no axe violations (desktop)`, async () => {
        const { container } = renderWithFluent(
          <Component {...defaultDesignProps} />
        );
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      });

      it(`${name} should have no axe violations (mobile)`, async () => {
        const { container } = renderWithFluent(
          <Component {...defaultDesignProps} isMobile={true} />
        );
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('should have focusable elements when navigation is enabled', () => {
      const bpfInstance = createMockBPFInstance(
        'process1',
        'Sales Process',
        'opportunitysalesprocess',
        mockStages.slice(0, 2),
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

      const focusableElements = container.querySelectorAll('[tabindex="0"]');
      expect(focusableElements.length).toBeGreaterThan(0);
    });

    it('should fire onNavigate when Enter is pressed', () => {
      const onNavigate = jest.fn();
      const bpfInstance = createMockBPFInstance(
        'process1',
        'Sales Process',
        'opportunitysalesprocess',
        mockStages.slice(0, 2),
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
          onNavigate={onNavigate}
        />
      );

      const rowButton = getByRole('button');
      fireEvent.keyDown(rowButton, { key: 'Enter' });
      expect(onNavigate).toHaveBeenCalledWith('opportunity', 'record1');
    });

    it('should fire onNavigate when Space is pressed', () => {
      const onNavigate = jest.fn();
      const bpfInstance = createMockBPFInstance(
        'process1',
        'Sales Process',
        'opportunitysalesprocess',
        mockStages.slice(0, 2),
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
          onNavigate={onNavigate}
        />
      );

      const rowButton = getByRole('button');
      fireEvent.keyDown(rowButton, { key: ' ' });
      expect(onNavigate).toHaveBeenCalledWith('opportunity', 'record1');
    });

    it('should not navigate when navigation is disabled', () => {
      const onNavigate = jest.fn();
      const bpfInstance = createMockBPFInstance(
        'process1',
        'Sales Process',
        'opportunitysalesprocess',
        mockStages.slice(0, 2),
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
          onNavigate={onNavigate}
        />
      );

      // Should not have a button role when navigation is disabled
      const buttons = container.querySelectorAll('[role="button"]');
      expect(buttons.length).toBe(0);

      // Should have article role instead
      const articles = container.querySelectorAll('[role="article"]');
      expect(articles.length).toBe(1);
    });
  });

  describe('ARIA Labels and Roles', () => {
    it('should have proper ARIA labels for screen readers', () => {
      const bpfInstance = createMockBPFInstance(
        'process1',
        'Sales Process',
        'opportunitysalesprocess',
        mockStages.slice(0, 2),
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

      const rowElement = getByRole('button');
      expect(rowElement).toHaveAttribute('aria-label');
      expect(rowElement.getAttribute('aria-label')).toContain('Test Opportunity');
    });

    it('should mark exactly one stage with aria-current="step"', () => {
      const { container } = renderWithFluent(
        <ChevronDesign {...defaultDesignProps} />
      );

      const currentSteps = container.querySelectorAll('[aria-current="step"]');
      expect(currentSteps.length).toBe(1);
    });

    it('should include stage name and status in aria-labels', () => {
      const { container } = renderWithFluent(
        <CircleDesign {...defaultDesignProps} />
      );

      const stageElements = container.querySelectorAll('[role="img"]');
      // Filter to the ones that have direct aria-label (the circle markers, not StageIcon inner)
      const withAriaLabel = Array.from(stageElements).filter(el => el.getAttribute('aria-label'));
      expect(withAriaLabel.length).toBeGreaterThanOrEqual(3);

      // Active stage should have status info
      const activeElement = container.querySelector('[aria-current="step"]');
      expect(activeElement).toBeTruthy();
      const ariaLabel = activeElement!.getAttribute('aria-label') || '';
      expect(ariaLabel).toContain('Develop');
      expect(ariaLabel).toContain('active');
    });

    it('should preserve aria-labels when labels are hidden on mobile (CircleDesign)', () => {
      const { container } = renderWithFluent(
        <CircleDesign {...defaultDesignProps} isMobile={true} />
      );

      // Labels are hidden on mobile but aria-labels on markers should still be present
      const stageElements = container.querySelectorAll('[role="img"][aria-label]');
      expect(stageElements.length).toBeGreaterThanOrEqual(3);

      // Verify aria-label contains stage name even though visual label is hidden
      const ariaLabels = Array.from(stageElements).map(el => el.getAttribute('aria-label'));
      expect(ariaLabels.some(label => label?.includes('Qualify'))).toBe(true);
      expect(ariaLabels.some(label => label?.includes('Develop'))).toBe(true);
      expect(ariaLabels.some(label => label?.includes('Propose'))).toBe(true);
    });

    it('should preserve aria-labels when labels are hidden on mobile (GradientDesign)', () => {
      const { container } = renderWithFluent(
        <GradientDesign {...defaultDesignProps} isMobile={true} />
      );

      const stageElements = container.querySelectorAll('[role="img"][aria-label]');
      expect(stageElements.length).toBeGreaterThanOrEqual(3);

      const ariaLabels = Array.from(stageElements).map(el => el.getAttribute('aria-label'));
      expect(ariaLabels.some(label => label?.includes('Qualify'))).toBe(true);
      expect(ariaLabels.some(label => label?.includes('Develop'))).toBe(true);
      expect(ariaLabels.some(label => label?.includes('Propose'))).toBe(true);
    });

    it('should have progressbar role with proper attributes (ChevronDesign)', () => {
      const { container } = renderWithFluent(
        <ChevronDesign {...defaultDesignProps} />
      );

      const progressbar = container.querySelector('[role="progressbar"]');
      expect(progressbar).toBeTruthy();
      expect(progressbar!.getAttribute('aria-valuemin')).toBe('0');
      expect(progressbar!.getAttribute('aria-valuemax')).toBe('3');
      expect(progressbar!.getAttribute('aria-label')).toContain('Business process flow');
    });

    it('should have progressbar role with proper attributes (FractionDesign)', () => {
      const { container } = renderWithFluent(
        <FractionDesign {...defaultDesignProps} />
      );

      const progressbar = container.querySelector('[role="progressbar"]');
      expect(progressbar).toBeTruthy();
      expect(progressbar!.getAttribute('aria-valuemin')).toBe('0');
      expect(progressbar!.getAttribute('aria-valuemax')).toBe('3');
      expect(progressbar!.getAttribute('aria-label')).toContain('Business process flow');
    });
  });
});
