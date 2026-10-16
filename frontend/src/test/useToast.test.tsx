import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ToastProvider, useToast } from '../hooks/useToast';

const TestComponent = () => {
  const { showToast } = useToast();
  return (
    <button onClick={() => showToast('Operation completed successfully', 'success')}>
      Trigger Toast
    </button>
  );
};

describe('useToast hook and ToastProvider', () => {
  it('displays toast message when triggered', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const btn = screen.getByRole('button', { name: /trigger toast/i });
    act(() => {
      fireEvent.click(btn);
    });

    expect(screen.getByText('Operation completed successfully')).toBeInTheDocument();
  });
});
