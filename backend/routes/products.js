const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  getLowStockProducts,
  getProductStats
} = require('../controllers/productController');
const {
  authenticateToken,
  requireAdmin,
  requireEmployee
} = require('../middleware/auth');
const {
  validateProduct,
  handleValidationErrors
} = require('../middleware/validation');

// Public routes (no authentication required)
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Apply authentication to routes below
router.use(authenticateToken);

// Employee and Admin routes
router.use(requireEmployee);

// Admin only routes
router.post('/', requireAdmin, validateProduct, handleValidationErrors, createProduct);
router.put('/:id', requireAdmin, updateProduct);
router.delete('/:id', requireAdmin, deleteProduct);
router.patch('/:id/stock', requireAdmin, updateStock);
router.get('/admin/low-stock', requireAdmin, getLowStockProducts);
router.get('/admin/stats', requireAdmin, getProductStats);

module.exports = router;