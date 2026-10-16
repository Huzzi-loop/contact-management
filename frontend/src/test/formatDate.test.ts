import { describe, it, expect } from 'vitest';
import { formatDateTime, formatDateOnly, formatRelativeTime } from '../utils/formatDate';

describe('formatDate utilities', () => {
  it('formats dates safely when null or empty', () => {
    expect(formatDateTime(null)).toBe('—');
    expect(formatDateOnly(undefined)).toBe('—');
    expect(formatRelativeTime('')).toBe('—');
  });

  it('formats full date and time properly', () => {
    const iso = '2026-10-15T12:30:00.000Z';
    const formatted = formatDateTime(iso);
    expect(formatted).toContain('2026');
    expect(formatted).toContain('Oct');
  });

  it('formats date only properly', () => {
    const iso = '2026-10-15T12:30:00.000Z';
    const formatted = formatDateOnly(iso);
    expect(formatted).toContain('Oct');
    expect(formatted).toContain('2026');
  });
});
