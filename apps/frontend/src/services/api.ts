import type { RefreshJWTRequest, RefreshJWTResponse } from '@board-bot-arena/shared';
import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const BASE_URL = "http://localhost:3000/api";
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];


const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};


api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // requireAuth middleware returns 403 if the access token is invalid (needs refresh)
    if (
      !originalRequest ||
      (error.response?.status !== 403 && error.response?.status !== 401) ||
      originalRequest._retry ||
      originalRequest.url === '/auth/refresh'
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // if we are already refreshing
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    // we are the first request to fail
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // get a new access token
      const data: RefreshJWTRequest = {};
      const response = await axios.post<RefreshJWTResponse>(
        BASE_URL + '/auth/refresh',
        data,
        { withCredentials: true }
      );

      const newAccessToken = response.data.token;
      setAccessToken(newAccessToken);

      processQueue(null, newAccessToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);

    } catch (refreshError) {
      // we failed to refresh, just sign out
      processQueue(refreshError as Error, null);
      setAccessToken(null);
      
      // redirect to login page?
      // window.location.href = '/login'; 
      
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);