import { describe, it, expect } from 'vitest';
import { parseApiError } from '../utils/errorHandler';

describe('parseApiError utility', () => {
  it('correctly classifies a 409 OCC Conflict error', () => {
    const error = {
      statusCode: 409,
      customMessage: 'The contact was modified by another user.',
      details: {
        currentVersion: 2,
        submittedVersion: 1,
      },
    };

    const parsed = parseApiError(error);
    expect(parsed.isConflict).toBe(true);
    expect(parsed.statusCode).toBe(409);
    expect(parsed.message).toBe('The contact was modified by another user.');
    expect(parsed.conflictDetails?.currentVersion).toBe(2);
  });

  it('correctly classifies a 400 Validation error', () => {
    const error = {
      statusCode: 400,
      customMessage: 'First name is required',
    };

    const parsed = parseApiError(error);
    expect(parsed.isValidationError).toBe(true);
    expect(parsed.isConflict).toBe(false);
    expect(parsed.message).toBe('First name is required');
  });

  it('falls back to default message if error is unknown', () => {
    const parsed = parseApiError({});
    expect(parsed.message).toBe('An unexpected error occurred');
  });
});
