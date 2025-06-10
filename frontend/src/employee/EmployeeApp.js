// src/employee/EmployeeApp.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from '../shared/components/Header';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ShopPage from './pages/ShopPage';
import CartPage from './pages/CartPage';
import HistoryPage from './pages/HistoryPage';
// import Profile from './pages/Profile';

const EmployeeApp = () => {
  return (
    <div className="employee-app">
      <Header title="Employee Portal" role="employee" />
      
      <main className="main-content">
        <div className="container">
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
      </main>

      <style jsx>{`
        .employee-app {
          min-height: 100vh;
          background-color: #f8f9fa;
        }

        .main-content {
          padding: 2rem 0;
          min-height: calc(100vh - 80px);
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        @media (max-width: 768px) {
          .main-content {
            padding: 1rem 0;
          }
          
          .container {
            padding: 0 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default EmployeeApp;