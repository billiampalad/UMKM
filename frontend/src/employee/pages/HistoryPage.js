// src/employee/pages/HistoryPage.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FiClock, FiEye, FiCalendar, FiDollarSign, 
  FiCheck, FiX, FiAlertCircle, FiShoppingBag,
  FiChevronDown, FiChevronUp 
} from 'react-icons/fi';
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
        return <FiCheck className="status-icon success" />;
      case 'pending':
        return <FiAlertCircle className="status-icon warning" />;
      case 'failed':
        return <FiX className="status-icon error" />;
      default:
        return <FiAlertCircle className="status-icon" />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'completed':
        return 'completed';
      case 'pending':
        return 'pending';
      case 'failed':
        return 'failed';
      default:
        return 'unknown';
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

    return (
      <div className="transaction-card">
        <div className="transaction-header" onClick={() => toggleTransactionDetails(transaction.id_transaksi)}>
          <div className="transaction-main">
            <div className="transaction-id">
              <FiShoppingBag className="transaction-icon" />
              <span>Order #{transaction.id_transaksi}</span>
            </div>
            <div className="transaction-date">
              <FiCalendar />
              <span>{formattedDate.date} at {formattedDate.time}</span>
            </div>
          </div>
          
          <div className="transaction-summary">
            <div className="transaction-amount">
              <FiDollarSign />
              <span>Rp {transaction.total_harga.toLocaleString()}</span>
            </div>
            <div className={`transaction-status ${getStatusClass(transaction.status_pembayaran)}`}>
              {getStatusIcon(transaction.status_pembayaran)}
              <span>{transaction.status_pembayaran}</span>
            </div>
          </div>

          <div className="expand-icon">
            {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
          </div>
        </div>

        {isExpanded && (
          <div className="transaction-details">
            <div className="details-grid">
              <div className="detail-item">
                <label>Payment Method:</label>
                <span>{transaction.metode_pembayaran}</span>
              </div>
              <div className="detail-item">
                <label>Transaction Date:</label>
                <span>{formattedDate.date} {formattedDate.time}</span>
              </div>
              <div className="detail-item">
                <label>Total Amount:</label>
                <span className="amount">Rp {transaction.total_harga.toLocaleString()}</span>
              </div>
              <div className="detail-item">
                <label>Status:</label>
                <span className={`status-badge ${getStatusClass(transaction.status_pembayaran)}`}>
                  {getStatusIcon(transaction.status_pembayaran)}
                  {transaction.status_pembayaran}
                </span>
              </div>
            </div>

            {transaction.items && transaction.items.length > 0 && (
              <div className="transaction-items">
                <h4>Items Ordered:</h4>
                <div className="items-list">
                  {transaction.items.map((item, index) => (
                    <div key={index} className="item-row">
                      <div className="item-info">
                        <span className="item-name">{item.nama_product}</span>
                        <span className="item-quantity">Qty: {item.jumlah}</span>
                      </div>
                      <div className="item-price">
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
      <div className="pagination">
        <button
          className="pagination-btn"
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        
        {pages.map(page => (
          <button
            key={page}
            className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </button>
        ))}
        
        <button
          className="pagination-btn"
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="history-page">
      <div className="page-header">
        <h1 className="page-title">
          <FiClock />
          Order History
        </h1>
        <p className="page-subtitle">View all your past transactions and orders</p>
      </div>

      {successMessage && (
        <div className="alert alert-success">
          <FiCheck /> {successMessage}
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {loading ? (
        <Loading message="Loading transaction history..." />
      ) : (
        <>
          {transactions.length > 0 ? (
            <>
              <div className="transactions-container">
                {transactions.map(transaction => (
                  <TransactionCard key={transaction.id_transaksi} transaction={transaction} />
                ))}
              </div>
              
              {totalPages > 1 && <Pagination />}
            </>
          ) : (
            <div className="no-transactions">
              <FiShoppingBag className="empty-icon" />
              <h3>No transactions found</h3>
              <p>You haven't made any orders yet. Start shopping to see your transaction history here.</p>
              <Link to="/employee/shop" className="btn btn-primary">
                Start Shopping
              </Link>
            </div>
          )}
        </>
      )}

      <style jsx>{`
        .history-page {
          padding: 0;
        }

        .page-header {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .page-title {
          font-size: 2rem;
          font-weight: 700;
          color: #333;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .page-subtitle {
          color: #666;
          font-size: 1rem;
          margin: 0;
        }

        .alert {
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
        }

        .alert-success {
          background: #d4edda;
          border: 1px solid #c3e6cb;
          color: #155724;
        }

        .alert-error {
          background: #f8d7da;
          border: 1px solid #f5c6cb;
          color: #721c24;
        }

        .transactions-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .transaction-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          transition: all 0.2s;
        }

        .transaction-card:hover {
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }

        .transaction-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .transaction-header:hover {
          background: #f8f9fa;
        }

        .transaction-main {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex: 1;
        }

        .transaction-id {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          color: #333;
          font-size: 1.125rem;
        }

        .transaction-icon {
          color: #007bff;
        }

        .transaction-date {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #666;
          font-size: 0.875rem;
        }

        .transaction-summary {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.5rem;
          margin-right: 1rem;
        }

        .transaction-amount {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-weight: 700;
          color: #333;
          font-size: 1.125rem;
        }

        .transaction-status {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.375rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .transaction-status.completed {
          background: #d4edda;
          color: #155724;
        }

        .transaction-status.pending {
          background: #fff3cd;
          color: #856404;
        }

        .transaction-status.failed {
          background: #f8d7da;
          color: #721c24;
        }

        .status-icon {
          font-size: 0.875rem;
        }

        .expand-icon {
          color: #666;
          font-size: 1.25rem;
        }

        .transaction-details {
          border-top: 1px solid #f0f0f0;
          padding: 1.5rem;
          background: #f8f9fa;
        }

        .details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .detail-item label {
          font-size: 0.875rem;
          color: #666;
          font-weight: 500;
        }

        .detail-item span {
          font-weight: 600;
          color: #333;
        }

        .detail-item .amount {
          color: #007bff;
          font-size: 1.125rem;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .transaction-items h4 {
          color: #333;
          margin: 0 0 1rem 0;
          font-size: 1rem;
        }

        .items-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .item-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: white;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }

        .item-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .item-name {
          font-weight: 600;
          color: #333;
        }

        .item-quantity {
          font-size: 0.875rem;
          color: #666;
        }

        .item-price {
          font-weight: 600;
          color: #007bff;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
          margin-top: 2rem;
        }

        .pagination-btn {
          padding: 8px 12px;
          border: 1px solid #ddd;
          background: white;
          cursor: pointer;
          border-radius: 6px;
          color: #333;
          font-size: 14px;
          transition: all 0.2s;
        }

        .pagination-btn:hover:not(:disabled) {
          background: #f8f9fa;
          border-color: #007bff;
        }

        .pagination-btn.active {
          background: #007bff;
          color: white;
          border-color: #007bff;
        }

        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .no-transactions {
          text-align: center;
          padding: 4rem 2rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .empty-icon {
          font-size: 4rem;
          color: #ddd;
          margin-bottom: 1.5rem;
        }

        .no-transactions h3 {
          color: #333;
          margin-bottom: 0.5rem;
        }

        .no-transactions p {
          color: #666;
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s;
          cursor: pointer;
        }

        .btn-primary {
          background: #007bff;
          color: white;
        }

        .btn-primary:hover {
          background: #0056b3;
          transform: translateY(-1px);
        }

        @media (max-width: 768px) {
          .page-header {
            padding: 1.5rem;
          }

          .page-title {
            font-size: 1.5rem;
          }

          .transaction-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
            padding: 1rem;
          }

          .transaction-summary {
            width: 100%;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            margin-right: 0;
          }

          .transaction-details {
            padding: 1rem;
          }

          .details-grid {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }

          .item-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .item-price {
            align-self: flex-end;
          }

          .no-transactions {
            padding: 2rem 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default HistoryPage;