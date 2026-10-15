import { describe, it, expect } from 'vitest';
import { createTagSchema } from '../src/validators/tag.validator';

describe('Tag Validator Unit Tests', () => {
  it('should accept valid tag payload with custom color', () => {
    const { error, value } = createTagSchema.validate({
      name: 'Customer',
      color: '#10B981',
    });

    expect(error).toBeUndefined();
    expect(value.name).toBe('Customer');
    expect(value.color).toBe('#10B981');
  });

  it('should default color to #3B82F6 if not provided', () => {
    const { error, value } = createTagSchema.validate({
      name: 'Prospect',
    });

    expect(error).toBeUndefined();
    expect(value.name).toBe('Prospect');
    expect(value.color).toBe('#3B82F6');
  });

  it('should reject missing tag name', () => {
    const { error } = createTagSchema.validate({
      color: '#10B981',
    });

    expect(error).toBeDefined();
    expect(error?.details[0].message).toContain('Tag name is required');
  });

  it('should reject empty or whitespace-only name', () => {
    const { error } = createTagSchema.validate({
      name: '   ',
    });

    expect(error).toBeDefined();
    expect(error?.details[0].message).toContain('Tag name cannot be empty');
  });

  it('should reject invalid hex color format', () => {
    const { error } = createTagSchema.validate({
      name: 'VIP',
      color: 'blue',
    });

    expect(error).toBeDefined();
    expect(error?.details[0].message).toContain('valid hex color code');
  });
});
