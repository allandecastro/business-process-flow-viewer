/**
 * Tests for components/index.ts barrel exports
 */

import { BPFViewer, BPFRow, ErrorBoundary, getDesignComponent } from '../../components';

describe('components/index.ts exports', () => {
  it('exports BPFViewer', () => {
    expect(BPFViewer).toBeDefined();
  });

  it('exports BPFRow', () => {
    expect(BPFRow).toBeDefined();
  });

  it('exports ErrorBoundary', () => {
    expect(ErrorBoundary).toBeDefined();
  });

  it('exports getDesignComponent', () => {
    expect(getDesignComponent).toBeDefined();
    expect(typeof getDesignComponent).toBe('function');
  });
});
