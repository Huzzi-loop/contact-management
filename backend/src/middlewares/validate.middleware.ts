import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ValidationError } from '../utils/apiError';

type RequestPart = 'body' | 'query' | 'params';

export const validate = (
  schema: Joi.ObjectSchema,
  part: RequestPart = 'body'
) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req[part], {
      abortEarly: false,     // Collect all errors across all fields
      stripUnknown: true,   // Remove undocumented properties
      allowUnknown: false,  // Disallow extraneous fields
    });

    if (error) {
      const details = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/['"]/g, ''),
      }));
      return next(new ValidationError('Invalid request payload or parameters', details));
    }

    // Replace request property with validated & sanitized value
    req[part] = value;
    next();
  };
};
