// src/shared/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing authentication...');
        
        const currentUser = authService.getCurrentUser();
        const token = authService.getToken();
        
        if (currentUser && token) {
          console.log('✅ Found existing auth data:', currentUser);
          setUser(currentUser);
          
          // Verify token is still valid
          const isValid = await authService.verifyToken();
          if (!isValid) {
            console.log('❌ Token invalid, clearing auth data');
            setUser(null);
            authService.logout();
          }
        } else {
          console.log('📭 No existing auth data found');
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔐 AuthContext: Attempting login...');
      
      const result = await authService.login(email, password);
      
      if (result.success) {
        setUser(result.data.user);
        console.log('✅ AuthContext: Login successful');
        return { success: true };
      } else {
        throw new Error(result.message || 'Login failed');
      }
    } catch (error) {
      const errorMessage = error.message || 'Login failed. Please try again.';
      console.error('❌ AuthContext: Login error:', errorMessage);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      console.log('🚪 AuthContext: Logging out...');
      
      await authService.logout();
      setUser(null);
      setError('');
    } catch (error) {
      console.error('❌ AuthContext: Logout error:', error);
      // Force logout even if API fails
      setUser(null);
      setError('');
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError('');
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    clearError,
    isAuthenticated: !!user,
    hasRole: (role) => user && user.role === role
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;