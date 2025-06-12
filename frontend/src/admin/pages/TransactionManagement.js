import React, { useState, useEffect } from 'react';

const TransactionManagement = () => {
    const user = { nama: 'Admin User' }; // Mock user
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
            pending: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
            completed: 'bg-green-100 text-green-700 border border-green-200',
            cancelled: 'bg-red-100 text-red-700 border border-red-200',
            shipped: 'bg-blue-100 text-blue-700 border border-blue-200',
            processing: 'bg-purple-100 text-purple-700 border border-purple-200'
        };

        const statusText = {
            pending: 'Pending',
            completed: 'Completed',
            cancelled: 'Cancelled',
            shipped: 'Shipped',
            processing: 'Processing'
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusConfig[status] || statusConfig.pending}`}>
                {statusText[status] || statusText.pending}
            </span>
        );
    };

    const getPaymentMethodIcon = (method) => {
        const methods = {
            credit_card: 'fas fa-credit-card',
            bank_transfer: 'fas fa-university',
            e_wallet: 'fas fa-mobile-alt',
            cash: 'fas fa-money-bill-wave'
        };
        return methods[method] || 'fas fa-credit-card';
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
            <>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
                <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
                <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600 text-lg">Loading transactions...</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            {/* CDN Links */}
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
            
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-3xl p-8 mb-8 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-32 translate-x-32"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full translate-y-24 -translate-x-24"></div>
                        <div className="relative z-10">
                            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                                <i className="fas fa-chart-line text-orange-400"></i>
                                Transaction Management
                            </h1>
                            <p className="text-purple-100 text-lg">Manage and monitor all customer transactions</p>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-blue-500 hover:shadow-xl transition-shadow duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-semibold mb-1">Total Transactions</p>
                                    <h3 className="text-2xl font-bold text-gray-800">{stats.total}</h3>
                                </div>
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white">
                                    <i className="fas fa-chart-bar text-lg"></i>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-yellow-500 hover:shadow-xl transition-shadow duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-semibold mb-1">Pending</p>
                                    <h3 className="text-2xl font-bold text-yellow-600">{stats.pending}</h3>
                                </div>
                                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center text-white">
                                    <i className="fas fa-clock text-lg"></i>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-green-500 hover:shadow-xl transition-shadow duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-semibold mb-1">Completed</p>
                                    <h3 className="text-2xl font-bold text-green-600">{stats.completed}</h3>
                                </div>
                                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white">
                                    <i className="fas fa-check-circle text-lg"></i>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-orange-500 hover:shadow-xl transition-shadow duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-semibold mb-1">Total Revenue</p>
                                    <h3 className="text-lg font-bold text-orange-600">{formatCurrency(stats.totalRevenue)}</h3>
                                </div>
                                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white">
                                    <i className="fas fa-dollar-sign text-lg"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-2xl p-6 mb-8 shadow-lg">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <i className="fas fa-filter text-purple-500"></i>
                            Filters
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                                <select
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none bg-white transition-colors duration-200"
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
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                        <i className="fas fa-search"></i>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Transaction ID, Customer..."
                                        value={filters.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors duration-200"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                                <input
                                    type="date"
                                    value={filters.startDate}
                                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors duration-200"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                                <input
                                    type="date"
                                    value={filters.endDate}
                                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors duration-200"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-6 flex justify-between items-center">
                            <span className="text-red-700 flex items-center gap-2">
                                <i className="fas fa-exclamation-circle"></i>
                                {error}
                            </span>
                            <button
                                onClick={() => setError(null)}
                                className="text-red-500 hover:text-red-700 text-xl"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                    )}

                    {/* Transactions Table */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <i className="fas fa-list text-purple-500"></i>
                                Transactions ({transactions.length})
                            </h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Transaction ID</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Customer</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Payment</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {transactions.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                                <div className="flex flex-col items-center gap-3">
                                                    <i className="fas fa-inbox text-4xl text-gray-300"></i>
                                                    <p className="text-lg">No transactions found</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        transactions.map((transaction) => (
                                            <tr key={transaction.id_transaksi} className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-orange-50 transition-all duration-200">
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-gray-800 mb-1">{transaction.id_transaksi}</div>
                                                    <div className="text-xs text-gray-500">{transaction.items.length} item(s)</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-gray-800 mb-1">{transaction.user_name}</div>
                                                    <div className="text-xs text-gray-500">{transaction.user_email}</div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600 text-sm">
                                                    {formatDate(transaction.tanggal_transaksi)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-gray-800">
                                                        {formatCurrency(transaction.total_amount)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <i className={`${getPaymentMethodIcon(transaction.payment_method)} text-purple-500`}></i>
                                                        <span className="text-sm text-gray-600 capitalize">
                                                            {transaction.payment_method.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getStatusBadge(transaction.status)}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedTransaction(transaction);
                                                            setShowModal(true);
                                                        }}
                                                        className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded-lg text-xs font-semibold transition-colors duration-200 flex items-center gap-1 mx-auto"
                                                    >
                                                        <i className="fas fa-eye"></i>
                                                        View
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
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                        <i className="fas fa-receipt text-purple-500"></i>
                                        Transaction Details
                                    </h3>
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="text-gray-500 hover:text-gray-700 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200"
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* Transaction Info */}
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                            <i className="fas fa-info-circle text-blue-500"></i>
                                            Transaction Information
                                        </h4>
                                        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Transaction ID:</span>
                                                <span className="font-semibold text-gray-800">{selectedTransaction.id_transaksi}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Date:</span>
                                                <span className="text-gray-800">{formatDate(selectedTransaction.tanggal_transaksi)}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Status:</span>
                                                {getStatusBadge(selectedTransaction.status)}
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Payment Method:</span>
                                                <span className="flex items-center gap-2">
                                                    <i className={`${getPaymentMethodIcon(selectedTransaction.payment_method)} text-purple-500`}></i>
                                                    <span className="capitalize">{selectedTransaction.payment_method.replace('_', ' ')}</span>
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Total Amount:</span>
                                                <span className="font-bold text-green-600 text-lg">{formatCurrency(selectedTransaction.total_amount)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Customer Info */}
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                            <i className="fas fa-user text-green-500"></i>
                                            Customer Information
                                        </h4>
                                        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Name:</span>
                                                <span className="font-semibold text-gray-800">{selectedTransaction.user_name}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Email:</span>
                                                <span className="text-gray-800">{selectedTransaction.user_email}</span>
                                            </div>
                                            <div className="flex justify-between items-start">
                                                <span className="text-gray-600">Shipping Address:</span>
                                                <span className="text-right text-gray-800 max-w-xs">{selectedTransaction.alamat_pengiriman}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Items */}
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                            <i className="fas fa-shopping-bag text-orange-500"></i>
                                            Items ({selectedTransaction.items.length})
                                        </h4>
                                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                                            {selectedTransaction.items.map((item, index) => (
                                                <div key={index} className={`p-4 flex justify-between items-center ${index < selectedTransaction.items.length - 1 ? 'border-b border-gray-100' : ''}`}>
                                                    <div>
                                                        <div className="font-semibold text-gray-800 mb-1">{item.nama_produk}</div>
                                                        <div className="text-sm text-gray-500">Qty: {item.kuantitas}</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-semibold text-gray-800">{formatCurrency(item.harga)}</div>
                                                        <div className="text-sm text-gray-500">
                                                            Total: {formatCurrency(item.harga * item.kuantitas)}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="pt-4 border-t border-gray-200">
                                        {selectedTransaction.status === 'pending' && (
                                            <div className="flex flex-wrap gap-3">
                                                <button
                                                    onClick={() => handleStatusUpdate(selectedTransaction.id_transaksi, 'processing')}
                                                    disabled={actionLoading}
                                                    className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-xl transition-colors duration-200 font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                                                >
                                                    {actionLoading ? (
                                                        <>
                                                            <i className="fas fa-spinner animate-spin"></i>
                                                            Processing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="fas fa-cog"></i>
                                                            Mark as Processing
                                                        </>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(selectedTransaction.id_transaksi, 'cancelled')}
                                                    disabled={actionLoading}
                                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-xl transition-colors duration-200 font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                                                >
                                                    {actionLoading ? (
                                                        <>
                                                            <i className="fas fa-spinner animate-spin"></i>
                                                            Cancelling...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="fas fa-times-circle"></i>
                                                            Cancel Transaction
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        )}

                                        {selectedTransaction.status === 'processing' && (
                                            <div className="flex flex-wrap gap-3">
                                                <button
                                                    onClick={() => handleStatusUpdate(selectedTransaction.id_transaksi, 'shipped')}
                                                    disabled={actionLoading}
                                                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-xl transition-colors duration-200 font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                                                >
                                                    {actionLoading ? (
                                                        <>
                                                            <i className="fas fa-spinner animate-spin"></i>
                                                            Shipping...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="fas fa-shipping-fast"></i>
                                                            Mark as Shipped
                                                        </>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(selectedTransaction.id_transaksi, 'cancelled')}
                                                    disabled={actionLoading}
                                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-xl transition-colors duration-200 font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                                                >
                                                    {actionLoading ? (
                                                        <>
                                                            <i className="fas fa-spinner animate-spin"></i>
                                                            Cancelling...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="fas fa-times-circle"></i>
                                                            Cancel Transaction
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        )}

                                        {selectedTransaction.status === 'shipped' && (
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => handleStatusUpdate(selectedTransaction.id_transaksi, 'completed')}
                                                    disabled={actionLoading}
                                                    className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-xl transition-colors duration-200 font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                                                >
                                                    {actionLoading ? (
                                                        <>
                                                            <i className="fas fa-spinner animate-spin"></i>
                                                            Completing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="fas fa-check-circle"></i>
                                                            Mark as Completed
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        )}

                                        {(selectedTransaction.status === 'completed' || selectedTransaction.status === 'cancelled') && (
                                            <div className={`p-4 rounded-xl text-center font-semibold ${
                                                selectedTransaction.status === 'completed' 
                                                    ? 'bg-green-50 text-green-700 border border-green-200' 
                                                    : 'bg-red-50 text-red-700 border border-red-200'
                                            }`}>
                                                {selectedTransaction.status === 'completed' ? (
                                                    <>
                                                        <i className="fas fa-check-circle mr-2"></i>
                                                        Transaction completed successfully
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fas fa-times-circle mr-2"></i>
                                                        Transaction has been cancelled
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default TransactionManagement;