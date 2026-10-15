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
