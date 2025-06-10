// src/admin/AdminApp.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../shared/contexts/AuthContext';
import AdminDashboard from './pages/AdminDashboard';
import ProductPage from './pages/ProductPage';
import UserPage from './pages/UserPage';
import TransactionManagement from './pages/TransactionManagement';
import ReportPage from './pages/ReportPage';

const AdminApp = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="admin-app">
      {/* Admin Header */}
      <header className="admin-header">
        <div className="header-container">
          <div className="header-left">
            <h1 className="admin-title">👨‍💼 Admin Dashboard</h1>
            <span className="welcome-text">Welcome, {user?.nama}!</span>
          </div>
          <div className="header-right">
            <div className="user-info">
              <span className="user-name">{user?.nama}</span>
              <span className="user-role">{user?.role}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="logout-btn"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Admin Navigation */}
      <nav className="admin-nav">
        <div className="nav-container">
          <a href="/admin" className="nav-link">
            📊 Dashboard
          </a>
          <a href="/admin/users" className="nav-link">
            👥 Users
          </a>
          <a href="/admin/products" className="nav-link">
            📦 Products
          </a>
          <a href="/admin/transactions" className="nav-link">
            💳 Transactions
          </a>
          <a href="/admin/reports" className="nav-link">
            📈 Reports
          </a>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <Routes>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UserPage />} />
          <Route path="products" element={<ProductPage />} />
          <Route path="transactions" element={<TransactionManagement />} />
          <Route path="reports" element={<ReportPage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </main>

      <style jsx>{`
        .admin-app {
          min-height: 100vh;
          background-color: #f8f9fa;
        }

        .admin-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 1rem 0;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .header-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-left {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .admin-title {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .welcome-text {
          font-size: 0.9rem;
          opacity: 0.9;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.25rem;
        }

        .user-name {
          font-weight: 600;
          font-size: 0.9rem;
        }

        .user-role {
          background: rgba(255,255,255,0.2);
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .logout-btn {
          background: rgba(255,255,255,0.15);
          color: white;
          border: 1px solid rgba(255,255,255,0.3);
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .logout-btn:hover {
          background: rgba(255,255,255,0.25);
          transform: translateY(-1px);
        }

        .admin-nav {
          background: white;
          border-bottom: 1px solid #e9ecef;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          gap: 2rem;
          overflow-x: auto;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 0;
          text-decoration: none;
          color: #666;
          font-weight: 500;
          white-space: nowrap;
          border-bottom: 2px solid transparent;
          transition: all 0.3s ease;
        }

        .nav-link:hover {
          color: #667eea;
          border-bottom-color: #667eea;
        }

        .main-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          min-height: calc(100vh - 140px);
        }

        @media (max-width: 768px) {
          .header-container {
            padding: 0 1rem;
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .header-right {
            flex-direction: column;
            gap: 0.5rem;
          }

          .nav-container {
            padding: 0 1rem;
            gap: 1rem;
          }

          .main-content {
            padding: 1rem;
          }

          .admin-title {
            font-size: 1.25rem;
          }
        }

        @media (max-width: 480px) {
          .nav-container {
            gap: 0.5rem;
          }

          .nav-link {
            padding: 0.75rem 0;
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminApp;