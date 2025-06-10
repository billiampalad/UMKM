// src/admin/pages/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../shared/contexts/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    products: { total_products: 0 },
    transactions: { overview: { total_transactions: 0, total_revenue: 0 } },
    totalUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [salesData, setSalesData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Mock data function - replace with real API calls when available
  const generateMockData = () => {
    // Generate mock transactions
    const mockTransactions = Array.from({ length: 5 }, (_, i) => ({
      id_transaksi: `TRX${String(i + 1).padStart(3, '0')}`,
      user_nama: `Customer ${i + 1}`,
      tanggal_transaksi: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      total_harga: Math.floor(Math.random() * 5000000) + 500000,
      status_pembayaran: ['completed', 'pending', 'processing'][Math.floor(Math.random() * 3)]
    }));

    // Generate mock low stock products
    const mockLowStock = Array.from({ length: 3 }, (_, i) => ({
      id_product: i + 1,
      nama_product: `Product ${i + 1}`,
      harga: Math.floor(Math.random() * 1000000) + 100000,
      stock: Math.floor(Math.random() * 5) + 1
    }));

    // Generate mock sales data
    const mockSalesData = Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      daily_revenue: Math.floor(Math.random() * 10000000) + 1000000
    }));

    return {
      transactions: mockTransactions,
      lowStock: mockLowStock,
      salesData: mockSalesData.reverse(),
      stats: {
        products: { total_products: 25 },
        transactions: { 
          overview: { 
            total_transactions: 150, 
            total_revenue: 75000000 
          } 
        },
        totalUsers: 45
      }
    };
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For now, use mock data. Replace this with actual API calls when available
      const mockData = generateMockData();
      
      setStats(mockData.stats);
      setRecentTransactions(mockData.transactions);
      setLowStockProducts(mockData.lowStock);
      setSalesData(mockData.salesData);
      
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const StatCard = ({ title, value, icon, color, link }) => (
    <div className={`stat-card ${color}`}>
      <div className="stat-content">
        <div className="stat-header">
          <div className="stat-icon">
            <span>{icon}</span>
          </div>
          <div className="stat-info">
            <h3 className="stat-value">{value}</h3>
            <p className="stat-title">{title}</p>
          </div>
        </div>
      </div>
      {link && (
        <Link to={link} className="stat-link">
          👁️ View Details
        </Link>
      )}
    </div>
  );

  const QuickActions = () => (
    <div className="quick-actions-section">
      <h2 className="section-title">Quick Actions</h2>
      <div className="quick-actions-grid">
        <Link to="/admin/products" className="quick-action-item">
          <span className="action-icon">➕</span>
          <span>Add Product</span>
        </Link>
        <Link to="/admin/users" className="quick-action-item">
          <span className="action-icon">👥</span>
          <span>Manage Users</span>
        </Link>
        <Link to="/admin/reports" className="quick-action-item">
          <span className="action-icon">📊</span>
          <span>View Reports</span>
        </Link>
        <button onClick={refreshData} className="quick-action-item" disabled={refreshing}>
          <span className={`action-icon ${refreshing ? 'spinning' : ''}`}>🔄</span>
          <span>Refresh Data</span>
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="alert alert-error">
          <p>❌ {error}</p>
          <button onClick={fetchDashboardData} className="btn btn-primary btn-sm">
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-text">
            <h1 className="dashboard-title">📊 Admin Dashboard</h1>
            <p className="dashboard-subtitle">Welcome back, {user?.nama}! Here's what's happening in your store.</p>
          </div>
          <div className="header-actions">
            <button onClick={refreshData} className="btn btn-secondary" disabled={refreshing}>
              <span className={refreshing ? 'spinning' : ''}>🔄</span>
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <Link to="/admin/products" className="btn btn-primary">
              ➕ Add Product
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <StatCard
          title="Total Products"
          value={stats?.products?.total_products || 0}
          icon="📦"
          color="blue"
          link="/admin/products"
        />
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon="👥"
          color="green"
          link="/admin/users"
        />
        <StatCard
          title="Monthly Transactions"
          value={stats?.transactions?.overview?.total_transactions || 0}
          icon="🛒"
          color="purple"
          link="/admin/transactions"
        />
        <StatCard
          title="Monthly Revenue"
          value={`Rp ${(stats?.transactions?.overview?.total_revenue || 0).toLocaleString()}`}
          icon="💰"
          color="orange"
          link="/admin/reports"
        />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      <div className="dashboard-content">
        {/* Recent Transactions */}
        <div className="dashboard-section">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">
                📈 Recent Transactions
              </h2>
              <Link to="/admin/transactions" className="btn btn-secondary btn-sm">
                👁️ View All
              </Link>
            </div>
            <div className="transactions-list">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => (
                  <div key={transaction.id_transaksi} className="transaction-item">
                    <div className="transaction-info">
                      <div className="transaction-id">
                        #{transaction.id_transaksi}
                      </div>
                      <div className="transaction-user">
                        {transaction.user_nama}
                      </div>
                      <div className="transaction-date">
                        {new Date(transaction.tanggal_transaksi).toLocaleDateString('id-ID')}
                      </div>
                    </div>
                    <div className="transaction-details">
                      <div className="transaction-amount">
                        Rp {transaction.total_harga.toLocaleString()}
                      </div>
                      <div className={`transaction-status ${transaction.status_pembayaran}`}>
                        {transaction.status_pembayaran}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data">
                  <span className="empty-icon">🛒</span>
                  <p>No recent transactions</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="dashboard-section">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">
                ⚠️ Low Stock Alert
              </h2>
              <Link to="/admin/products" className="btn btn-warning btn-sm">
                📦 Manage Stock
              </Link>
            </div>
            <div className="low-stock-list">
              {lowStockProducts.length > 0 ? (
                lowStockProducts.map((product) => (
                  <div key={product.id_product} className="low-stock-item">
                    <div className="product-info">
                      <div className="product-name">{product.nama_product}</div>
                      <div className="product-price">
                        Rp {product.harga.toLocaleString()}
                      </div>
                    </div>
                    <div className="stock-info">
                      <span className={`stock-badge ${product.stock === 0 ? 'out-of-stock' : 'low-stock'}`}>
                        {product.stock === 0 ? 'Out of Stock' : `${product.stock} left`}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data">
                  <span className="empty-icon">📦</span>
                  <p>All products have sufficient stock</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sales Chart */}
      {salesData.length > 0 && (
        <div className="sales-chart-section">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">
                📊 Sales Overview (Last 7 Days)
              </h2>
              <Link to="/admin/reports" className="btn btn-secondary btn-sm">
                📥 Export Report
              </Link>
            </div>
            <div className="chart-container">
              <div className="simple-chart">
                {salesData.map((data, index) => (
                  <div key={index} className="chart-bar">
                    <div 
                      className="bar" 
                      style={{ 
                        height: `${(data.daily_revenue / Math.max(...salesData.map(d => d.daily_revenue))) * 100}%` 
                      }}
                    ></div>
                    <div className="bar-label">
                      {new Date(data.date).toLocaleDateString('id-ID', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="bar-value">
                      Rp {(data.daily_revenue / 1000000).toFixed(1)}M
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-dashboard {
          padding: 0;
          min-height: 100vh;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
          text-align: center;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        .error-container {
          padding: 2rem;
          text-align: center;
        }

        .alert {
          padding: 1rem 1.5rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          max-width: 400px;
          margin: 0 auto;
        }

        .alert-error {
          background: #fee2e2;
          border: 1px solid #fecaca;
          color: #991b1b;
        }

        .dashboard-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 16px;
          padding: 2.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .header-text {
          flex: 1;
        }

        .dashboard-title {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .dashboard-subtitle {
          font-size: 1.125rem;
          opacity: 0.9;
          margin: 0;
          font-weight: 300;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .btn {
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
          padding: 10px 20px;
          font-size: 14px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-primary {
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          backdrop-filter: blur(10px);
        }

        .btn-primary:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.25);
          transform: translateY(-2px);
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #5a6268;
          transform: translateY(-1px);
        }

        .btn-warning {
          background: #ffc107;
          color: #212529;
        }

        .btn-sm {
          padding: 6px 12px;
          font-size: 12px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          border-left: 4px solid;
        }

        .stat-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
        }

        .stat-card.blue { border-left-color: #3b82f6; }
        .stat-card.green { border-left-color: #10b981; }
        .stat-card.purple { border-left-color: #8b5cf6; }
        .stat-card.orange { border-left-color: #f59e0b; }

        .stat-content {
          position: relative;
          z-index: 1;
          margin-bottom: 1rem;
        }

        .stat-header {
          display: flex;
          align-items: flex-start;
          gap: 1.5rem;
        }

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.75rem;
          color: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .stat-card.blue .stat-icon { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
        .stat-card.green .stat-icon { background: linear-gradient(135deg, #10b981, #047857); }
        .stat-card.purple .stat-icon { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
        .stat-card.orange .stat-icon { background: linear-gradient(135deg, #f59e0b, #d97706); }

        .stat-info {
          flex: 1;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          color: #1f2937;
          margin: 0 0 0.25rem 0;
          line-height: 1;
        }

        .stat-title {
          color: #6b7280;
          font-size: 0.875rem;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
        }

        .stat-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #6366f1;
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 600;
          padding-top: 1rem;
          border-top: 1px solid #f3f4f6;
          transition: color 0.2s;
        }

        .stat-link:hover {
          color: #4f46e5;
        }

        .quick-actions-section {
          margin-bottom: 2rem;
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 1.5rem;
        }

        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .quick-action-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          padding: 1.5rem;
          background: white;
          border-radius: 12px;
          text-decoration: none;
          color: #374151;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          border: 1px solid #e5e7eb;
        }

        .quick-action-item:hover:not(:disabled) {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
          border-color: #6366f1;
        }

        .action-icon {
          font-size: 1.5rem;
          color: #6366f1;
        }

        .dashboard-content {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          overflow: hidden;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #f3f4f6;
          background: #fafbfc;
        }

        .card-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
        }

        .transactions-list,
        .low-stock-list {
          padding: 0;
          max-height: 400px;
          overflow-y: auto;
        }

        .transaction-item,
        .low-stock-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #f3f4f6;
        }

        .transaction-item:hover,
        .low-stock-item:hover {
          background-color: #f9fafb;
        }

        .transaction-info,
        .product-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .transaction-id,
        .product-name {
          font-weight: 700;
          color: #1f2937;
          font-size: 0.875rem;
        }

        .transaction-user,
        .transaction-date,
        .product-price {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .transaction-details,
        .stock-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.5rem;
        }

        .transaction-amount {
          font-weight: 700;
          color: #1f2937;
          font-size: 0.875rem;
        }

        .transaction-status,
        .stock-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.675rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .transaction-status.completed {
          background: #d1fae5;
          color: #065f46;
        }

        .transaction-status.pending {
          background: #fef3c7;
          color: #92400e;
        }

        .transaction-status.processing {
          background: #e0e7ff;
          color: #3730a3;
        }

        .stock-badge.low-stock {
          background: #fef3c7;
          color: #92400e;
        }

        .stock-badge.out-of-stock {
          background: #fee2e2;
          color: #991b1b;
        }

        .no-data {
          padding: 3rem 1.5rem;
          text-align: center;
          color: #6b7280;
        }

        .empty-icon {
          font-size: 2.5rem;
          color: #d1d5db;
          margin-bottom: 1rem;
          display: block;
        }

        .sales-chart-section {
          margin-bottom: 2rem;
        }

        .chart-container {
          padding: 2rem;
        }

        .simple-chart {
          display: flex;
          align-items: flex-end;
          gap: 1rem;
          height: 200px;
          padding: 1rem 0;
        }

        .chart-bar {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .bar {
          width: 100%;
          background: linear-gradient(to top, #3b82f6, #60a5fa);
          border-radius: 4px 4px 0 0;
          min-height: 4px;
          transition: all 0.3s ease;
        }

        .chart-bar:hover .bar {
          background: linear-gradient(to top, #1d4ed8, #3b82f6);
        }

        .bar-label {
          font-size: 0.75rem;
          color: #6b7280;
          font-weight: 500;
        }

        .bar-value {
          font-size: 0.675rem;
          color: #9ca3af;
          font-weight: 600;
        }

        @media (max-width: 1200px) {
          .dashboard-content {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .dashboard-header {
            padding: 2rem 1.5rem;
          }

          .header-content {
            flex-direction: column;
            gap: 1.5rem;
          }

          .dashboard-title {
            font-size: 2rem;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .quick-actions-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;