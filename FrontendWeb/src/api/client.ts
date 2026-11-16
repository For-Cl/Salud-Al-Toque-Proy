import axios from 'axios';
import toast from 'react-hot-toast';

declare module 'axios' {
  export interface AxiosRequestConfig {
    skipErrorToast?: boolean;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor — attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle global session expiry and network failures without duplicate toasts
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    if (!error.response) {
      if (!error.config?.skipErrorToast) {
        toast.error('Error de conexión. Verifica que el backend esté en ejecución.');
      }
      return Promise.reject(error);
    }

    const { status } = error.response;

    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user_profile');
      if (window.location.pathname !== '/login') {
        toast.error('Tu sesión ha expirado. Inicia sesión de nuevo.');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
