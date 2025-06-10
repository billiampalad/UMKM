const { promisePool } = require('../config/database');

// Get user's cart
const getCart = async (req, res) => {
  try {
    const userId = req.user.id_user;

    const [rows] = await promisePool.execute(`
      SELECT 
        ci.id_cart,
        ci.id_product,
        ci.jumlah,
        ci.created_at,
        p.nama_product,
        p.deskripsi,
        p.harga,
        p.stock,
        (ci.jumlah * p.harga) as subtotal
      FROM cart_items ci
      JOIN products p ON ci.id_product = p.id_product
      WHERE ci.id_user = ?
      ORDER BY ci.created_at DESC
    `, [userId]);

    // Calculate total
    const total = rows.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);

    res.json({
      success: true,
      message: 'Cart retrieved successfully',
      data: {
        items: rows,
        total_items: rows.length,
        total_amount: total
      }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve cart'
    });
  }
};

// Add item to cart
const addToCart = async (req, res) => {
  try {
    const { id_product, jumlah } = req.body;
    const userId = req.user.id_user;

    // Check if product exists and has enough stock
    const [productRows] = await promisePool.execute(
      'SELECT id_product, nama_product, harga, stock FROM products WHERE id_product = ?',
      [id_product]
    );

    if (productRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const product = productRows[0];

    if (product.stock < jumlah) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock available',
        available_stock: product.stock
      });
    }

    // Check if item already exists in cart
    const [existingItem] = await promisePool.execute(
      'SELECT id_cart, jumlah FROM cart_items WHERE id_user = ? AND id_product = ?',
      [userId, id_product]
    );

    if (existingItem.length > 0) {
      // Update existing item
      const newQuantity = existingItem[0].jumlah + jumlah;
      
      if (product.stock < newQuantity) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock for total quantity',
          available_stock: product.stock,
          current_cart_quantity: existingItem[0].jumlah
        });
      }

      await promisePool.execute(
        'UPDATE cart_items SET jumlah = ? WHERE id_cart = ?',
        [newQuantity, existingItem[0].id_cart]
      );

      res.json({
        success: true,
        message: 'Cart item updated successfully',
        data: {
          id_cart: existingItem[0].id_cart,
          id_product,
          jumlah: newQuantity,
          action: 'updated'
        }
      });
    } else {
      // Add new item
      const [result] = await promisePool.execute(
        'INSERT INTO cart_items (id_user, id_product, jumlah) VALUES (?, ?, ?)',
        [userId, id_product, jumlah]
      );

      res.status(201).json({
        success: true,
        message: 'Item added to cart successfully',
        data: {
          id_cart: result.insertId,
          id_product,
          jumlah,
          action: 'added'
        }
      });
    }
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart'
    });
  }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { jumlah } = req.body;
    const userId = req.user.id_user;

    if (jumlah <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than 0'
      });
    }

    // Check if cart item belongs to user
    const [cartItem] = await promisePool.execute(`
      SELECT ci.id_cart, ci.id_product, ci.jumlah, p.stock, p.nama_product
      FROM cart_items ci
      JOIN products p ON ci.id_product = p.id_product
      WHERE ci.id_cart = ? AND ci.id_user = ?
    `, [id, userId]);

    if (cartItem.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    const item = cartItem[0];

    // Check stock availability
    if (item.stock < jumlah) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock available',
        available_stock: item.stock
      });
    }

    // Update quantity
    await promisePool.execute(
      'UPDATE cart_items SET jumlah = ? WHERE id_cart = ?',
      [jumlah, id]
    );

    res.json({
      success: true,
      message: 'Cart item updated successfully',
      data: {
        id_cart: parseInt(id),
        previous_quantity: item.jumlah,
        new_quantity: jumlah
      }
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart item'
    });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id_user;

    // Check if cart item belongs to user
    const [cartItem] = await promisePool.execute(
      'SELECT id_cart FROM cart_items WHERE id_cart = ? AND id_user = ?',
      [id, userId]
    );

    if (cartItem.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    // Remove item
    await promisePool.execute(
      'DELETE FROM cart_items WHERE id_cart = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Item removed from cart successfully'
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart'
    });
  }
};

// Clear entire cart
const clearCart = async (req, res) => {
  try {
    const userId = req.user.id_user;

    // Get count of items before clearing
    const [countResult] = await promisePool.execute(
      'SELECT COUNT(*) as count FROM cart_items WHERE id_user = ?',
      [userId]
    );

    const itemCount = countResult[0].count;

    // Clear all items
    await promisePool.execute(
      'DELETE FROM cart_items WHERE id_user = ?',
      [userId]
    );

    res.json({
      success: true,
      message: 'Cart cleared successfully',
      data: {
        items_removed: itemCount
      }
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart'
    });
  }
};

// Get cart summary
const getCartSummary = async (req, res) => {
  try {
    const userId = req.user.id_user;

    const [summary] = await promisePool.execute(`
      SELECT 
        COUNT(*) as total_items,
        SUM(ci.jumlah) as total_quantity,
        SUM(ci.jumlah * p.harga) as total_amount
      FROM cart_items ci
      JOIN products p ON ci.id_product = p.id_product
      WHERE ci.id_user = ?
    `, [userId]);

    res.json({
      success: true,
      message: 'Cart summary retrieved successfully',
      data: {
        total_items: summary[0].total_items || 0,
        total_quantity: summary[0].total_quantity || 0,
        total_amount: summary[0].total_amount || 0
      }
    });
  } catch (error) {
    console.error('Get cart summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve cart summary'
    });
  }
};

// Validate cart before checkout
const validateCart = async (req, res) => {
  try {
    const userId = req.user.id_user;

    const [cartItems] = await promisePool.execute(`
      SELECT 
        ci.id_cart,
        ci.id_product,
        ci.jumlah,
        p.nama_product,
        p.harga,
        p.stock,
        CASE WHEN p.stock < ci.jumlah THEN 'insufficient_stock' ELSE 'available' END as status
      FROM cart_items ci
      JOIN products p ON ci.id_product = p.id_product
      WHERE ci.id_user = ?
    `, [userId]);

    if (cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    const unavailableItems = cartItems.filter(item => item.status === 'insufficient_stock');
    const isValid = unavailableItems.length === 0;

    res.json({
      success: true,
      message: 'Cart validation completed',
      data: {
        is_valid: isValid,
        total_items: cartItems.length,
        unavailable_items: unavailableItems,
        validation_message: isValid ? 'Cart is ready for checkout' : 'Some items have insufficient stock'
      }
    });
  } catch (error) {
    console.error('Validate cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate cart'
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartSummary,
  validateCart
};