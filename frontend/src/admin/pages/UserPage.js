import React, { useState, useEffect } from 'react';

const UserPage = () => {
    const currentUser = { id_user: 1, nama: 'Admin User' }; // Mock current user
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    // Form states
    const [formData, setFormData] = useState({
        nama: '',
        email: '',
        password: '',
        role: 'employee'
    });

    // Search & Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(10);

    // Load users on component mount
    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            setError('');
            
            // Simulate API call dengan mock data
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Mock data - ganti ini dengan API call sebenarnya nanti
            const mockUsers = [
                {
                    id_user: 1,
                    nama: 'Administrator',
                    email: 'admin@ecommerce.com',
                    role: 'admin',
                    created_at: '2025-01-01T10:00:00Z'
                },
                {
                    id_user: 2,
                    nama: 'John Doe',
                    email: 'john@example.com',
                    role: 'employee',
                    created_at: '2025-01-15T14:30:00Z'
                },
                {
                    id_user: 3,
                    nama: 'Jane Smith',
                    email: 'jane@example.com',
                    role: 'employee',
                    created_at: '2025-02-01T09:15:00Z'
                },
                {
                    id_user: 4,
                    nama: 'Bob Wilson',
                    email: 'bob@example.com',
                    role: 'employee',
                    created_at: '2025-02-15T16:45:00Z'
                },
                {
                    id_user: 5,
                    nama: 'Alice Brown',
                    email: 'alice@example.com',
                    role: 'admin',
                    created_at: '2025-03-01T11:20:00Z'
                }
            ];
            
            setUsers(mockUsers);
            
        } catch (err) {
            setError('Error loading users: ' + err.message);
            console.error('Load users error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const resetForm = () => {
        setFormData({
            nama: '',
            email: '',
            password: '',
            role: 'employee'
        });
    };

    const clearMessages = () => {
        setError('');
        setSuccess('');
    };

    // Add User
    const handleAddUser = async () => {
        if (!formData.nama || !formData.email || !formData.password) {
            setError('All fields are required');
            return;
        }

        try {
            setLoading(true);
            clearMessages();

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Mock success response
            setSuccess('User added successfully!');
            resetForm();
            setShowAddModal(false);
            await loadUsers();

        } catch (err) {
            setError('Error adding user: ' + err.message);
            console.error('Add user error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Edit User
    const handleEditUser = async () => {
        if (!formData.nama || !formData.email) {
            setError('Name and email are required');
            return;
        }

        try {
            setLoading(true);
            clearMessages();

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            setSuccess('User updated successfully!');
            resetForm();
            setShowEditModal(false);
            setSelectedUser(null);
            await loadUsers();

        } catch (err) {
            setError('Error updating user: ' + err.message);
            console.error('Update user error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Delete User
    const handleDeleteUser = async () => {
        if (!selectedUser) return;

        try {
            setLoading(true);
            clearMessages();

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            setSuccess('User deleted successfully!');
            setShowDeleteModal(false);
            setSelectedUser(null);
            await loadUsers();

        } catch (err) {
            setError('Error deleting user: ' + err.message);
            console.error('Delete user error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Open Edit Modal
    const openEditModal = (user) => {
        setSelectedUser(user);
        setFormData({
            nama: user.nama,
            email: user.email,
            password: '', // Don't prefill password
            role: user.role
        });
        setShowEditModal(true);
        clearMessages();
    };

    // Open Delete Modal
    const openDeleteModal = (user) => {
        setSelectedUser(user);
        setShowDeleteModal(true);
        clearMessages();
    };

    // Filter and search users
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        return matchesSearch && matchesRole;
    });

    // Pagination
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    if (loading && users.length === 0) {
        return (
            <>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
                <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
                <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600 text-lg">Loading users...</p>
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
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                                    <i className="fas fa-users text-orange-400"></i>
                                    User Management
                                </h1>
                                <p className="text-purple-100 text-lg">Manage system users and their roles</p>
                            </div>
                            <button
                                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg"
                                onClick={() => {
                                    setShowAddModal(true);
                                    resetForm();
                                    clearMessages();
                                }}
                            >
                                <i className="fas fa-plus"></i>
                                Add New User
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    {error && (
                        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-6 flex justify-between items-center">
                            <span className="text-red-700 flex items-center gap-2">
                                <i className="fas fa-exclamation-circle"></i>
                                {error}
                            </span>
                            <button onClick={clearMessages} className="text-red-500 hover:text-red-700 text-xl">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 mb-6 flex justify-between items-center">
                            <span className="text-green-700 flex items-center gap-2">
                                <i className="fas fa-check-circle"></i>
                                {success}
                            </span>
                            <button onClick={clearMessages} className="text-green-500 hover:text-green-700 text-xl">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                    )}

                    {/* Filters */}
                    <div className="bg-white rounded-2xl p-6 mb-8 shadow-lg">
                        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
                            <div className="flex-1 relative">
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <i className="fas fa-search"></i>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors duration-200"
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <label className="text-gray-700 font-semibold whitespace-nowrap">Filter by Role:</label>
                                <select
                                    value={filterRole}
                                    onChange={(e) => setFilterRole(e.target.value)}
                                    className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none bg-white min-w-[150px]"
                                >
                                    <option value="all">All Roles</option>
                                    <option value="admin">Admin</option>
                                    <option value="employee">Employee</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Users Table */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Created Date</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {currentUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                                <div className="flex flex-col items-center gap-3">
                                                    <i className="fas fa-search text-4xl text-gray-300"></i>
                                                    <p className="text-lg">
                                                        {searchTerm || filterRole !== 'all'
                                                            ? 'No users found matching your criteria'
                                                            : 'No users available'}
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        currentUsers.map((user) => (
                                            <tr key={user.id_user} className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-orange-50 transition-all duration-200">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    #{user.id_user}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm font-semibold text-gray-900">{user.nama}</span>
                                                        {user.id_user === currentUser?.id_user && (
                                                            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                                                                You
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                                                        user.role === 'admin' 
                                                            ? 'bg-red-100 text-red-700 border border-red-200' 
                                                            : 'bg-blue-100 text-blue-700 border border-blue-200'
                                                    }`}>
                                                        <i className={user.role === 'admin' ? 'fas fa-user-shield' : 'fas fa-user'}></i>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {user.created_at
                                                        ? new Date(user.created_at).toLocaleDateString('id-ID')
                                                        : 'N/A'
                                                    }
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex gap-2">
                                                        <button
                                                            className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded-lg text-xs transition-colors duration-200 flex items-center gap-1 disabled:opacity-50"
                                                            onClick={() => openEditModal(user)}
                                                            disabled={loading}
                                                        >
                                                            <i className="fas fa-edit"></i>
                                                            Edit
                                                        </button>
                                                        <button
                                                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-xs transition-colors duration-200 flex items-center gap-1 disabled:opacity-50"
                                                            onClick={() => openDeleteModal(user)}
                                                            disabled={loading || user.id_user === currentUser?.id_user}
                                                            title={user.id_user === currentUser?.id_user ? "Cannot delete yourself" : "Delete user"}
                                                        >
                                                            <i className="fas fa-trash"></i>
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 mb-8">
                            <button
                                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                <i className="fas fa-chevron-left"></i>
                                Previous
                            </button>

                            <span className="text-gray-600 font-semibold">
                                Page {currentPage} of {totalPages} ({filteredUsers.length} users)
                            </span>

                            <button
                                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                                <i className="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    )}

                    {/* Add User Modal */}
                    {showAddModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                        <i className="fas fa-plus text-orange-500"></i>
                                        Add New User
                                    </h3>
                                    <button
                                        className="text-gray-500 hover:text-gray-700 text-2xl"
                                        onClick={() => setShowAddModal(false)}
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>

                                <div className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name:</label>
                                        <input
                                            type="text"
                                            name="nama"
                                            value={formData.nama}
                                            onChange={handleInputChange}
                                            placeholder="Enter full name"
                                            required
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors duration-200"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email:</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="Enter email address"
                                            required
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors duration-200"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Password:</label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            placeholder="Enter password"
                                            required
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors duration-200"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Role:</label>
                                        <select
                                            name="role"
                                            value={formData.role}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none bg-white transition-colors duration-200"
                                            required
                                        >
                                            <option value="employee">
                                                <i className="fas fa-user"></i> Employee
                                            </option>
                                            <option value="admin">
                                                <i className="fas fa-user-shield"></i> Admin
                                            </option>
                                        </select>
                                    </div>

                                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                                        <button
                                            type="button"
                                            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-xl transition-colors duration-200 font-semibold"
                                            onClick={() => setShowAddModal(false)}
                                            disabled={loading}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl transition-colors duration-200 font-semibold disabled:opacity-50"
                                            disabled={loading}
                                            onClick={handleAddUser}
                                        >
                                            {loading ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <i className="fas fa-spinner animate-spin"></i>
                                                    Adding...
                                                </span>
                                            ) : (
                                                'Add User'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Edit User Modal */}
                    {showEditModal && selectedUser && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                        <i className="fas fa-edit text-purple-500"></i>
                                        Edit User
                                    </h3>
                                    <button
                                        className="text-gray-500 hover:text-gray-700 text-2xl"
                                        onClick={() => setShowEditModal(false)}
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>

                                <div className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name:</label>
                                        <input
                                            type="text"
                                            name="nama"
                                            value={formData.nama}
                                            onChange={handleInputChange}
                                            placeholder="Enter full name"
                                            required
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors duration-200"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email:</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="Enter email address"
                                            required
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors duration-200"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">New Password (leave empty to keep current):</label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            placeholder="Enter new password (optional)"
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors duration-200"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Role:</label>
                                        <select
                                            name="role"
                                            value={formData.role}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none bg-white transition-colors duration-200"
                                            required
                                        >
                                            <option value="employee">Employee</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>

                                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                                        <button
                                            type="button"
                                            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-xl transition-colors duration-200 font-semibold"
                                            onClick={() => setShowEditModal(false)}
                                            disabled={loading}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-xl transition-colors duration-200 font-semibold disabled:opacity-50"
                                            disabled={loading}
                                            onClick={handleEditUser}
                                        >
                                            {loading ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <i className="fas fa-spinner animate-spin"></i>
                                                    Updating...
                                                </span>
                                            ) : (
                                                'Update User'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Delete Confirmation Modal */}
                    {showDeleteModal && selectedUser && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
                                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                        <i className="fas fa-trash text-red-500"></i>
                                        Delete User
                                    </h3>
                                    <button
                                        className="text-gray-500 hover:text-gray-700 text-2xl"
                                        onClick={() => setShowDeleteModal(false)}
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>

                                <div className="p-6">
                                    <p className="text-gray-700 mb-4">Are you sure you want to delete this user?</p>
                                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                                        <div className="font-semibold text-gray-800">{selectedUser.nama}</div>
                                        <div className="text-gray-600 text-sm">{selectedUser.email}</div>
                                    </div>
                                    <p className="text-red-600 text-sm text-center mb-6 flex items-center justify-center gap-2">
                                        <i className="fas fa-exclamation-triangle"></i>
                                        This action cannot be undone!
                                    </p>

                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-xl transition-colors duration-200 font-semibold"
                                            onClick={() => setShowDeleteModal(false)}
                                            disabled={loading}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl transition-colors duration-200 font-semibold disabled:opacity-50"
                                            onClick={handleDeleteUser}
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <i className="fas fa-spinner animate-spin"></i>
                                                    Deleting...
                                                </span>
                                            ) : (
                                                'Delete User'
                                            )}
                                        </button>
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

export default UserPage;