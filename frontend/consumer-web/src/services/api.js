import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  signup: (data) => api.post('/api/auth/signup', data),
  login: (data) => api.post('/api/auth/login', data),
  getCurrentUser: () => api.get('/api/auth/me'),
};

// Store APIs
export const storeAPI = {
  getStores: () => api.get('/api/stores/'),
  getStore: (id) => api.get(`/api/stores/${id}`),
  getStoreProducts: (id) => api.get(`/api/stores/${id}/products`),
};

// Order APIs
export const orderAPI = {
  createOrder: (data) => api.post('/api/orders/', data),
  getMyOrders: () => api.get('/api/orders/my'),
  getOrder: (id) => api.get(`/api/orders/${id}`),
};

export default api;
