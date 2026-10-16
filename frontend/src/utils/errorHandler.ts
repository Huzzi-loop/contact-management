import type { OccConflictDetails } from '../types';

export interface ParsedApiError {
  message: string;
  statusCode?: number;
  isConflict: boolean;
  isNotFound: boolean;
  isValidationError: boolean;
  conflictDetails?: OccConflictDetails;
  rawDetails?: any;
}

export function parseApiError(error: any): ParsedApiError {
  const statusCode = error?.statusCode || error?.response?.status;
  const isConflict = statusCode === 409;
  const isNotFound = statusCode === 404;
  const isValidationError = statusCode === 400;

  // Extract custom message from interceptor, response payload, or error.message
  const message =
    error?.customMessage ||
    error?.response?.data?.error?.message ||
    error?.response?.data?.message ||
    error?.message ||
    'An unexpected error occurred';

  const conflictDetails = isConflict
    ? (error?.details || error?.response?.data?.error?.details || undefined)
    : undefined;

  const rawDetails = error?.details || error?.response?.data?.error?.details || undefined;

  return {
    message,
    statusCode,
    isConflict,
    isNotFound,
    isValidationError,
    conflictDetails,
    rawDetails,
  };
}
