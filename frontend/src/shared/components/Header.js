// src/shared/components/Header.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiShoppingCart, FiUser, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { cartAPI } from '../services/api';

const Header = ({ title, role }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (role === 'employee') {
      fetchCartCount();
    }
  }, [role]);

  const fetchCartCount = async () => {
    try {
      const response = await cartAPI.getCartSummary();
      setCartCount(response.data.data.total_items || 0);
    } catch (error) {
      console.error('Failed to fetch cart count:', error);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const getMenuItems = () => {
    if (role === 'employee') {
      return [
        { path: '/employee', label: 'Dashboard', icon: '🏠' },
        { path: '/employee/shop', label: 'Shop', icon: '🛍️' },
        { path: '/employee/cart', label: 'Cart', icon: '🛒', badge: cartCount },
        { path: '/employee/history', label: 'History', icon: '📋' },
      ];
    }
    return [];
  };

  const menuItems = getMenuItems();

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <button 
            className="menu-toggle"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <FiX /> : <FiMenu />}
          </button>
          <h1 className="header-title">{title}</h1>
        </div>

        <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
          <ul className="nav-list">
            {menuItems.map((item) => (
              <li key={item.path} className="nav-item">
                <Link 
                  to={item.path} 
                  className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                  {item.badge > 0 && (
                    <span className="nav-badge">{item.badge}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header-right">
          <div className="user-info">
            <FiUser />
            <span>{user?.nama}</span>
          </div>
          <button 
            className="logout-btn"
            onClick={handleLogout}
            title="Logout"
          >
            <FiLogOut />
          </button>
        </div>
      </div>

      <style jsx>{`
        .header {
          background: white;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          position: sticky;
          top: 0;
          z-index: 1000;
        }

        .header-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 80px;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .menu-toggle {
          display: none;
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #333;
        }

        .header-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #333;
          margin: 0;
        }

        .nav {
          flex: 1;
          margin: 0 2rem;
        }

        .nav-list {
          display: flex;
          list-style: none;
          margin: 0;
          padding: 0;
          gap: 0.5rem;
        }

        .nav-item {
          position: relative;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          text-decoration: none;
          color: #666;
          border-radius: 8px;
          transition: all 0.2s;
          font-weight: 500;
          position: relative;
        }

        .nav-link:hover {
          background: #f8f9fa;
          color: #333;
        }

        .nav-link.active {
          background: #007bff;
          color: white;
        }

        .nav-icon {
          font-size: 1rem;
        }

        .nav-label {
          font-size: 0.875rem;
        }

        .nav-badge {
          position: absolute;
          top: 0.25rem;
          right: 0.25rem;
          background: #dc3545;
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.125rem 0.375rem;
          border-radius: 10px;
          min-width: 18px;
          text-align: center;
          line-height: 1;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #666;
          font-weight: 500;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .logout-btn:hover {
          background: #c82333;
        }

        @media (max-width: 768px) {
          .header-container {
            padding: 0 0.5rem;
          }

          .menu-toggle {
            display: block;
          }

          .header-title {
            font-size: 1.25rem;
          }

          .nav {
            position: fixed;
            top: 80px;
            left: 0;
            right: 0;
            background: white;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            transform: translateY(-100%);
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            margin: 0;
            padding: 1rem;
          }

          .nav-open {
            transform: translateY(0);
            opacity: 1;
            visibility: visible;
          }

          .nav-list {
            flex-direction: column;
            gap: 0.5rem;
          }

          .nav-link {
            justify-content: flex-start;
            padding: 1rem;
            border-radius: 8px;
          }

          .user-info span {
            display: none;
          }

          .logout-btn {
            width: 36px;
            height: 36px;
          }
        }

        @media (max-width: 480px) {
          .header-container {
            height: 70px;
          }

          .nav {
            top: 70px;
          }

          .header-title {
            font-size: 1.125rem;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;