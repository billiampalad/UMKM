// src/admin/pages/UserPage.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../shared/contexts/AuthContext';
import userService from '../../shared/services/userService';

const UserPage = () => {
    const { user: currentUser } = useAuth();
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
    const handleAddUser = async (e) => {
        e.preventDefault();

        if (!formData.nama || !formData.email || !formData.password) {
            setError('All fields are required');
            return;
        }

        try {
            setLoading(true);
            clearMessages();

            const response = await userService.create(formData);

            if (response.success) {
                setSuccess('User added successfully!');
                resetForm();
                setShowAddModal(false);
                await loadUsers();
            } else {
                setError(response.message || 'Failed to add user');
            }
        } catch (err) {
            setError('Error adding user: ' + err.message);
            console.error('Add user error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Edit User
    const handleEditUser = async (e) => {
        e.preventDefault();

        if (!formData.nama || !formData.email) {
            setError('Name and email are required');
            return;
        }

        try {
            setLoading(true);
            clearMessages();

            // Remove password if empty (don't update password)
            const updateData = { ...formData };
            if (!updateData.password) {
                delete updateData.password;
            }

            const response = await userService.update(selectedUser.id_user, updateData);

            if (response.success) {
                setSuccess('User updated successfully!');
                resetForm();
                setShowEditModal(false);
                setSelectedUser(null);
                await loadUsers();
            } else {
                setError(response.message || 'Failed to update user');
            }
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

            const response = await userService.delete(selectedUser.id_user);

            if (response.success) {
                setSuccess('User deleted successfully!');
                setShowDeleteModal(false);
                setSelectedUser(null);
                await loadUsers();
            } else {
                setError(response.message || 'Failed to delete user');
            }
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
            <div className="page-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading users...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            {/* Header */}
            <div className="page-header">
                <div className="header-content">
                    <h1>👥 User Management</h1>
                    <p>Manage system users and their roles</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        setShowAddModal(true);
                        resetForm();
                        clearMessages();
                    }}
                >
                    ➕ Add New User
                </button>
            </div>

            {/* Messages */}
            {error && (
                <div className="alert alert-error">
                    <span>❌ {error}</span>
                    <button onClick={clearMessages} className="alert-close">✕</button>
                </div>
            )}

            {success && (
                <div className="alert alert-success">
                    <span>✅ {success}</span>
                    <button onClick={clearMessages} className="alert-close">✕</button>
                </div>
            )}

            {/* Filters */}
            <div className="filters-section">
                <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>

                <div className="filter-group">
                    <label>Filter by Role:</label>
                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="employee">Employee</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Created Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentUsers.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="no-data">
                                    {searchTerm || filterRole !== 'all'
                                        ? '🔍 No users found matching your criteria'
                                        : '📝 No users available'}
                                </td>
                            </tr>
                        ) : (
                            currentUsers.map((user) => (
                                <tr key={user.id_user}>
                                    <td>#{user.id_user}</td>
                                    <td>
                                        <div className="user-info">
                                            <span className="user-name">{user.nama}</span>
                                            {user.id_user === currentUser?.id_user && (
                                                <span className="current-user-badge">You</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span className={`role-badge role-${user.role}`}>
                                            {user.role === 'admin' ? '👨‍💼' : '👥'} {user.role}
                                        </span>
                                    </td>
                                    <td>
                                        {user.created_at
                                            ? new Date(user.created_at).toLocaleDateString('id-ID')
                                            : 'N/A'
                                        }
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="btn btn-sm btn-secondary"
                                                onClick={() => openEditModal(user)}
                                                disabled={loading}
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button
                                                className="btn btn-sm btn-danger"
                                                onClick={() => openDeleteModal(user)}
                                                disabled={loading || user.id_user === currentUser?.id_user}
                                                title={user.id_user === currentUser?.id_user ? "Cannot delete yourself" : "Delete user"}
                                            >
                                                🗑️ Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        className="btn btn-sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        ← Previous
                    </button>

                    <span className="pagination-info">
                        Page {currentPage} of {totalPages} ({filteredUsers.length} users)
                    </span>

                    <button
                        className="btn btn-sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        Next →
                    </button>
                </div>
            )}

            {/* Add User Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>➕ Add New User</h3>
                            <button
                                className="modal-close"
                                onClick={() => setShowAddModal(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleAddUser} className="modal-form">
                            <div className="form-group">
                                <label>Full Name:</label>
                                <input
                                    type="text"
                                    name="nama"
                                    value={formData.nama}
                                    onChange={handleInputChange}
                                    placeholder="Enter full name"
                                    required
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group">
                                <label>Email:</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Enter email address"
                                    required
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group">
                                <label>Password:</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="Enter password"
                                    required
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group">
                                <label>Role:</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    className="form-control"
                                    required
                                >
                                    <option value="employee">👥 Employee</option>
                                    <option value="admin">👨‍💼 Admin</option>
                                </select>
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowAddModal(false)}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loading}
                                >
                                    {loading ? 'Adding...' : 'Add User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {showEditModal && selectedUser && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>✏️ Edit User</h3>
                            <button
                                className="modal-close"
                                onClick={() => setShowEditModal(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleEditUser} className="modal-form">
                            <div className="form-group">
                                <label>Full Name:</label>
                                <input
                                    type="text"
                                    name="nama"
                                    value={formData.nama}
                                    onChange={handleInputChange}
                                    placeholder="Enter full name"
                                    required
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group">
                                <label>Email:</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Enter email address"
                                    required
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group">
                                <label>New Password (leave empty to keep current):</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="Enter new password (optional)"
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group">
                                <label>Role:</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    className="form-control"
                                    required
                                >
                                    <option value="employee">👥 Employee</option>
                                    <option value="admin">👨‍💼 Admin</option>
                                </select>
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowEditModal(false)}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loading}
                                >
                                    {loading ? 'Updating...' : 'Update User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedUser && (
                <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="modal-content modal-sm" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>🗑️ Delete User</h3>
                            <button
                                className="modal-close"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="modal-body">
                            <p>Are you sure you want to delete this user?</p>
                            <div className="user-preview">
                                <strong>{selectedUser.nama}</strong><br />
                                <span className="text-muted">{selectedUser.email}</span>
                            </div>
                            <p className="warning-text">⚠️ This action cannot be undone!</p>
                        </div>

                        <div className="modal-actions">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setShowDeleteModal(false)}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-danger"
                                onClick={handleDeleteUser}
                                disabled={loading}
                            >
                                {loading ? 'Deleting...' : 'Delete User'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
        .page-container {
          padding: 24px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
          padding-bottom: 16px;
          border-bottom: 2px solid #e9ecef;
        }

        .header-content h1 {
          margin: 0 0 8px 0;
          color: #333;
          font-size: 2rem;
          font-weight: 700;
        }

        .header-content p {
          margin: 0;
          color: #666;
          font-size: 1rem;
        }

        .loading-spinner {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 300px;
          text-align: center;
        }

        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .alert {
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .alert-error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .alert-success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .alert-close {
          background: none;
          border: none;
          color: inherit;
          cursor: pointer;
          font-size: 16px;
          padding: 0;
          margin-left: 12px;
        }

        .filters-section {
          display: flex;
          gap: 20px;
          margin-bottom: 24px;
          flex-wrap: wrap;
          align-items: center;
        }

        .search-box {
          position: relative;
          flex: 1;
          min-width: 250px;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #666;
          font-size: 16px;
        }

        .search-input {
          width: 100%;
          padding: 10px 12px 10px 40px;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #007bff;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .filter-group label {
          font-weight: 500;
          color: #333;
          white-space: nowrap;
        }

        .filter-select {
          padding: 8px 12px;
          border: 2px solid #e9ecef;
          border-radius: 6px;
          font-size: 14px;
          background: white;
        }

        .table-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          margin-bottom: 20px;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .data-table th {
          background: #f8f9fa;
          padding: 16px 12px;
          text-align: left;
          font-weight: 600;
          color: #333;
          border-bottom: 2px solid #dee2e6;
        }

        .data-table td {
          padding: 12px;
          border-bottom: 1px solid #dee2e6;
          vertical-align: middle;
        }

        .data-table tr:hover {
          background: #f8f9fa;
        }

        .no-data {
          text-align: center;
          color: #666;
          font-style: italic;
          padding: 40px;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .user-name {
          font-weight: 500;
        }

        .current-user-badge {
          background: #007bff;
          color: white;
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 500;
        }

        .role-badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          text-transform: capitalize;
        }

        .role-admin {
          background: #dc3545;
          color: white;
        }

        .role-employee {
          background: #007bff;
          color: white;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
        }

        .btn {
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          white-space: nowrap;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
        }

        .btn-primary {
          background: #007bff;
          color: white;
          padding: 10px 20px;
          font-size: 14px;
        }

        .btn-primary:hover:not(:disabled) {
          background: #0056b3;
          transform: translateY(-1px);
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
          padding: 8px 12px;
          font-size: 13px;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #545b62;
        }

        .btn-danger {
          background: #dc3545;
          color: white;
          padding: 8px 12px;
          font-size: 13px;
        }

        .btn-danger:hover:not(:disabled) {
          background: #c82333;
        }

        .btn-sm {
          padding: 6px 12px;
          font-size: 13px;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 16px;
          margin-top: 20px;
        }

        .pagination-info {
          color: #666;
          font-size: 14px;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-sm {
          max-width: 400px;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #dee2e6;
        }

        .modal-header h3 {
          margin: 0;
          color: #333;
          font-size: 1.25rem;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: #666;
          padding: 4px;
        }

        .modal-close:hover {
          color: #333;
        }

        .modal-form {
          padding: 24px;
        }

        .modal-body {
          padding: 24px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
          color: #333;
        }

        .form-control {
          width: 100%;
          padding: 10px 12px;
          border: 2px solid #e9ecef;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.3s ease;
          box-sizing: border-box;
        }

        .form-control:focus {
          outline: none;
          border-color: #007bff;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          padding-top: 20px;
          border-top: 1px solid #dee2e6;
        }

        .user-preview {
          background: #f8f9fa;
          padding: 12px;
          border-radius: 6px;
          margin: 12px 0;
        }

        .text-muted {
          color: #666;
          font-size: 14px;
        }

        .warning-text {
          color: #dc3545;
          font-size: 14px;
          text-align: center;
          margin: 16px 0 0 0;
        }

        @media (max-width: 768px) {
          .page-container {
            padding: 16px;
          }

          .page-header {
            flex-direction: column;
            gap: 16px;
          }

          .filters-section {
            flex-direction: column;
            align-items: stretch;
          }

          .search-box {
            min-width: unset;
          }

          .data-table {
            font-size: 13px;
          }

          .data-table th,
          .data-table td {
            padding: 8px;
          }

          .action-buttons {
            flex-direction: column;
          }

          .modal-content {
            margin: 10px;
            max-width: none;
          }

          .modal-actions {
            flex-direction: column;
          }
        }
      `}</style>
        </div>
    );
};

export default UserPage;