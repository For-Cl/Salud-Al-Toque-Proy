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

// Response interceptor — handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    if (error.config?.skipErrorToast) {
      return Promise.reject(error);
    }

    if (!error.response) {
      toast.error('Error de conexión. Verifica que el backend esté en ejecución.');
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    switch (status) {
      case 401:
        localStorage.removeItem('token');
        localStorage.removeItem('user_profile');
        if (window.location.pathname !== '/login') {
          toast.error('Tu sesión ha expirado. Inicia sesión de nuevo.');
          window.location.href = '/login';
        }
        break;
      case 403:
        toast.error('No tienes permisos para realizar esta acción.');
        break;
      case 409:
        toast.error(data?.message || 'Conflicto con los datos enviados.');
        break;
      case 500:
        toast.error('Error interno del servidor. Intenta más tarde.');
        break;
      default:
        break;
    }

    return Promise.reject(error);
  }
);

export default apiClient;
