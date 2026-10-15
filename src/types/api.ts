/**
 * THE RESPONSE CONTRACT. Must match backend/src/utils/apiResponse.ts and error.middleware.ts.
 *
 * Success: { success: true,  message: "...", data: T }
 * Error:   { success: false, message: "...", errors?: { field: "..." } }
 */
export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiFailure {
  success: false;
  message: string;
  errors?: Record<string, string>;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;
