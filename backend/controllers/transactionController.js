const { promisePool } = require('../config/database');

// Create transaction from cart
const createTransaction = async (req, res) => {
  const connection = await promisePool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { metode_pembayaran } = req.body;
    const userId = req.user.id_user;

    // Get cart items
    const [cartItems] = await connection.execute(`
      SELECT 
        ci.id_cart,
        ci.id_product,
        ci.jumlah,
        p.nama_product,
        p.harga,
        p.stock,
        (ci.jumlah * p.harga) as subtotal
      FROM cart_items ci
      JOIN products p ON ci.id_product = p.id_product
      WHERE ci.id_user = ?
    `, [userId]);

    if (cartItems.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Validate stock for all items
    for (const item of cartItems) {
      if (item.stock < item.jumlah) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.nama_product}`,
          available_stock: item.stock,
          requested_quantity: item.jumlah
        });
      }
    }

    // Calculate total
    const totalAmount = cartItems.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);

    // Create transaction
    const [transactionResult] = await connection.execute(
      'INSERT INTO transactions (id_user, total_harga, metode_pembayaran, status_pembayaran) VALUES (?, ?, ?, ?)',
      [userId, totalAmount, metode_pembayaran, 'completed']
    );

    const transactionId = transactionResult.insertId;

    // Create transaction items and update stock
    for (const item of cartItems) {
      // Insert transaction item
      await connection.execute(
        'INSERT INTO transaction_items (id_transaksi, id_product, jumlah, sub_total) VALUES (?, ?, ?, ?)',
        [transactionId, item.id_product, item.jumlah, item.subtotal]
      );

      // Update product stock
      await connection.execute(
        'UPDATE products SET stock = stock - ? WHERE id_product = ?',
        [item.jumlah, item.id_product]
      );
    }

    // Clear cart
    await connection.execute(
      'DELETE FROM cart_items WHERE id_user = ?',
      [userId]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: {
        id_transaksi: transactionId,
        total_harga: totalAmount,
        metode_pembayaran,
        status_pembayaran: 'completed',
        items_count: cartItems.length
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create transaction'
    });
  } finally {
    connection.release();
  }
};

// Get user transactions
const getUserTransactions = async (req, res) => {
  try {
    const userId = req.user.id_user;
    const { page = 1, limit = 10, status = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        t.id_transaksi,
        t.total_harga,
        t.tanggal_transaksi,
        t.metode_pembayaran,
        t.status_pembayaran,
        COUNT(ti.id_transaksi_item) as items_count
      FROM transactions t
      LEFT JOIN transaction_items ti ON t.id_transaksi = ti.id_transaksi
      WHERE t.id_user = ?
    `;
    
    let countQuery = 'SELECT COUNT(*) as total FROM transactions WHERE id_user = ?';
    let queryParams = [userId];
    let countParams = [userId];

    // Add status filter
    if (status) {
      query += ' AND t.status_pembayaran = ?';
      countQuery += ' AND status_pembayaran = ?';
      queryParams.push(status);
      countParams.push(status);
    }

    query += ' GROUP BY t.id_transaksi ORDER BY t.tanggal_transaksi DESC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), parseInt(offset));

    const [transactions] = await promisePool.execute(query, queryParams);
    const [countResult] = await promisePool.execute(countQuery, countParams);

    const totalTransactions = countResult[0].total;
    const totalPages = Math.ceil(totalTransactions / limit);

    res.json({
      success: true,
      message: 'Transactions retrieved successfully',
      data: {
        transactions,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalTransactions,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get user transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve transactions'
    });
  }
};

// Get all transactions (Admin only)
const getAllTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = '', user_id = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        t.id_transaksi,
        t.id_user,
        t.total_harga,
        t.tanggal_transaksi,
        t.metode_pembayaran,
        t.status_pembayaran,
        u.nama as user_nama,
        u.email as user_email,
        COUNT(ti.id_transaksi_item) as items_count
      FROM transactions t
      JOIN users u ON t.id_user = u.id_user
      LEFT JOIN transaction_items ti ON t.id_transaksi = ti.id_transaksi
      WHERE 1=1
    `;
    
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM transactions t
      JOIN users u ON t.id_user = u.id_user
      WHERE 1=1
    `;
    
    let queryParams = [];
    let countParams = [];

    // Add status filter
    if (status) {
      query += ' AND t.status_pembayaran = ?';
      countQuery += ' AND t.status_pembayaran = ?';
      queryParams.push(status);
      countParams.push(status);
    }

    // Add user filter
    if (user_id) {
      query += ' AND t.id_user = ?';
      countQuery += ' AND t.id_user = ?';
      queryParams.push(user_id);
      countParams.push(user_id);
    }

    query += ' GROUP BY t.id_transaksi ORDER BY t.tanggal_transaksi DESC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), parseInt(offset));

    const [transactions] = await promisePool.execute(query, queryParams);
    const [countResult] = await promisePool.execute(countQuery, countParams);

    const totalTransactions = countResult[0].total;
    const totalPages = Math.ceil(totalTransactions / limit);

    res.json({
      success: true,
      message: 'All transactions retrieved successfully',
      data: {
        transactions,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalTransactions,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get all transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve transactions'
    });
  }
};

// Get transaction details
const getTransactionDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id_user;
    const isAdmin = req.user.role === 'admin';

    // Get transaction info
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

    // If not admin, only show own transactions
    if (!isAdmin) {
      transactionQuery += ' AND t.id_user = ?';
    }

    const transactionParams = isAdmin ? [id] : [id, userId];
    const [transactionRows] = await promisePool.execute(transactionQuery, transactionParams);

    if (transactionRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Get transaction items
    const [itemRows] = await promisePool.execute(`
      SELECT 
        ti.id_transaksi_item,
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
    `, [id]);

    const transaction = transactionRows[0];
    transaction.items = itemRows;

    res.json({
      success: true,
      message: 'Transaction details retrieved successfully',
      data: transaction
    });
  } catch (error) {
    console.error('Get transaction details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve transaction details'
    });
  }
};

// Update transaction status (Admin only)
const updateTransactionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status_pembayaran } = req.body;

    // Validate status
    const validStatuses = ['pending', 'completed', 'failed'];
    if (!validStatuses.includes(status_pembayaran)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: pending, completed, failed'
      });
    }

    // Check if transaction exists
    const [transactionRows] = await promisePool.execute(
      'SELECT id_transaksi, status_pembayaran FROM transactions WHERE id_transaksi = ?',
      [id]
    );

    if (transactionRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    const currentStatus = transactionRows[0].status_pembayaran;

    // Update status
    await promisePool.execute(
      'UPDATE transactions SET status_pembayaran = ? WHERE id_transaksi = ?',
      [status_pembayaran, id]
    );

    res.json({
      success: true,
      message: 'Transaction status updated successfully',
      data: {
        id_transaksi: parseInt(id),
        previous_status: currentStatus,
        new_status: status_pembayaran
      }
    });
  } catch (error) {
    console.error('Update transaction status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update transaction status'
    });
  }
};

// Get transaction statistics (Admin only)
const getTransactionStats = async (req, res) => {
  try {
    const { period = 'month' } = req.query; // day, week, month, year

    let dateCondition = '';
    switch (period) {
      case 'day':
        dateCondition = 'DATE(tanggal_transaksi) = CURDATE()';
        break;
      case 'week':
        dateCondition = 'YEARWEEK(tanggal_transaksi) = YEARWEEK(NOW())';
        break;
      case 'month':
        dateCondition = 'YEAR(tanggal_transaksi) = YEAR(NOW()) AND MONTH(tanggal_transaksi) = MONTH(NOW())';
        break;
      case 'year':
        dateCondition = 'YEAR(tanggal_transaksi) = YEAR(NOW())';
        break;
      default:
        dateCondition = '1=1'; // All time
    }

    // Total transactions and revenue
    const [totalStats] = await promisePool.execute(`
      SELECT 
        COUNT(*) as total_transactions,
        SUM(total_harga) as total_revenue,
        AVG(total_harga) as average_order_value
      FROM transactions 
      WHERE ${dateCondition}
    `);

    // Status breakdown
    const [statusStats] = await promisePool.execute(`
      SELECT 
        status_pembayaran,
        COUNT(*) as count,
        SUM(total_harga) as revenue
      FROM transactions 
      WHERE ${dateCondition}
      GROUP BY status_pembayaran
    `);

    // Daily revenue for charts (last 30 days)
    const [dailyStats] = await promisePool.execute(`
      SELECT 
        DATE(tanggal_transaksi) as date,
        COUNT(*) as transactions_count,
        SUM(total_harga) as daily_revenue
      FROM transactions 
      WHERE tanggal_transaksi >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(tanggal_transaksi)
      ORDER BY date ASC
    `);

    // Top customers
    const [topCustomers] = await promisePool.execute(`
      SELECT 
        u.id_user,
        u.nama,
        u.email,
        COUNT(t.id_transaksi) as transaction_count,
        SUM(t.total_harga) as total_spent
      FROM users u
      JOIN transactions t ON u.id_user = t.id_user
      WHERE ${dateCondition}
      GROUP BY u.id_user
      ORDER BY total_spent DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      message: 'Transaction statistics retrieved successfully',
      data: {
        period,
        overview: totalStats[0],
        status_breakdown: statusStats,
        daily_stats: dailyStats,
        top_customers: topCustomers
      }
    });
  } catch (error) {
    console.error('Get transaction stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve transaction statistics'
    });
  }
};

// Cancel transaction (for pending transactions only)
const cancelTransaction = async (req, res) => {
  const connection = await promisePool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    const userId = req.user.id_user;
    const isAdmin = req.user.role === 'admin';

    // Get transaction details
    let query = `
      SELECT t.id_transaksi, t.id_user, t.status_pembayaran
      FROM transactions t
      WHERE t.id_transaksi = ?
    `;
    
    // If not admin, only allow canceling own transactions
    if (!isAdmin) {
      query += ' AND t.id_user = ?';
    }

    const params = isAdmin ? [id] : [id, userId];
    const [transactionRows] = await connection.execute(query, params);

    if (transactionRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    const transaction = transactionRows[0];

    if (transaction.status_pembayaran !== 'pending') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Only pending transactions can be canceled'
      });
    }

    // Get transaction items to restore stock
    const [itemRows] = await connection.execute(`
      SELECT id_product, jumlah
      FROM transaction_items
      WHERE id_transaksi = ?
    `, [id]);

    // Restore stock for each item
    for (const item of itemRows) {
      await connection.execute(
        'UPDATE products SET stock = stock + ? WHERE id_product = ?',
        [item.jumlah, item.id_product]
      );
    }

    // Update transaction status to failed
    await connection.execute(
      'UPDATE transactions SET status_pembayaran = ? WHERE id_transaksi = ?',
      ['failed', id]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Transaction canceled successfully',
      data: {
        id_transaksi: parseInt(id),
        items_restored: itemRows.length
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Cancel transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel transaction'
    });
  } finally {
    connection.release();
  }
};

// Direct checkout (bypass cart)
const directCheckout = async (req, res) => {
  const connection = await promisePool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { items, metode_pembayaran } = req.body;
    const userId = req.user.id_user;

    if (!items || items.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Items are required for checkout'
      });
    }

    let totalAmount = 0;
    const validatedItems = [];

    // Validate each item
    for (const item of items) {
      const [productRows] = await connection.execute(
        'SELECT id_product, nama_product, harga, stock FROM products WHERE id_product = ?',
        [item.id_product]
      );

      if (productRows.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.id_product} not found`
        });
      }

      const product = productRows[0];

      if (product.stock < item.jumlah) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.nama_product}`,
          available_stock: product.stock,
          requested_quantity: item.jumlah
        });
      }

      const subtotal = product.harga * item.jumlah;
      totalAmount += subtotal;

      validatedItems.push({
        id_product: product.id_product,
        nama_product: product.nama_product,
        harga: product.harga,
        jumlah: item.jumlah,
        subtotal
      });
    }

    // Create transaction
    const [transactionResult] = await connection.execute(
      'INSERT INTO transactions (id_user, total_harga, metode_pembayaran, status_pembayaran) VALUES (?, ?, ?, ?)',
      [userId, totalAmount, metode_pembayaran, 'completed']
    );

    const transactionId = transactionResult.insertId;

    // Create transaction items and update stock
    for (const item of validatedItems) {
      // Insert transaction item
      await connection.execute(
        'INSERT INTO transaction_items (id_transaksi, id_product, jumlah, sub_total) VALUES (?, ?, ?, ?)',
        [transactionId, item.id_product, item.jumlah, item.subtotal]
      );

      // Update product stock
      await connection.execute(
        'UPDATE products SET stock = stock - ? WHERE id_product = ?',
        [item.jumlah, item.id_product]
      );
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Direct checkout completed successfully',
      data: {
        id_transaksi: transactionId,
        total_harga: totalAmount,
        metode_pembayaran,
        status_pembayaran: 'completed',
        items: validatedItems
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Direct checkout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process direct checkout'
    });
  } finally {
    connection.release();
  }
};

module.exports = {
  createTransaction,
  getUserTransactions,
  getAllTransactions,
  getTransactionDetails,
  updateTransactionStatus,
  getTransactionStats,
  cancelTransaction,
  directCheckout
};