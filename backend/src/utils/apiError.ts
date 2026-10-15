export class ApiError extends Error {
  public statusCode: number;
  public errorCode: string;
  public details?: any;

  constructor(
    statusCode: number,
    message: string,
    errorCode: string = 'INTERNAL_ERROR',
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends ApiError {
  constructor(message: string = 'Bad Request', details?: any) {
    super(400, message, 'BAD_REQUEST', details);
  }
}

export class ValidationError extends ApiError {
  constructor(message: string = 'Validation Error', details?: any) {
    super(400, message, 'VALIDATION_ERROR', details);
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource Not Found') {
    super(404, message, 'NOT_FOUND');
  }
}

export class ConflictError extends ApiError {
  constructor(message: string = 'Conflict detected', details?: any) {
    super(409, message, 'CONFLICT', details);
  }
}
