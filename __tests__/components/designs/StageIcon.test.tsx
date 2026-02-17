/**
 * Tests for StageIcon shared component
 */

import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { StageIcon } from '../../../components/designs/shared/StageIcon';

describe('StageIcon', () => {
  describe('completed status', () => {
    it('renders a checkmark icon for completed stages', () => {
      const { container } = render(<StageIcon status="completed" stageNumber={1} />);
      const icon = container.querySelector('[aria-label="Stage 1 - Completed"]');
      expect(icon).toBeTruthy();
    });

    it('renders checkmark with small size', () => {
      const { container } = render(<StageIcon status="completed" stageNumber={2} size="small" />);
      expect(container.querySelector('[aria-label="Stage 2 - Completed"]')).toBeTruthy();
    });

    it('renders checkmark with large size', () => {
      const { container } = render(<StageIcon status="completed" stageNumber={3} size="large" />);
      expect(container.querySelector('[aria-label="Stage 3 - Completed"]')).toBeTruthy();
    });
  });

  describe('active status', () => {
    it('renders stage number for active stages when showNumber is true', () => {
      render(<StageIcon status="active" stageNumber={2} showNumber={true} />);
      expect(screen.getByText('2')).toBeTruthy();
    });

    it('renders correct aria-label for active stages', () => {
      const { container } = render(<StageIcon status="active" stageNumber={2} />);
      expect(container.querySelector('[aria-label="Active - Stage 2"]')).toBeTruthy();
    });

    it('returns null when showNumber is false', () => {
      const { container } = render(<StageIcon status="active" stageNumber={2} showNumber={false} />);
      expect(container.innerHTML).toBe('');
    });
  });

  describe('inactive status', () => {
    it('renders stage number for inactive stages', () => {
      render(<StageIcon status="inactive" stageNumber={3} />);
      expect(screen.getByText('3')).toBeTruthy();
    });

    it('renders correct aria-label for inactive stages', () => {
      const { container } = render(<StageIcon status="inactive" stageNumber={3} />);
      expect(container.querySelector('[aria-label="Stage 3"]')).toBeTruthy();
    });

    it('returns null when showNumber is false', () => {
      const { container } = render(<StageIcon status="inactive" stageNumber={3} showNumber={false} />);
      expect(container.innerHTML).toBe('');
    });
  });

  describe('default props', () => {
    it('defaults to medium size', () => {
      const { container } = render(<StageIcon status="completed" stageNumber={1} />);
      expect(container.querySelector('[aria-label="Stage 1 - Completed"]')).toBeTruthy();
    });

    it('defaults to showNumber true', () => {
      render(<StageIcon status="active" stageNumber={1} />);
      expect(screen.getByText('1')).toBeTruthy();
    });
  });
});
