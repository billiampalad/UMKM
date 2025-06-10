import React, { useState, useEffect } from 'react';
import api from '../../shared/utils/api';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/transactions/my-orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await api.get(`/transactions/${orderId}/details`);
      setSelectedOrder(response.data);
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="order-history">
      <h1>Order History</h1>
      
      {orders.length === 0 ? (
        <div className="no-orders">
          <p>No orders found</p>
          <a href="/employee/products" className="btn-primary">
            Start Shopping
          </a>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id_transaksi} className="order-card">
              <div className="order-header">
                <div className="order-info">
                  <h3>Order #{order.id_transaksi}</h3>
                  <p>Date: {new Date(order.tanggal_transaksi).toLocaleDateString()}</p>
                </div>
                <div className="order-status">
                  <span className={`status-badge ${order.status_pembayaran}`}>
                    {order.status_pembayaran}
                  </span>
                </div>
              </div>
              
              <div className="order-details">
                <p>Total: Rp {parseFloat(order.total_harga).toLocaleString()}</p>
                <p>Payment: {order.metode_pembayaran}</p>
                
                <button 
                  onClick={() => fetchOrderDetails(order.id_transaksi)}
                  className="btn-secondary"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedOrder && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Order #{selectedOrder.id_transaksi} Details</h2>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="close-btn"
              >
                ×
              </button>
            </div>
            
            <div className="order-items">
              <h3>Items:</h3>
              {selectedOrder.items?.map((item) => (
                <div key={item.id_transaksi_item} className="order-item">
                  <span>{item.nama_product}</span>
                  <span>Qty: {item.jumlah}</span>
                  <span>Rp {parseFloat(item.sub_total).toLocaleString()}</span>
                </div>
              ))}
            </div>
            
            <div className="order-summary">
              <p><strong>Total: Rp {parseFloat(selectedOrder.total_harga).toLocaleString()}</strong></p>
              <p>Status: <span className={`status-badge ${selectedOrder.status_pembayaran}`}>
                {selectedOrder.status_pembayaran}
              </span></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;