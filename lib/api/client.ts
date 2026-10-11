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
let activeRefreshPromise: Promise<{ accessToken: string; refreshToken: string } | null> | null = null;
let refreshSubscribers: Array<(tokens: { accessToken: string; refreshToken: string }) => void> = [];

function subscribeTokenRefresh(callback: (tokens: { accessToken: string; refreshToken: string }) => void) {
  refreshSubscribers.push(callback);
}

function onTokenRefreshed(tokens: { accessToken: string; refreshToken: string }) {
  refreshSubscribers.forEach(callback => callback(tokens));
  refreshSubscribers = [];
}

function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refreshToken');
}

function setTokens(accessToken: string, refreshToken: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
}

function clearTokens() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
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
    url = endpoint;
  } else {
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

  // Use provided token or get from localStorage
  const accessToken = token || getAccessToken();

  const config: RequestInit = {
    ...customConfig,
    credentials: 'include',
    headers: {
      ...headers,
    },
  };

  const defaultHeaders: Record<string, string> = {};

  if (!(config.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  if (accessToken) {
    defaultHeaders['Authorization'] = `Bearer ${accessToken}`;
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
    if (response.status === 401 && !skipAuthRefresh && isBrowser) {
      if (!activeRefreshPromise) {
        activeRefreshPromise = (async () => {
          try {
            const refreshToken = getRefreshToken();
            if (!refreshToken) {
              return null;
            }

            const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ refreshToken }),
            });

            if (!refreshResponse.ok) {
              clearTokens();
              return null;
            }

            const data = await refreshResponse.json();
            const { tokens } = data;
            
            if (tokens && tokens.accessToken && tokens.refreshToken) {
              setTokens(tokens.accessToken, tokens.refreshToken);
              return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
            }
            
            return null;
          } catch (refreshError) {
            console.error('[Auth Refresh] Failed to refresh token:', refreshError);
            clearTokens();
            return null;
          } finally {
            activeRefreshPromise = null;
          }
        })();
      }

      const refreshedTokens = await activeRefreshPromise;

      if (refreshedTokens) {
        onTokenRefreshed(refreshedTokens);
        // Retry the original request with new token
        return request<T>(endpoint, { ...options, token: refreshedTokens.accessToken });
      }

      // If refresh failed, redirect to login
      if (typeof window !== 'undefined') {
        clearTokens();
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
