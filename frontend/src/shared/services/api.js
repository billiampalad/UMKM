// src/shared/services/api.js
import axios from 'axios';

// API Base URL - pastikan sesuai dengan backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

console.log('🌐 API Base URL:', API_BASE_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    console.log('📤 API Request:', config.method?.toUpperCase(), config.url);
    
    // Get token from localStorage (sesuai dengan authService)
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Token added to request');
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('📥 API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: error.config?.url
    });

    if (error.response?.status === 401) {
      // Token expired or invalid
      console.log('🚪 Unauthorized - clearing auth data');
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API - sesuai dengan backend endpoints
export const authAPI = {
  login: (credentials) => {
    console.log('🔐 Calling login API with:', { email: credentials.email });
    return api.post('/api/auth/login', {
      email: credentials.email,
      pass: credentials.password // Backend expects 'pass', not 'password'
    });
  },
  logout: () => api.post('/api/auth/logout'),
  verifyToken: () => api.get('/api/auth/verify'),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/api/users/profile'),
  updateProfile: (userData) => api.put('/api/users/profile', userData),
  getAllUsers: (params = {}) => api.get('/api/users', { params }),
  getUserById: (id) => api.get(`/api/users/${id}`),
  createUser: (userData) => api.post('/api/users', userData),
  updateUser: (id, userData) => api.put(`/api/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/api/users/${id}`),
};

// Product API
export const productAPI = {
  getAllProducts: (params = {}) => api.get('/api/products', { params }),
  getProductById: (id) => api.get(`/api/products/${id}`),
  createProduct: (productData) => api.post('/api/products', productData),
  updateProduct: (id, productData) => api.put(`/api/products/${id}`, productData),
  deleteProduct: (id) => api.delete(`/api/products/${id}`),
  updateStock: (id, stockData) => api.patch(`/api/products/${id}/stock`, stockData),
};

// Cart API
export const cartAPI = {
  getCart: () => api.get('/api/cart'),
  addToCart: (itemData) => api.post('/api/cart/add', itemData),
  updateCartItem: (id, itemData) => api.put(`/api/cart/update/${id}`, itemData),
  removeFromCart: (id) => api.delete(`/api/cart/remove/${id}`),
  clearCart: () => api.delete('/api/cart/clear'),
};

// Transaction API
export const transactionAPI = {
  createTransaction: (transactionData) => api.post('/api/transactions/checkout', transactionData),
  getUserTransactions: (params = {}) => api.get('/api/transactions/my-transactions', { params }),
  getAllTransactions: (params = {}) => api.get('/api/transactions', { params }),
  getTransactionDetails: (id) => api.get(`/api/transactions/${id}`),
  updateTransactionStatus: (id, statusData) => api.patch(`/api/transactions/${id}/status`, statusData),
  cancelTransaction: (id) => api.patch(`/api/transactions/${id}/cancel`),
};

// Document API
export const documentAPI = {
  getAllDocuments: (params = {}) => api.get('/api/documents', { params }),
  getDocumentById: (id) => api.get(`/api/documents/${id}`),
  generateDocument: (transactionId, documentData) => api.post(`/api/documents/generate/${transactionId}`, documentData),
  getDocumentsByTransaction: (transactionId) => api.get(`/api/documents/transaction/${transactionId}`),
  deleteDocument: (id) => api.delete(`/api/documents/${id}`),
};

// API Endpoints untuk kompatibilitas dengan authService
export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  USERS: `${API_BASE_URL}/api/users`,
  PROFILE: `${API_BASE_URL}/api/users/profile`,
  PRODUCTS: `${API_BASE_URL}/api/products`,
  CART: `${API_BASE_URL}/api/cart`,
  CART_ADD: `${API_BASE_URL}/api/cart/add`,
  TRANSACTIONS: `${API_BASE_URL}/api/transactions`,
  STATUS: `${API_BASE_URL}/api/status`
};

// Helper function untuk compatibility dengan existing authService
export const apiRequest = async (url, options = {}) => {
  try {
    console.log('🌐 API Request:', { url, options });
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    const data = await response.json();
    console.log('📡 API Response:', { url, status: response.status, data });

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('❌ API Request Error:', { url, error: error.message });
    throw error;
  }
};

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export default api;