// src/employee/pages/HistoryPage.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { transactionAPI } from '../../shared/services/api';
import Loading from '../../shared/components/Loading';

const HistoryPage = () => {
  const location = useLocation();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedTransaction, setExpandedTransaction] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const itemsPerPage = 10;

  useEffect(() => {
    // Check for success message from navigation state
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      setTimeout(() => setSuccessMessage(''), 5000);
      // Clear the state to prevent showing message on refresh
      window.history.replaceState({}, document.title);
    }
    
    fetchTransactions();
  }, [currentPage, location.state]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        limit: itemsPerPage
      };

      const response = await transactionAPI.getUserTransactions(params);
      const { transactions: transactionData, pagination } = response.data.data;
      
      setTransactions(transactionData);
      setTotalPages(pagination.totalPages);
      
    } catch (err) {
      setError('Failed to fetch transaction history');
      console.error('Fetch transactions error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return 'fas fa-check-circle';
      case 'pending':
        return 'fas fa-clock';
      case 'failed':
        return 'fas fa-times-circle';
      default:
        return 'fas fa-question-circle';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#8FD14F';
      case 'pending':
        return '#FF6600';
      case 'failed':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const toggleTransactionDetails = (transactionId) => {
    setExpandedTransaction(
      expandedTransaction === transactionId ? null : transactionId
    );
  };

  const TransactionCard = ({ transaction }) => {
    const isExpanded = expandedTransaction === transaction.id_transaksi;
    const formattedDate = formatDate(transaction.tanggal_transaksi);
    const statusColor = getStatusColor(transaction.status_pembayaran);

    return (
      <div style={styles.transactionCard}>
        <div 
          style={styles.transactionHeader} 
          onClick={() => toggleTransactionDetails(transaction.id_transaksi)}
        >
          <div style={styles.transactionMain}>
            <div style={styles.transactionId}>
              <div style={styles.orderIconContainer}>
                <i className="fas fa-receipt" style={styles.orderIcon}></i>
              </div>
              <div>
                <div style={styles.orderNumber}>Order #{transaction.id_transaksi}</div>
                <div style={styles.transactionDate}>
                  <i className="fas fa-calendar-alt" style={styles.dateIcon}></i>
                  {formattedDate.date} at {formattedDate.time}
                </div>
              </div>
            </div>
          </div>
          
          <div style={styles.transactionSummary}>
            <div style={styles.transactionAmount}>
              Rp {transaction.total_harga.toLocaleString()}
            </div>
            <div style={{
              ...styles.transactionStatus,
              backgroundColor: `${statusColor}20`,
              color: statusColor
            }}>
              <i className={getStatusIcon(transaction.status_pembayaran)} style={styles.statusIcon}></i>
              {transaction.status_pembayaran}
            </div>
          </div>

          <div style={styles.expandIcon}>
            <i className={`fas ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
          </div>
        </div>

        {isExpanded && (
          <div style={styles.transactionDetails}>
            <div style={styles.detailsHeader}>
              <h4 style={styles.detailsTitle}>
                <i className="fas fa-info-circle" style={styles.detailsIcon}></i>
                Transaction Details
              </h4>
            </div>
            
            <div style={styles.detailsGrid}>
              <div style={styles.detailItem}>
                <div style={styles.detailLabel}>
                  <i className="fas fa-credit-card" style={styles.detailIcon}></i>
                  Payment Method
                </div>
                <div style={styles.detailValue}>{transaction.metode_pembayaran}</div>
              </div>
              
              <div style={styles.detailItem}>
                <div style={styles.detailLabel}>
                  <i className="fas fa-calendar" style={styles.detailIcon}></i>
                  Transaction Date
                </div>
                <div style={styles.detailValue}>{formattedDate.date} {formattedDate.time}</div>
              </div>
              
              <div style={styles.detailItem}>
                <div style={styles.detailLabel}>
                  <i className="fas fa-money-bill-wave" style={styles.detailIcon}></i>
                  Total Amount
                </div>
                <div style={{...styles.detailValue, ...styles.amountValue}}>
                  Rp {transaction.total_harga.toLocaleString()}
                </div>
              </div>
              
              <div style={styles.detailItem}>
                <div style={styles.detailLabel}>
                  <i className="fas fa-flag" style={styles.detailIcon}></i>
                  Status
                </div>
                <div style={{
                  ...styles.statusBadge,
                  backgroundColor: `${statusColor}20`,
                  color: statusColor
                }}>
                  <i className={getStatusIcon(transaction.status_pembayaran)} style={styles.badgeIcon}></i>
                  {transaction.status_pembayaran}
                </div>
              </div>
            </div>

            {transaction.items && transaction.items.length > 0 && (
              <div style={styles.transactionItems}>
                <h4 style={styles.itemsTitle}>
                  <i className="fas fa-shopping-bag" style={styles.itemsIcon}></i>
                  Items Ordered ({transaction.items.length})
                </h4>
                <div style={styles.itemsList}>
                  {transaction.items.map((item, index) => (
                    <div key={index} style={styles.itemRow}>
                      <div style={styles.itemImageContainer}>
                        <i className="fas fa-box" style={styles.itemImage}></i>
                      </div>
                      <div style={styles.itemInfo}>
                        <div style={styles.itemName}>{item.nama_product}</div>
                        <div style={styles.itemQuantity}>
                          <i className="fas fa-times" style={styles.quantityIcon}></i>
                          Quantity: {item.jumlah}
                        </div>
                      </div>
                      <div style={styles.itemPrice}>
                        Rp {(item.harga * item.jumlah).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const Pagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div style={styles.pagination}>
        <button
          style={{
            ...styles.paginationBtn,
            opacity: currentPage === 1 ? 0.5 : 1,
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
          }}
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
        >
          <i className="fas fa-chevron-left" style={styles.paginationIcon}></i>
          Previous
        </button>
        
        {pages.map(page => (
          <button
            key={page}
            style={{
              ...styles.paginationBtn,
              ...(currentPage === page ? styles.paginationBtnActive : {})
            }}
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </button>
        ))}
        
        <button
          style={{
            ...styles.paginationBtn,
            opacity: currentPage === totalPages ? 0.5 : 1,
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
          }}
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
        >
          Next
          <i className="fas fa-chevron-right" style={styles.paginationIcon}></i>
        </button>
      </div>
    );
  };

  return (
    <div style={styles.historyPage}>
      {/* FontAwesome CDN */}
      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
      />
      
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.pageHeader}>
          <div style={styles.headerContent}>
            <div style={styles.headerText}>
              <h1 style={styles.pageTitle}>
                <i className="fas fa-history" style={styles.titleIcon}></i>
                Order History
              </h1>
              <p style={styles.pageSubtitle}>View all your past transactions and orders</p>
            </div>
            <div style={styles.headerStats}>
              <div style={styles.statCard}>
                <div style={styles.statValue}>{transactions.length}</div>
                <div style={styles.statLabel}>Total Orders</div>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        {successMessage && (
          <div style={styles.alertSuccess}>
            <i className="fas fa-check-circle" style={styles.alertIcon}></i>
            {successMessage}
          </div>
        )}

        {error && (
          <div style={styles.alertError}>
            <i className="fas fa-exclamation-triangle" style={styles.alertIcon}></i>
            {error}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div style={styles.loadingContainer}>
            <Loading message="Loading transaction history..." />
          </div>
        ) : (
          <>
            {transactions.length > 0 ? (
              <>
                <div style={styles.transactionsContainer}>
                  {transactions.map(transaction => (
                    <TransactionCard key={transaction.id_transaksi} transaction={transaction} />
                  ))}
                </div>
                
                {totalPages > 1 && <Pagination />}
              </>
            ) : (
              <div style={styles.noTransactions}>
                <i className="fas fa-shopping-bag" style={styles.emptyIcon}></i>
                <h3 style={styles.emptyTitle}>No transactions found</h3>
                <p style={styles.emptyText}>
                  You haven't made any orders yet. Start shopping to see your transaction history here.
                </p>
                <Link to="/employee/shop" style={styles.startShoppingBtn}>
                  <i className="fas fa-shopping-cart" style={styles.buttonIcon}></i>
                  Start Shopping
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Styles object
const styles = {
  historyPage: {
    minHeight: '100vh',
    backgroundColor: '#F5F5F5',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '24px'
  },
  pageHeader: {
    background: 'linear-gradient(135deg, #604CC3 0%, #8b5cf6 100%)',
    borderRadius: '20px',
    padding: '32px',
    marginBottom: '24px',
    color: 'white',
    position: 'relative',
    overflow: 'hidden'
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    zIndex: 10,
    flexWrap: 'wrap',
    gap: '24px'
  },
  headerText: {
    flex: 1
  },
  pageTitle: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    margin: '0 0 8px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  titleIcon: {
    color: 'white'
  },
  pageSubtitle: {
    fontSize: '1.125rem',
    margin: 0,
    opacity: 0.9
  },
  headerStats: {
    display: 'flex',
    gap: '24px'
  },
  statCard: {
    textAlign: 'center',
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    padding: '16px 24px',
    backdropFilter: 'blur(10px)'
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '4px'
  },
  statLabel: {
    fontSize: '0.875rem',
    opacity: 0.9
  },
  alertSuccess: {
    padding: '16px 20px',
    borderRadius: '12px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'rgba(143, 209, 79, 0.2)',
    border: '1px solid #8FD14F',
    color: '#8FD14F',
    fontWeight: '500'
  },
  alertError: {
    padding: '16px 20px',
    borderRadius: '12px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'rgba(239, 68, 68, 0.2)',
    border: '1px solid #ef4444',
    color: '#ef4444',
    fontWeight: '500'
  },
  alertIcon: {
    fontSize: '1.125rem'
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px'
  },
  transactionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '32px'
  },
  transactionCard: {
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
    transition: 'all 0.3s ease'
  },
  transactionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '24px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease'
  },
  transactionMain: {
    flex: 1
  },
  transactionId: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  orderIconContainer: {
    width: '48px',
    height: '48px',
    background: 'linear-gradient(135deg, #FF6600 0%, #ff8533 100%)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  orderIcon: {
    color: 'white',
    fontSize: '1.25rem'
  },
  orderNumber: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '4px'
  },
  transactionDate: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#666',
    fontSize: '0.875rem'
  },
  dateIcon: {
    color: '#604CC3'
  },
  transactionSummary: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '8px',
    marginRight: '16px'
  },
  transactionAmount: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#FF6600'
  },
  transactionStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  statusIcon: {
    fontSize: '0.875rem'
  },
  expandIcon: {
    color: '#666',
    fontSize: '1.25rem'
  },
  transactionDetails: {
    borderTop: '1px solid #f0f0f0',
    background: '#f8f9fa'
  },
  detailsHeader: {
    padding: '20px 24px 0',
    borderBottom: '1px solid #e9ecef',
    marginBottom: '20px'
  },
  detailsTitle: {
    fontSize: '1.125rem',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 16px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  detailsIcon: {
    color: '#604CC3'
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    padding: '0 24px 24px'
  },
  detailItem: {
    background: 'white',
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid #e9ecef'
  },
  detailLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.875rem',
    color: '#666',
    fontWeight: '500',
    marginBottom: '8px'
  },
  detailIcon: {
    color: '#604CC3',
    fontSize: '0.875rem'
  },
  detailValue: {
    fontWeight: '600',
    color: '#333',
    fontSize: '0.875rem'
  },
  amountValue: {
    color: '#FF6600',
    fontSize: '1.125rem'
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  badgeIcon: {
    fontSize: '0.75rem'
  },
  transactionItems: {
    padding: '0 24px 24px'
  },
  itemsTitle: {
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 16px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  itemsIcon: {
    color: '#8FD14F'
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px',
    background: 'white',
    borderRadius: '12px',
    border: '1px solid #e9ecef',
    gap: '16px'
  },
  itemImageContainer: {
    width: '40px',
    height: '40px',
    background: 'linear-gradient(135deg, #8FD14F 0%, #7bc142 100%)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  itemImage: {
    color: 'white',
    fontSize: '1rem'
  },
  itemInfo: {
    flex: 1
  },
  itemName: {
    fontWeight: '600',
    color: '#333',
    marginBottom: '4px'
  },
  itemQuantity: {
    fontSize: '0.875rem',
    color: '#666',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  quantityIcon: {
    fontSize: '0.75rem'
  },
  itemPrice: {
    fontWeight: 'bold',
    color: '#FF6600',
    fontSize: '1rem'
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    marginTop: '32px',
    flexWrap: 'wrap'
  },
  paginationBtn: {
    padding: '12px 16px',
    border: '1px solid #e5e7eb',
    background: 'white',
    cursor: 'pointer',
    borderRadius: '8px',
    color: '#333',
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  paginationBtnActive: {
    background: '#604CC3',
    color: 'white',
    borderColor: '#604CC3'
  },
  paginationIcon: {
    fontSize: '0.75rem'
  },
  noTransactions: {
    textAlign: 'center',
    padding: '64px 32px',
    background: 'white',
    borderRadius: '20px',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb'
  },
  emptyIcon: {
    fontSize: '5rem',
    color: '#d1d5db',
    marginBottom: '24px'
  },
  emptyTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '8px',
    margin: '0 0 8px 0'
  },
  emptyText: {
    color: '#666',
    marginBottom: '32px',
    fontSize: '1rem',
    lineHeight: '1.6',
    margin: '0 0 32px 0'
  },
  startShoppingBtn: {
    background: 'linear-gradient(135deg, #FF6600 0%, #ff8533 100%)',
    color: 'white',
    padding: '14px 28px',
    borderRadius: '12px',
    textDecoration: 'none',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s ease'
  },
  buttonIcon: {
    fontSize: '0.875rem'
  }
};

export default HistoryPage;