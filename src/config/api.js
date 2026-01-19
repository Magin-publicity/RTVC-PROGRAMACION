// Configuración centralizada de la API
// Esto permite que la app funcione en localhost Y en red local (IP)

// Detectar automáticamente la URL base de la API
const getApiUrl = () => {
  // En producción, usar variable de entorno
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || 'https://api.rtvc.app';
  }

  // En desarrollo: usar rutas relativas para que Vite las proxee
  // Esto funciona tanto en localhost como en IP de red
  return '/api';
};

export const API_BASE_URL = getApiUrl();

// Helper para hacer fetch con la URL correcta
export const apiFetch = async (endpoint, options = {}) => {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };

  // Agregar token si existe
  const token = localStorage.getItem('token');
  if (token) {
    defaultOptions.headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...defaultOptions, ...options });

  // Lanzar error si la respuesta no es OK
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response;
};

// Helper para Socket.io
export const getSocketUrl = () => {
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || 'https://api.rtvc.app';
  }

  // En desarrollo: usar la URL del servidor actual pero puerto 3000
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  return `${protocol}//${hostname}:3000`;
};

console.log('[API Config] API Base URL:', API_BASE_URL);
console.log('[API Config] Socket URL:', getSocketUrl());
