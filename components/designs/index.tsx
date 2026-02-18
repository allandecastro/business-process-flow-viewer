/**
 * BPF Design Components - Main Export
 *
 * This file exports all 8 visual styles for displaying BPF stages.
 * Each design is now in its own file for better organization and maintainability.
 *
 * ChevronDesign is imported eagerly (static import) since it's the default
 * design style. The remaining 7 designs are lazy-loaded on demand.
 */

import * as React from 'react';
import type { IBPFDesignProps } from '../../types';
import { ChevronDesign } from './ChevronDesign';

// Lazy load non-default design components
const CircleDesign = React.lazy(() => import('./CircleDesign').then(m => ({ default: m.CircleDesign })));
const PillDesign = React.lazy(() => import('./PillDesign').then(m => ({ default: m.PillDesign })));
const SegmentedBarDesign = React.lazy(() => import('./SegmentedBarDesign').then(m => ({ default: m.SegmentedBarDesign })));
const StepperDesign = React.lazy(() => import('./StepperDesign').then(m => ({ default: m.StepperDesign })));
const GradientDesign = React.lazy(() => import('./GradientDesign').then(m => ({ default: m.GradientDesign })));
const LineDesign = React.lazy(() => import('./LineDesign').then(m => ({ default: m.LineDesign })));
const FractionDesign = React.lazy(() => import('./FractionDesign').then(m => ({ default: m.FractionDesign })));

export {
  ChevronDesign,
  CircleDesign,
  PillDesign,
  SegmentedBarDesign,
  StepperDesign,
  GradientDesign,
  LineDesign,
  FractionDesign,
};

/** Return type for getDesignComponent — covers both eager and lazy components */
type DesignComponentType = React.FC<IBPFDesignProps> | React.LazyExoticComponent<React.FC<IBPFDesignProps>>;

/**
 * Get design component by style name.
 * Returns ChevronDesign (eagerly loaded) for the default case.
 */
export function getDesignComponent(designStyle: string): DesignComponentType {
  const normalizedStyle = designStyle.toLowerCase().trim();

  switch (normalizedStyle) {
    case 'chevron':
      return ChevronDesign;
    case 'circles':
      return CircleDesign;
    case 'pills':
      return PillDesign;
    case 'segmented':
      return SegmentedBarDesign;
    case 'stepper':
      return StepperDesign;
    case 'gradient':
      return GradientDesign;
    case 'line':
    case 'line + markers':
      return LineDesign;
    case 'fraction':
      return FractionDesign;
    default:
      return ChevronDesign;
  }
}
