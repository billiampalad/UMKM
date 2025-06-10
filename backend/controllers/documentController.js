const { promisePool } = require('../config/database');

// Generate document for transaction
const generateDocument = async (req, res) => {
  try {
    const { id } = req.params; // transaction ID
    const { tipe_dokumen } = req.body;
    const userId = req.user.id_user;
    const isAdmin = req.user.role === 'admin';

    // Validate document type
    const validTypes = ['invoice', 'receipt', 'report'];
    if (!validTypes.includes(tipe_dokumen)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document type. Must be one of: invoice, receipt, report'
      });
    }

    // Check if transaction exists and user has access
    let transactionQuery = `
      SELECT 
        t.id_transaksi,
        t.id_user,
        t.total_harga,
        t.tanggal_transaksi,
        t.metode_pembayaran,
        t.status_pembayaran,
        u.nama as user_nama,
        u.email as user_email
      FROM transactions t
      JOIN users u ON t.id_user = u.id_user
      WHERE t.id_transaksi = ?
    `;

    // If not admin, only allow access to own transactions
    if (!isAdmin) {
      transactionQuery += ' AND t.id_user = ?';
    }

    const params = isAdmin ? [id] : [id, userId];
    const [transactionRows] = await promisePool.execute(transactionQuery, params);

    if (transactionRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Check if document already exists
    const [existingDoc] = await promisePool.execute(
      'SELECT id_dokumen FROM documents WHERE id_transaksi = ? AND tipe_dokumen = ?',
      [id, tipe_dokumen]
    );

    if (existingDoc.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Document of this type already exists for this transaction',
        existing_document_id: existingDoc[0].id_dokumen
      });
    }

    // Create document record
    const [result] = await promisePool.execute(
      'INSERT INTO documents (id_transaksi, tipe_dokumen) VALUES (?, ?)',
      [id, tipe_dokumen]
    );

    res.status(201).json({
      success: true,
      message: 'Document generated successfully',
      data: {
        id_dokumen: result.insertId,
        id_transaksi: parseInt(id),
        tipe_dokumen,
        tanggal_pembuatan: new Date()
      }
    });
  } catch (error) {
    console.error('Generate document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate document'
    });
  }
};

// Get all documents
const getAllDocuments = async (req, res) => {
  try {
    const { page = 1, limit = 10, tipe_dokumen = '', transaction_id = '' } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.user.id_user;
    const isAdmin = req.user.role === 'admin';

    let query = `
      SELECT 
        d.id_dokumen,
        d.id_transaksi,
        d.tipe_dokumen,
        d.tanggal_pembuatan,
        t.total_harga,
        t.tanggal_transaksi,
        t.status_pembayaran,
        u.nama as user_nama,
        u.email as user_email
      FROM documents d
      JOIN transactions t ON d.id_transaksi = t.id_transaksi
      JOIN users u ON t.id_user = u.id_user
      WHERE 1=1
    `;

    let countQuery = `
      SELECT COUNT(*) as total
      FROM documents d
      JOIN transactions t ON d.id_transaksi = t.id_transaksi
      JOIN users u ON t.id_user = u.id_user
      WHERE 1=1
    `;

    let queryParams = [];
    let countParams = [];

    // If not admin, only show documents for own transactions
    if (!isAdmin) {
      query += ' AND t.id_user = ?';
      countQuery += ' AND t.id_user = ?';
      queryParams.push(userId);
      countParams.push(userId);
    }

    // Add document type filter
    if (tipe_dokumen) {
      query += ' AND d.tipe_dokumen = ?';
      countQuery += ' AND d.tipe_dokumen = ?';
      queryParams.push(tipe_dokumen);
      countParams.push(tipe_dokumen);
    }

    // Add transaction ID filter
    if (transaction_id) {
      query += ' AND d.id_transaksi = ?';
      countQuery += ' AND d.id_transaksi = ?';
      queryParams.push(transaction_id);
      countParams.push(transaction_id);
    }

    query += ' ORDER BY d.tanggal_pembuatan DESC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), parseInt(offset));

    const [documents] = await promisePool.execute(query, queryParams);
    const [countResult] = await promisePool.execute(countQuery, countParams);

    const totalDocuments = countResult[0].total;
    const totalPages = Math.ceil(totalDocuments / limit);

    res.json({
      success: true,
      message: 'Documents retrieved successfully',
      data: {
        documents,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalDocuments,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get all documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve documents'
    });
  }
};

// Get document by ID
const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id_user;
    const isAdmin = req.user.role === 'admin';

    let query = `
      SELECT 
        d.id_dokumen,
        d.id_transaksi,
        d.tipe_dokumen,
        d.tanggal_pembuatan,
        t.total_harga,
        t.tanggal_transaksi,
        t.metode_pembayaran,
        t.status_pembayaran,
        u.nama as user_nama,
        u.email as user_email
      FROM documents d
      JOIN transactions t ON d.id_transaksi = t.id_transaksi
      JOIN users u ON t.id_user = u.id_user
      WHERE d.id_dokumen = ?
    `;

    // If not admin, only allow access to own documents
    if (!isAdmin) {
      query += ' AND t.id_user = ?';
    }

    const params = isAdmin ? [id] : [id, userId];
    const [rows] = await promisePool.execute(query, params);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Get transaction items for detailed document
    const [itemRows] = await promisePool.execute(`
      SELECT 
        ti.id_product,
        ti.jumlah,
        ti.sub_total,
        p.nama_product,
        p.deskripsi,
        p.harga as current_price
      FROM transaction_items ti
      JOIN products p ON ti.id_product = p.id_product
      WHERE ti.id_transaksi = ?
      ORDER BY ti.id_transaksi_item
    `, [rows[0].id_transaksi]);

    const document = rows[0];
    document.transaction_items = itemRows;

    res.json({
      success: true,
      message: 'Document retrieved successfully',
      data: document
    });
  } catch (error) {
    console.error('Get document by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve document'
    });
  }
};

// Delete document (Admin only)
const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if document exists
    const [existingDoc] = await promisePool.execute(
      'SELECT id_dokumen FROM documents WHERE id_dokumen = ?',
      [id]
    );

    if (existingDoc.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Delete document
    await promisePool.execute(
      'DELETE FROM documents WHERE id_dokumen = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document'
    });
  }
};

// Get documents by transaction ID
const getDocumentsByTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user.id_user;
    const isAdmin = req.user.role === 'admin';

    // Check if user has access to this transaction
    let transactionQuery = 'SELECT id_transaksi FROM transactions WHERE id_transaksi = ?';
    if (!isAdmin) {
      transactionQuery += ' AND id_user = ?';
    }

    const transactionParams = isAdmin ? [transactionId] : [transactionId, userId];
    const [transactionRows] = await promisePool.execute(transactionQuery, transactionParams);

    if (transactionRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found or access denied'
      });
    }

    // Get documents for this transaction
    const [documents] = await promisePool.execute(`
      SELECT 
        id_dokumen,
        id_transaksi,
        tipe_dokumen,
        tanggal_pembuatan
      FROM documents
      WHERE id_transaksi = ?
      ORDER BY tanggal_pembuatan DESC
    `, [transactionId]);

    res.json({
      success: true,
      message: 'Transaction documents retrieved successfully',
      data: {
        id_transaksi: parseInt(transactionId),
        documents,
        count: documents.length
      }
    });
  } catch (error) {
    console.error('Get documents by transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve transaction documents'
    });
  }
};

// Get document statistics (Admin only)
const getDocumentStats = async (req, res) => {
  try {
    // Total documents by type
    const [typeStats] = await promisePool.execute(`
      SELECT 
        tipe_dokumen,
        COUNT(*) as count
      FROM documents
      GROUP BY tipe_dokumen
    `);

    // Documents created today
    const [todayStats] = await promisePool.execute(`
      SELECT COUNT(*) as today_count
      FROM documents
      WHERE DATE(tanggal_pembuatan) = CURDATE()
    `);

    // Documents created this month
    const [monthStats] = await promisePool.execute(`
      SELECT COUNT(*) as month_count
      FROM documents
      WHERE YEAR(tanggal_pembuatan) = YEAR(NOW()) 
      AND MONTH(tanggal_pembuatan) = MONTH(NOW())
    `);

    // Total documents
    const [totalStats] = await promisePool.execute(`
      SELECT COUNT(*) as total_count
      FROM documents
    `);

    // Recent documents
    const [recentDocs] = await promisePool.execute(`
      SELECT 
        d.id_dokumen,
        d.tipe_dokumen,
        d.tanggal_pembuatan,
        t.id_transaksi,
        t.total_harga,
        u.nama as user_nama
      FROM documents d
      JOIN transactions t ON d.id_transaksi = t.id_transaksi
      JOIN users u ON t.id_user = u.id_user
      ORDER BY d.tanggal_pembuatan DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      message: 'Document statistics retrieved successfully',
      data: {
        total_documents: totalStats[0].total_count,
        documents_today: todayStats[0].today_count,
        documents_this_month: monthStats[0].month_count,
        by_type: typeStats,
        recent_documents: recentDocs
      }
    });
  } catch (error) {
    console.error('Get document stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve document statistics'
    });
  }
};

module.exports = {
  generateDocument,
  getAllDocuments,
  getDocumentById,
  deleteDocument,
  getDocumentsByTransaction,
  getDocumentStats
};