const bcrypt = require('bcryptjs');
const { promisePool } = require('../config/database');

// Get all users (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const [rows] = await promisePool.execute(
      'SELECT id_user, nama, email, role, created_at FROM users ORDER BY created_at DESC'
    );

    res.json({
      success: true,
      message: 'Users retrieved successfully',
      data: rows
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve users'
    });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await promisePool.execute(
      'SELECT id_user, nama, email, role, created_at FROM users WHERE id_user = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User retrieved successfully',
      data: rows[0]
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user'
    });
  }
};

// Create new user (Admin only)
const createUser = async (req, res) => {
  try {
    const { nama, email, pass, role = 'employee' } = req.body;

    // Check if email already exists
    const [existingUser] = await promisePool.execute(
      'SELECT id_user FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(pass, 10);

    // Insert new user
    const [result] = await promisePool.execute(
      'INSERT INTO users (nama, email, pass, role) VALUES (?, ?, ?, ?)',
      [nama, email, hashedPassword, role]
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id_user: result.insertId,
        nama,
        email,
        role
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user'
    });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, email, role } = req.body;

    // Check if user exists
    const [existingUser] = await promisePool.execute(
      'SELECT id_user FROM users WHERE id_user = ?',
      [id]
    );

    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is already taken by another user
    if (email) {
      const [emailCheck] = await promisePool.execute(
        'SELECT id_user FROM users WHERE email = ? AND id_user != ?',
        [email, id]
      );

      if (emailCheck.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }
    }

    // Build update query
    let updateFields = [];
    let updateValues = [];

    if (nama) {
      updateFields.push('nama = ?');
      updateValues.push(nama);
    }
    if (email) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    if (role) {
      updateFields.push('role = ?');
      updateValues.push(role);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updateValues.push(id);

    await promisePool.execute(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id_user = ?`,
      updateValues
    );

    res.json({
      success: true,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
};

// Delete user (Admin only)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const [existingUser] = await promisePool.execute(
      'SELECT id_user FROM users WHERE id_user = ?',
      [id]
    );

    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Don't allow deleting own account
    if (parseInt(id) === req.user.id_user) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    await promisePool.execute(
      'DELETE FROM users WHERE id_user = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: req.user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile'
    });
  }
};

// Update current user profile
const updateProfile = async (req, res) => {
  try {
    const { nama, email } = req.body;
    const userId = req.user.id_user;

    // Check if email is already taken by another user
    if (email) {
      const [emailCheck] = await promisePool.execute(
        'SELECT id_user FROM users WHERE email = ? AND id_user != ?',
        [email, userId]
      );

      if (emailCheck.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }
    }

    // Build update query
    let updateFields = [];
    let updateValues = [];

    if (nama) {
      updateFields.push('nama = ?');
      updateValues.push(nama);
    }
    if (email) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updateValues.push(userId);

    await promisePool.execute(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id_user = ?`,
      updateValues
    );

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getProfile,
  updateProfile
};