import axios from 'axios';
import { Platform } from 'react-native';
import { storage } from '../utils/storage';

// OJO cambiar a la IP de tu PC
const DEFAULT_HOST = '192.168.18.126';
export const API_BASE_URL = `http://${DEFAULT_HOST}:8080`;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: Inject Bearer token from SecureStore
apiClient.interceptors.request.use(
  async (config) => {
    const token = await storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: User-friendly error message resolution
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.response) {
      error.friendlyMessage = 'Sin conexión al servidor. Comprueba tu red.';
      return Promise.reject(error);
    }

    const { status, data } = error.response;
    switch (status) {
      case 400:
        error.friendlyMessage = data?.message || 'Los datos enviados son inválidos.';
        break;
      case 401:
        await storage.deleteToken();
        error.friendlyMessage = 'Tu sesión ha expirado o las credenciales no son válidas.';
        break;
      case 403:
        error.friendlyMessage = 'No tienes permiso para realizar esta acción.';
        break;
      case 404:
        error.friendlyMessage = data?.message || 'El recurso solicitado no fue encontrado.';
        break;
      case 409:
        error.friendlyMessage = data?.message || 'Conflicto: el horario u operación ya no está disponible.';
        break;
      case 500:
        error.friendlyMessage = 'Error interno del servidor. Por favor intenta más tarde.';
        break;
      default:
        error.friendlyMessage = data?.message || 'Ocurrió un error inesperado.';
        break;
    }
    return Promise.reject(error);
  }
);

export default apiClient;

