import { ApiError, ApiResponse } from './types';

export { ApiError };
export type { ApiResponse };
import { getMockResponse } from './mocks';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Mock fallback is a development convenience only — never serve fake data
// when talking to a real backend in production.
const MOCK_FALLBACK_ENABLED = process.env.NODE_ENV !== 'production';

interface RequestOptions extends RequestInit {
  token?: string;
  params?: Record<string, string | number | boolean | undefined>;
  skipAuthRefresh?: boolean;
}

let isRefreshing = false;
let activeRefreshPromise: Promise<boolean> | null = null;
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
}

export async function request<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { token, params, headers, skipAuthRefresh, ...customConfig } = options;

  const isBrowser = typeof window !== 'undefined';
  let url: string;
  if (endpoint.startsWith('http')) {
    url = endpoint;
  } else if (isBrowser) {
    // When executing in browser, use same-origin relative URL so HttpOnly cookies are sent
    url = endpoint;
  } else {
    // When executing in Node.js/Next server (Server Components or Route Handlers), target Railway directly
    url = `${API_BASE_URL}${endpoint}`;
  }

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined) {
        searchParams.append(key, String(val));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const config: RequestInit = {
    ...customConfig,
    credentials: 'include', // Send cookies (including accesstoken) with requests
    headers: {
      ...headers,
    },
  };

  const defaultHeaders: Record<string, string> = {};

  // Don't set Content-Type for FormData - browser will set it with boundary
  if (!(config.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  config.headers = {
    ...defaultHeaders,
    ...headers,
  };

  const method = config.method || 'GET';
  let bodyData: any = null;
  if (config.body && typeof config.body === 'string') {
    try {
      bodyData = JSON.parse(config.body);
    } catch {
      bodyData = config.body;
    }
  }

  try {
    const response = await fetch(url, config);

    // Handle 401 Unauthorized - attempt token refresh
    if (response.status === 401 && !skipAuthRefresh) {
      if (!activeRefreshPromise) {
        activeRefreshPromise = (async () => {
          try {
            // Rotate tokens via our own BFF route — it reads the HttpOnly
            // refresh cookie server-side, so the real token never touches JS.
            const refreshResponse = await fetch('/api/auth/refresh', {
              method: 'POST',
              credentials: 'include',
            });
            return refreshResponse.ok;
          } catch (refreshError) {
            console.error('[Auth Refresh] Failed to refresh token:', refreshError);
            return false;
          } finally {
            activeRefreshPromise = null;
          }
        })();
      }

      const refreshedSuccessfully = await activeRefreshPromise;

      if (refreshedSuccessfully) {
        // Retry the original request without stale bearer token so fresh cookie is sent
        return request<T>(endpoint, { ...options, token: undefined });
      }

      // If refresh failed, redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/merchant/auth/login';
      }
      throw new ApiError('Session expired. Please log in again.', 401);
    }

    // If server returned 404, 500, 502, 503, attempt mock fallback in development
    if (
      MOCK_FALLBACK_ENABLED &&
      !response.ok &&
      (response.status === 404 || response.status >= 500)
    ) {
      const mock = getMockResponse(endpoint, method, bodyData);
      if (mock) {
        console.warn(`[API Fallback] Backend returned status ${response.status}. Serving mock data for: [${method}] ${endpoint}`);
        return mock;
      }
    }

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data?.message || `HTTP request failed with status ${response.status}`,
        response.status,
        data?.errorCode,
        data
      );
    }

    return data;
  } catch (error: any) {
    // If network error occurred (e.g. backend down / CORS issue)
    if (MOCK_FALLBACK_ENABLED) {
      const mock = getMockResponse(endpoint, method, bodyData);
      if (mock) {
        console.warn(`[API Fallback] Network request failed (${error?.message}). Serving mock data for: [${method}] ${endpoint}`);
        return mock;
      }
    }

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(error?.message || 'Network request failed', 0);
  }
}

export const apiClient = {
  get: <T = any>(endpoint: string, options?: RequestOptions) => {
    console.log('apiClient.get called:', endpoint, options)
    return request<T>(endpoint, { ...options, method: 'GET' })
  },

  post: <T = any>(endpoint: string, body?: any, options?: RequestOptions) => {
    console.log('apiClient.post called:', endpoint, body, options)
    return request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
    })
  },

  put: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
    }),

  patch: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
    }),

  delete: <T = any>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};
