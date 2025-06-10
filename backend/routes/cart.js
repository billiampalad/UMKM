const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartSummary,
  validateCart
} = require('../controllers/cartController');
const {
  authenticateToken,
  requireEmployee
} = require('../middleware/auth');
const {
  validateCart: validateCartItem,
  handleValidationErrors
} = require('../middleware/validation');

// Apply authentication and employee role to all routes
router.use(authenticateToken);
router.use(requireEmployee);

// Cart routes
router.get('/', getCart);
router.get('/summary', getCartSummary);
router.get('/validate', validateCart);
router.post('/add', validateCartItem, handleValidationErrors, addToCart);
router.put('/:id', updateCartItem);
router.delete('/:id', removeFromCart);
router.delete('/', clearCart);

module.exports = router;