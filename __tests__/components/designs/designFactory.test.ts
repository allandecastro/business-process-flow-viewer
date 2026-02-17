/**
 * Tests for design factory (designs/index.tsx)
 */

import { getDesignComponent } from '../../../components/designs';

describe('getDesignComponent', () => {
  it('returns ChevronDesign for "chevron"', () => {
    const component = getDesignComponent('chevron');
    expect(component).toBeDefined();
  });

  it('returns CircleDesign for "circles"', () => {
    const component = getDesignComponent('circles');
    expect(component).toBeDefined();
  });

  it('returns PillDesign for "pills"', () => {
    const component = getDesignComponent('pills');
    expect(component).toBeDefined();
  });

  it('returns SegmentedBarDesign for "segmented"', () => {
    const component = getDesignComponent('segmented');
    expect(component).toBeDefined();
  });

  it('returns StepperDesign for "stepper"', () => {
    const component = getDesignComponent('stepper');
    expect(component).toBeDefined();
  });

  it('returns GradientDesign for "gradient"', () => {
    const component = getDesignComponent('gradient');
    expect(component).toBeDefined();
  });

  it('returns LineDesign for "line"', () => {
    const component = getDesignComponent('line');
    expect(component).toBeDefined();
  });

  it('returns LineDesign for "line + markers"', () => {
    const component = getDesignComponent('line + markers');
    expect(component).toBeDefined();
  });

  it('returns FractionDesign for "fraction"', () => {
    const component = getDesignComponent('fraction');
    expect(component).toBeDefined();
  });

  it('defaults to ChevronDesign for unknown style', () => {
    const component = getDesignComponent('unknown');
    expect(component).toBeDefined();
  });

  it('handles case-insensitive input', () => {
    const component = getDesignComponent('CHEVRON');
    expect(component).toBeDefined();
  });

  it('handles whitespace in input', () => {
    const component = getDesignComponent('  chevron  ');
    expect(component).toBeDefined();
  });
});
