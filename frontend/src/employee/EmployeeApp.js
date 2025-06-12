// src/employee/EmployeeApp.js
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from '../shared/components/Header';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ShopPage from './pages/ShopPage';
import CartPage from './pages/CartPage';
import HistoryPage from './pages/HistoryPage';
// import Profile from './pages/Profile';

const EmployeeApp = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  // Page transition loading effect
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('dashboard') || path === '/employee' || path === '/employee/') {
      return 'Dashboard';
    } else if (path.includes('shop') || path.includes('products')) {
      return 'Shop';
    } else if (path.includes('cart')) {
      return 'Shopping Cart';
    } else if (path.includes('history')) {
      return 'Order History';
    } else if (path.includes('profile')) {
      return 'Profile';
    }
    return 'Employee Portal';
  };

  // Loading component
  const LoadingOverlay = () => (
    <div style={styles.loadingOverlay}>
      <div style={styles.loadingSpinner}>
        <div style={styles.spinner}></div>
      </div>
    </div>
  );

  return (
    <div style={styles.employeeApp}>
      {/* FontAwesome CDN */}
      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
      />
      
      <Header title="Employee Portal" role="employee" />
      
      {/* Page Title Bar */}
      <div style={styles.pageTitleBar}>
        <div style={styles.container}>
          <div style={styles.breadcrumb}>
            <i className="fas fa-home" style={styles.breadcrumbIcon}></i>
            <span style={styles.breadcrumbText}>Employee</span>
            <i className="fas fa-chevron-right" style={styles.breadcrumbSeparator}></i>
            <span style={styles.currentPage}>{getPageTitle()}</span>
          </div>
        </div>
      </div>
      
      <main style={styles.mainContent}>
        <div style={styles.container}>
          {/* Loading overlay during page transitions */}
          {isLoading && <LoadingOverlay />}
          
          <div style={styles.contentWrapper}>
            <Routes>
              <Route index element={<EmployeeDashboard />} />
              <Route path="dashboard" element={<EmployeeDashboard />} />
              <Route path="shop" element={<ShopPage />} />
              <Route path="products" element={<ShopPage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="history" element={<HistoryPage />} />
              {/* <Route path="profile" element={<Profile />} /> */}
              <Route path="*" element={<Navigate to="/employee" replace />} />
            </Routes>
          </div>
        </div>
      </main>

      {/* Quick Action FAB */}
      <div style={styles.fabContainer}>
        <div style={styles.fab}>
          <i className="fas fa-plus" style={styles.fabIcon}></i>
        </div>
        <div style={styles.fabMenu}>
          <a href="/employee/shop" style={styles.fabMenuItem}>
            <i className="fas fa-shopping-bag" style={styles.fabMenuIcon}></i>
            <span style={styles.fabMenuText}>Shop</span>
          </a>
          <a href="/employee/cart" style={styles.fabMenuItem}>
            <i className="fas fa-shopping-cart" style={styles.fabMenuIcon}></i>
            <span style={styles.fabMenuText}>Cart</span>
          </a>
          <a href="/employee/history" style={styles.fabMenuItem}>
            <i className="fas fa-history" style={styles.fabMenuIcon}></i>
            <span style={styles.fabMenuText}>History</span>
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.container}>
          <div style={styles.footerContent}>
            <div style={styles.footerLeft}>
              <p style={styles.footerText}>
                © 2024 Employee Portal. Made with <i className="fas fa-heart" style={styles.heartIcon}></i> for our team
              </p>
            </div>
            <div style={styles.footerRight}>
              <div style={styles.socialLinks}>
                <a href="#" style={styles.socialLink}>
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" style={styles.socialLink}>
                  <i className="fab fa-linkedin"></i>
                </a>
                <a href="#" style={styles.socialLink}>
                  <i className="fab fa-instagram"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Styles object
const styles = {
  employeeApp: {
    minHeight: '100vh',
    backgroundColor: '#F5F5F5',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    position: 'relative'
  },
  pageTitleBar: {
    background: 'white',
    borderBottom: '1px solid #e5e7eb',
    padding: '16px 0',
    position: 'sticky',
    top: '70px',
    zIndex: 100,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.875rem'
  },
  breadcrumbIcon: {
    color: '#604CC3',
    fontSize: '1rem'
  },
  breadcrumbText: {
    color: '#666'
  },
  breadcrumbSeparator: {
    color: '#d1d5db',
    fontSize: '0.75rem'
  },
  currentPage: {
    color: '#333',
    fontWeight: '600'
  },
  mainContent: {
    padding: '32px 0',
    minHeight: 'calc(100vh - 180px)',
    position: 'relative'
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 24px'
  },
  contentWrapper: {
    position: 'relative',
    minHeight: '500px'
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(245, 245, 245, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    borderRadius: '16px'
  },
  loadingSpinner: {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #604CC3',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  fabContainer: {
    position: 'fixed',
    bottom: '32px',
    right: '32px',
    zIndex: 1000
  },
  fab: {
    width: '56px',
    height: '56px',
    background: 'linear-gradient(135deg, #FF6600 0%, #ff8533 100%)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 8px 25px rgba(255, 102, 0, 0.3)',
    transition: 'all 0.3s ease',
    position: 'relative'
  },
  fabIcon: {
    color: 'white',
    fontSize: '1.25rem',
    transition: 'transform 0.3s ease'
  },
  fabMenu: {
    position: 'absolute',
    bottom: '70px',
    right: '0',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    opacity: 0,
    visibility: 'hidden',
    transform: 'translateY(20px)',
    transition: 'all 0.3s ease'
  },
  fabMenuItem: {
    background: 'white',
    borderRadius: '28px',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textDecoration: 'none',
    color: '#333',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    whiteSpace: 'nowrap'
  },
  fabMenuIcon: {
    color: '#604CC3',
    fontSize: '1rem'
  },
  fabMenuText: {
    fontSize: '0.875rem',
    fontWeight: '500'
  },
  footer: {
    background: 'linear-gradient(135deg, #604CC3 0%, #8b5cf6 100%)',
    color: 'white',
    padding: '24px 0',
    marginTop: 'auto'
  },
  footerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px'
  },
  footerLeft: {
    flex: 1
  },
  footerText: {
    margin: 0,
    fontSize: '0.875rem',
    opacity: 0.9,
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  heartIcon: {
    color: '#ff6b6b',
    fontSize: '0.875rem'
  },
  footerRight: {
    display: 'flex',
    alignItems: 'center'
  },
  socialLinks: {
    display: 'flex',
    gap: '16px'
  },
  socialLink: {
    color: 'white',
    fontSize: '1.125rem',
    opacity: 0.8,
    transition: 'all 0.3s ease',
    textDecoration: 'none'
  },

  // Media queries simulation
  '@media (max-width: 768px)': {
    container: {
      padding: '0 16px'
    },
    mainContent: {
      padding: '16px 0'
    },
    pageTitleBar: {
      top: '60px'
    },
    fabContainer: {
      bottom: '16px',
      right: '16px'
    },
    footerContent: {
      flexDirection: 'column',
      textAlign: 'center',
      gap: '12px'
    }
  }
};

// Add CSS animations
const cssAnimations = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .employee-app .fab-container:hover .fab-menu {
    opacity: 1 !important;
    visibility: visible !important;
    transform: translateY(0) !important;
  }

  .employee-app .fab:hover {
    transform: scale(1.1) !important;
    box-shadow: 0 12px 35px rgba(255, 102, 0, 0.4) !important;
  }

  .employee-app .fab:hover .fab-icon {
    transform: rotate(45deg) !important;
  }

  .employee-app .fab-menu-item:hover {
    background: #f8f9fa !important;
    transform: translateX(-4px) !important;
  }

  .employee-app .social-link:hover {
    opacity: 1 !important;
    transform: translateY(-2px) !important;
  }

  @media (max-width: 768px) {
    .employee-app .container {
      padding: 0 16px !important;
    }
    
    .employee-app .main-content {
      padding: 16px 0 !important;
    }
    
    .employee-app .page-title-bar {
      top: 60px !important;
    }
    
    .employee-app .fab-container {
      bottom: 16px !important;
      right: 16px !important;
    }
    
    .employee-app .footer-content {
      flex-direction: column !important;
      text-align: center !important;
      gap: 12px !important;
    }
    
    .employee-app .breadcrumb {
      font-size: 0.75rem !important;
    }
  }
`;

// Inject CSS
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = cssAnimations;
  document.head.appendChild(styleSheet);
}

export default EmployeeApp;