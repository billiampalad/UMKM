// src/shared/components/Login.js

import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/authService';

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
    <div style={styles.loginContainer}>
      {/* FontAwesome CDN */}
      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
      />
      
      {/* Background Elements */}
      <div style={styles.backgroundElement1}></div>
      <div style={styles.backgroundElement2}></div>
      <div style={styles.backgroundElement3}></div>
      <div style={styles.backgroundElement4}></div>
      
      <div style={styles.loginWrapper}>
        <div style={styles.loginCard}>
          {/* Header */}
          <div style={styles.loginHeader}>
            <div style={styles.logoContainer}>
              <div style={styles.logoIcon}>
                <i className="fas fa-store" style={styles.logoIconInner}></i>
              </div>
              <h1 style={styles.loginTitle}>E-Commerce System</h1>
              <p style={styles.loginSubtitle}>Welcome back! Please sign in to continue</p>
            </div>
            
            {/* Decorative elements */}
            <div style={styles.headerDecoration1}></div>
            <div style={styles.headerDecoration2}></div>
          </div>

          {/* Backend Status */}
          <div style={{
            ...styles.backendStatus,
            ...(backendStatus?.status === 'healthy' ? styles.statusConnected : styles.statusDisconnected)
          }}>
            <div style={{
              ...styles.statusDot,
              backgroundColor: backendStatus?.status === 'healthy' ? '#8FD14F' : '#ef4444'
            }}></div>
            <i className={`fas ${backendStatus?.status === 'healthy' ? 'fa-check-circle' : 'fa-exclamation-triangle'}`} 
               style={styles.statusIcon}></i>
            {backendStatus?.status === 'healthy' ? (
              <span>Backend Connected</span>
            ) : (
              <span>Backend Disconnected</span>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div style={styles.alertError}>
              <i className="fas fa-exclamation-triangle" style={styles.alertIcon}></i>
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} style={styles.loginForm}>
            <div style={styles.formGroup}>
              <label htmlFor="email" style={styles.formLabel}>
                <i className="fas fa-envelope" style={styles.formIcon}></i>
                Email Address
              </label>
              <div style={styles.inputWrapper}>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  style={styles.formControl}
                  placeholder="Enter your email address"
                  required
                />
                <div style={styles.inputFocus}></div>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="password" style={styles.formLabel}>
                <i className="fas fa-lock" style={styles.formIcon}></i>
                Password
              </label>
              <div style={styles.passwordInputWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  style={styles.formControl}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  style={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
                <div style={styles.inputFocus}></div>
              </div>
            </div>

            <button
              type="submit"
              style={{
                ...styles.loginButton,
                opacity: (loading || localLoading) ? 0.7 : 1,
                cursor: (loading || localLoading) ? 'not-allowed' : 'pointer'
              }}
              disabled={loading || localLoading}
            >
              {loading || localLoading ? (
                <>
                  <div style={styles.spinner}></div>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt" style={styles.buttonIcon}></i>
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Demo Section */}
          <div style={styles.demoSection}>
            <div style={styles.demoInfo}>
              <div style={styles.demoCredentials}>
                <div style={styles.credentialItem}>
                  <i className="fas fa-shield-alt" style={styles.credentialIcon}></i>
                  <div>
                    <strong>Admin:</strong> admin@ecommerce.com | admin123
                  </div>
                </div>
                <div style={styles.credentialItem}>
                  <i className="fas fa-user-tie" style={styles.credentialIcon}></i>
                  <div>
                    <strong>Employee:</strong> employee@ecommerce.com | employee123
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Styles object
const styles = {
  loginContainer: {
    height: '100vh', // ubah dari minHeight ke height
    background: 'linear-gradient(135deg, #F5F5F5 0%, #e5e7eb 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px', // kurangi dari 20px ke 10px
    position: 'relative',
    overflow: 'hidden',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  
  // Background Elements
  backgroundElement1: {
    position: 'absolute',
    top: '10%',
    left: '5%',
    width: '200px',
    height: '200px',
    background: 'linear-gradient(135deg, #604CC3, #8b5cf6)',
    borderRadius: '50%',
    opacity: 0.1,
    animation: 'float 15s ease-in-out infinite'
  },
  backgroundElement2: {
    position: 'absolute',
    top: '60%',
    right: '10%',
    width: '150px',
    height: '150px',
    background: 'linear-gradient(135deg, #FF6600, #ff8533)',
    borderRadius: '50%',
    opacity: 0.1,
    animation: 'float 12s ease-in-out infinite reverse'
  },
  backgroundElement3: {
    position: 'absolute',
    bottom: '20%',
    left: '15%',
    width: '100px',
    height: '100px',
    background: 'linear-gradient(135deg, #8FD14F, #7bc142)',
    borderRadius: '50%',
    opacity: 0.1,
    animation: 'float 10s ease-in-out infinite'
  },
  backgroundElement4: {
    position: 'absolute',
    top: '30%',
    right: '30%',
    width: '80px',
    height: '80px',
    background: 'linear-gradient(135deg, #604CC3, #FF6600)',
    borderRadius: '50%',
    opacity: 0.05,
    animation: 'float 18s ease-in-out infinite reverse'
  },
  
  loginWrapper: {
    width: '100%',
    maxWidth: '450px',
    position: 'relative',
    zIndex: 10
  },
  
  loginCard: {
    background: 'white',
    borderRadius: '24px',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
    overflow: 'hidden',
    border: '1px solid #e5e7eb',
    position: 'relative'
  },
  
  loginHeader: {
    background: 'linear-gradient(135deg, #604CC3 0%, #8b5cf6 100%)',
    color: 'white',
    padding: '48px 32px 32px',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden'
  },
  
  logoContainer: {
    position: 'relative',
    zIndex: 10
  },
  
  logoIcon: {
    width: '80px',
    height: '80px',
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
    backdropFilter: 'blur(10px)',
    border: '2px solid rgba(255, 255, 255, 0.3)'
  },
  
  logoIconInner: {
    fontSize: '2.5rem',
    color: 'white'
  },
  
  loginTitle: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '8px',
    margin: '0 0 8px 0'
  },
  
  loginSubtitle: {
    fontSize: '1rem',
    opacity: 0.9,
    margin: 0,
    fontWeight: '400'
  },
  
  headerDecoration1: {
    position: 'absolute',
    top: '-50px',
    right: '-50px',
    width: '100px',
    height: '100px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '50%'
  },
  
  headerDecoration2: {
    position: 'absolute',
    bottom: '-30px',
    left: '-30px',
    width: '60px',
    height: '60px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '50%'
  },
  
  // Backend Status
  backendStatus: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px 24px',
    fontSize: '0.875rem',
    fontWeight: '600',
    gap: '8px',
    position: 'relative'
  },
  
  statusConnected: {
    background: 'rgba(143, 209, 79, 0.2)',
    color: '#8FD14F',
    borderBottom: '2px solid rgba(143, 209, 79, 0.3)'
  },
  
  statusDisconnected: {
    background: 'rgba(239, 68, 68, 0.2)',
    color: '#ef4444',
    borderBottom: '2px solid rgba(239, 68, 68, 0.3)'
  },
  
  statusDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    animation: 'pulse 2s infinite'
  },
  
  statusIcon: {
    fontSize: '1rem'
  },
  
  // Alert
  alertError: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 24px',
    background: 'rgba(239, 68, 68, 0.2)',
    color: '#ef4444',
    fontSize: '0.875rem',
    fontWeight: '500',
    borderBottom: '1px solid rgba(239, 68, 68, 0.3)'
  },
  
  alertIcon: {
    fontSize: '1rem'
  },
  
  // Form
  loginForm: {
    padding: '32px'
  },
  
  formGroup: {
    marginBottom: '24px'
  },
  
  formLabel: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#333',
    fontSize: '0.875rem',
    gap: '8px'
  },
  
  formIcon: {
    color: '#604CC3',
    fontSize: '1rem'
  },
  
  inputWrapper: {
    position: 'relative'
  },
  
  passwordInputWrapper: {
    position: 'relative'
  },
  
  formControl: {
    width: '100%',
    padding: '14px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    outline: 'none',
    background: '#f8f9fa',
    boxSizing: 'border-box'
  },
  
  inputFocus: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: 'linear-gradient(135deg, #604CC3, #FF6600)',
    transform: 'scaleX(0)',
    transformOrigin: 'center',
    transition: 'transform 0.3s ease'
  },
  
  passwordToggle: {
    position: 'absolute',
    right: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: '#666',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '6px',
    transition: 'all 0.3s ease',
    fontSize: '1rem'
  },
  
  loginButton: {
    width: '100%',
    background: 'linear-gradient(135deg, #604CC3 0%, #8b5cf6 100%)',
    border: 'none',
    padding: '16px',
    borderRadius: '12px',
    color: 'white',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '8px'
  },
  
  buttonIcon: {
    fontSize: '1rem'
  },
  
  spinner: {
    width: '20px',
    height: '20px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  
  // Demo Section
  demoSection: {
    borderTop: '1px solid #f0f0f0',
    padding: '24px 32px 32px'
  },
  
  demoDivider: {
    textAlign: 'center',
    marginBottom: '24px',
    position: 'relative'
  },
  
  dividerText: {
    background: 'white',
    padding: '0 16px',
    color: '#666',
    fontSize: '0.875rem',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px'
  },
  
  dividerIcon: {
    color: '#FF6600'
  },
  
  demoButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '20px'
  },
  
  demoBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 20px',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '0.875rem',
    textAlign: 'left',
    fontWeight: '500'
  },
  
  demoBtnAdmin: {
    background: 'linear-gradient(135deg, rgba(96, 76, 195, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
    border: '2px solid rgba(96, 76, 195, 0.2)',
    color: '#604CC3'
  },
  
  demoBtnEmployee: {
    background: 'linear-gradient(135deg, rgba(255, 102, 0, 0.1) 0%, rgba(255, 133, 51, 0.1) 100%)',
    border: '2px solid rgba(255, 102, 0, 0.2)',
    color: '#FF6600'
  },
  
  demoBtnIcon: {
    fontSize: '1.5rem',
    flexShrink: 0
  },
  
  demoBtnTitle: {
    fontWeight: 'bold',
    marginBottom: '2px'
  },
  
  demoBtnSubtitle: {
    fontSize: '0.75rem',
    opacity: 0.8
  },
  
  // Demo Info
  demoInfo: {
    background: '#f8f9fa',
    borderRadius: '12px',
    padding: '16px',
    border: '1px solid #e9ecef'
  },
  
  demoCredentials: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  
  credentialItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.75rem',
    color: '#666'
  },
  
  credentialIcon: {
    color: '#604CC3',
    fontSize: '0.875rem',
    width: '16px'
  },
  
  // Footer
  footer: {
    textAlign: 'center',
    marginTop: '24px'
  },
  
  footerText: {
    fontSize: '0.875rem',
    color: '#666',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    flexWrap: 'wrap'
  },
  
  footerIcon: {
    fontSize: '0.75rem'
  },
  
  heartIcon: {
    color: '#ff6b6b',
    fontSize: '0.875rem',
    margin: '0 2px'
  }
};

// CSS Animations
const cssAnimations = `
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(180deg); }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(1.1); }
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .login-container .form-control:focus {
    border-color: #604CC3 !important;
    background: white !important;
    box-shadow: 0 0 0 3px rgba(96, 76, 195, 0.1) !important;
  }

  .login-container .form-control:focus + .input-focus {
    transform: scaleX(1) !important;
  }

  .login-container .password-toggle:hover {
    background: rgba(96, 76, 195, 0.1) !important;
    color: #604CC3 !important;
  }

  .login-container .login-button:hover:not(:disabled) {
    transform: translateY(-2px) !important;
    box-shadow: 0 8px 25px rgba(96, 76, 195, 0.3) !important;
  }

  .login-container .demo-btn:hover:not(:disabled) {
    transform: translateY(-2px) !important;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1) !important;
  }

  .login-container .demo-btn-admin:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(96, 76, 195, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%) !important;
    border-color: rgba(96, 76, 195, 0.3) !important;
  }

  .login-container .demo-btn-employee:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(255, 102, 0, 0.15) 0%, rgba(255, 133, 51, 0.15) 100%) !important;
    border-color: rgba(255, 102, 0, 0.3) !important;
  }

  @media (max-width: 480px) {
    .login-container {
      padding: 10px !important;
    }
    
    .login-container .login-header {
      padding: 32px 20px 24px !important;
    }
    
    .login-container .login-form,
    .login-container .demo-section {
      padding: 24px 20px !important;
    }
    
    .login-container .login-title {
      font-size: 1.5rem !important;
    }
    
    .login-container .logo-icon {
      width: 60px !important;
      height: 60px !important;
      margin-bottom: 16px !important;
    }
    
    .login-container .logo-icon-inner {
      font-size: 2rem !important;
    }
    
    .login-container .demo-buttons {
      gap: 8px !important;
    }
  }
`;

// Inject CSS
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = cssAnimations;
  document.head.appendChild(styleSheet);
}

export default Login;