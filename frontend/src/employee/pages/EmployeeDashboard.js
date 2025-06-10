// src/employee/pages/EmployeeDashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../shared/contexts/AuthContext';
import { cartAPI, transactionAPI, productAPI } from '../../shared/services/api';
import Loading from '../../shared/components/Loading';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    cartSummary: null,
    recentTransactions: null,
    featuredProducts: null
  });
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, [retryCount]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setErrors({});
      
      // Initialize with default/empty data
      const newDashboardData = {
        cartSummary: { total_items: 0, total_quantity: 0, cart_value: 0 },
        recentTransactions: [],
        featuredProducts: []
      };
      
      const newErrors = {};

      // Fetch cart summary with individual error handling
      try {
        const cartSummaryRes = await cartAPI.getCartSummary();
        if (cartSummaryRes?.data?.data) {
          newDashboardData.cartSummary = cartSummaryRes.data.data;
        }
      } catch (err) {
        console.error('Failed to fetch cart summary:', err);
        newErrors.cartSummary = 'Failed to load cart data';
      }

      // Fetch recent transactions with individual error handling
      try {
        const recentTransactionsRes = await transactionAPI.getUserTransactions({ 
          limit: 5,
          page: 1 
        });
        if (recentTransactionsRes?.data?.data?.transactions) {
          newDashboardData.recentTransactions = recentTransactionsRes.data.data.transactions;
        } else if (recentTransactionsRes?.data?.data && Array.isArray(recentTransactionsRes.data.data)) {
          // Handle case where transactions are directly in data
          newDashboardData.recentTransactions = recentTransactionsRes.data.data;
        }
      } catch (err) {
        console.error('Failed to fetch recent transactions:', err);
        newErrors.recentTransactions = 'Failed to load transaction history';
      }

      // Fetch featured products with individual error handling
      try {
        const featuredProductsRes = await productAPI.getAllProducts({ 
          limit: 6,
          page: 1 
        });
        if (featuredProductsRes?.data?.data?.products) {
          newDashboardData.featuredProducts = featuredProductsRes.data.data.products;
        } else if (featuredProductsRes?.data?.data && Array.isArray(featuredProductsRes.data.data)) {
          // Handle case where products are directly in data
          newDashboardData.featuredProducts = featuredProductsRes.data.data;
        }
      } catch (err) {
        console.error('Failed to fetch featured products:', err);
        newErrors.featuredProducts = 'Failed to load products';
      }

      setDashboardData(newDashboardData);
      setErrors(newErrors);
      
    } catch (err) {
      console.error('Dashboard error:', err);
      setErrors({ global: 'Failed to load dashboard data' });
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const hasAnyData = () => {
    return dashboardData.cartSummary || 
           dashboardData.recentTransactions?.length > 0 || 
           dashboardData.featuredProducts?.length > 0;
  };

  if (loading) {
    return <Loading message="Loading dashboard..." size="large" />;
  }

  // Show global error only if no data loaded at all
  if (errors.global && !hasAnyData()) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-8">
        <div className="bg-white rounded-3xl p-12 text-center shadow-2xl max-w-md w-full border border-gray-100">
          <div className="mb-6">
            <i className="fas fa-exclamation-triangle text-6xl text-[#FF6600] mb-4"></i>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Unable to Load Dashboard</h3>
            <p className="text-gray-600 leading-relaxed">{errors.global}</p>
          </div>
          <button 
            onClick={handleRetry} 
            className="bg-gradient-to-r from-[#FF6600] to-[#ff8533] text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            <i className="fas fa-redo mr-2"></i>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const QuickActionCard = ({ title, description, iconClass, gradientFrom, gradientTo, link, badge }) => (
    <Link to={link} className="group block">
      <div className={`bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -mr-16 -mt-16"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white bg-opacity-20 rounded-xl p-3">
              <i className={`${iconClass} text-2xl`}></i>
            </div>
            {badge && (
              <div className="bg-white text-[#FF6600] rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                {badge}
              </div>
            )}
          </div>
          <h3 className="text-xl font-bold mb-2">{title}</h3>
          <p className="text-white text-opacity-90 text-sm">{description}</p>
        </div>
      </div>
    </Link>
  );

  const ProductCard = ({ product }) => (
    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-gray-100">
      <div className="bg-gradient-to-br from-[#8FD14F] to-[#7bc142] rounded-xl p-4 mb-4 flex items-center justify-center">
        <i className="fas fa-box text-2xl text-white"></i>
      </div>
      <h4 className="text-lg font-bold text-gray-800 mb-2">{product.nama_product}</h4>
      <p className="text-2xl font-bold text-[#FF6600] mb-1">Rp {product.harga?.toLocaleString() || '0'}</p>
      <p className="text-gray-600 text-sm">{product.stock || 0} in stock</p>
    </div>
  );

  const ErrorSection = ({ title, error, onRetry }) => (
    <div className="text-center py-12">
      <i className="fas fa-exclamation-triangle text-4xl text-[#FF6600] mb-4"></i>
      <p className="text-gray-600 mb-4">{error}</p>
      <button 
        onClick={onRetry} 
        className="bg-[#604CC3] text-white px-6 py-2 rounded-lg hover:bg-[#5441a8] transition-all duration-300"
      >
        <i className="fas fa-redo mr-2"></i>
        Retry
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* FontAwesome CDN */}
      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
      />
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-[#604CC3] to-[#8b5cf6] rounded-3xl p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white bg-opacity-10 rounded-full -mr-32 -mt-32"></div>
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center">
            <div className="text-center lg:text-left mb-6 lg:mb-0">
              <h1 className="text-4xl lg:text-5xl font-bold mb-3">
                Welcome back, {user?.nama || 'Employee'}! 👋
              </h1>
              <p className="text-xl text-white text-opacity-90">
                Ready to explore our products and manage your orders?
              </p>
            </div>
            <div className="flex-shrink-0">
              <Link 
                to="/employee/shop" 
                className="bg-white bg-opacity-20 backdrop-blur-sm text-white px-8 py-4 rounded-2xl font-semibold hover:bg-opacity-30 transition-all duration-300 inline-flex items-center"
              >
                <i className="fas fa-shopping-bag mr-3 text-lg"></i>
                Start Shopping
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
            <i className="fas fa-bolt text-[#FF6600] mr-3"></i>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <QuickActionCard
              title="Browse Products"
              description="Explore our product catalog"
              iconClass="fas fa-shopping-bag"
              gradientFrom="from-[#FF6600]"
              gradientTo="to-[#ff8533]"
              link="/employee/shop"
            />
            <QuickActionCard
              title="Shopping Cart"
              description="Review items in your cart"
              iconClass="fas fa-shopping-cart"
              gradientFrom="from-[#8FD14F]"
              gradientTo="to-[#7bc142]"
              link="/employee/cart"
              badge={dashboardData?.cartSummary?.total_items > 0 ? dashboardData.cartSummary.total_items : null}
            />
            <QuickActionCard
              title="Order History"
              description="View your past transactions"
              iconClass="fas fa-history"
              gradientFrom="from-[#604CC3]"
              gradientTo="to-[#8b5cf6]"
              link="/employee/history"
            />
            <QuickActionCard
              title="Profile Settings"
              description="Update your account details"
              iconClass="fas fa-user-cog"
              gradientFrom="from-gray-600"
              gradientTo="to-gray-700"
              link="/employee/profile"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Cart Summary */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-[#8FD14F] to-[#7bc142] p-6 text-white">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center">
                  <i className="fas fa-shopping-cart mr-3"></i>
                  Cart Summary
                </h2>
                <Link 
                  to="/employee/cart" 
                  className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30 transition-all duration-300 text-sm"
                >
                  <i className="fas fa-eye mr-2"></i>
                  View Cart
                </Link>
              </div>
            </div>
            <div className="p-6">
              {errors.cartSummary ? (
                <ErrorSection 
                  title="Cart Summary" 
                  error={errors.cartSummary}
                  onRetry={handleRetry}
                />
              ) : dashboardData?.cartSummary?.total_items > 0 ? (
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-[#FF6600] to-[#ff8533] rounded-xl text-white">
                    <div className="text-3xl font-bold mb-1">{dashboardData.cartSummary.total_items}</div>
                    <div className="text-sm opacity-90">Items</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-[#8FD14F] to-[#7bc142] rounded-xl text-white">
                    <div className="text-3xl font-bold mb-1">{dashboardData.cartSummary.total_quantity || dashboardData.cartSummary.total_items}</div>
                    <div className="text-sm opacity-90">Quantity</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-[#604CC3] to-[#8b5cf6] rounded-xl text-white">
                    <div className="text-xl font-bold mb-1">Rp {(dashboardData.cartSummary.cart_value || dashboardData.cartSummary.total_amount || 0).toLocaleString()}</div>
                    <div className="text-sm opacity-90">Total Value</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <i className="fas fa-shopping-cart text-6xl text-gray-300 mb-4"></i>
                  <p className="text-gray-600 mb-6 text-lg">Your cart is empty</p>
                  <Link 
                    to="/employee/shop" 
                    className="bg-gradient-to-r from-[#FF6600] to-[#ff8533] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    <i className="fas fa-shopping-bag mr-2"></i>
                    Start Shopping
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-[#604CC3] to-[#8b5cf6] p-6 text-white">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center">
                  <i className="fas fa-clock mr-3"></i>
                  Recent Orders
                </h2>
                <Link 
                  to="/employee/history" 
                  className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30 transition-all duration-300 text-sm"
                >
                  <i className="fas fa-list mr-2"></i>
                  View All
                </Link>
              </div>
            </div>
            <div>
              {errors.recentTransactions ? (
                <ErrorSection 
                  title="Recent Orders" 
                  error={errors.recentTransactions}
                  onRetry={handleRetry}
                />
              ) : dashboardData?.recentTransactions?.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {dashboardData.recentTransactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id_transaksi} className="p-6 hover:bg-gray-50 transition-all duration-300">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-bold text-gray-800 flex items-center">
                            <i className="fas fa-receipt text-[#FF6600] mr-2"></i>
                            Order #{transaction.id_transaksi}
                          </div>
                          <div className="text-gray-600 text-sm mt-1">
                            <i className="fas fa-calendar mr-1"></i>
                            {new Date(transaction.tanggal_transaksi).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-800 text-lg">
                            Rp {transaction.total_harga?.toLocaleString() || '0'}
                          </div>
                          <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 ${
                            transaction.status_pembayaran === 'completed' 
                              ? 'bg-[#8FD14F] bg-opacity-20 text-[#8FD14F]' 
                              : transaction.status_pembayaran === 'pending'
                              ? 'bg-[#FF6600] bg-opacity-20 text-[#FF6600]'
                              : 'bg-red-100 text-red-600'
                          }`}>
                            {transaction.status_pembayaran || 'pending'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <i className="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
                  <p className="text-gray-600 mb-6 text-lg">No recent orders</p>
                  <Link 
                    to="/employee/shop" 
                    className="bg-gradient-to-r from-[#604CC3] to-[#8b5cf6] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    <i className="fas fa-shopping-bag mr-2"></i>
                    Place Your First Order
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Featured Products */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800 flex items-center">
              <i className="fas fa-star text-[#FF6600] mr-3"></i>
              Featured Products
            </h2>
            <Link 
              to="/employee/shop" 
              className="bg-gradient-to-r from-[#FF6600] to-[#ff8533] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              <i className="fas fa-eye mr-2"></i>
              View All Products
            </Link>
          </div>
          {errors.featuredProducts ? (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <ErrorSection 
                title="Featured Products" 
                error={errors.featuredProducts}
                onRetry={handleRetry}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              {dashboardData?.featuredProducts?.length > 0 ? (
                dashboardData.featuredProducts.map((product) => (
                  <ProductCard key={product.id_product} product={product} />
                ))
              ) : (
                <div className="col-span-full bg-white rounded-2xl shadow-xl border border-gray-100 text-center py-16">
                  <i className="fas fa-box-open text-6xl text-gray-300 mb-4"></i>
                  <p className="text-gray-600 mb-6 text-lg">No products available</p>
                  <Link 
                    to="/employee/shop" 
                    className="bg-gradient-to-r from-[#8FD14F] to-[#7bc142] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    <i className="fas fa-shopping-bag mr-2"></i>
                    Browse All Products
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;