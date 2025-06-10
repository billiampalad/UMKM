const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getProfile,
  updateProfile
} = require('../controllers/userController');
const {
  authenticateToken,
  requireAdmin
} = require('../middleware/auth');
const {
  validateUser,
  handleValidationErrors
} = require('../middleware/validation');

// Apply authentication to all routes
router.use(authenticateToken);

// Profile routes (available to all authenticated users)
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Admin only routes
router.get('/', requireAdmin, getAllUsers);
router.get('/:id', requireAdmin, getUserById);
router.post('/', requireAdmin, validateUser, handleValidationErrors, createUser);
router.put('/:id', requireAdmin, updateUser);
router.delete('/:id', requireAdmin, deleteUser);

module.exports = router;