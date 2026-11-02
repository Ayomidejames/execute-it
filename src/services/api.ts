/**
 * Centralized API Client for ExecuteIt
 * Handles API base URLs, JSON request/response pipelines, auth headers, and fallback logic.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const FORCE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || import.meta.env.VITE_USE_MOCK === true;

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
  isMock?: boolean;
}

export class ApiError extends Error {
  status: number;
  data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Check if the live API mode is enabled.
 */
export function isMockMode(): boolean {
  return FORCE_MOCK;
}

export async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  // If explicitly configured for mock mode, throw a special sentinel so the service handles it via mock layer
  if (FORCE_MOCK) {
    throw new ApiError('MOCK_FALLBACK_REQUESTED', 200, { fallbackToMock: true });
  }

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Includes HttpOnly backend cookies
    });

    const contentType = response.headers.get('content-type');
    let data: any = null;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      throw new ApiError(
        data?.message || `Request failed with status ${response.status}`,
        response.status,
        data
      );
    }

    return {
      data,
      status: response.status,
      isMock: false,
    };
  } catch (error: any) {
    // If server is not running or network failed, allow service to fall back to mock with warning
    if (error.name !== 'ApiError' || error.message === 'Failed to fetch') {
      console.warn(
        `[ExecuteIt API] Backend connection to ${url} failed. Gracefully falling back to mock service layer.`
      );
      throw new ApiError('BACKEND_UNAVAILABLE_FALLBACK', 503, { fallbackToMock: true });
    }
    throw error;
  }
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};
