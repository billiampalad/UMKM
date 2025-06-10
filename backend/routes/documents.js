const express = require('express');
const router = express.Router();
const {
  generateDocument,
  getAllDocuments,
  getDocumentById,
  deleteDocument,
  getDocumentsByTransaction,
  getDocumentStats
} = require('../controllers/documentController');
const {
  authenticateToken,
  requireAdmin,
  requireEmployee
} = require('../middleware/auth');

// Apply authentication to all routes
router.use(authenticateToken);
router.use(requireEmployee);

// Employee and Admin routes
router.get('/', getAllDocuments);
router.get('/:id', getDocumentById);
router.post('/generate/:id', generateDocument); // :id is transaction ID
router.get('/transaction/:transactionId', getDocumentsByTransaction);

// Admin only routes
router.delete('/:id', requireAdmin, deleteDocument);
router.get('/admin/stats', requireAdmin, getDocumentStats);

module.exports = router;