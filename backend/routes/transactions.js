const express = require('express');
const router = express.Router();
const {
  createTransaction,
  getUserTransactions,
  getAllTransactions,
  getTransactionDetails,
  updateTransactionStatus,
  getTransactionStats,
  cancelTransaction,
  directCheckout
} = require('../controllers/transactionController');
const {
  authenticateToken,
  requireAdmin,
  requireEmployee
} = require('../middleware/auth');
const {
  validateTransaction,
  handleValidationErrors
} = require('../middleware/validation');

// Apply authentication to all routes
router.use(authenticateToken);
router.use(requireEmployee);

// Employee routes
router.post('/checkout', createTransaction);
router.post('/direct-checkout', validateTransaction, handleValidationErrors, directCheckout);
router.get('/my-transactions', getUserTransactions);
router.get('/:id', getTransactionDetails);
router.patch('/:id/cancel', cancelTransaction);

// Admin only routes
router.get('/', requireAdmin, getAllTransactions);
router.patch('/:id/status', requireAdmin, updateTransactionStatus);
router.get('/admin/stats', requireAdmin, getTransactionStats);

module.exports = router;