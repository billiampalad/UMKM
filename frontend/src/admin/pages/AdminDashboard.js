import React, { useState, useEffect } from 'react';

const AdminDashboard = () => {
  const user = { nama: 'Admin User' }; // Mock user
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

  const StatCard = ({ title, value, icon, colorClass, link }) => (
    <div className={`${colorClass} bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border-l-4`}>
      <div className="flex items-start gap-4 mb-4">
        <div className={`${colorClass.includes('orange') ? 'bg-gradient-to-br from-orange-500 to-orange-600' : 
                        colorClass.includes('purple') ? 'bg-gradient-to-br from-purple-500 to-purple-600' :
                        colorClass.includes('green') ? 'bg-gradient-to-br from-green-400 to-green-500' :
                        'bg-gradient-to-br from-blue-500 to-blue-600'} w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg`}>
          <i className={icon}></i>
        </div>
        <div className="flex-1">
          <h3 className="text-3xl font-bold text-gray-800 mb-1">{value}</h3>
          <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">{title}</p>
        </div>
      </div>
      {link && (
        <a href={link} className={`${colorClass.includes('orange') ? 'text-orange-500 hover:text-orange-600' :
                                   colorClass.includes('purple') ? 'text-purple-500 hover:text-purple-600' :
                                   colorClass.includes('green') ? 'text-green-500 hover:text-green-600' :
                                   'text-blue-500 hover:text-blue-600'} inline-flex items-center gap-2 text-sm font-semibold pt-4 border-t border-gray-100 transition-all duration-200 hover:translate-x-1`}>
          <i className="fas fa-eye"></i>
          View Details
        </a>
      )}
    </div>
  );

  const QuickActions = () => (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <i className="fas fa-bolt text-yellow-500"></i>
        Quick Actions
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <a href="/admin/products" className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border-2 border-transparent hover:border-purple-400 group">
          <div className="text-3xl mb-3 bg-gradient-to-r from-purple-500 to-orange-500 bg-clip-text text-transparent">
            <i className="fas fa-plus"></i>
          </div>
          <span className="text-gray-700 font-semibold group-hover:text-purple-600">Add Product</span>
        </a>
        <a href="/admin/users" className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border-2 border-transparent hover:border-purple-400 group">
          <div className="text-3xl mb-3 bg-gradient-to-r from-purple-500 to-orange-500 bg-clip-text text-transparent">
            <i className="fas fa-users"></i>
          </div>
          <span className="text-gray-700 font-semibold group-hover:text-purple-600">Manage Users</span>
        </a>
        <a href="/admin/reports" className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border-2 border-transparent hover:border-purple-400 group">
          <div className="text-3xl mb-3 bg-gradient-to-r from-purple-500 to-orange-500 bg-clip-text text-transparent">
            <i className="fas fa-chart-bar"></i>
          </div>
          <span className="text-gray-700 font-semibold group-hover:text-purple-600">View Reports</span>
        </a>
        <button onClick={refreshData} disabled={refreshing} className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border-2 border-transparent hover:border-purple-400 group disabled:opacity-50">
          <div className={`text-3xl mb-3 bg-gradient-to-r from-purple-500 to-orange-500 bg-clip-text text-transparent ${refreshing ? 'animate-spin' : ''}`}>
            <i className="fas fa-sync-alt"></i>
          </div>
          <span className="text-gray-700 font-semibold group-hover:text-purple-600">
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </span>
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center max-w-md shadow-lg">
          <i className="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
          <p className="text-red-700 text-lg mb-4">{error}</p>
          <button onClick={fetchDashboardData} className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors duration-200">
            <i className="fas fa-redo mr-2"></i>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* CDN Links */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        {/* Header */}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Products"
            value={stats?.products?.total_products || 0}
            icon="fas fa-box"
            colorClass="border-blue-500"
            link="/admin/products"
          />
          <StatCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            icon="fas fa-users"
            colorClass="border-green-500"
            link="/admin/users"
          />
          <StatCard
            title="Monthly Transactions"
            value={stats?.transactions?.overview?.total_transactions || 0}
            icon="fas fa-shopping-cart"
            colorClass="border-purple-500"
            link="/admin/transactions"
          />
          <StatCard
            title="Monthly Revenue"
            value={`Rp ${(stats?.transactions?.overview?.total_revenue || 0).toLocaleString()}`}
            icon="fas fa-dollar-sign"
            colorClass="border-orange-500"
            link="/admin/reports"
          />
        </div>

        {/* Quick Actions */}
        <QuickActions />

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Recent Transactions */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                <i className="fas fa-chart-area text-green-500"></i>
                Recent Transactions
              </h2>
              <a href="/admin/transactions" className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm transition-colors duration-200 flex items-center gap-2">
                <i className="fas fa-eye"></i>
                View All
              </a>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => (
                  <div key={transaction.id_transaksi} className="p-6 border-b hover:bg-gradient-to-r hover:from-purple-50 hover:to-orange-50 transition-all duration-200 hover:translate-x-1">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-bold text-gray-800 text-sm">#{transaction.id_transaksi}</div>
                        <div className="text-gray-600 text-xs mt-1">{transaction.user_nama}</div>
                        <div className="text-gray-500 text-xs">{new Date(transaction.tanggal_transaksi).toLocaleDateString('id-ID')}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-800 text-sm">Rp {transaction.total_harga.toLocaleString()}</div>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-2 ${
                          transaction.status_pembayaran === 'completed' ? 'bg-green-100 text-green-600 border border-green-200' :
                          transaction.status_pembayaran === 'pending' ? 'bg-orange-100 text-orange-600 border border-orange-200' :
                          'bg-purple-100 text-purple-600 border border-purple-200'
                        }`}>
                          {transaction.status_pembayaran}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-gray-500">
                  <i className="fas fa-shopping-cart text-4xl text-gray-300 mb-4"></i>
                  <p>No recent transactions</p>
                </div>
              )}
            </div>
          </div>

          {/* Low Stock Alert */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                <i className="fas fa-exclamation-triangle text-orange-500"></i>
                Low Stock Alert
              </h2>
              <a href="/admin/products" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm transition-colors duration-200 flex items-center gap-2">
                <i className="fas fa-box"></i>
                Manage
              </a>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {lowStockProducts.length > 0 ? (
                lowStockProducts.map((product) => (
                  <div key={product.id_product} className="p-6 border-b hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 transition-all duration-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-gray-800">{product.nama_product}</div>
                        <div className="text-gray-600 text-sm">Rp {product.harga.toLocaleString()}</div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        product.stock === 0 ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-orange-100 text-orange-600 border border-orange-200'
                      }`}>
                        {product.stock === 0 ? 'Out of Stock' : `${product.stock} left`}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-gray-500">
                  <i className="fas fa-box text-4xl text-gray-300 mb-4"></i>
                  <p>All products have sufficient stock</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sales Chart */}
        {salesData.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                <i className="fas fa-chart-bar text-purple-500"></i>
                Sales Overview (Last 7 Days)
              </h2>
              <a href="/admin/reports" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm transition-colors duration-200 flex items-center gap-2">
                <i className="fas fa-download"></i>
                Export Report
              </a>
            </div>
            <div className="p-6">
              <div className="flex items-end justify-between gap-4 h-64 bg-gradient-to-t from-purple-50 to-transparent rounded-xl p-4">
                {salesData.map((data, index) => (
                  <div key={index} className="flex flex-col items-center gap-2 flex-1">
                    <div 
                      className="w-full bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-lg shadow-lg hover:from-orange-500 hover:to-orange-400 transition-all duration-300 hover:scale-105"
                      style={{ 
                        height: `${(data.daily_revenue / Math.max(...salesData.map(d => d.daily_revenue))) * 200}px`,
                        minHeight: '8px'
                      }}
                    ></div>
                    <div className="text-xs text-gray-600 font-semibold">
                      {new Date(data.date).toLocaleDateString('id-ID', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="text-xs text-gray-500 font-bold">
                      Rp {(data.daily_revenue / 1000000).toFixed(1)}M
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminDashboard;