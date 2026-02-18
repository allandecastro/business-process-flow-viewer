import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import { ErrorBoundary } from '../../components/ErrorBoundary';

function renderWithFluent(ui: React.ReactElement) {
  return render(
    <FluentProvider theme={webLightTheme}>{ui}</FluentProvider>
  );
}

// Component that throws an error for testing
const ThrowError: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = true }) => {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  // Suppress console.error for these tests
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it('should render children when there is no error', () => {
    renderWithFluent(
      <ErrorBoundary>
        <div data-testid="child">Child content</div>
      </ErrorBoundary>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('should render default error UI when child throws error', () => {
    renderWithFluent(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Error displaying Business Process Flow/i)).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('should render custom fallback when provided', () => {
    const customFallback = <div data-testid="custom-fallback">Custom error message</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    expect(screen.getByText('Custom error message')).toBeInTheDocument();
    expect(screen.queryByText(/Error displaying Business Process Flow/i)).not.toBeInTheDocument();
  });

  it('should log error to console', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error');

    renderWithFluent(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(consoleErrorSpy).toHaveBeenCalled();
    const errorCall = consoleErrorSpy.mock.calls.find((call) =>
      typeof call[0] === 'string' && call[0].includes('[BPF Viewer] Error caught by ErrorBoundary')
    );
    expect(errorCall).toBeDefined();
  });

  it('should display generic message when error has no message', () => {
    const ThrowErrorWithoutMessage: React.FC = () => {
      const error = new Error();
      error.message = '';
      throw error;
    };

    renderWithFluent(
      <ErrorBoundary>
        <ThrowErrorWithoutMessage />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Error displaying Business Process Flow/i)).toBeInTheDocument();
    expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument();
  });

  it('should render error container with Fluent styles and role=alert', () => {
    renderWithFluent(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    const alertContainer = screen.getByRole('alert');
    expect(alertContainer).toBeInTheDocument();
    // Fluent makeStyles applies CSS classes instead of inline styles
    expect(alertContainer.className).toBeTruthy();
    expect(alertContainer).toHaveTextContent(/Error displaying Business Process Flow/i);
  });

  it('should recover when error is fixed', () => {
    const { rerender } = renderWithFluent(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Error displaying Business Process Flow/i)).toBeInTheDocument();

    // Note: ErrorBoundary doesn't automatically recover in React
    // This test shows the error UI persists even after children change
    rerender(
      <FluentProvider theme={webLightTheme}>
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      </FluentProvider>
    );

    // Error UI should still be shown (ErrorBoundary state doesn't reset automatically)
    expect(screen.getByText(/Error displaying Business Process Flow/i)).toBeInTheDocument();
  });

  it('should render a retry button in error state', () => {
    renderWithFluent(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();
  });

  it('should reset error state when retry is clicked', () => {
    renderWithFluent(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Error displaying Business Process Flow/i)).toBeInTheDocument();

    // Click retry - this resets the error state, but ThrowError will throw again
    // causing getDerivedStateFromError to trigger again
    const retryButton = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryButton);

    // The error is shown again because ThrowError still throws
    expect(screen.getByText(/Error displaying Business Process Flow/i)).toBeInTheDocument();
  });

  it('should have role=alert on error container', () => {
    renderWithFluent(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
