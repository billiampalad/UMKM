// src/admin/pages/TransactionManagement.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../shared/contexts/AuthContext';

const TransactionManagement = () => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        status: 'all',
        startDate: '',
        endDate: '',
        search: ''
    });
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        completed: 0,
        cancelled: 0,
        totalRevenue: 0
    });

    // Mock data untuk demo (nanti ganti dengan API call)
    const mockTransactions = [
        {
            id_transaksi: 'TRX-001',
            id_user: 2,
            user_name: 'John Doe',
            user_email: 'john@example.com',
            tanggal_transaksi: '2025-06-09',
            total_amount: 250000,
            status: 'completed',
            payment_method: 'credit_card',
            items: [
                { id_produk: 1, nama_produk: 'Laptop Gaming', harga: 200000, kuantitas: 1 },
                { id_produk: 2, nama_produk: 'Mouse Wireless', harga: 50000, kuantitas: 1 }
            ],
            alamat_pengiriman: 'Jl. Sudirman No. 123, Jakarta',
            created_at: '2025-06-09T10:30:00Z',
            updated_at: '2025-06-09T14:20:00Z'
        },
        {
            id_transaksi: 'TRX-002',
            id_user: 3,
            user_name: 'Jane Smith',
            user_email: 'jane@example.com',
            tanggal_transaksi: '2025-06-09',
            total_amount: 150000,
            status: 'pending',
            payment_method: 'bank_transfer',
            items: [
                { id_produk: 3, nama_produk: 'Keyboard Mechanical', harga: 150000, kuantitas: 1 }
            ],
            alamat_pengiriman: 'Jl. Thamrin No. 456, Jakarta',
            created_at: '2025-06-09T11:15:00Z',
            updated_at: '2025-06-09T11:15:00Z'
        },
        {
            id_transaksi: 'TRX-003',
            id_user: 4,
            user_name: 'Bob Johnson',
            user_email: 'bob@example.com',
            tanggal_transaksi: '2025-06-08',
            total_amount: 75000,
            status: 'cancelled',
            payment_method: 'e_wallet',
            items: [
                { id_produk: 4, nama_produk: 'Webcam HD', harga: 75000, kuantitas: 1 }
            ],
            alamat_pengiriman: 'Jl. Gatot Subroto No. 789, Jakarta',
            created_at: '2025-06-08T09:20:00Z',
            updated_at: '2025-06-08T16:30:00Z'
        },
        {
            id_transaksi: 'TRX-004',
            id_user: 2,
            user_name: 'John Doe',
            user_email: 'john@example.com',
            tanggal_transaksi: '2025-06-08',
            total_amount: 320000,
            status: 'completed',
            payment_method: 'credit_card',
            items: [
                { id_produk: 5, nama_produk: 'Monitor 4K', harga: 300000, kuantitas: 1 },
                { id_produk: 6, nama_produk: 'USB Cable', harga: 20000, kuantitas: 1 }
            ],
            alamat_pengiriman: 'Jl. Sudirman No. 123, Jakarta',
            created_at: '2025-06-08T14:45:00Z',
            updated_at: '2025-06-08T18:20:00Z'
        },
        {
            id_transaksi: 'TRX-005',
            id_user: 5,
            user_name: 'Alice Brown',
            user_email: 'alice@example.com',
            tanggal_transaksi: '2025-06-07',
            total_amount: 180000,
            status: 'shipped',
            payment_method: 'bank_transfer',
            items: [
                { id_produk: 7, nama_produk: 'Headphone Gaming', harga: 180000, kuantitas: 1 }
            ],
            alamat_pengiriman: 'Jl. Rasuna Said No. 321, Jakarta',
            created_at: '2025-06-07T13:10:00Z',
            updated_at: '2025-06-09T08:15:00Z'
        }
    ];

    // Load transactions (mock data)
    useEffect(() => {
        const loadTransactions = async () => {
            setLoading(true);
            try {
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Filter transactions based on filters
                let filteredTransactions = mockTransactions;

                if (filters.status !== 'all') {
                    filteredTransactions = filteredTransactions.filter(t => t.status === filters.status);
                }

                if (filters.search) {
                    filteredTransactions = filteredTransactions.filter(t =>
                        t.id_transaksi.toLowerCase().includes(filters.search.toLowerCase()) ||
                        t.user_name.toLowerCase().includes(filters.search.toLowerCase()) ||
                        t.user_email.toLowerCase().includes(filters.search.toLowerCase())
                    );
                }

                if (filters.startDate && filters.endDate) {
                    filteredTransactions = filteredTransactions.filter(t => {
                        const transactionDate = new Date(t.tanggal_transaksi);
                        const start = new Date(filters.startDate);
                        const end = new Date(filters.endDate);
                        return transactionDate >= start && transactionDate <= end;
                    });
                }

                setTransactions(filteredTransactions);

                // Calculate stats
                const stats = {
                    total: mockTransactions.length,
                    pending: mockTransactions.filter(t => t.status === 'pending').length,
                    completed: mockTransactions.filter(t => t.status === 'completed').length,
                    cancelled: mockTransactions.filter(t => t.status === 'cancelled').length,
                    totalRevenue: mockTransactions
                        .filter(t => t.status === 'completed')
                        .reduce((sum, t) => sum + t.total_amount, 0)
                };
                setStats(stats);

            } catch (error) {
                setError('Failed to load transactions');
                console.error('Error loading transactions:', error);
            } finally {
                setLoading(false);
            }
        };

        loadTransactions();
    }, [filters]);

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleStatusUpdate = async (transactionId, newStatus) => {
        setActionLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Update transaction status in state
            setTransactions(prev => prev.map(t =>
                t.id_transaksi === transactionId
                    ? { ...t, status: newStatus, updated_at: new Date().toISOString() }
                    : t
            ));

            // Update selected transaction if it's being viewed
            if (selectedTransaction?.id_transaksi === transactionId) {
                setSelectedTransaction(prev => ({
                    ...prev,
                    status: newStatus,
                    updated_at: new Date().toISOString()
                }));
            }

            setShowModal(false);
            alert(`Transaction ${transactionId} status updated to ${newStatus}`);
        } catch (error) {
            setError('Failed to update transaction status');
            console.error('Error updating status:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { color: '#ffc107', bg: '#fff3cd', text: 'Pending' },
            completed: { color: '#28a745', bg: '#d4edda', text: 'Completed' },
            cancelled: { color: '#dc3545', bg: '#f8d7da', text: 'Cancelled' },
            shipped: { color: '#17a2b8', bg: '#d1ecf1', text: 'Shipped' },
            processing: { color: '#6f42c1', bg: '#e2d9f3', text: 'Processing' }
        };

        const config = statusConfig[status] || statusConfig.pending;

        return (
            <span style={{
                background: config.bg,
                color: config.color,
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '500'
            }}>
                {config.text}
            </span>
        );
    };

    const getPaymentMethodIcon = (method) => {
        const methods = {
            credit_card: '💳',
            bank_transfer: '🏦',
            e_wallet: '📱',
            cash: '💵'
        };
        return methods[method] || '💳';
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner" style={{ width: '40px', height: '40px', margin: '0 auto 16px' }}></div>
                    <p>Loading transactions...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', background: '#f8f9fa', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '28px', fontWeight: '700' }}>
                    📊 Transaction Management
                </h1>
                <p style={{ margin: 0, color: '#666' }}>
                    Manage and monitor all customer transactions
                </p>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '14px' }}>Total Transactions</p>
                            <h3 style={{ margin: 0, color: '#333', fontSize: '24px', fontWeight: '700' }}>{stats.total}</h3>
                        </div>
                        <span style={{ fontSize: '24px' }}>📈</span>
                    </div>
                </div>

                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '14px' }}>Pending</p>
                            <h3 style={{ margin: 0, color: '#ffc107', fontSize: '24px', fontWeight: '700' }}>{stats.pending}</h3>
                        </div>
                        <span style={{ fontSize: '24px' }}>⏳</span>
                    </div>
                </div>

                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '14px' }}>Completed</p>
                            <h3 style={{ margin: 0, color: '#28a745', fontSize: '24px', fontWeight: '700' }}>{stats.completed}</h3>
                        </div>
                        <span style={{ fontSize: '24px' }}>✅</span>
                    </div>
                </div>

                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '14px' }}>Total Revenue</p>
                            <h3 style={{ margin: 0, color: '#28a745', fontSize: '20px', fontWeight: '700' }}>{formatCurrency(stats.totalRevenue)}</h3>
                        </div>
                        <span style={{ fontSize: '24px' }}>💰</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>🔍 Filters</h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500', color: '#333' }}>
                            Status
                        </label>
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '2px solid #e9ecef',
                                borderRadius: '6px',
                                fontSize: '14px'
                            }}
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500', color: '#333' }}>
                            Search
                        </label>
                        <input
                            type="text"
                            placeholder="Transaction ID, Customer name, Email..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '2px solid #e9ecef',
                                borderRadius: '6px',
                                fontSize: '14px',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500', color: '#333' }}>
                            Start Date
                        </label>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => handleFilterChange('startDate', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '2px solid #e9ecef',
                                borderRadius: '6px',
                                fontSize: '14px',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500', color: '#333' }}>
                            End Date
                        </label>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => handleFilterChange('endDate', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '2px solid #e9ecef',
                                borderRadius: '6px',
                                fontSize: '14px',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
                    <h3 style={{ margin: 0, color: '#333' }}>📋 Transactions ({transactions.length})</h3>
                </div>

                {error && (
                    <div style={{ padding: '16px', background: '#f8d7da', color: '#721c24', borderLeft: '4px solid #dc3545' }}>
                        ❌ {error}
                    </div>
                )}

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8f9fa' }}>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333', borderBottom: '1px solid #eee' }}>
                                    Transaction ID
                                </th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333', borderBottom: '1px solid #eee' }}>
                                    Customer
                                </th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333', borderBottom: '1px solid #eee' }}>
                                    Date
                                </th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333', borderBottom: '1px solid #eee' }}>
                                    Amount
                                </th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333', borderBottom: '1px solid #eee' }}>
                                    Payment
                                </th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333', borderBottom: '1px solid #eee' }}>
                                    Status
                                </th>
                                <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#333', borderBottom: '1px solid #eee' }}>
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                                        📭 No transactions found
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((transaction) => (
                                    <tr key={transaction.id_transaksi} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                        <td style={{ padding: '12px' }}>
                                            <div style={{ fontWeight: '500', color: '#333', marginBottom: '4px' }}>
                                                {transaction.id_transaksi}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#666' }}>
                                                {transaction.items.length} item(s)
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <div style={{ fontWeight: '500', color: '#333', marginBottom: '4px' }}>
                                                {transaction.user_name}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#666' }}>
                                                {transaction.user_email}
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px', color: '#666', fontSize: '14px' }}>
                                            {formatDate(transaction.tanggal_transaksi)}
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <div style={{ fontWeight: '600', color: '#333' }}>
                                                {formatCurrency(transaction.total_amount)}
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span>{getPaymentMethodIcon(transaction.payment_method)}</span>
                                                <span style={{ fontSize: '14px', color: '#666', textTransform: 'capitalize' }}>
                                                    {transaction.payment_method.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            {getStatusBadge(transaction.status)}
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            <button
                                                onClick={() => {
                                                    setSelectedTransaction(transaction);
                                                    setShowModal(true);
                                                }}
                                                style={{
                                                    background: '#007bff',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    padding: '6px 12px',
                                                    fontSize: '12px',
                                                    cursor: 'pointer',
                                                    fontWeight: '500'
                                                }}
                                            >
                                                👁️ View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Transaction Detail Modal */}
            {showModal && selectedTransaction && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '12px',
                        width: '90%',
                        maxWidth: '600px',
                        maxHeight: '90vh',
                        overflow: 'auto'
                    }}>
                        <div style={{ padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, color: '#333' }}>
                                📋 Transaction Details
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '20px',
                                    cursor: 'pointer',
                                    color: '#666'
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        <div style={{ padding: '20px' }}>
                            {/* Transaction Info */}
                            <div style={{ marginBottom: '24px' }}>
                                <h4 style={{ margin: '0 0 12px 0', color: '#333' }}>Transaction Information</h4>
                                <div style={{ display: 'grid', gap: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#666' }}>Transaction ID:</span>
                                        <span style={{ fontWeight: '500' }}>{selectedTransaction.id_transaksi}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#666' }}>Date:</span>
                                        <span>{formatDate(selectedTransaction.tanggal_transaksi)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#666' }}>Status:</span>
                                        {getStatusBadge(selectedTransaction.status)}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#666' }}>Payment Method:</span>
                                        <span>
                                            {getPaymentMethodIcon(selectedTransaction.payment_method)} {selectedTransaction.payment_method.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#666' }}>Total Amount:</span>
                                        <span style={{ fontWeight: '600', color: '#28a745' }}>{formatCurrency(selectedTransaction.total_amount)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div style={{ marginBottom: '24px' }}>
                                <h4 style={{ margin: '0 0 12px 0', color: '#333' }}>Customer Information</h4>
                                <div style={{ display: 'grid', gap: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#666' }}>Name:</span>
                                        <span>{selectedTransaction.user_name}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#666' }}>Email:</span>
                                        <span>{selectedTransaction.user_email}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#666' }}>Shipping Address:</span>
                                        <span style={{ textAlign: 'right', maxWidth: '60%' }}>{selectedTransaction.alamat_pengiriman}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Items */}
                            <div style={{ marginBottom: '24px' }}>
                                <h4 style={{ margin: '0 0 12px 0', color: '#333' }}>Items ({selectedTransaction.items.length})</h4>
                                <div style={{ border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' }}>
                                    {selectedTransaction.items.map((item, index) => (
                                        <div key={index} style={{
                                            padding: '12px',
                                            borderBottom: index < selectedTransaction.items.length - 1 ? '1px solid #f0f0f0' : 'none',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <div>
                                                <div style={{ fontWeight: '500', marginBottom: '4px' }}>{item.nama_produk}</div>
                                                <div style={{ fontSize: '12px', color: '#666' }}>Qty: {item.kuantitas}</div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontWeight: '500' }}>{formatCurrency(item.harga)}</div>
                                                <div style={{ fontSize: '12px', color: '#666' }}>
                                                    Total: {formatCurrency(item.harga * item.kuantitas)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            {selectedTransaction.status === 'pending' && (
                                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                    <button
                                        onClick={() => handleStatusUpdate(selectedTransaction.id_transaksi, 'processing')}
                                        disabled={actionLoading}
                                        style={{
                                            background: '#6f42c1',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            padding: '8px 16px',
                                            fontSize: '14px',
                                            cursor: 'pointer',
                                            fontWeight: '500'
                                        }}
                                    >
                                        {actionLoading ? '⏳ Processing...' : '🔄 Mark as Processing'}
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate(selectedTransaction.id_transaksi, 'cancelled')}
                                        disabled={actionLoading}
                                        style={{
                                            background: '#dc3545',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            padding: '8px 16px',
                                            fontSize: '14px',
                                            cursor: 'pointer',
                                            fontWeight: '500'
                                        }}
                                    >
                                        {actionLoading ? '⏳ Cancelling...' : '❌ Cancel Transaction'}
                                    </button>
                                </div>
                            )}

                            {selectedTransaction.status === 'processing' && (
                                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                    <button
                                        onClick={() => handleStatusUpdate(selectedTransaction.id_transaksi, 'shipped')}
                                        disabled={actionLoading}
                                        style={{
                                            background: '#17a2b8',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            padding: '8px 16px',
                                            fontSize: '14px',
                                            cursor: 'pointer',
                                            fontWeight: '500'
                                        }}
                                    >
                                        {actionLoading ? '⏳ Shipping...' : '🚚 Mark as Shipped'}
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate(selectedTransaction.id_transaksi, 'cancelled')}
                                        disabled={actionLoading}
                                        style={{
                                            background: '#dc3545',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            padding: '8px 16px',
                                            fontSize: '14px',
                                            cursor: 'pointer',
                                            fontWeight: '500'
                                        }}
                                    >
                                        {actionLoading ? '⏳ Cancelling...' : '❌ Cancel Transaction'}
                                    </button>
                                </div>
                            )}

                            {selectedTransaction.status === 'shipped' && (
                                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                    <button
                                        onClick={() => handleStatusUpdate(selectedTransaction.id_transaksi, 'completed')}
                                        disabled={actionLoading}
                                        style={{
                                            background: '#28a745',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            padding: '8px 16px',
                                            fontSize: '14px',
                                            cursor: 'pointer',
                                            fontWeight: '500'
                                        }}
                                    >
                                        {actionLoading ? '⏳ Completing...' : '✅ Mark as Completed'}
                                    </button>
                                </div>
                            )}

                            {(selectedTransaction.status === 'completed' || selectedTransaction.status === 'cancelled') && (
                                <div style={{
                                    padding: '12px',
                                    background: selectedTransaction.status === 'completed' ? '#d4edda' : '#f8d7da',
                                    color: selectedTransaction.status === 'completed' ? '#155724' : '#721c24',
                                    borderRadius: '6px',
                                    textAlign: 'center'
                                }}>
                                    {selectedTransaction.status === 'completed' ?
                                        '✅ Transaction completed successfully' :
                                        '❌ Transaction has been cancelled'
                                    }
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* CSS for spinner */}
            <style jsx>{`
        .spinner {
          border: 3px solid #f3f3f3;
          border-top: 3px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        button:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
        }

        table th {
          position: sticky;
          top: 0;
          background: #f8f9fa;
          z-index: 1;
        }

        @media (max-width: 768px) {
          .table-responsive {
            font-size: 14px;
          }
          
          .modal-content {
            width: 95%;
            margin: 20px;
          }
          
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .filters-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .action-buttons {
            flex-direction: column;
          }
          
          .action-buttons button {
            width: 100%;
          }
        }
      `}</style>
        </div>
    );
};

export default TransactionManagement;