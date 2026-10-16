import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';
import { ApiResponse } from '../utils/apiResponse';
import { config } from '../config/env';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof ApiError) {
    return ApiResponse.error(
      res,
      err.message,
      err.statusCode,
      err.errorCode,
      err.details
    );
  }

  // Handle generic uncaught server errors
  console.error('Unhandled server error:', err);
  const message = config.isProduction ? 'Internal Server Error' : err.message;
  const details = config.isProduction ? undefined : { stack: err.stack };

  return ApiResponse.error(res, message, 500, 'INTERNAL_SERVER_ERROR', details);
};
