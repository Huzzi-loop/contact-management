import Joi from 'joi';

export const createTagSchema = Joi.object({
  name: Joi.string().trim().min(1).max(50).required().messages({
    'string.base': 'Tag name must be a string',
    'string.empty': 'Tag name cannot be empty',
    'string.min': 'Tag name must be at least 1 character long',
    'string.max': 'Tag name cannot exceed 50 characters',
    'any.required': 'Tag name is required',
  }),
  color: Joi.string()
    .trim()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .default('#3B82F6')
    .messages({
      'string.pattern.base': 'Tag color must be a valid hex color code (e.g. #3B82F6 or #FFF)',
    }),
});
