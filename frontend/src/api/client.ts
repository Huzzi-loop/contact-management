import axios from 'axios';
import type { AxiosError, AxiosResponse } from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Response interceptor for consistent error extraction
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError<{ success?: boolean; error?: { message?: string; code?: string; details?: any } }>) => {
    const errorData = error.response?.data;
    const errorMessage =
      errorData?.error?.message ||
      error.message ||
      'An unexpected error occurred. Please try again.';

    return Promise.reject({
      ...error,
      customMessage: errorMessage,
      statusCode: error.response?.status,
      errorCode: errorData?.error?.code,
      details: errorData?.error?.details,
    });
  }
);

export default apiClient;
