import { describe, it, expect } from 'vitest';
import { createContactSchema } from '../src/modules/contact/contact.validator';

describe('Contact Validator Unit Tests - Create Contact', () => {
  it('should accept valid contact with all fields', () => {
    const { error, value } = createContactSchema.validate({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@example.com',
      phone: '+1 555-0123',
      company: 'Acme Corp',
      tagIds: ['123e4567-e89b-12d3-a456-426614174000'],
    });

    expect(error).toBeUndefined();
    expect(value.firstName).toBe('Jane');
    expect(value.lastName).toBe('Doe');
    expect(value.email).toBe('jane.doe@example.com');
  });

  it('should accept minimal contact with only required first and last name', () => {
    const { error, value } = createContactSchema.validate({
      firstName: 'John',
      lastName: 'Smith',
    });

    expect(error).toBeUndefined();
    expect(value.firstName).toBe('John');
    expect(value.lastName).toBe('Smith');
    expect(value.tagIds).toEqual([]);
  });

  it('should reject missing firstName', () => {
    const { error } = createContactSchema.validate({
      lastName: 'Smith',
    });

    expect(error).toBeDefined();
    expect(error?.details[0].message).toContain('First name is required');
  });

  it('should reject empty lastName', () => {
    const { error } = createContactSchema.validate({
      firstName: 'John',
      lastName: '   ',
    });

    expect(error).toBeDefined();
    expect(error?.details[0].message).toContain('Last name cannot be empty');
  });

  it('should reject invalid email format', () => {
    const { error } = createContactSchema.validate({
      firstName: 'John',
      lastName: 'Doe',
      email: 'not-an-email',
    });

    expect(error).toBeDefined();
    expect(error?.details[0].message).toContain('valid email address');
  });

  it('should reject non-UUID tagIds', () => {
    const { error } = createContactSchema.validate({
      firstName: 'John',
      lastName: 'Doe',
      tagIds: ['not-a-valid-uuid'],
    });

    expect(error).toBeDefined();
    expect(error?.details[0].message).toContain('Each tagId must be a valid UUID');
  });
});
