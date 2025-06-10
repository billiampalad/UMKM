// src/shared/services/authService.js
import { authAPI, API_ENDPOINTS } from './api';

export const authService = {
  // Login function menggunakan axios
  login: async (email, password) => {
    try {
      console.log('🔐 Attempting login for:', email);
      
      const response = await authAPI.login({ email, password });
      
      if (response.data.success) {
        // Store token and user info
        localStorage.setItem('authToken', response.data.data.token);
        localStorage.setItem('userData', JSON.stringify(response.data.data.user));
        
        console.log('✅ Login successful:', response.data.data.user);
        return { success: true, data: response.data.data };
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      console.error('❌ Login error:', error.response?.data?.message || error.message);
      throw new Error(error.response?.data?.message || error.message || 'Login failed');
    }
  },

  // Logout function
  logout: async () => {
    try {
      console.log('🚪 Logging out...');
      
      // Call logout API if token exists
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          await authAPI.logout();
        } catch (error) {
          console.warn('Logout API call failed, but continuing with local logout');
        }
      }
      
      // Clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      
      // Redirect to login
      window.location.href = '/login';
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Force local logout even if API fails
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      window.location.href = '/login';
    }
  },

  // Get current user
  getCurrentUser: () => {
    try {
      const userData = localStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('❌ Error getting current user:', error);
      return null;
    }
  },

  // Get auth token
  getToken: () => {
    return localStorage.getItem('authToken');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    return !!(token && userData);
  },

  // Check if user has specific role
  hasRole: (role) => {
    const user = authService.getCurrentUser();
    return user && user.role === role;
  },

  // Test backend connection
  testConnection: async () => {
    try {
      console.log('🔍 Testing backend connection...');
      const response = await fetch(API_ENDPOINTS.STATUS);
      const data = await response.json();
      console.log('📡 Backend status:', data);
      return data;
    } catch (error) {
      console.error('❌ Backend connection failed:', error);
      throw error;
    }
  },

  // Verify token validity
  verifyToken: async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        return false;
      }

      const response = await authAPI.verifyToken();
      return response.data.success;
    } catch (error) {
      console.error('❌ Token verification failed:', error);
      // Clear invalid token
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      return false;
    }
  }
};

export default authService;