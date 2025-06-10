// src/shared/services/userService.js
import { apiRequest } from './api';

const userService = {
    // Get all users
    getAll: async () => {
        try {
            console.log('🔍 Fetching all users...');
            const response = await apiRequest('/api/users', {
                method: 'GET'
            });
            console.log('📊 Users loaded:', response.data?.length || 0);
            return response;
        } catch (error) {
            console.error('❌ Get users error:', error);
            throw error;
        }
    },

    // Get user by ID
    getById: async (id) => {
        try {
            console.log('🔍 Fetching user by ID:', id);
            const response = await apiRequest(`/api/users/${id}`, {
                method: 'GET'
            });
            console.log('📊 User loaded:', response.data?.email);
            return response;
        } catch (error) {
            console.error('❌ Get user by ID error:', error);
            throw error;
        }
    },

    // Create new user
    create: async (userData) => {
        try {
            console.log('➕ Creating new user:', userData.email);
            const response = await apiRequest('/api/users', {
                method: 'POST',
                body: JSON.stringify({
                    nama: userData.nama,
                    email: userData.email,
                    password: userData.password,
                    role: userData.role || 'employee'
                })
            });
            console.log('✅ User created successfully:', response.data?.id_user);
            return response;
        } catch (error) {
            console.error('❌ Create user error:', error);
            throw error;
        }
    },

    // Update user
    update: async (id, userData) => {
        try {
            console.log('✏️ Updating user:', id, userData.email);

            // Prepare update data (remove empty password)
            const updateData = {
                nama: userData.nama,
                email: userData.email,
                role: userData.role
            };

            // Only include password if it's provided
            if (userData.password && userData.password.trim() !== '') {
                updateData.password = userData.password;
            }

            const response = await apiRequest(`/api/users/${id}`, {
                method: 'PUT',
                body: JSON.stringify(updateData)
            });
            console.log('✅ User updated successfully');
            return response;
        } catch (error) {
            console.error('❌ Update user error:', error);
            throw error;
        }
    },

    // Delete user
    delete: async (id) => {
        try {
            console.log('🗑️ Deleting user:', id);
            const response = await apiRequest(`/api/users/${id}`, {
                method: 'DELETE'
            });
            console.log('✅ User deleted successfully');
            return response;
        } catch (error) {
            console.error('❌ Delete user error:', error);
            throw error;
        }
    },

    // Search users
    search: async (query) => {
        try {
            console.log('🔍 Searching users:', query);
            const response = await apiRequest(`/api/users/search?q=${encodeURIComponent(query)}`, {
                method: 'GET'
            });
            console.log('📊 Search results:', response.data?.length || 0);
            return response;
        } catch (error) {
            console.error('❌ Search users error:', error);
            throw error;
        }
    },

    // Get users by role
    getByRole: async (role) => {
        try {
            console.log('🔍 Fetching users by role:', role);
            const response = await apiRequest(`/api/users/role/${role}`, {
                method: 'GET'
            });
            console.log('📊 Users by role loaded:', response.data?.length || 0);
            return response;
        } catch (error) {
            console.error('❌ Get users by role error:', error);
            throw error;
        }
    },

    // Change user password
    changePassword: async (id, passwordData) => {
        try {
            console.log('🔐 Changing user password:', id);
            const response = await apiRequest(`/api/users/${id}/password`, {
                method: 'PATCH',
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });
            console.log('✅ Password changed successfully');
            return response;
        } catch (error) {
            console.error('❌ Change password error:', error);
            throw error;
        }
    },

    // Toggle user status (activate/deactivate)
    toggleStatus: async (id) => {
        try {
            console.log('🔄 Toggling user status:', id);
            const response = await apiRequest(`/api/users/${id}/toggle-status`, {
                method: 'PATCH'
            });
            console.log('✅ User status toggled successfully');
            return response;
        } catch (error) {
            console.error('❌ Toggle user status error:', error);
            throw error;
        }
    }
};

export default userService;