const { promisePool } = require('../config/database');

// Get all products
const getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', category = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM products WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) as total FROM products WHERE 1=1';
    let queryParams = [];
    let countParams = [];

    // Add search filter
    if (search) {
      query += ' AND (nama_product LIKE ? OR deskripsi LIKE ?)';
      countQuery += ' AND (nama_product LIKE ? OR deskripsi LIKE ?)';
      const searchParam = `%${search}%`;
      queryParams.push(searchParam, searchParam);
      countParams.push(searchParam, searchParam);
    }

    // Add ordering and pagination
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), parseInt(offset));

    // Execute queries
    const [products] = await promisePool.execute(query, queryParams);
    const [countResult] = await promisePool.execute(countQuery, countParams);

    const totalProducts = countResult[0].total;
    const totalPages = Math.ceil(totalProducts / limit);

    res.json({
      success: true,
      message: 'Products retrieved successfully',
      data: {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalProducts,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve products'
    });
  }
};

// Get product by ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await promisePool.execute(
      'SELECT * FROM products WHERE id_product = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product retrieved successfully',
      data: rows[0]
    });
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve product'
    });
  }
};

// Create new product (Admin only)
const createProduct = async (req, res) => {
  try {
    const { nama_product, deskripsi, harga, stock } = req.body;

    // Check if product name already exists
    const [existingProduct] = await promisePool.execute(
      'SELECT id_product FROM products WHERE nama_product = ?',
      [nama_product]
    );

    if (existingProduct.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Product name already exists'
      });
    }

    // Insert new product
    const [result] = await promisePool.execute(
      'INSERT INTO products (nama_product, deskripsi, harga, stock) VALUES (?, ?, ?, ?)',
      [nama_product, deskripsi || null, parseFloat(harga), parseInt(stock)]
    );

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: {
        id_product: result.insertId,
        nama_product,
        deskripsi,
        harga: parseFloat(harga),
        stock: parseInt(stock)
      }
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product'
    });
  }
};

// Update product (Admin only)
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_product, deskripsi, harga, stock } = req.body;

    // Check if product exists
    const [existingProduct] = await promisePool.execute(
      'SELECT id_product FROM products WHERE id_product = ?',
      [id]
    );

    if (existingProduct.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if product name is already taken by another product
    if (nama_product) {
      const [nameCheck] = await promisePool.execute(
        'SELECT id_product FROM products WHERE nama_product = ? AND id_product != ?',
        [nama_product, id]
      );

      if (nameCheck.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Product name already exists'
        });
      }
    }

    // Build update query
    let updateFields = [];
    let updateValues = [];

    if (nama_product) {
      updateFields.push('nama_product = ?');
      updateValues.push(nama_product);
    }
    if (deskripsi !== undefined) {
      updateFields.push('deskripsi = ?');
      updateValues.push(deskripsi);
    }
    if (harga !== undefined) {
      updateFields.push('harga = ?');
      updateValues.push(parseFloat(harga));
    }
    if (stock !== undefined) {
      updateFields.push('stock = ?');
      updateValues.push(parseInt(stock));
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updateValues.push(id);

    await promisePool.execute(
      `UPDATE products SET ${updateFields.join(', ')} WHERE id_product = ?`,
      updateValues
    );

    res.json({
      success: true,
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product'
    });
  }
};

// Delete product (Admin only)
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const [existingProduct] = await promisePool.execute(
      'SELECT id_product FROM products WHERE id_product = ?',
      [id]
    );

    if (existingProduct.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if product is in any active carts
    const [cartItems] = await promisePool.execute(
      'SELECT id_cart FROM cart_items WHERE id_product = ?',
      [id]
    );

    if (cartItems.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete product that is in shopping carts'
      });
    }

    await promisePool.execute(
      'DELETE FROM products WHERE id_product = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product'
    });
  }
};

// Update stock (Admin only)
const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock, operation = 'set' } = req.body; // operation: 'set', 'add', 'subtract'

    // Validate stock value
    if (typeof stock !== 'number' || stock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock must be a non-negative number'
      });
    }

    // Get current product
    const [rows] = await promisePool.execute(
      'SELECT id_product, stock FROM products WHERE id_product = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    let newStock;
    const currentStock = rows[0].stock;

    switch (operation) {
      case 'add':
        newStock = currentStock + stock;
        break;
      case 'subtract':
        newStock = Math.max(0, currentStock - stock);
        break;
      case 'set':
      default:
        newStock = stock;
        break;
    }

    await promisePool.execute(
      'UPDATE products SET stock = ? WHERE id_product = ?',
      [newStock, id]
    );

    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: {
        previous_stock: currentStock,
        new_stock: newStock,
        operation
      }
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update stock'
    });
  }
};

// Get low stock products (Admin only)
const getLowStockProducts = async (req, res) => {
  try {
    const { threshold = 10 } = req.query;

    const [rows] = await promisePool.execute(
      'SELECT * FROM products WHERE stock <= ? ORDER BY stock ASC',
      [parseInt(threshold)]
    );

    res.json({
      success: true,
      message: 'Low stock products retrieved successfully',
      data: {
        products: rows,
        threshold: parseInt(threshold),
        count: rows.length
      }
    });
  } catch (error) {
    console.error('Get low stock products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve low stock products'
    });
  }
};

// Get product statistics (Admin only)
const getProductStats = async (req, res) => {
  try {
    const [totalProducts] = await promisePool.execute(
      'SELECT COUNT(*) as total FROM products'
    );
    
    const [lowStockCount] = await promisePool.execute(
      'SELECT COUNT(*) as count FROM products WHERE stock <= 10'
    );
    
    const [outOfStockCount] = await promisePool.execute(
      'SELECT COUNT(*) as count FROM products WHERE stock = 0'
    );
    
    const [totalValue] = await promisePool.execute(
      'SELECT SUM(harga * stock) as total_value FROM products'
    );

    res.json({
      success: true,
      message: 'Product statistics retrieved successfully',
      data: {
        total_products: totalProducts[0].total,
        low_stock_products: lowStockCount[0].count,
        out_of_stock_products: outOfStockCount[0].count,
        total_inventory_value: totalValue[0].total_value || 0
      }
    });
  } catch (error) {
    console.error('Get product stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve product statistics'
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  getLowStockProducts,
  getProductStats
};