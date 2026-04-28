import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token de autenticación
export const setAuthToken = (getToken) => {
  api.interceptors.request.use(
    async (config) => {
      try {
        const token = await getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      } catch (error) {
        console.error('Error getting auth token:', error);
        return config;
      }
    },
    (error) => {
      return Promise.reject(error);
    }
  );
};

// Interceptor para manejo de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirigir al login
      window.location.href = '/sign-in';
    }
    return Promise.reject(error);
  }
);

// API methods
export const connectorsAPI = {
  getAll: (params) => api.get('/connectors', { params }),
  getOne: (id) => api.get(`/connectors/${id}`),
  create: (data) => api.post('/connectors', data),
  update: (id, data) => api.patch(`/connectors/${id}`, data),
  delete: (id) => api.delete(`/connectors/${id}`),
  test: (id) => api.post(`/connectors/${id}/test`),
  getTools: (id) => api.get(`/connectors/${id}/tools`),
  refreshTools: (id) => api.post(`/connectors/${id}/refresh-tools`),
};

export const agentsAPI = {
  query: (data) => api.post('/agents/query', data),
  getSession: (sessionId) => api.get(`/agents/sessions/${sessionId}`),
};

export const executionsAPI = {
  getAll: (params) => api.get('/executions', { params }),
  getOne: (id) => api.get(`/executions/${id}`),
  getStats: (params) => api.get('/executions/stats/summary', { params }),
};

export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;
