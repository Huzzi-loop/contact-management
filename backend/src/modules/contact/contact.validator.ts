import Joi from 'joi';

export const createContactSchema = Joi.object({
  firstName: Joi.string().trim().min(1).max(100).required().messages({
    'string.base': 'First name must be a string',
    'string.empty': 'First name cannot be empty',
    'any.required': 'First name is required',
  }),
  lastName: Joi.string().trim().min(1).max(100).required().messages({
    'string.base': 'Last name must be a string',
    'string.empty': 'Last name cannot be empty',
    'any.required': 'Last name is required',
  }),
  email: Joi.string()
    .trim()
    .email({ tlds: { allow: false } })
    .max(255)
    .allow(null, '')
    .optional()
    .messages({
      'string.email': 'Email must be a valid email address',
    }),
  phone: Joi.string().trim().max(50).allow(null, '').optional(),
  company: Joi.string().trim().max(150).allow(null, '').optional(),
  tagIds: Joi.array()
    .items(Joi.string().uuid().messages({ 'string.guid': 'Each tagId must be a valid UUID' }))
    .unique()
    .default([])
    .optional(),
});

export const updateContactSchema = Joi.object({
  version: Joi.number().integer().min(1).required().messages({
    'any.required': 'Version number is required for optimistic concurrency control',
    'number.base': 'Version must be an integer',
    'number.min': 'Version must be at least 1',
  }),
  firstName: Joi.string().trim().min(1).max(100).optional().messages({
    'string.empty': 'First name cannot be empty',
  }),
  lastName: Joi.string().trim().min(1).max(100).optional().messages({
    'string.empty': 'Last name cannot be empty',
  }),
  email: Joi.string()
    .trim()
    .email({ tlds: { allow: false } })
    .max(255)
    .allow(null, '')
    .optional()
    .messages({
      'string.email': 'Email must be a valid email address',
    }),
  phone: Joi.string().trim().max(50).allow(null, '').optional(),
  company: Joi.string().trim().max(150).allow(null, '').optional(),
})
  .min(2) // Requires version + at least 1 field to update
  .messages({
    'object.min': 'At least one field must be provided to update',
  });

export const getContactsQuerySchema = Joi.object({
  search: Joi.string().trim().max(100).allow('').optional().messages({
    'string.max': 'Search term cannot exceed 100 characters',
  }),
  sortBy: Joi.string().valid('name', 'createdAt').default('createdAt').messages({
    'any.only': 'sortBy must be one of: name, createdAt',
  }),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc').messages({
    'any.only': 'sortOrder must be one of: asc, desc',
  }),
  page: Joi.number().integer().min(1).default(1).messages({
    'number.base': 'page must be a number',
    'number.integer': 'page must be an integer',
    'number.min': 'page must be at least 1',
  }),
  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    'number.base': 'limit must be a number',
    'number.integer': 'limit must be an integer',
    'number.min': 'limit must be at least 1',
    'number.max': 'limit cannot exceed 100',
  }),
});

export const searchContactsQuerySchema = getContactsQuerySchema;

