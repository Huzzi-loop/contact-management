import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../hooks/useDebounce';

describe('useDebounce hook', () => {
  it('returns initial value immediately and debounces updates', () => {
    vi.useFakeTimers();

    const { result, rerender } = renderHook(({ val }) => useDebounce(val, 300), {
      initialProps: { val: 'initial' },
    });

    expect(result.current).toBe('initial');

    rerender({ val: 'updated' });
    // Still initial before timer completes
    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('updated');
    vi.useRealTimers();
  });
});
