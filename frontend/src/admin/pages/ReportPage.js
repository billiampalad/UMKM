import React, { useState, useEffect } from 'react';

const ReportPage = () => {
    const user = { nama: 'Admin User' }; // Mock user
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-green-500 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white">
                        <i className="fas fa-dollar-sign text-xl"></i>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-600 mb-1">Total Penjualan</h3>
                        <p className="text-xl font-bold text-gray-800 mb-1">{formatCurrency(stats.totalSales)}</p>
                        <span className={`text-sm flex items-center gap-1 ${stats.salesGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            <i className={`fas ${stats.salesGrowth >= 0 ? 'fa-trending-up' : 'fa-trending-down'}`}></i>
                            {Math.abs(stats.salesGrowth).toFixed(1)}%
                        </span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-blue-500 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white">
                        <i className="fas fa-users text-xl"></i>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-600 mb-1">Total Pengguna</h3>
                        <p className="text-xl font-bold text-gray-800 mb-1">{stats.totalUsers.toLocaleString()}</p>
                        <span className="text-sm text-gray-500">Pengguna baru</span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-yellow-500 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center text-white">
                        <i className="fas fa-box text-xl"></i>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-600 mb-1">Total Produk</h3>
                        <p className="text-xl font-bold text-gray-800 mb-1">{stats.totalProducts}</p>
                        <span className="text-sm text-gray-500">Produk aktif</span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-cyan-500 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center text-white">
                        <i className="fas fa-receipt text-xl"></i>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-600 mb-1">Transaksi</h3>
                        <p className="text-xl font-bold text-gray-800 mb-1">{stats.totalTransactions}</p>
                        <span className="text-sm text-gray-500">Transaksi selesai</span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-purple-500 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white">
                        <i className="fas fa-chart-bar text-xl"></i>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-600 mb-1">Rata-rata Order</h3>
                        <p className="text-xl font-bold text-gray-800 mb-1">{formatCurrency(stats.averageOrderValue)}</p>
                        <span className="text-sm text-gray-500">Per transaksi</span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-orange-500 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white">
                        <i className="fas fa-trophy text-xl"></i>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-600 mb-1">Produk Terlaris</h3>
                        <p className="text-lg font-bold text-gray-800 mb-1">{stats.topSellingProduct}</p>
                        <span className="text-sm text-gray-500">Paling banyak terjual</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderSalesReport = () => (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Tanggal</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Penjualan</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Jumlah Order</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Pelanggan</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Rata-rata Order</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {reportData.sales.map((sale, index) => (
                        <tr key={index} className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-orange-50 transition-all duration-200">
                            <td className="px-6 py-4 text-gray-800">{formatDate(sale.date)}</td>
                            <td className="px-6 py-4 font-semibold text-gray-800">{formatCurrency(sale.amount)}</td>
                            <td className="px-6 py-4 text-gray-800">{sale.orders}</td>
                            <td className="px-6 py-4 text-gray-800">{sale.customers}</td>
                            <td className="px-6 py-4 font-semibold text-gray-800">{formatCurrency(sale.amount / sale.orders)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderUsersReport = () => (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Tanggal</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Pengguna Baru</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Pengguna Aktif</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Role</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {reportData.users.map((user, index) => (
                        <tr key={index} className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-orange-50 transition-all duration-200">
                            <td className="px-6 py-4 text-gray-800">{formatDate(user.date)}</td>
                            <td className="px-6 py-4 text-gray-800">{user.newUsers}</td>
                            <td className="px-6 py-4 text-gray-800">{user.activeUsers}</td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                                    user.role === 'admin' 
                                        ? 'bg-red-100 text-red-700 border border-red-200' 
                                        : 'bg-blue-100 text-blue-700 border border-blue-200'
                                }`}>
                                    <i className={user.role === 'admin' ? 'fas fa-user-shield' : 'fas fa-user'}></i>
                                    {user.role === 'admin' ? 'Admin' : 'Employee'}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderProductsReport = () => (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Nama Produk</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Terjual</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Pendapatan</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Stok</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Kategori</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {reportData.products.map((product) => (
                        <tr key={product.id} className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-orange-50 transition-all duration-200">
                            <td className="px-6 py-4 text-gray-800 font-semibold">#{product.id}</td>
                            <td className="px-6 py-4 text-gray-800 font-semibold">{product.name}</td>
                            <td className="px-6 py-4 text-gray-800">{product.sold}</td>
                            <td className="px-6 py-4 text-gray-800 font-semibold">{formatCurrency(product.revenue)}</td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                                    product.stock < 10 
                                        ? 'bg-red-100 text-red-700 border border-red-200' 
                                        : 'bg-green-100 text-green-700 border border-green-200'
                                }`}>
                                    {product.stock}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">
                                    {product.category}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderTransactionsReport = () => (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">ID Transaksi</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Tanggal</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Pelanggan</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Produk</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Jumlah</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {reportData.transactions.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-orange-50 transition-all duration-200">
                            <td className="px-6 py-4 text-gray-800 font-semibold">{transaction.id}</td>
                            <td className="px-6 py-4 text-gray-800">{formatDate(transaction.date)}</td>
                            <td className="px-6 py-4 text-gray-800">{transaction.customer}</td>
                            <td className="px-6 py-4 text-gray-800">{transaction.product}</td>
                            <td className="px-6 py-4 text-gray-800 font-semibold">{formatCurrency(transaction.amount)}</td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                                    transaction.status === 'completed' 
                                        ? 'bg-green-100 text-green-700 border border-green-200'
                                        : transaction.status === 'pending'
                                        ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                                        : 'bg-red-100 text-red-700 border border-red-200'
                                }`}>
                                    {transaction.status === 'completed' && <><i className="fas fa-check-circle"></i> Selesai</>}
                                    {transaction.status === 'pending' && <><i className="fas fa-clock"></i> Pending</>}
                                    {transaction.status === 'cancelled' && <><i className="fas fa-times-circle"></i> Dibatalkan</>}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

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
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                                    <i className="fas fa-chart-line text-orange-400"></i>
                                    Laporan & Analisis
                                </h1>
                                <p className="text-purple-100 text-lg">Dashboard laporan komprehensif untuk analisis bisnis</p>
                            </div>
                            <button
                                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg disabled:opacity-50"
                                onClick={loadReportData}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <i className="fas fa-spinner animate-spin"></i>
                                        Loading...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-sync-alt"></i>
                                        Refresh Data
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Date Filter */}
                    <div className="bg-white rounded-2xl p-6 mb-8 shadow-lg">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                            <label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <i className="fas fa-calendar-alt text-purple-500"></i>
                                Periode Laporan:
                            </label>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                <input
                                    type="date"
                                    value={dateFilter.startDate}
                                    onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
                                    className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors duration-200"
                                />
                                <span className="text-gray-600 font-medium">sampai</span>
                                <input
                                    type="date"
                                    value={dateFilter.endDate}
                                    onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
                                    className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors duration-200"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    {renderStatsCards()}

                    {/* Report Navigation */}
                    <div className="bg-white rounded-2xl p-6 mb-8 shadow-lg">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                            <div className="flex flex-wrap gap-2">
                                <button
                                    className={`px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${
                                        selectedReport === 'sales'
                                            ? 'bg-purple-500 text-white shadow-lg'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                    onClick={() => setSelectedReport('sales')}
                                >
                                    <i className="fas fa-dollar-sign"></i>
                                    Laporan Penjualan
                                </button>
                                <button
                                    className={`px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${
                                        selectedReport === 'users'
                                            ? 'bg-purple-500 text-white shadow-lg'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                    onClick={() => setSelectedReport('users')}
                                >
                                    <i className="fas fa-users"></i>
                                    Laporan Pengguna
                                </button>
                                <button
                                    className={`px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${
                                        selectedReport === 'products'
                                            ? 'bg-purple-500 text-white shadow-lg'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                    onClick={() => setSelectedReport('products')}
                                >
                                    <i className="fas fa-box"></i>
                                    Laporan Produk
                                </button>
                                <button
                                    className={`px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${
                                        selectedReport === 'transactions'
                                            ? 'bg-purple-500 text-white shadow-lg'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                    onClick={() => setSelectedReport('transactions')}
                                >
                                    <i className="fas fa-receipt"></i>
                                    Laporan Transaksi
                                </button>
                            </div>

                            <button
                                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl transition-all duration-200 font-semibold flex items-center gap-2 disabled:opacity-50"
                                onClick={() => exportToCSV(reportData[selectedReport], selectedReport)}
                                disabled={loading || !reportData[selectedReport]?.length}
                            >
                                <i className="fas fa-download"></i>
                                Export CSV
                            </button>
                        </div>
                    </div>

                    {/* Report Content */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-16">
                                <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
                                <p className="text-gray-600 text-lg">Memuat data laporan...</p>
                            </div>
                        ) : (
                            <div>
                                {selectedReport === 'sales' && renderSalesReport()}
                                {selectedReport === 'users' && renderUsersReport()}
                                {selectedReport === 'products' && renderProductsReport()}
                                {selectedReport === 'transactions' && renderTransactionsReport()}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ReportPage;