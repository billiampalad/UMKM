// src/employee/pages/CartPage.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiShoppingCart, FiTrash2, FiPlus, FiMinus, 
  FiShoppingBag, FiCheck, FiCreditCard, FiX 
} from 'react-icons/fi';
import { cartAPI, transactionAPI } from '../../shared/services/api';
import Loading from '../../shared/components/Loading';

const CartPage = () => {
  const navigate = useNavigate();
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState({});
  const [removing, setRemoving] = useState({});
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    metode_pembayaran: 'cash'
  });

  useEffect(() => {
    fetchCartData();
  }, []);

  const fetchCartData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await cartAPI.getCart();
      setCartData(response.data.data);
      
    } catch (err) {
      setError('Failed to fetch cart data');
      console.error('Fetch cart error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      setUpdating(prev => ({ ...prev, [cartId]: true }));
      
      await cartAPI.updateCartItem(cartId, { jumlah: newQuantity });
      await fetchCartData(); // Refresh cart data
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update quantity';
      setError(errorMessage);
      setTimeout(() => setError(null), 3000);
    } finally {
      setUpdating(prev => ({ ...prev, [cartId]: false }));
    }
  };

  const removeItem = async (cartId) => {
    try {
      setRemoving(prev => ({ ...prev, [cartId]: true }));
      
      await cartAPI.removeFromCart(cartId);
      await fetchCartData(); // Refresh cart data
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to remove item';
      setError(errorMessage);
      setTimeout(() => setError(null), 3000);
    } finally {
      setRemoving(prev => ({ ...prev, [cartId]: false }));
    }
  };

  const clearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your cart?')) return;
    
    try {
      setLoading(true);
      
      await cartAPI.clearCart();
      await fetchCartData(); // Refresh cart data
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to clear cart';
      setError(errorMessage);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleCheckout = async () => {
    try {
      setCheckingOut(true);
      
      // First validate cart
      const validation = await cartAPI.validateCart();
      if (!validation.data.data.is_valid) {
        setError('Some items in your cart have insufficient stock. Please review your cart.');
        setShowCheckoutModal(false);
        await fetchCartData(); // Refresh to show updated stock
        return;
      }
      
      // Process checkout
      const response = await transactionAPI.createTransaction(checkoutData);
      
      setShowCheckoutModal(false);
      navigate('/employee/history', { 
        state: { 
          message: 'Order placed successfully!',
          transactionId: response.data.data.id_transaksi 
        } 
      });
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Checkout failed';
      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
    } finally {
      setCheckingOut(false);
    }
  };

  const CartItem = ({ item }) => {
    const isUpdating = updating[item.id_cart];
    const isRemoving = removing[item.id_cart];

    return (
      <div className="cart-item">
        <div className="item-image">
          <FiShoppingBag />
          <div className="image-overlay"></div>
        </div>
        
        <div className="item-details">
          <h3 className="item-name">{item.nama_product}</h3>
          <p className="item-description">{item.deskripsi}</p>
          <div className="item-price">
            Rp {item.harga.toLocaleString()} each
          </div>
          <div className="item-availability">
            {item.stock >= item.jumlah ? (
              <span className="in-stock">✓ In stock</span>
            ) : (
              <span className="low-stock">⚠ Only {item.stock} left</span>
            )}
          </div>
        </div>

        <div className="item-quantity">
          <div className="quantity-controls">
            <button
              className="quantity-btn"
              onClick={() => updateQuantity(item.id_cart, item.jumlah - 1)}
              disabled={isUpdating || item.jumlah <= 1}
            >
              <FiMinus />
            </button>
            <span className="quantity-display">
              {isUpdating ? '...' : item.jumlah}
            </span>
            <button
              className="quantity-btn"
              onClick={() => updateQuantity(item.id_cart, item.jumlah + 1)}
              disabled={isUpdating || item.jumlah >= item.stock}
            >
              <FiPlus />
            </button>
          </div>
        </div>

        <div className="item-total">
          <div className="total-price">
            Rp {item.subtotal.toLocaleString()}
          </div>
          <button
            className="remove-btn"
            onClick={() => removeItem(item.id_cart)}
            disabled={isRemoving}
            title="Remove item"
          >
            {isRemoving ? (
              <div className="spinner-sm"></div>
            ) : (
              <FiTrash2 />
            )}
          </button>
        </div>
      </div>
    );
  };

  const CheckoutModal = () => (
    <div className="modal-overlay" onClick={() => setShowCheckoutModal(false)}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Checkout</h2>
          <button 
            className="modal-close"
            onClick={() => setShowCheckoutModal(false)}
          >
            <FiX />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="checkout-summary">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Items ({cartData?.total_items})</span>
              <span>Rp {cartData?.total_amount.toLocaleString()}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>Rp {cartData?.total_amount.toLocaleString()}</span>
            </div>
          </div>

          <div className="payment-method">
            <h3>Payment Method</h3>
            <div className="payment-options">
              <label className="payment-option">
                <input
                  type="radio"
                  name="payment"
                  value="cash"
                  checked={checkoutData.metode_pembayaran === 'cash'}
                  onChange={(e) => setCheckoutData(prev => ({ 
                    ...prev, 
                    metode_pembayaran: e.target.value 
                  }))}
                />
                <span className="payment-label">💰 Cash</span>
              </label>
              <label className="payment-option">
                <input
                  type="radio"
                  name="payment"
                  value="debit_card"
                  checked={checkoutData.metode_pembayaran === 'debit_card'}
                  onChange={(e) => setCheckoutData(prev => ({ 
                    ...prev, 
                    metode_pembayaran: e.target.value 
                  }))}
                />
                <span className="payment-label">💳 Debit Card</span>
              </label>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button 
            className="btn-secondary"
            onClick={() => setShowCheckoutModal(false)}
            disabled={checkingOut}
          >
            Cancel
          </button>
          <button 
            className="btn-primary"
            onClick={handleCheckout}
            disabled={checkingOut}
          >
            {checkingOut ? (
              <>
                <div className="spinner-sm"></div>
                Processing...
              </>
            ) : (
              <>
                <FiCreditCard />
                Place Order
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) return <Loading />;

  return (
    <div className="cart-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">
            <FiShoppingCart />
            <span>Shopping Cart</span>
          </h1>
          {cartData?.items?.length > 0 && (
            <button 
              className="btn-danger-outline"
              onClick={clearCart}
            >
              <FiTrash2 />
              Clear Cart
            </button>
          )}
        </div>
        <div className="header-decoration"></div>
      </div>

      {error && (
        <div className="alert alert-error">
          <div className="alert-content">
            <FiX className="alert-icon" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {!cartData?.items?.length ? (
        <div className="empty-cart">
          <div className="empty-content">
            <div className="empty-icon-container">
              <FiShoppingBag className="empty-icon" />
              <div className="icon-animation"></div>
            </div>
            <h2>Your cart is empty</h2>
            <p>Start shopping to add items to your cart</p>
            <Link to="/employee/shop" className="btn-primary">
              <FiShoppingBag />
              Browse Products
            </Link>
          </div>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items">
            {cartData.items.map(item => (
              <CartItem key={item.id_cart} item={item} />
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-card">
              <div className="summary-header">
                <h3>Order Summary</h3>
                <div className="summary-decoration"></div>
              </div>
              <div className="summary-details">
                <div className="summary-row">
                  <span>Items ({cartData.total_items})</span>
                  <span>Rp {cartData.total_amount.toLocaleString()}</span>
                </div>
                <div className="summary-row total">
                  <strong>
                    <span>Total</span>
                    <span>Rp {cartData.total_amount.toLocaleString()}</span>
                  </strong>
                </div>
              </div>
              <button 
                className="btn-primary btn-full checkout-btn"
                onClick={() => setShowCheckoutModal(true)}
              >
                <FiCheck />
                <span>Proceed to Checkout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showCheckoutModal && <CheckoutModal />}

      <style jsx>{`
        .cart-page {
          padding: 0;
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }

        .page-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          padding: 2.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
          position: relative;
          overflow: hidden;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          z-index: 2;
        }

        .page-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: white;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 1rem;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }

        .page-title svg {
          font-size: 2rem;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
        }

        .header-decoration {
          position: absolute;
          top: -50%;
          right: -10%;
          width: 200px;
          height: 200px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          backdrop-filter: blur(10px);
        }

        .btn-danger-outline {
          background: rgba(255, 255, 255, 0.15);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .btn-danger-outline:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255, 255, 255, 0.2);
        }

        .alert {
          margin-bottom: 2rem;
          border-radius: 12px;
          overflow: hidden;
          animation: slideIn 0.3s ease;
        }

        .alert-error {
          background: linear-gradient(135deg, #ff6b6b, #ee5a24);
          box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3);
        }

        .alert-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          color: white;
          font-weight: 500;
        }

        .alert-icon {
          font-size: 1.25rem;
        }

        .empty-cart {
          background: white;
          border-radius: 20px;
          padding: 4rem 2rem;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
          position: relative;
          overflow: hidden;
        }

        .empty-content {
          position: relative;
          z-index: 2;
        }

        .empty-cart::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #667eea, #764ba2, #667eea);
          background-size: 200% 100%;
          animation: gradientMove 3s ease infinite;
        }

        .empty-icon-container {
          position: relative;
          display: inline-block;
          margin-bottom: 2rem;
        }

        .empty-icon {
          font-size: 5rem;
          color: #667eea;
          filter: drop-shadow(0 4px 8px rgba(102, 126, 234, 0.3));
        }

        .icon-animation {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 120px;
          height: 120px;
          border: 3px solid transparent;
          border-top: 3px solid #667eea;
          border-radius: 50%;
          animation: spin 3s linear infinite;
          opacity: 0.3;
        }

        .empty-cart h2 {
          font-size: 2rem;
          color: #333;
          margin-bottom: 1rem;
          font-weight: 700;
        }

        .empty-cart p {
          color: #666;
          font-size: 1.125rem;
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .cart-content {
          display: grid;
          grid-template-columns: 1fr 350px;
          gap: 2rem;
          align-items: start;
        }

        .cart-items {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .cart-item {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
          display: grid;
          grid-template-columns: 100px 1fr auto auto;
          gap: 1.5rem;
          align-items: center;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .cart-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #667eea, #764ba2);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        .cart-item:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
        }

        .cart-item:hover::before {
          transform: scaleX(1);
        }

        .item-image {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 2rem;
          position: relative;
          overflow: hidden;
        }

        .image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transform: translateX(-100%);
          transition: transform 0.6s ease;
        }

        .cart-item:hover .image-overlay {
          transform: translateX(100%);
        }

        .item-details {
          flex: 1;
        }

        .item-name {
          font-size: 1.25rem;
          font-weight: 700;
          color: #333;
          margin: 0 0 0.5rem 0;
          line-height: 1.4;
        }

        .item-description {
          color: #666;
          font-size: 0.875rem;
          margin: 0 0 0.75rem 0;
          line-height: 1.5;
        }

        .item-price {
          font-size: 1rem;
          font-weight: 600;
          color: #667eea;
          margin-bottom: 0.5rem;
        }

        .item-availability {
          font-size: 0.875rem;
        }

        .in-stock {
          color: #10ac84;
          font-weight: 500;
        }

        .low-stock {
          color: #ff6b6b;
          font-weight: 500;
        }

        .quantity-controls {
          display: flex;
          align-items: center;
          background: #f8f9fa;
          border-radius: 12px;
          padding: 0.5rem;
          gap: 0.5rem;
        }

        .quantity-btn {
          width: 36px;
          height: 36px;
          border: none;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #667eea;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .quantity-btn:hover:not(:disabled) {
          background: #667eea;
          color: white;
          transform: scale(1.1);
        }

        .quantity-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .quantity-display {
          min-width: 40px;
          text-align: center;
          font-weight: 700;
          color: #333;
          font-size: 1.125rem;
        }

        .item-total {
          text-align: right;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          align-items: flex-end;
        }

        .total-price {
          font-size: 1.25rem;
          font-weight: 700;
          color: #333;
        }

        .remove-btn {
          width: 40px;
          height: 40px;
          border: none;
          background: linear-gradient(135deg, #ff6b6b, #ee5a24);
          color: white;
          border-radius: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
        }

        .remove-btn:hover:not(:disabled) {
          transform: scale(1.1);
          box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
        }

        .remove-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .cart-summary {
          position: sticky;
          top: 2rem;
        }

        .summary-card {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
          position: relative;
          overflow: hidden;
        }

        .summary-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #667eea, #764ba2);
        }

        .summary-header {
          position: relative;
          margin-bottom: 1.5rem;
        }

        .summary-header h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #333;
          margin: 0;
        }

        .summary-decoration {
          width: 50px;
          height: 3px;
          background: linear-gradient(90deg, #667eea, #764ba2);
          border-radius: 2px;
          margin-top: 0.5rem;
        }

        .summary-details {
          margin-bottom: 2rem;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .summary-row:last-child {
          border-bottom: none;
        }

        .summary-row.total {
          padding-top: 1rem;
          margin-top: 1rem;
          border-top: 2px solid #f0f0f0;
          font-size: 1.125rem;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          text-decoration: none;
          position: relative;
          overflow: hidden;
        }

        .btn-primary::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s ease;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
        }

        .btn-primary:hover::before {
          left: 100%;
        }

        .btn-full {
          width: 100%;
        }

        .checkout-btn {
          font-size: 1.125rem;
          padding: 1.25rem 2rem;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease;
        }

        .modal {
          background: white;
          border-radius: 20px;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: modalSlideIn 0.3s ease;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
        }

        .modal-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
        }

        .modal-close {
          background: none;
          border: none;
          color: white;
          font-size: 1.5rem;
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s;
        }

        .modal-close:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .modal-body {
          padding: 2rem;
        }

        .checkout-summary {
          margin-bottom: 2rem;
        }

        .checkout-summary h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #333;
          margin-bottom: 1rem;
        }

        .payment-method h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #333;
          margin-bottom: 1rem;
        }

        .payment-options {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .payment-option {
          display: flex;
          align-items: center;
          padding: 1rem;
          border: 2px solid #f0f0f0;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .payment-option:hover {
          border-color: #667eea;
          background: #f8f9ff;
        }

        .payment-option input[type="radio"] {
          margin-right: 1rem;
          transform: scale(1.2);
          accent-color: #667eea;
        }

        .payment-label {
          font-weight: 500;
          font-size: 1.125rem;
        }

        .modal-footer {
          display: flex;
          gap: 1rem;
          padding: 1.5rem 2rem;
          background: #f8f9fa;
          border-top: 1px solid #f0f0f0;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #5a6268;
        }

        .btn-secondary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner-sm {
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideIn {
          from { 
            opacity: 0; 
            transform: translateY(-20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }

        @keyframes modalSlideIn {
          from { 
            opacity: 0; 
            transform: scale(0.9) translateY(-20px); 
          }
          to { 
            opacity: 1; 
            transform: scale(1) translateY(0); 
          }
        }

        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @media (max-width: 1024px) {
          .cart-content {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .summary-card {
            position: relative;
            top: auto;
          }
        }

        @media (max-width: 768px) {
          .page-header {
            padding: 2rem 1.5rem;
            border-radius: 16px;
          }

          .page-title {
            font-size: 2rem;
          }

          .header-content {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .cart-item {
            grid-template-columns: 1fr;
            gap: 1rem;
            text-align: center;
            padding: 1.5rem;
          }

          .item-image {
            margin: 0 auto;
          }

          .item-total {
            align-items: center;
          }

          .empty-cart {
            padding: 3rem 1.5rem;
            border-radius: 16px;
          }

          .empty-icon {
            font-size: 4rem;
          }

          .modal {
            width: 95%;
            margin: 1rem;
          }

          .modal-body {
            padding: 1.5rem;
          }

          .modal-footer {
            padding: 1rem 1.5rem;
            flex-direction: column;
          }

          .btn-secondary,
          .btn-primary {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default CartPage;