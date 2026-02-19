/**
 * Tests for design factory (designs/index.tsx)
 */

import {
  getDesignComponent,
  ChevronDesign,
  CircleDesign,
  PillDesign,
  SegmentedBarDesign,
  StepperDesign,
  GradientDesign,
  LineDesign,
  FractionDesign,
} from '../../../components/designs';

describe('getDesignComponent', () => {
  it('returns ChevronDesign for "chevron"', () => {
    const component = getDesignComponent('chevron');
    expect(component).toBe(ChevronDesign);
  });

  it('returns CircleDesign for "circles"', () => {
    const component = getDesignComponent('circles');
    expect(component).toBe(CircleDesign);
  });

  it('returns PillDesign for "pills"', () => {
    const component = getDesignComponent('pills');
    expect(component).toBe(PillDesign);
  });

  it('returns SegmentedBarDesign for "segmented"', () => {
    const component = getDesignComponent('segmented');
    expect(component).toBe(SegmentedBarDesign);
  });

  it('returns StepperDesign for "stepper"', () => {
    const component = getDesignComponent('stepper');
    expect(component).toBe(StepperDesign);
  });

  it('returns GradientDesign for "gradient"', () => {
    const component = getDesignComponent('gradient');
    expect(component).toBe(GradientDesign);
  });

  it('returns LineDesign for "line"', () => {
    const component = getDesignComponent('line');
    expect(component).toBe(LineDesign);
  });

  it('returns LineDesign for "line + markers"', () => {
    const component = getDesignComponent('line + markers');
    expect(component).toBe(LineDesign);
  });

  it('returns FractionDesign for "fraction"', () => {
    const component = getDesignComponent('fraction');
    expect(component).toBe(FractionDesign);
  });

  it('defaults to ChevronDesign for unknown style', () => {
    const component = getDesignComponent('unknown');
    expect(component).toBe(ChevronDesign);
  });

  it('handles case-insensitive input', () => {
    const component = getDesignComponent('CHEVRON');
    expect(component).toBe(ChevronDesign);
  });

  it('handles whitespace in input', () => {
    const component = getDesignComponent('  chevron  ');
    expect(component).toBe(ChevronDesign);
  });
});
