import { Response } from 'express';

export interface ApiResponsePayload<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: Record<string, any>;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export class ApiResponse {
  static success<T>(
    res: Response,
    data: T,
    message: string = 'Success',
    statusCode: number = 200,
    meta?: Record<string, any>
  ) {
    const payload: ApiResponsePayload<T> = {
      success: true,
      message,
      data,
      ...(meta ? { meta } : {}),
    };
    return res.status(statusCode).json(payload);
  }

  static created<T>(res: Response, data: T, message: string = 'Created successfully') {
    return this.success(res, data, message, 201);
  }

  static error(
    res: Response,
    message: string,
    statusCode: number = 500,
    errorCode: string = 'INTERNAL_ERROR',
    details?: any
  ) {
    const payload: ApiResponsePayload = {
      success: false,
      error: {
        code: errorCode,
        message,
        details,
      },
    };
    return res.status(statusCode).json(payload);
  }
}
