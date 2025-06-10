// src/shared/components/Login.js

import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/authService';
import { FiUser, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

const Login = () => {
  const { user, login, loading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);

  const [backendStatus, setBackendStatus] = useState(null);

  // Clear error when component mounts or form changes
  useEffect(() => {
    clearError();
  }, [formData, clearError]);

  useEffect(() => {
    const testBackend = async () => {
      try {
        const status = await authService.testConnection();
        setBackendStatus(status);
      } catch (error) {
        setBackendStatus({ status: 'disconnected', error: error.message });
      }
    };
    testBackend();
  }, []);

  // Redirect if already logged in
  if (user) {
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (user.role === 'employee') {
      return <Navigate to="/employee" replace />;
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      return;
    }

    setLocalLoading(true);
    
    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      // Redirect will happen automatically via the useEffect above
    }
    
    setLocalLoading(false);
  };

  const handleDemoLogin = async (role) => {
    setLocalLoading(true);
    
    const demoCredentials = {
      admin: { email: 'admin@ecommerce.com', password: 'admin123' },
      employee: { email: 'employee@ecommerce.com', password: 'employee123' }
    };

    const credentials = demoCredentials[role];
    await login(credentials.email, credentials.password);
    
    setLocalLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-card">
          {/* Header */}
          <div className="login-header">
            <h1 className="login-title">E-Commerce System</h1>
            <p className="login-subtitle">Silakan login untuk melanjutkan</p>
          </div>

          {/* ✅ TAMBAHKAN DIV INI SETELAH login-header: */}
        <div className={`backend-status ${backendStatus?.status === 'healthy' ? 'connected' : 'disconnected'}`}>
          <span className="status-dot"></span>
          {backendStatus?.status === 'healthy' ? (
            <span>Backend Connected ✅</span>
          ) : (
            <span>Backend Disconnected ❌</span>
          )}
        </div>

          {/* Error Message */}
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                <FiUser className="form-icon" />
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="form-control"
                placeholder="Masukkan email Anda"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                <FiLock className="form-icon" />
                Password
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Masukkan password Anda"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg login-button"
              disabled={loading || localLoading}
            >
              {loading || localLoading ? 'Loading...' : 'Login'}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="demo-section">
            <div className="demo-divider">
              <span>Atau coba akun demo</span>
            </div>
            
            <div className="demo-buttons">
              <button
                type="button"
                className="btn btn-secondary demo-btn"
                onClick={() => handleDemoLogin('admin')}
                disabled={loading || localLoading}
              >
                Demo Admin
              </button>
              <button
                type="button"
                className="btn btn-warning demo-btn"
                onClick={() => handleDemoLogin('employee')}
                disabled={loading || localLoading}
              >
                Demo Employee
              </button>
            </div>

            <div className="demo-info">
              <small>
                <strong>Admin:</strong> admin@ecommerce.com | admin123<br/>
                <strong>Employee:</strong> employee@ecommerce.com | employee123
              </small>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .login-wrapper {
          width: 100%;
          max-width: 400px;
        }

        .login-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          overflow: hidden;
        }

        .login-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px 30px 30px;
          text-align: center;
        }

        .login-title {
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .login-subtitle {
          font-size: 0.95rem;
          opacity: 0.9;
          margin: 0;
        }

        .login-form {
          padding: 30px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
          font-weight: 500;
          color: #333;
        }

        .form-icon {
          margin-right: 8px;
          color: #667eea;
        }

        .password-input-wrapper {
          position: relative;
        }

        .password-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
          padding: 4px;
        }

        .password-toggle:hover {
          color: #333;
        }

        .login-button {
          width: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          padding: 12px;
          font-size: 1rem;
          font-weight: 600;
          margin-top: 10px;
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .demo-section {
          border-top: 1px solid #eee;
          padding: 20px 30px 30px;
        }

        .demo-divider {
          text-align: center;
          margin-bottom: 20px;
          position: relative;
        }

        .demo-divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: #eee;
        }

        .demo-divider span {
          background: white;
          padding: 0 15px;
          color: #666;
          font-size: 0.875rem;
        }

        .demo-buttons {
          display: flex;
          gap: 10px;
          margin-bottom: 15px;
        }

        .demo-btn {
          flex: 1;
          padding: 8px 12px;
          font-size: 0.875rem;
        }

        .demo-info {
          text-align: center;
          color: #666;
          font-size: 0.75rem;
          line-height: 1.4;
        }

        @media (max-width: 480px) {
          .login-container {
            padding: 10px;
          }
          
          .login-header {
            padding: 30px 20px 20px;
          }
          
          .login-form,
          .demo-section {
            padding: 20px;
          }
          
          .login-title {
            font-size: 1.5rem;
          }
        }

        .backend-status {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px 20px;
          margin: 0;
          font-size: 14px;
          font-weight: 500;
        }

        .backend-status.connected {
          background: #d4edda;
          color: #155724;
        }

        .backend-status.disconnected {
          background: #f8d7da;
          color: #721c24;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-right: 8px;
        }

        .backend-status.connected .status-dot {
          background: #28a745;
          animation: pulse 2s infinite;
        }

        .backend-status.disconnected .status-dot {
          background: #dc3545;
        }

        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Login;