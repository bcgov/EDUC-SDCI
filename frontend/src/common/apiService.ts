import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';

// Buffer concurrent requests while refresh token is being acquired
let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}[] = [];

function processQueue(error: any, token: string | null = null): void {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
}

// Create new non-global axios instance and intercept strategy
const apiAxios: AxiosInstance = axios.create();
const intercept = apiAxios.interceptors.response.use(
  (config: AxiosRequestConfig) => config,
  (error: any) => {
    const originalRequest: AxiosRequestConfig = error.config;
    if (error.response.status !== 401) {
      return Promise.reject(error);
    }
    axios.interceptors.response.eject(intercept);
    return new Promise<AxiosResponse>((resolve, reject) => {
      resolve(axios(originalRequest));
    }).catch((e) => {
      reject(e);
    });
  }
);

export default {
  apiAxios,
  intercept,
  processQueue,
  failedQueue,
};