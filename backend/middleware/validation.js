const { body, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
const validateUser = [
  body('nama')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2-100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('pass')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['admin', 'employee'])
    .withMessage('Role must be admin or employee')
];

// Product validation rules
const validateProduct = [
  body('nama_product')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2-100 characters'),
  body('deskripsi')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('harga')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer')
];

// Cart validation rules
const validateCart = [
  body('id_product')
    .isInt({ min: 1 })
    .withMessage('Product ID must be a positive integer'),
  body('jumlah')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1')
];

// Login validation rules
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('pass')
    .notEmpty()
    .withMessage('Password is required')
];

// Transaction validation rules
const validateTransaction = [
  body('metode_pembayaran')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Payment method must be between 2-50 characters'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('Transaction must have at least 1 item'),
  body('items.*.id_product')
    .isInt({ min: 1 })
    .withMessage('Product ID must be a positive integer'),
  body('items.*.jumlah')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1')
];

module.exports = {
  handleValidationErrors,
  validateUser,
  validateProduct,
  validateCart,
  validateLogin,
  validateTransaction
};