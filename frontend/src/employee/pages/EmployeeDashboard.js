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
      <div style={styles.errorContainer}>
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
        />
        <div style={styles.errorCard}>
          <div style={styles.errorContent}>
            <i className="fas fa-exclamation-triangle" style={styles.errorIcon}></i>
            <h3 style={styles.errorTitle}>Unable to Load Dashboard</h3>
            <p style={styles.errorText}>{errors.global}</p>
          </div>
          <button onClick={handleRetry} style={styles.retryButton}>
            <i className="fas fa-redo" style={styles.buttonIcon}></i>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const QuickActionCard = ({ title, description, iconClass, backgroundColor, link, badge }) => (
    <Link to={link} style={styles.quickActionLink}>
      <div style={{...styles.quickActionCard, background: backgroundColor}}>
        <div style={styles.cardDecorative}></div>
        <div style={styles.cardContent}>
          <div style={styles.cardHeader}>
            <div style={styles.cardIconContainer}>
              <i className={iconClass} style={styles.cardIcon}></i>
            </div>
            {badge && (
              <div style={styles.badge}>
                {badge}
              </div>
            )}
          </div>
          <h3 style={styles.cardTitle}>{title}</h3>
          <p style={styles.cardDescription}>{description}</p>
        </div>
      </div>
    </Link>
  );

  const ProductCard = ({ product }) => (
    <div style={styles.productCard}>
      <div style={styles.productImageContainer}>
        <i className="fas fa-box" style={styles.productIcon}></i>
      </div>
      <h4 style={styles.productName}>{product.nama_product}</h4>
      <p style={styles.productPrice}>Rp {product.harga?.toLocaleString() || '0'}</p>
      <p style={styles.productStock}>{product.stock || 0} in stock</p>
    </div>
  );

  const ErrorSection = ({ title, error, onRetry }) => (
    <div style={styles.errorSection}>
      <i className="fas fa-exclamation-triangle" style={styles.sectionErrorIcon}></i>
      <p style={styles.sectionErrorText}>{error}</p>
      <button onClick={onRetry} style={styles.sectionRetryButton}>
        <i className="fas fa-redo" style={styles.buttonIcon}></i>
        Retry
      </button>
    </div>
  );

  return (
    <div style={styles.dashboard}>
      {/* FontAwesome CDN */}
      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
      />
      
      <div style={styles.container}>
        {/* Welcome Section */}
        <div style={styles.welcomeSection}>
          <div style={styles.welcomeDecorative}></div>
          <div style={styles.welcomeContent}>
            <div style={styles.welcomeText}>
              <h1 style={styles.welcomeTitle}>
                Welcome back, {user?.nama || 'Employee'}! 👋
              </h1>
              <p style={styles.welcomeSubtitle}>
                Ready to explore our products and manage your orders?
              </p>
            </div>
            <div style={styles.welcomeActions}>
              <Link to="/employee/shop" style={styles.welcomeButton}>
                <i className="fas fa-shopping-bag" style={styles.buttonIcon}></i>
                Start Shopping
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <i className="fas fa-bolt" style={styles.sectionIcon}></i>
            Quick Actions
          </h2>
          <div style={styles.quickActionsGrid}>
            <QuickActionCard
              title="Browse Products"
              description="Explore our product catalog"
              iconClass="fas fa-shopping-bag"
              backgroundColor="linear-gradient(135deg, #FF6600 0%, #ff8533 100%)"
              link="/employee/shop"
            />
            <QuickActionCard
              title="Shopping Cart"
              description="Review items in your cart"
              iconClass="fas fa-shopping-cart"
              backgroundColor="linear-gradient(135deg, #8FD14F 0%, #7bc142 100%)"
              link="/employee/cart"
              badge={dashboardData?.cartSummary?.total_items > 0 ? dashboardData.cartSummary.total_items : null}
            />
            <QuickActionCard
              title="Order History"
              description="View your past transactions"
              iconClass="fas fa-history"
              backgroundColor="linear-gradient(135deg, #604CC3 0%, #8b5cf6 100%)"
              link="/employee/history"
            />
            <QuickActionCard
              title="Profile Settings"
              description="Update your account details"
              iconClass="fas fa-user-cog"
              backgroundColor="linear-gradient(135deg, #6b7280 0%, #4b5563 100%)"
              link="/employee/profile"
            />
          </div>
        </div>

        <div style={styles.dashboardGrid}>
          {/* Cart Summary */}
          <div style={styles.card}>
            <div style={{...styles.cardHeaderSection, background: 'linear-gradient(135deg, #8FD14F 0%, #7bc142 100%)'}}>
              <h2 style={styles.cardHeaderTitle}>
                <i className="fas fa-shopping-cart" style={styles.headerIcon}></i>
                Cart Summary
              </h2>
              <Link to="/employee/cart" style={styles.headerButton}>
                <i className="fas fa-eye" style={styles.buttonIcon}></i>
                View Cart
              </Link>
            </div>
            <div style={styles.cardBody}>
              {errors.cartSummary ? (
                <ErrorSection 
                  title="Cart Summary" 
                  error={errors.cartSummary}
                  onRetry={handleRetry}
                />
              ) : dashboardData?.cartSummary?.total_items > 0 ? (
                <div style={styles.statsGrid}>
                  <div style={{...styles.statCard, background: 'linear-gradient(135deg, #FF6600 0%, #ff8533 100%)'}}>
                    <div style={styles.statValue}>{dashboardData.cartSummary.total_items}</div>
                    <div style={styles.statLabel}>Items</div>
                  </div>
                  <div style={{...styles.statCard, background: 'linear-gradient(135deg, #8FD14F 0%, #7bc142 100%)'}}>
                    <div style={styles.statValue}>{dashboardData.cartSummary.total_quantity || dashboardData.cartSummary.total_items}</div>
                    <div style={styles.statLabel}>Quantity</div>
                  </div>
                  <div style={{...styles.statCard, background: 'linear-gradient(135deg, #604CC3 0%, #8b5cf6 100%)'}}>
                    <div style={styles.statValueSmall}>Rp {(dashboardData.cartSummary.cart_value || dashboardData.cartSummary.total_amount || 0).toLocaleString()}</div>
                    <div style={styles.statLabel}>Total Value</div>
                  </div>
                </div>
              ) : (
                <div style={styles.emptyState}>
                  <i className="fas fa-shopping-cart" style={styles.emptyIcon}></i>
                  <p style={styles.emptyText}>Your cart is empty</p>
                  <Link to="/employee/shop" style={styles.emptyButton}>
                    <i className="fas fa-shopping-bag" style={styles.buttonIcon}></i>
                    Start Shopping
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          <div style={styles.card}>
            <div style={{...styles.cardHeaderSection, background: 'linear-gradient(135deg, #604CC3 0%, #8b5cf6 100%)'}}>
              <h2 style={styles.cardHeaderTitle}>
                <i className="fas fa-clock" style={styles.headerIcon}></i>
                Recent Orders
              </h2>
              <Link to="/employee/history" style={styles.headerButton}>
                <i className="fas fa-list" style={styles.buttonIcon}></i>
                View All
              </Link>
            </div>
            <div style={styles.cardBody}>
              {errors.recentTransactions ? (
                <ErrorSection 
                  title="Recent Orders" 
                  error={errors.recentTransactions}
                  onRetry={handleRetry}
                />
              ) : dashboardData?.recentTransactions?.length > 0 ? (
                <div style={styles.transactionsList}>
                  {dashboardData.recentTransactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id_transaksi} style={styles.transactionItem}>
                      <div style={styles.transactionInfo}>
                        <div style={styles.transactionId}>
                          <i className="fas fa-receipt" style={styles.transactionIcon}></i>
                          Order #{transaction.id_transaksi}
                        </div>
                        <div style={styles.transactionDate}>
                          <i className="fas fa-calendar" style={styles.transactionDateIcon}></i>
                          {new Date(transaction.tanggal_transaksi).toLocaleDateString()}
                        </div>
                      </div>
                      <div style={styles.transactionDetails}>
                        <div style={styles.transactionAmount}>
                          Rp {transaction.total_harga?.toLocaleString() || '0'}
                        </div>
                        <div style={{
                          ...styles.transactionStatus,
                          backgroundColor: transaction.status_pembayaran === 'completed' 
                            ? 'rgba(143, 209, 79, 0.2)' 
                            : transaction.status_pembayaran === 'pending'
                            ? 'rgba(255, 102, 0, 0.2)'
                            : 'rgba(239, 68, 68, 0.2)',
                          color: transaction.status_pembayaran === 'completed' 
                            ? '#8FD14F' 
                            : transaction.status_pembayaran === 'pending'
                            ? '#FF6600'
                            : '#ef4444'
                        }}>
                          {transaction.status_pembayaran || 'pending'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={styles.emptyState}>
                  <i className="fas fa-inbox" style={styles.emptyIcon}></i>
                  <p style={styles.emptyText}>No recent orders</p>
                  <Link to="/employee/shop" style={{...styles.emptyButton, background: 'linear-gradient(135deg, #604CC3 0%, #8b5cf6 100%)'}}>
                    <i className="fas fa-shopping-bag" style={styles.buttonIcon}></i>
                    Place Your First Order
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Featured Products */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>
              <i className="fas fa-star" style={styles.sectionIcon}></i>
              Featured Products
            </h2>
            <Link to="/employee/shop" style={styles.sectionButton}>
              <i className="fas fa-eye" style={styles.buttonIcon}></i>
              View All Products
            </Link>
          </div>
          {errors.featuredProducts ? (
            <div style={styles.card}>
              <div style={styles.cardBody}>
                <ErrorSection 
                  title="Featured Products" 
                  error={errors.featuredProducts}
                  onRetry={handleRetry}
                />
              </div>
            </div>
          ) : (
            <div style={styles.productsGrid}>
              {dashboardData?.featuredProducts?.length > 0 ? (
                dashboardData.featuredProducts.map((product) => (
                  <ProductCard key={product.id_product} product={product} />
                ))
              ) : (
                <div style={styles.noProductsCard}>
                  <i className="fas fa-box-open" style={styles.emptyIcon}></i>
                  <p style={styles.emptyText}>No products available</p>
                  <Link to="/employee/shop" style={{...styles.emptyButton, background: 'linear-gradient(135deg, #8FD14F 0%, #7bc142 100%)'}}>
                    <i className="fas fa-shopping-bag" style={styles.buttonIcon}></i>
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

// Styles object
const styles = {
  dashboard: {
    minHeight: '100vh',
    backgroundColor: '#F5F5F5',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '24px'
  },
  errorContainer: {
    minHeight: '100vh',
    backgroundColor: '#F5F5F5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px'
  },
  errorCard: {
    backgroundColor: 'white',
    borderRadius: '24px',
    padding: '48px 32px',
    textAlign: 'center',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
    maxWidth: '400px',
    width: '100%',
    border: '1px solid #e5e7eb'
  },
  errorContent: {
    marginBottom: '32px'
  },
  errorIcon: {
    fontSize: '4rem',
    color: '#FF6600',
    marginBottom: '16px'
  },
  errorTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '8px',
    margin: 0
  },
  errorText: {
    color: '#666',
    lineHeight: '1.6',
    margin: 0
  },
  retryButton: {
    background: 'linear-gradient(135deg, #FF6600 0%, #ff8533 100%)',
    color: 'white',
    border: 'none',
    padding: '12px 32px',
    borderRadius: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px'
  },
  welcomeSection: {
    background: 'linear-gradient(135deg, #604CC3 0%, #8b5cf6 100%)',
    borderRadius: '24px',
    padding: '48px 32px',
    marginBottom: '32px',
    color: 'white',
    position: 'relative',
    overflow: 'hidden'
  },
  welcomeDecorative: {
    position: 'absolute',
    top: '0',
    right: '0',
    width: '256px',
    height: '256px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '50%',
    marginRight: '-128px',
    marginTop: '-128px'
  },
  welcomeContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    zIndex: 10,
    flexWrap: 'wrap',
    gap: '24px'
  },
  welcomeText: {
    flex: 1,
    minWidth: '300px'
  },
  welcomeTitle: {
    fontSize: '3rem',
    fontWeight: 'bold',
    marginBottom: '12px',
    margin: 0
  },
  welcomeSubtitle: {
    fontSize: '1.25rem',
    opacity: 0.9,
    margin: 0
  },
  welcomeActions: {
    flexShrink: 0
  },
  welcomeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    color: 'white',
    padding: '16px 32px',
    borderRadius: '16px',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '12px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    border: '2px solid rgba(255, 255, 255, 0.3)'
  },
  section: {
    marginBottom: '32px'
  },
  sectionTitle: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '24px',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  sectionIcon: {
    color: '#FF6600'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px'
  },
  sectionButton: {
    background: 'linear-gradient(135deg, #FF6600 0%, #ff8533 100%)',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '12px',
    textDecoration: 'none',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s ease'
  },
  quickActionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '24px'
  },
  quickActionLink: {
    textDecoration: 'none',
    color: 'inherit'
  },
  quickActionCard: {
    borderRadius: '16px',
    padding: '24px',
    color: 'white',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
    cursor: 'pointer'
  },
  cardDecorative: {
    position: 'absolute',
    top: '0',
    right: '0',
    width: '128px',
    height: '128px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '50%',
    marginRight: '-64px',
    marginTop: '-64px'
  },
  cardContent: {
    position: 'relative',
    zIndex: 10
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  cardIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    padding: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardIcon: {
    fontSize: '1.5rem'
  },
  badge: {
    backgroundColor: 'white',
    color: '#FF6600',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.875rem',
    fontWeight: 'bold'
  },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    marginBottom: '8px',
    margin: 0
  },
  cardDescription: {
    opacity: 0.9,
    fontSize: '0.875rem',
    margin: 0
  },
  dashboardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '32px',
    marginBottom: '32px'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    overflow: 'hidden'
  },
  cardHeaderSection: {
    padding: '24px',
    color: 'white'
  },
  cardHeaderTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  headerIcon: {
    marginRight: '12px'
  },
  headerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '0.875rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s ease'
  },
  cardBody: {
    padding: '24px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px'
  },
  statCard: {
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
    color: 'white'
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '4px'
  },
  statValueSmall: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    marginBottom: '4px'
  },
  statLabel: {
    fontSize: '0.875rem',
    opacity: 0.9,
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '48px 24px'
  },
  emptyIcon: {
    fontSize: '4rem',
    color: '#d1d5db',
    marginBottom: '16px'
  },
  emptyText: {
    color: '#666',
    marginBottom: '24px',
    fontSize: '1.125rem',
    margin: '0 0 24px 0'
  },
  emptyButton: {
    background: 'linear-gradient(135deg, #FF6600 0%, #ff8533 100%)',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '12px',
    textDecoration: 'none',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s ease'
  },
  transactionsList: {
    padding: 0
  },
  transactionItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 0',
    borderBottom: '1px solid #f0f0f0',
    transition: 'all 0.2s ease'
  },
  transactionInfo: {
    flex: 1
  },
  transactionId: {
    fontWeight: 'bold',
    color: '#333',
    display: 'flex',
    alignItems: 'center',
    marginBottom: '4px'
  },
  transactionIcon: {
    color: '#FF6600',
    marginRight: '8px'
  },
  transactionDate: {
    fontSize: '0.875rem',
    color: '#666',
    display: 'flex',
    alignItems: 'center'
  },
  transactionDateIcon: {
    marginRight: '4px'
  },
  transactionDetails: {
    textAlign: 'right'
  },
  transactionAmount: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: '1.125rem',
    marginBottom: '4px'
  },
  transactionStatus: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    display: 'inline-block'
  },
  productsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '24px'
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  },
  productImageContainer: {
    background: 'linear-gradient(135deg, #8FD14F 0%, #7bc142 100%)',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  productIcon: {
    fontSize: '1.5rem',
    color: 'white'
  },
  productName: {
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '8px',
    margin: '0 0 8px 0'
  },
  productPrice: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#FF6600',
    marginBottom: '4px',
    margin: '0 0 4px 0'
  },
  productStock: {
    fontSize: '0.875rem',
    color: '#666',
    margin: 0
  },
  noProductsCard: {
    gridColumn: '1 / -1',
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    textAlign: 'center',
    padding: '64px 32px'
  },
  errorSection: {
    textAlign: 'center',
    padding: '48px 24px'
  },
  sectionErrorIcon: {
    fontSize: '3rem',
    color: '#FF6600',
    marginBottom: '16px'
  },
  sectionErrorText: {
    color: '#666',
    marginBottom: '16px',
    fontSize: '0.875rem'
  },
  sectionRetryButton: {
    background: '#604CC3',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s ease'
  },
  buttonIcon: {
    marginRight: '8px'
  }
};

export default EmployeeDashboard;