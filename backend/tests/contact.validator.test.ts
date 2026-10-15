import { describe, it, expect } from 'vitest';
import { createContactSchema, updateContactSchema } from '../src/modules/contact/contact.validator';

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

describe('Contact Validator Unit Tests - Update Contact', () => {
  it('should accept valid update payload with version and fields', () => {
    const { error, value } = updateContactSchema.validate({
      version: 1,
      firstName: 'UpdatedFirst',
      company: 'NewCo',
    });

    expect(error).toBeUndefined();
    expect(value.version).toBe(1);
    expect(value.firstName).toBe('UpdatedFirst');
    expect(value.company).toBe('NewCo');
  });

  it('should reject payload missing version', () => {
    const { error } = updateContactSchema.validate({
      firstName: 'UpdatedFirst',
    });

    expect(error).toBeDefined();
    expect(error?.details[0].message).toContain('Version number is required');
  });

  it('should reject version less than 1', () => {
    const { error } = updateContactSchema.validate({
      version: 0,
      firstName: 'UpdatedFirst',
    });

    expect(error).toBeDefined();
    expect(error?.details[0].message).toContain('Version must be at least 1');
  });

  it('should reject payload with only version and no update fields', () => {
    const { error } = updateContactSchema.validate({
      version: 2,
    });

    expect(error).toBeDefined();
    expect(error?.details[0].message).toContain('At least one field must be provided to update');
  });

  it('should reject empty firstName string in update', () => {
    const { error } = updateContactSchema.validate({
      version: 1,
      firstName: '   ',
    });

    expect(error).toBeDefined();
    expect(error?.details[0].message).toContain('First name cannot be empty');
  });
});
