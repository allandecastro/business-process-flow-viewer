/**
 * Tests for all BPF Design Components
 *
 * Tests Circle, Pill, SegmentedBar, Stepper, Gradient, Line, and Fraction designs.
 * ChevronDesign is already covered via accessibility tests.
 */

import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import { createMockBPFStage, createMockStageColors } from '../../setup/testUtils';
import { CircleDesign } from '../../../components/designs/CircleDesign';
import { PillDesign } from '../../../components/designs/PillDesign';
import { SegmentedBarDesign } from '../../../components/designs/SegmentedBarDesign';
import { StepperDesign } from '../../../components/designs/StepperDesign';
import { GradientDesign } from '../../../components/designs/GradientDesign';
import { LineDesign } from '../../../components/designs/LineDesign';
import { FractionDesign } from '../../../components/designs/FractionDesign';
import type { IBPFDesignProps } from '../../../types';

function renderWithFluent(ui: React.ReactElement) {
  return render(
    <FluentProvider theme={webLightTheme}>{ui}</FluentProvider>
  );
}

const defaultStages = [
  createMockBPFStage('stage1', 'Qualify', 'Qualify', 0, 0, true, false),
  createMockBPFStage('stage2', 'Develop', 'Develop', 1, 1, false, true),
  createMockBPFStage('stage3', 'Propose', 'Propose', 2, 2, false, false),
];

const defaultColors = createMockStageColors();

const defaultProps: IBPFDesignProps = {
  stages: defaultStages,
  displayMode: 'stage',
  colors: defaultColors,
  showPulse: true,
  isMobile: false,
};

describe('CircleDesign', () => {
  it('renders all stages', () => {
    const { container } = renderWithFluent(<CircleDesign {...defaultProps} />);
    // Each stage has a wrapper with role="img" and StageIcon may also have role="img"
    const stageElements = container.querySelectorAll('[role="img"]');
    expect(stageElements.length).toBeGreaterThanOrEqual(3);
  });

  it('renders stage labels on desktop', () => {
    renderWithFluent(<CircleDesign {...defaultProps} />);
    expect(screen.getByText('Qualify')).toBeTruthy();
    expect(screen.getByText('Develop')).toBeTruthy();
    expect(screen.getByText('Propose')).toBeTruthy();
  });

  it('hides labels on mobile', () => {
    renderWithFluent(<CircleDesign {...defaultProps} isMobile={true} />);
    expect(screen.queryByText('Qualify')).toBeNull();
  });

  it('renders connectors between stages', () => {
    const { container } = renderWithFluent(<CircleDesign {...defaultProps} />);
    const connectors = container.querySelectorAll('[role="presentation"]');
    expect(connectors.length).toBe(2); // N-1 connectors
  });

  it('sets aria-current on active stage', () => {
    const { container } = renderWithFluent(<CircleDesign {...defaultProps} />);
    const currentStep = container.querySelectorAll('[aria-current="step"]');
    expect(currentStep.length).toBe(1);
  });

  it('renders in category mode', () => {
    renderWithFluent(<CircleDesign {...defaultProps} displayMode="category" />);
    // In category mode it should use stageCategoryName
    expect(screen.getByText('Qualify')).toBeTruthy();
    expect(screen.getByText('Develop')).toBeTruthy();
  });
});

describe('PillDesign', () => {
  it('renders all stages as pills', () => {
    const { container } = renderWithFluent(<PillDesign {...defaultProps} />);
    const pills = container.querySelectorAll('[role="img"]');
    expect(pills.length).toBe(3);
  });

  it('renders stage labels', () => {
    renderWithFluent(<PillDesign {...defaultProps} />);
    expect(screen.getByText('Qualify')).toBeTruthy();
    expect(screen.getByText('Develop')).toBeTruthy();
    expect(screen.getByText('Propose')).toBeTruthy();
  });

  it('sets aria-current on active stage', () => {
    const { container } = renderWithFluent(<PillDesign {...defaultProps} />);
    const currentStep = container.querySelectorAll('[aria-current="step"]');
    expect(currentStep.length).toBe(1);
  });

  it('renders in mobile mode', () => {
    const { container } = renderWithFluent(<PillDesign {...defaultProps} isMobile={true} />);
    const pills = container.querySelectorAll('[role="img"]');
    expect(pills.length).toBe(3);
  });
});

describe('SegmentedBarDesign', () => {
  it('renders all segments', () => {
    const { container } = renderWithFluent(<SegmentedBarDesign {...defaultProps} />);
    const segments = container.querySelectorAll('[role="img"]');
    expect(segments.length).toBe(3);
  });

  it('renders labels inside segments', () => {
    renderWithFluent(<SegmentedBarDesign {...defaultProps} />);
    expect(screen.getByText('Qualify')).toBeTruthy();
    expect(screen.getByText('Develop')).toBeTruthy();
  });

  it('renders in mobile mode', () => {
    const { container } = renderWithFluent(<SegmentedBarDesign {...defaultProps} isMobile={true} />);
    const segments = container.querySelectorAll('[role="img"]');
    expect(segments.length).toBe(3);
  });

  it('sets aria-current on active segment', () => {
    const { container } = renderWithFluent(<SegmentedBarDesign {...defaultProps} />);
    const currentStep = container.querySelectorAll('[aria-current="step"]');
    expect(currentStep.length).toBe(1);
  });
});

describe('StepperDesign', () => {
  it('renders all steps', () => {
    const { container } = renderWithFluent(<StepperDesign {...defaultProps} />);
    const steps = container.querySelectorAll('[role="img"]');
    // Each step has its own role="img" plus StageIcon may have role="img" too
    expect(steps.length).toBeGreaterThanOrEqual(3);
  });

  it('renders labels below steps', () => {
    renderWithFluent(<StepperDesign {...defaultProps} />);
    expect(screen.getByText('Qualify')).toBeTruthy();
    expect(screen.getByText('Develop')).toBeTruthy();
    expect(screen.getByText('Propose')).toBeTruthy();
  });

  it('renders connectors between steps', () => {
    const { container } = renderWithFluent(<StepperDesign {...defaultProps} />);
    const connectors = container.querySelectorAll('[role="presentation"]');
    expect(connectors.length).toBe(2);
  });

  it('renders in mobile mode', () => {
    const { container } = renderWithFluent(<StepperDesign {...defaultProps} isMobile={true} />);
    const steps = container.querySelectorAll('[role="img"]');
    expect(steps.length).toBeGreaterThanOrEqual(3);
  });
});

describe('GradientDesign', () => {
  it('renders markers for all stages', () => {
    const { container } = renderWithFluent(<GradientDesign {...defaultProps} />);
    const markers = container.querySelectorAll('[role="img"]');
    expect(markers.length).toBeGreaterThanOrEqual(3);
  });

  it('renders progress bar', () => {
    const { container } = renderWithFluent(<GradientDesign {...defaultProps} />);
    const progressBar = container.querySelectorAll('[role="presentation"]');
    expect(progressBar.length).toBeGreaterThanOrEqual(1);
  });

  it('renders labels on desktop', () => {
    renderWithFluent(<GradientDesign {...defaultProps} />);
    expect(screen.getByText('Qualify')).toBeTruthy();
    expect(screen.getByText('Develop')).toBeTruthy();
  });

  it('hides labels on mobile', () => {
    renderWithFluent(<GradientDesign {...defaultProps} isMobile={true} />);
    expect(screen.queryByText('Qualify')).toBeNull();
  });

  it('handles all completed stages', () => {
    const allCompletedStages = [
      createMockBPFStage('stage1', 'Qualify', 'Qualify', 0, 0, true, false),
      createMockBPFStage('stage2', 'Develop', 'Develop', 1, 1, true, false),
      createMockBPFStage('stage3', 'Propose', 'Propose', 2, 2, true, false),
    ];
    const { container } = renderWithFluent(
      <GradientDesign {...defaultProps} stages={allCompletedStages} />
    );
    expect(container.querySelector('[role="presentation"]')).toBeTruthy();
  });

  it('handles empty stages', () => {
    const { container } = renderWithFluent(
      <GradientDesign {...defaultProps} stages={[]} />
    );
    expect(container).toBeTruthy();
  });
});

describe('LineDesign', () => {
  it('renders markers for all stages', () => {
    const { container } = renderWithFluent(<LineDesign {...defaultProps} />);
    const markers = container.querySelectorAll('[role="img"]');
    expect(markers.length).toBeGreaterThanOrEqual(3);
  });

  it('renders progress line', () => {
    const { container } = renderWithFluent(<LineDesign {...defaultProps} />);
    const progressLines = container.querySelectorAll('[role="presentation"]');
    expect(progressLines.length).toBeGreaterThanOrEqual(1);
  });

  it('renders labels for all stages', () => {
    renderWithFluent(<LineDesign {...defaultProps} />);
    expect(screen.getByText('Qualify')).toBeTruthy();
    expect(screen.getByText('Develop')).toBeTruthy();
    expect(screen.getByText('Propose')).toBeTruthy();
  });

  it('renders in mobile mode', () => {
    const { container } = renderWithFluent(<LineDesign {...defaultProps} isMobile={true} />);
    const markers = container.querySelectorAll('[role="img"]');
    expect(markers.length).toBeGreaterThanOrEqual(3);
  });

  it('handles active stage on first position', () => {
    const stagesFirstActive = [
      createMockBPFStage('stage1', 'Qualify', 'Qualify', 0, 0, false, true),
      createMockBPFStage('stage2', 'Develop', 'Develop', 1, 1, false, false),
    ];
    const { container } = renderWithFluent(
      <LineDesign {...defaultProps} stages={stagesFirstActive} />
    );
    expect(container.querySelector('[aria-current="step"]')).toBeTruthy();
  });

  it('handles all completed (no active) stages', () => {
    const allDone = [
      createMockBPFStage('stage1', 'Qualify', 'Qualify', 0, 0, true, false),
      createMockBPFStage('stage2', 'Develop', 'Develop', 1, 1, true, false),
    ];
    const { container } = renderWithFluent(
      <LineDesign {...defaultProps} stages={allDone} />
    );
    expect(container).toBeTruthy();
  });
});

describe('FractionDesign', () => {
  it('renders fraction text', () => {
    renderWithFluent(<FractionDesign {...defaultProps} />);
    // Should show current step number and total
    expect(screen.getByText('/3')).toBeTruthy();
  });

  it('renders current stage name', () => {
    renderWithFluent(<FractionDesign {...defaultProps} />);
    expect(screen.getByText('Develop')).toBeTruthy();
  });

  it('renders progressbar role', () => {
    const { container } = renderWithFluent(<FractionDesign {...defaultProps} />);
    const progressbar = container.querySelector('[role="progressbar"]');
    expect(progressbar).toBeTruthy();
    expect(progressbar?.getAttribute('aria-valuemin')).toBe('0');
    expect(progressbar?.getAttribute('aria-valuemax')).toBe('3');
  });

  it('renders in category display mode', () => {
    renderWithFluent(<FractionDesign {...defaultProps} displayMode="category" />);
    // Should still render with category names
    expect(screen.getByText('Develop')).toBeTruthy();
  });

  it('handles all completed stages (no active)', () => {
    const allDone = [
      createMockBPFStage('stage1', 'Qualify', 'Qualify', 0, 0, true, false),
      createMockBPFStage('stage2', 'Develop', 'Develop', 1, 1, true, false),
      createMockBPFStage('stage3', 'Close', 'Close', 2, 2, true, false),
    ];
    renderWithFluent(<FractionDesign {...defaultProps} stages={allDone} />);
    expect(screen.getByText('/3')).toBeTruthy();
  });
});
