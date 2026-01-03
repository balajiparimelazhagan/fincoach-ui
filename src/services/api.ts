import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { storageService } from './storage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second
const MAX_RETRY_DELAY = 5000; // 5 seconds
const ENDPOINTS_SKIP_RETRY = ['/users/me', '/user-preferences']; // Skip retry for auth endpoints

// Track retry attempts per request
const retryMap = new Map<string, number>();

/**
 * Base axios instance with default configuration
 */
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

/**
 * Request interceptor to add auth token to requests
 */
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await storageService.get('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor to handle errors globally with retry logic
 */
api.interceptors.response.use(
  (response) => {
    // Clear retry count on success
    const key = `${response.config.method}:${response.config.url}`;
    retryMap.delete(key);
    return response;
  },
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig & { _retry?: number };

    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      await storageService.remove('access_token');
      
      // Don't retry auth endpoints
      const shouldSkipRetry = ENDPOINTS_SKIP_RETRY.some(endpoint => 
        config?.url?.includes(endpoint)
      );
      
      if (shouldSkipRetry) {
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    // Retry logic for specific errors (network errors, 5xx errors, timeouts)
    const shouldRetry = 
      !config ||
      (error.response?.status && error.response.status >= 500) || // Server errors
      error.code === 'ECONNABORTED' || // Timeout
      error.message === 'Network Error'; // Network errors

    if (shouldRetry && config) {
      const retryCount = config._retry || 0;
      const key = `${config.method}:${config.url}`;
      const currentRetries = retryMap.get(key) || 0;

      if (currentRetries < MAX_RETRIES) {
        // Calculate exponential backoff delay
        const delay = Math.min(
          INITIAL_RETRY_DELAY * Math.pow(2, currentRetries),
          MAX_RETRY_DELAY
        );

        console.warn(
          `Retrying request: ${config.method?.toUpperCase()} ${config.url} (attempt ${currentRetries + 1}/${MAX_RETRIES})`,
          { delay }
        );

        retryMap.set(key, currentRetries + 1);

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));

        // Retry the request
        return api(config);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
