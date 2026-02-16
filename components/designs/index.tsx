/**
 * BPF Design Components - Main Export
 *
 * This file exports all 8 visual styles for displaying BPF stages.
 * Each design is now in its own file for better organization and maintainability.
 *
 * All designs use the shared useBPFDesignHelpers hook to:
 * - Eliminate code duplication (~200 lines saved)
 * - Centralize business logic
 * - Improve performance with memoization
 * - Ensure consistency across designs
 *
 * Lazy loading with React.lazy improves initial load performance by loading
 * design components only when needed.
 */

import * as React from 'react';
import type { IBPFDesignProps } from '../../types';

// Lazy load design components for better performance
const ChevronDesign = React.lazy(() => import('./ChevronDesign').then(m => ({ default: m.ChevronDesign })));
const CircleDesign = React.lazy(() => import('./CircleDesign').then(m => ({ default: m.CircleDesign })));
const PillDesign = React.lazy(() => import('./PillDesign').then(m => ({ default: m.PillDesign })));
const SegmentedBarDesign = React.lazy(() => import('./SegmentedBarDesign').then(m => ({ default: m.SegmentedBarDesign })));
const StepperDesign = React.lazy(() => import('./StepperDesign').then(m => ({ default: m.StepperDesign })));
const GradientDesign = React.lazy(() => import('./GradientDesign').then(m => ({ default: m.GradientDesign })));
const LineDesign = React.lazy(() => import('./LineDesign').then(m => ({ default: m.LineDesign })));
const FractionDesign = React.lazy(() => import('./FractionDesign').then(m => ({ default: m.FractionDesign })));

// Export all design components (lazy loaded)
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

/**
 * Get design component by style name
 *
 * @param designStyle - Name of the design style
 * @returns React lazy component for the specified design
 */
export function getDesignComponent(designStyle: string): React.LazyExoticComponent<React.FC<IBPFDesignProps>> {
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
      // Default to Chevron if unknown style
      return ChevronDesign;
  }
}
