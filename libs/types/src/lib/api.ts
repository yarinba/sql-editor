/**
 * Base types shared across modules
 */

export type ApiStatus = 'success' | 'error';

export interface ApiResponse<T> {
  status: ApiStatus;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}
