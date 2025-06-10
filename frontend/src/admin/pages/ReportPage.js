// src/admin/pages/ReportPage.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../shared/contexts/AuthContext';

const ReportPage = () => {
    const { user } = useAuth();
    const [reportData, setReportData] = useState({
        sales: [],
        users: [],
        products: [],
        transactions: []
    });
    const [loading, setLoading] = useState(false);
    const [selectedReport, setSelectedReport] = useState('sales');
    const [dateFilter, setDateFilter] = useState({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
        endDate: new Date().toISOString().split('T')[0] // today
    });
    const [stats, setStats] = useState({
        totalSales: 0,
        totalUsers: 0,
        totalProducts: 0,
        totalTransactions: 0,
        averageOrderValue: 0,
        topSellingProduct: '',
        salesGrowth: 0
    });

    // Mock data generator (replace with actual API calls)
    const generateMockData = () => {
        const salesData = [];
        const userData = [];
        const productData = [];
        const transactionData = [];

        // Generate sales data for the last 30 days
        for (let i = 29; i >= 0; i--) {
            const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
            salesData.push({
                date: date.toISOString().split('T')[0],
                amount: Math.floor(Math.random() * 5000000) + 1000000, // 1M - 6M
                orders: Math.floor(Math.random() * 50) + 10,
                customers: Math.floor(Math.random() * 30) + 5
            });
        }

        // Generate user registration data
        for (let i = 29; i >= 0; i--) {
            const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
            userData.push({
                date: date.toISOString().split('T')[0],
                newUsers: Math.floor(Math.random() * 20) + 1,
                activeUsers: Math.floor(Math.random() * 100) + 50,
                role: Math.random() > 0.8 ? 'admin' : 'employee'
            });
        }

        // Generate product data
        const products = ['Laptop Dell', 'iPhone 15', 'Samsung TV', 'Nike Shoes', 'Sony Headphones'];
        products.forEach((product, index) => {
            productData.push({
                id: index + 1,
                name: product,
                sold: Math.floor(Math.random() * 100) + 10,
                revenue: Math.floor(Math.random() * 10000000) + 1000000,
                stock: Math.floor(Math.random() * 50) + 5,
                category: ['Electronics', 'Fashion', 'Sports'][Math.floor(Math.random() * 3)]
            });
        });

        // Generate transaction data
        for (let i = 0; i < 50; i++) {
            const date = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
            transactionData.push({
                id: `TRX${String(i + 1).padStart(3, '0')}`,
                date: date.toISOString().split('T')[0],
                amount: Math.floor(Math.random() * 2000000) + 100000,
                status: ['completed', 'pending', 'cancelled'][Math.floor(Math.random() * 3)],
                customer: `Customer ${i + 1}`,
                product: products[Math.floor(Math.random() * products.length)]
            });
        }

        return { salesData, userData, productData, transactionData };
    };

    // Calculate statistics
    const calculateStats = (data) => {
        const { salesData, userData, productData, transactionData } = data;

        const totalSales = salesData.reduce((sum, day) => sum + day.amount, 0);
        const totalUsers = userData.reduce((sum, day) => sum + day.newUsers, 0);
        const totalProducts = productData.length;
        const totalTransactions = transactionData.filter(t => t.status === 'completed').length;
        const averageOrderValue = totalSales / (salesData.reduce((sum, day) => sum + day.orders, 0) || 1);
        const topSellingProduct = productData.sort((a, b) => b.sold - a.sold)[0]?.name || 'N/A';

        // Calculate growth (compare last 15 days vs previous 15 days)
        const recentSales = salesData.slice(-15).reduce((sum, day) => sum + day.amount, 0);
        const previousSales = salesData.slice(-30, -15).reduce((sum, day) => sum + day.amount, 0);
        const salesGrowth = previousSales > 0 ? ((recentSales - previousSales) / previousSales * 100) : 0;

        return {
            totalSales,
            totalUsers,
            totalProducts,
            totalTransactions,
            averageOrderValue,
            topSellingProduct,
            salesGrowth
        };
    };

    // Load report data
    const loadReportData = async () => {
        setLoading(true);
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            const mockData = generateMockData();
            setReportData({
                sales: mockData.salesData,
                users: mockData.userData,
                products: mockData.productData,
                transactions: mockData.transactionData
            });

            const calculatedStats = calculateStats(mockData);
            setStats(calculatedStats);

        } catch (error) {
            console.error('Error loading report data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Export report to CSV
    const exportToCSV = (data, filename) => {
        if (!data || data.length === 0) return;

        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => {
                const value = row[header];
                return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
            }).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    useEffect(() => {
        loadReportData();
    }, [dateFilter]);

    const renderStatsCards = () => (
        <div className="stats-grid">
            <div className="stat-card sales">
                <div className="stat-icon">💰</div>
                <div className="stat-content">
                    <h3>Total Penjualan</h3>
                    <p className="stat-value">{formatCurrency(stats.totalSales)}</p>
                    <span className={`stat-change ${stats.salesGrowth >= 0 ? 'positive' : 'negative'}`}>
                        {stats.salesGrowth >= 0 ? '↗️' : '↘️'} {Math.abs(stats.salesGrowth).toFixed(1)}%
                    </span>
                </div>
            </div>

            <div className="stat-card users">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                    <h3>Total Pengguna</h3>
                    <p className="stat-value">{stats.totalUsers.toLocaleString()}</p>
                    <span className="stat-label">Pengguna baru</span>
                </div>
            </div>

            <div className="stat-card products">
                <div className="stat-icon">📦</div>
                <div className="stat-content">
                    <h3>Total Produk</h3>
                    <p className="stat-value">{stats.totalProducts}</p>
                    <span className="stat-label">Produk aktif</span>
                </div>
            </div>

            <div className="stat-card transactions">
                <div className="stat-icon">🧾</div>
                <div className="stat-content">
                    <h3>Transaksi</h3>
                    <p className="stat-value">{stats.totalTransactions}</p>
                    <span className="stat-label">Transaksi selesai</span>
                </div>
            </div>

            <div className="stat-card average">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                    <h3>Rata-rata Order</h3>
                    <p className="stat-value">{formatCurrency(stats.averageOrderValue)}</p>
                    <span className="stat-label">Per transaksi</span>
                </div>
            </div>

            <div className="stat-card top-product">
                <div className="stat-icon">🏆</div>
                <div className="stat-content">
                    <h3>Produk Terlaris</h3>
                    <p className="stat-value">{stats.topSellingProduct}</p>
                    <span className="stat-label">Paling banyak terjual</span>
                </div>
            </div>
        </div>
    );

    const renderSalesReport = () => (
        <div className="report-table-container">
            <table className="report-table">
                <thead>
                    <tr>
                        <th>Tanggal</th>
                        <th>Penjualan</th>
                        <th>Jumlah Order</th>
                        <th>Pelanggan</th>
                        <th>Rata-rata Order</th>
                    </tr>
                </thead>
                <tbody>
                    {reportData.sales.map((sale, index) => (
                        <tr key={index}>
                            <td>{formatDate(sale.date)}</td>
                            <td>{formatCurrency(sale.amount)}</td>
                            <td>{sale.orders}</td>
                            <td>{sale.customers}</td>
                            <td>{formatCurrency(sale.amount / sale.orders)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderUsersReport = () => (
        <div className="report-table-container">
            <table className="report-table">
                <thead>
                    <tr>
                        <th>Tanggal</th>
                        <th>Pengguna Baru</th>
                        <th>Pengguna Aktif</th>
                        <th>Role</th>
                    </tr>
                </thead>
                <tbody>
                    {reportData.users.map((user, index) => (
                        <tr key={index}>
                            <td>{formatDate(user.date)}</td>
                            <td>{user.newUsers}</td>
                            <td>{user.activeUsers}</td>
                            <td>
                                <span className={`role-badge ${user.role}`}>
                                    {user.role === 'admin' ? '👨‍💼 Admin' : '👥 Employee'}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderProductsReport = () => (
        <div className="report-table-container">
            <table className="report-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nama Produk</th>
                        <th>Terjual</th>
                        <th>Pendapatan</th>
                        <th>Stok</th>
                        <th>Kategori</th>
                    </tr>
                </thead>
                <tbody>
                    {reportData.products.map((product) => (
                        <tr key={product.id}>
                            <td>#{product.id}</td>
                            <td>{product.name}</td>
                            <td>{product.sold}</td>
                            <td>{formatCurrency(product.revenue)}</td>
                            <td>
                                <span className={`stock-badge ${product.stock < 10 ? 'low' : 'normal'}`}>
                                    {product.stock}
                                </span>
                            </td>
                            <td>
                                <span className="category-badge">{product.category}</span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderTransactionsReport = () => (
        <div className="report-table-container">
            <table className="report-table">
                <thead>
                    <tr>
                        <th>ID Transaksi</th>
                        <th>Tanggal</th>
                        <th>Pelanggan</th>
                        <th>Produk</th>
                        <th>Jumlah</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {reportData.transactions.map((transaction) => (
                        <tr key={transaction.id}>
                            <td>{transaction.id}</td>
                            <td>{formatDate(transaction.date)}</td>
                            <td>{transaction.customer}</td>
                            <td>{transaction.product}</td>
                            <td>{formatCurrency(transaction.amount)}</td>
                            <td>
                                <span className={`status-badge ${transaction.status}`}>
                                    {transaction.status === 'completed' && '✅ Selesai'}
                                    {transaction.status === 'pending' && '⏳ Pending'}
                                    {transaction.status === 'cancelled' && '❌ Dibatalkan'}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="report-page">
            <div className="report-header">
                <div className="header-content">
                    <h1>📊 Laporan & Analisis</h1>
                    <p>Dashboard laporan komprehensif untuk analisis bisnis</p>
                </div>
                <div className="header-actions">
                    <button
                        className="btn btn-primary"
                        onClick={loadReportData}
                        disabled={loading}
                    >
                        {loading ? '⏳ Loading...' : '🔄 Refresh Data'}
                    </button>
                </div>
            </div>

            {/* Date Filter */}
            <div className="date-filter">
                <div className="filter-group">
                    <label>📅 Periode Laporan:</label>
                    <input
                        type="date"
                        value={dateFilter.startDate}
                        onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
                        className="date-input"
                    />
                    <span className="date-separator">sampai</span>
                    <input
                        type="date"
                        value={dateFilter.endDate}
                        onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
                        className="date-input"
                    />
                </div>
            </div>

            {/* Statistics Cards */}
            {renderStatsCards()}

            {/* Report Navigation */}
            <div className="report-nav">
                <div className="nav-tabs">
                    <button
                        className={`nav-tab ${selectedReport === 'sales' ? 'active' : ''}`}
                        onClick={() => setSelectedReport('sales')}
                    >
                        💰 Laporan Penjualan
                    </button>
                    <button
                        className={`nav-tab ${selectedReport === 'users' ? 'active' : ''}`}
                        onClick={() => setSelectedReport('users')}
                    >
                        👥 Laporan Pengguna
                    </button>
                    <button
                        className={`nav-tab ${selectedReport === 'products' ? 'active' : ''}`}
                        onClick={() => setSelectedReport('products')}
                    >
                        📦 Laporan Produk
                    </button>
                    <button
                        className={`nav-tab ${selectedReport === 'transactions' ? 'active' : ''}`}
                        onClick={() => setSelectedReport('transactions')}
                    >
                        🧾 Laporan Transaksi
                    </button>
                </div>

                <button
                    className="btn btn-secondary export-btn"
                    onClick={() => exportToCSV(reportData[selectedReport], selectedReport)}
                    disabled={loading || !reportData[selectedReport]?.length}
                >
                    📥 Export CSV
                </button>
            </div>

            {/* Report Content */}
            <div className="report-content">
                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Memuat data laporan...</p>
                    </div>
                ) : (
                    <div className="report-section">
                        {selectedReport === 'sales' && renderSalesReport()}
                        {selectedReport === 'users' && renderUsersReport()}
                        {selectedReport === 'products' && renderProductsReport()}
                        {selectedReport === 'transactions' && renderTransactionsReport()}
                    </div>
                )}
            </div>

            <style jsx>{`
        .report-page {
          padding: 24px;
          background: #f8f9fa;
          min-height: 100vh;
        }

        .report-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .header-content h1 {
          margin: 0 0 8px 0;
          color: #333;
          font-size: 1.8rem;
        }

        .header-content p {
          margin: 0;
          color: #666;
        }

        .date-filter {
          background: white;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 24px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .filter-group label {
          font-weight: 500;
          color: #333;
        }

        .date-input {
          padding: 8px 12px;
          border: 2px solid #e9ecef;
          border-radius: 6px;
          font-size: 14px;
        }

        .date-input:focus {
          outline: none;
          border-color: #667eea;
        }

        .date-separator {
          color: #666;
          font-size: 14px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          border-left: 4px solid;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .stat-card.sales { border-left-color: #28a745; }
        .stat-card.users { border-left-color: #007bff; }
        .stat-card.products { border-left-color: #ffc107; }
        .stat-card.transactions { border-left-color: #17a2b8; }
        .stat-card.average { border-left-color: #6f42c1; }
        .stat-card.top-product { border-left-color: #fd7e14; }

        .stat-icon {
          font-size: 2rem;
          opacity: 0.8;
        }

        .stat-content h3 {
          margin: 0 0 8px 0;
          font-size: 0.9rem;
          color: #666;
          font-weight: 500;
        }

        .stat-value {
          margin: 0 0 4px 0;
          font-size: 1.5rem;
          font-weight: 700;
          color: #333;
        }

        .stat-change.positive { color: #28a745; }
        .stat-change.negative { color: #dc3545; }
        
        .stat-label {
          font-size: 0.8rem;
          color: #666;
        }

        .report-nav {
          background: white;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 24px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }

        .nav-tabs {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .nav-tab {
          padding: 12px 20px;
          border: none;
          background: #f8f9fa;
          color: #666;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
          font-size: 14px;
        }

        .nav-tab:hover {
          background: #e9ecef;
          color: #333;
        }

        .nav-tab.active {
          background: #667eea;
          color: white;
        }

        .btn {
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
          padding: 12px 20px;
          font-size: 14px;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-primary {
          background: #667eea;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #5a6fd8;
          transform: translateY(-1px);
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #5a6268;
          transform: translateY(-1px);
        }

        .export-btn {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .report-content {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          overflow: hidden;
        }

        .report-table-container {
          overflow-x: auto;
        }

        .report-table {
          width: 100%;
          border-collapse: collapse;
        }

        .report-table th {
          background: #f8f9fa;
          padding: 16px;
          text-align: left;
          font-weight: 600;
          color: #333;
          border-bottom: 2px solid #e9ecef;
          white-space: nowrap;
        }

        .report-table td {
          padding: 16px;
          border-bottom: 1px solid #e9ecef;
          color: #333;
        }

        .report-table tr:hover {
          background: #f8f9fa;
        }

        .role-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          white-space: nowrap;
        }

        .role-badge.admin {
          background: #dc3545;
          color: white;
        }

        .role-badge.employee {
          background: #007bff;
          color: white;
        }

        .stock-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .stock-badge.low {
          background: #dc3545;
          color: white;
        }

        .stock-badge.normal {
          background: #28a745;
          color: white;
        }

        .category-badge {
          background: #6f42c1;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
        }

        .status-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          white-space: nowrap;
        }

        .status-badge.completed {
          background: #d4edda;
          color: #155724;
        }

        .status-badge.pending {
          background: #fff3cd;
          color: #856404;
        }

        .status-badge.cancelled {
          background: #f8d7da;
          color: #721c24;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px;
          color: #666;
        }

        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .report-page {
            padding: 16px;
          }

          .report-header {
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .filter-group {
            flex-direction: column;
            align-items: flex-start;
          }

          .nav-tabs {
            flex-direction: column;
            width: 100%;
          }

          .nav-tab {
            width: 100%;
            text-align: center;
          }

          .report-nav {
            flex-direction: column;
          }

          .report-table {
            font-size: 14px;
          }

          .report-table th,
          .report-table td {
            padding: 12px 8px;
          }
        }

        @media (max-width: 480px) {
          .report-table th,
          .report-table td {
            padding: 8px 4px;
            font-size: 12px;
          }

          .stat-card {
            padding: 16px;
          }

          .stat-value {
            font-size: 1.2rem;
          }
        }
      `}</style>
        </div>
    );
};

export default ReportPage;