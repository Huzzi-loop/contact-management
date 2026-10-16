export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: any;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  meta?: PaginationMeta;
  error?: ApiErrorPayload;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface OccConflictDetails<T = any> {
  currentVersion?: number;
  submittedVersion?: number;
  latestContact?: T;
}
