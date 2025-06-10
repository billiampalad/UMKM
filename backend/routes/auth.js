const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  changePassword, 
  verifyToken, 
  logout 
} = require('../controllers/authController');
const { 
  authenticateToken 
} = require('../middleware/auth');
const { 
  validateLogin, 
  validateUser, 
  handleValidationErrors 
} = require('../middleware/validation');

// Public routes
router.post('/register', validateUser, handleValidationErrors, register);
router.post('/login', validateLogin, handleValidationErrors, login);

// Protected routes
router.use(authenticateToken); // Apply authentication to all routes below

router.post('/change-password', changePassword);
router.get('/verify', verifyToken);
router.post('/logout', logout);

module.exports = router;