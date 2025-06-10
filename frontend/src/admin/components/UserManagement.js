import React, { useState, useEffect } from 'react';
import api from '../../shared/utils/api';

const TransactionReport = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/transactions');
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (filterStatus !== 'all' && transaction.status_pembayaran !== filterStatus) {
      return false;
    }
    
    if (dateRange.startDate && new Date(transaction.tanggal_transaksi) < new Date(dateRange.startDate)) {
      return false;
    }
    
    if (dateRange.endDate && new Date(transaction.tanggal_transaksi) > new Date(dateRange.endDate)) {
      return false;
    }
    
    return true;
  });

  const totalRevenue = filteredTransactions
    .filter(t => t.status_pembayaran === 'completed')
    .reduce((sum, t) => sum + parseFloat(t.total_harga), 0);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="transaction-report">
      <h1>Transaction Reports</h1>
      
      <div className="filters">
        <div className="filter-group">
          <label>Status:</label>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Start Date:</label>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
          />
        </div>
        
        <div className="filter-group">
          <label>End Date:</label>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
          />
        </div>
      </div>

      <div className="summary-stats">
        <div className="stat-card">
          <h3>Total Transactions</h3>
          <p className="stat-number">{filteredTransactions.length}</p>
        </div>
        
        <div className="stat-card">
          <h3>Completed Revenue</h3>
          <p className="stat-number">Rp {totalRevenue.toLocaleString()}</p>
        </div>
        
        <div className="stat-card">
          <h3>Pending Transactions</h3>
          <p className="stat-number">
            {filteredTransactions.filter(t => t.status_pembayaran === 'pending').length}
          </p>
        </div>
      </div>

      <div className="transactions-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Total</th>
              <th>Date</th>
              <th>Payment Method</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((transaction) => (
              <tr key={transaction.id_transaksi}>
                <td>{transaction.id_transaksi}</td>
                <td>{transaction.user_nama || 'N/A'}</td>
                <td>Rp {parseFloat(transaction.total_harga).toLocaleString()}</td>
                <td>{new Date(transaction.tanggal_transaksi).toLocaleDateString()}</td>
                <td>{transaction.metode_pembayaran}</td>
                <td>
                  <span className={`status-badge ${transaction.status_pembayaran}`}>
                    {transaction.status_pembayaran}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionReport;