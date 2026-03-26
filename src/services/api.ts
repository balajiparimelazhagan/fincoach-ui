import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { storageService } from './storage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// Retry configuration for network/server errors
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;
const MAX_RETRY_DELAY = 5000;

// Track retry attempts per request
const retryMap = new Map<string, number>();

// ---------- Token refresh state ----------
// Only one refresh call is made even when multiple requests fail simultaneously.
// All waiting requests are queued and retried once the new token arrives.

let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function drainQueue(err: unknown, token: string | null) {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (err) reject(err);
    else resolve(token!);
  });
  refreshQueue = [];
}

async function clearSession() {
  await storageService.remove('access_token');
  await storageService.remove('refresh_token');
  window.location.href = '/login';
}

/**
 * Base axios instance with default configuration
 */
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

/**
 * Request interceptor — attaches the current access token to every request
 */
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await storageService.get('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

/**
 * Response interceptor — handles 401 with silent token refresh + retry,
 * and exponential back-off retry for 5xx / network errors.
 */
api.interceptors.response.use(
  (response) => {
    const key = `${response.config.method}:${response.config.url}`;
    retryMap.delete(key);
    return response;
  },
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig & { _retried?: boolean };

    // ── 401 Unauthorized ──────────────────────────────────────────────────────
    if (error.response?.status === 401) {
      // If the refresh call itself returns 401 the session is dead.
      if (config?.url?.includes('/auth/refresh')) {
        await clearSession();
        return Promise.reject(error);
      }

      // Already retried this specific request — don't loop.
      if (config?._retried) {
        await clearSession();
        return Promise.reject(error);
      }

      if (config) config._retried = true;

      if (isRefreshing) {
        // Another request is already refreshing — queue this one.
        return new Promise<string>((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            if (config?.headers) config.headers.Authorization = `Bearer ${newToken}`;
            return api(config!);
          })
          .catch(() => Promise.reject(error));
      }

      isRefreshing = true;

      try {
        const refreshToken = await storageService.get('refresh_token');
        if (!refreshToken) {
          drainQueue(error, null);
          await clearSession();
          return Promise.reject(error);
        }

        // Direct axios call — bypasses our interceptors to avoid loops.
        const { data } = await axios.post<{ access_token: string }>(
          `${API_BASE_URL}/auth/refresh`,
          { refresh_token: refreshToken },
        );

        const newToken = data.access_token;
        await storageService.set('access_token', newToken);

        drainQueue(null, newToken);

        if (config?.headers) config.headers.Authorization = `Bearer ${newToken}`;
        return api(config!);
      } catch (refreshError) {
        drainQueue(refreshError, null);
        await clearSession();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ── Retry for 5xx / network / timeout errors ───────────────────────────
    const shouldRetry =
      !config ||
      (error.response?.status && error.response.status >= 500) ||
      error.code === 'ECONNABORTED' ||
      error.message === 'Network Error';

    if (shouldRetry && config) {
      const key = `${config.method}:${config.url}`;
      const currentRetries = retryMap.get(key) || 0;

      if (currentRetries < MAX_RETRIES) {
        const delay = Math.min(
          INITIAL_RETRY_DELAY * Math.pow(2, currentRetries),
          MAX_RETRY_DELAY,
        );

        if (import.meta.env.DEV) {
          console.warn(
            `Retrying request: ${config.method?.toUpperCase()} ${config.url} ` +
            `(attempt ${currentRetries + 1}/${MAX_RETRIES})`,
            { delay },
          );
        }

        retryMap.set(key, currentRetries + 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return api(config);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
