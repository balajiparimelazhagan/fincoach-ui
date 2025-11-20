import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { storageService } from './storage';

const API_BASE_URL = 'http://localhost:8000/api/v1';

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
 * Response interceptor to handle errors globally
 */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      await storageService.remove('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
