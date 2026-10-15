import { describe, it, expect } from 'vitest';
import {
  createContactSchema,
  updateContactSchema,
  getContactsQuerySchema,
  searchContactsQuerySchema,
} from '../src/modules/contact/contact.validator';

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

describe('Contact Validator Unit Tests - Get/Search Contacts Query', () => {
  it('should accept valid search query with default sortBy and sortOrder', () => {
    const { error, value } = getContactsQuerySchema.validate({
      search: 'Alice',
    });

    expect(error).toBeUndefined();
    expect(value.search).toBe('Alice');
    expect(value.sortBy).toBe('createdAt');
    expect(value.sortOrder).toBe('desc');
  });

  it('should accept empty object and apply default sortBy and sortOrder', () => {
    const { error, value } = getContactsQuerySchema.validate({});

    expect(error).toBeUndefined();
    expect(value.search).toBeUndefined();
    expect(value.sortBy).toBe('createdAt');
    expect(value.sortOrder).toBe('desc');
  });

  it('should accept valid sortBy name and sortOrder asc', () => {
    const { error, value } = getContactsQuerySchema.validate({
      sortBy: 'name',
      sortOrder: 'asc',
    });

    expect(error).toBeUndefined();
    expect(value.sortBy).toBe('name');
    expect(value.sortOrder).toBe('asc');
  });

  it('should accept empty string for search parameter', () => {
    const { error, value } = getContactsQuerySchema.validate({
      search: '',
    });

    expect(error).toBeUndefined();
    expect(value.search).toBe('');
  });

  it('should reject search term exceeding 100 characters', () => {
    const { error } = getContactsQuerySchema.validate({
      search: 'a'.repeat(101),
    });

    expect(error).toBeDefined();
    expect(error?.details[0].message).toContain('Search term cannot exceed 100 characters');
  });

  it('should reject invalid sortBy option', () => {
    const { error } = getContactsQuerySchema.validate({
      sortBy: 'unsupportedField',
    });

    expect(error).toBeDefined();
    expect(error?.details[0].message).toContain('sortBy must be one of: name, createdAt');
  });

  it('should reject invalid sortOrder option', () => {
    const { error } = getContactsQuerySchema.validate({
      sortOrder: 'ascending',
    });

    expect(error).toBeDefined();
    expect(error?.details[0].message).toContain('sortOrder must be one of: asc, desc');
  });

  it('should accept valid page and limit numbers', () => {
    const { error, value } = getContactsQuerySchema.validate({
      page: 3,
      limit: 25,
    });

    expect(error).toBeUndefined();
    expect(value.page).toBe(3);
    expect(value.limit).toBe(25);
  });

  it('should reject page less than 1', () => {
    const { error } = getContactsQuerySchema.validate({
      page: 0,
    });

    expect(error).toBeDefined();
    expect(error?.details[0].message).toContain('page must be at least 1');
  });

  it('should reject limit greater than 100', () => {
    const { error } = getContactsQuerySchema.validate({
      limit: 101,
    });

    expect(error).toBeDefined();
    expect(error?.details[0].message).toContain('limit cannot exceed 100');
  });

  it('should reject non-integer page or limit', () => {
    const { error } = getContactsQuerySchema.validate({
      page: 2.5,
    });

    expect(error).toBeDefined();
    expect(error?.details[0].message).toContain('page must be an integer');
  });

  it('should accept valid tagId UUID and company filter', () => {
    const { error, value } = getContactsQuerySchema.validate({
      tagId: '123e4567-e89b-12d3-a456-426614174000',
      company: 'Acme Corp',
    });

    expect(error).toBeUndefined();
    expect(value.tagId).toBe('123e4567-e89b-12d3-a456-426614174000');
    expect(value.company).toBe('Acme Corp');
  });

  it('should reject non-UUID tagId', () => {
    const { error } = getContactsQuerySchema.validate({
      tagId: 'invalid-tag-uuid',
    });

    expect(error).toBeDefined();
    expect(error?.details[0].message).toContain('tagId must be a valid UUID');
  });

  it('should reject company longer than 150 characters', () => {
    const { error } = getContactsQuerySchema.validate({
      company: 'x'.repeat(151),
    });

    expect(error).toBeDefined();
    expect(error?.details[0].message).toContain('company filter cannot exceed 150 characters');
  });
});

