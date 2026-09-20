// frontend/src/components/orders/OrderDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import '../../styles/OrderDetail.css';

const OrderDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({
    quantity: 0,
    price: 0
  });

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/orders/${id}`,
        config
      );
      setOrder(res.data.order);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error(error.response?.data?.message || 'Failed to load order');
      setLoading(false);
      navigate('/dashboard');
    }
  };

  // Update individual item status (Process, Ship, Deliver)
  const handleUpdateItemStatus = async (itemId, status) => {
    try {
      setUpdating(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      console.log(`📤 Updating item ${itemId} to status: ${status}`);
      
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/orders/${id}/items/${itemId}/status`,
        { status },
        config
      );
      
      console.log('✅ Response:', response.data);
      
      const statusMessages = {
        'processing': 'Item is now being processed ✅',
        'shipped': 'Item has been shipped 📦',
        'delivered': 'Item has been delivered ✅',
        'cancelled': 'Item cancelled successfully 🗑️'
      };
      
      toast.success(statusMessages[status] || `Item ${status} successfully!`);
      fetchOrderDetails();
    } catch (error) {
      console.error('❌ Error updating item status:', error);
      
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        toast.error(error.response.data?.message || `Error ${error.response.status}`);
      } else if (error.request) {
        console.error('No response received');
        toast.error('No response from server. Is backend running?');
      } else {
        console.error('Request error:', error.message);
        toast.error(error.message);
      }
    } finally {
      setUpdating(false);
    }
  };

  // Recover cancelled order item (admin only) - NEW
  const handleRecoverItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to recover this item?')) return;

    try {
      setUpdating(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      await axios.put(
        `${process.env.REACT_APP_API_URL}/orders/${id}/items/${itemId}/recover`,
        {},
        config
      );
      
      toast.success('Item recovered successfully!');
      fetchOrderDetails();
    } catch (error) {
      console.error('Error recovering item:', error);
      toast.error(error.response?.data?.message || 'Failed to recover item');
    } finally {
      setUpdating(false);
    }
  };

  // Update order status (admin only)
  const handleUpdateOrderStatus = async (status) => {
    try {
      setUpdating(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      await axios.put(
        `${process.env.REACT_APP_API_URL}/orders/${id}/status`,
        { status },
        config
      );
      toast.success(`Order ${status} successfully!`);
      fetchOrderDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  // Cancel entire order (user or admin)
  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this entire order?')) return;

    try {
      setUpdating(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      await axios.put(
        `${process.env.REACT_APP_API_URL}/orders/${id}/cancel`,
        {},
        config
      );
      toast.success('Order cancelled successfully!');
      fetchOrderDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    } finally {
      setUpdating(false);
    }
  };

  // Recover cancelled order (admin only)
  const handleRecoverOrder = async () => {
    if (!window.confirm('Are you sure you want to recover this order?')) return;

    try {
      setUpdating(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      await axios.put(
        `${process.env.REACT_APP_API_URL}/orders/${id}/recover`,
        {},
        config
      );
      toast.success('Order recovered successfully!');
      fetchOrderDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to recover order');
    } finally {
      setUpdating(false);
    }
  };

  // Cancel order item
  const handleCancelItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to cancel this item?')) return;

    try {
      setUpdating(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/orders/${id}/items/${itemId}`,
        config
      );
      toast.success('Item cancelled successfully');
      fetchOrderDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel item');
    } finally {
      setUpdating(false);
    }
  };

  // Edit item details (quantity and price)
  const startEdit = (item) => {
    setEditingItem(item.id);
    setEditForm({
      quantity: item.quantity,
      price: parseFloat(item.price)
    });
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditForm({ quantity: 0, price: 0 });
  };

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: parseFloat(e.target.value) || 0
    });
  };

  const handleSaveEdit = async (itemId) => {
    if (editForm.quantity < 1) {
      toast.error('Quantity must be at least 1');
      return;
    }
    if (editForm.price < 0) {
      toast.error('Price cannot be negative');
      return;
    }

    try {
      setUpdating(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      await axios.put(
        `${process.env.REACT_APP_API_URL}/orders/${id}/items/${itemId}`,
        {
          quantity: editForm.quantity,
          price: editForm.price
        },
        config
      );
      toast.success('Item updated successfully');
      setEditingItem(null);
      fetchOrderDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update item');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading order details...</div>;
  }

  if (!order) {
    return <div className="alert alert-danger">Order not found</div>;
  }

  const isAdmin = user?.role === 'admin';
  const isPendingOrProcessing = ['pending', 'processing'].includes(order.status);
  const isCancelled = order.status === 'cancelled';

  // Status colors
  const getStatusColor = (status) => {
    const colors = {
      'pending': '#ffd93d',
      'processing': '#4facfe',
      'shipped': '#43e97b',
      'delivered': '#28a745',
      'cancelled': '#ff6b6b',
      'active': '#28a745'
    };
    return colors[status] || '#6c757d';
  };

  return (
    <div className="order-detail-container">
      <div className="order-detail-header">
        <Link to="/dashboard" className="btn btn-outline back-btn">
          ← Back to Dashboard
        </Link>
        <h2>Order #{order.id.substring(0, 10)}</h2>
        <div className="order-status-display">
          <span 
            className="order-status-badge"
            style={{ backgroundColor: getStatusColor(order.status) }}
          >
            {order.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Order Summary */}
      <div className="order-summary-card">
        <div className="summary-grid">
          <div className="summary-item">
            <label>Customer</label>
            <span>{order.user_name || 'N/A'}</span>
          </div>
          <div className="summary-item">
            <label>Email</label>
            <span>{order.user_email || 'N/A'}</span>
          </div>
          <div className="summary-item">
            <label>Phone</label>
            <span>{order.phone || 'N/A'}</span>
          </div>
          <div className="summary-item">
            <label>Order Date</label>
            <span>{new Date(order.created_at).toLocaleString()}</span>
          </div>
          <div className="summary-item">
            <label>Payment Method</label>
            <span>{order.payment_method}</span>
          </div>
          <div className="summary-item">
            <label>Total Amount</label>
            <span className="total-amount">${parseFloat(order.total_amount).toFixed(2)}</span>
          </div>
        </div>

        <div className="shipping-info">
          <h4>Shipping Address</h4>
          <p>{order.shipping_address}</p>
          {order.notes && (
            <div className="order-notes">
              <h4>Notes</h4>
              <p>{order.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Order Items */}
      <div className="order-items-section">
        <h3>Order Items</h3>
        <div className="items-table-container">
          <table className="items-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Subtotal</th>
                <th>Item Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {order.items && order.items.map((item) => {
                const isEditing = editingItem === item.id;
                const isItemCancelled = item.status === 'cancelled';
                const isItemProcessing = item.status === 'processing';
                const isItemShipped = item.status === 'shipped';
                const isItemDelivered = item.status === 'delivered';

                return (
                  <tr key={item.id} className={isItemCancelled ? 'cancelled-item' : ''}>
                    <td>
                      <div className="product-cell">
                        {item.product_image ? (
                          <img 
                            src={`http://localhost:5000${item.product_image}`} 
                            alt={item.product_name}
                            className="item-thumbnail"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="item-placeholder">📦</div>
                        )}
                        <span>{item.product_name}</span>
                      </div>
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          type="number"
                          name="price"
                          value={editForm.price}
                          onChange={handleEditChange}
                          className="edit-input"
                          step="0.01"
                          min="0"
                        />
                      ) : (
                        `$${parseFloat(item.price).toFixed(2)}`
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          type="number"
                          name="quantity"
                          value={editForm.quantity}
                          onChange={handleEditChange}
                          className="edit-input"
                          min="1"
                          step="1"
                        />
                      ) : (
                        item.quantity
                      )}
                    </td>
                    <td>${(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
                    <td>
                      <span 
                        className="item-status-badge"
                        style={{ 
                          backgroundColor: getStatusColor(item.status || 'active'),
                          color: item.status === 'pending' ? '#856404' : 'white'
                        }}
                      >
                        {item.status || 'Active'}
                      </span>
                    </td>
                    <td>
                      {isEditing ? (
                        <div className="action-buttons">
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleSaveEdit(item.id)}
                            disabled={updating}
                          >
                            💾 Save
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={cancelEdit}
                            disabled={updating}
                          >
                            ❌ Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="action-buttons">
                          {/* Admin Actions - Process, Ship, Deliver */}
                          {isAdmin && !isItemCancelled && !isCancelled && (
                            <>
                              <button
                                className="btn btn-warning btn-sm"
                                onClick={() => startEdit(item)}
                                disabled={updating}
                                title="Edit item details"
                              >
                                ✏️ Edit
                              </button>
                              
                              {/* Process Button */}
                              {!isItemProcessing && !isItemShipped && !isItemDelivered && (
                                <button
                                  className="btn btn-primary btn-sm"
                                  onClick={() => handleUpdateItemStatus(item.id, 'processing')}
                                  disabled={updating}
                                  title="Mark as Processing"
                                >
                                  🔄 Process
                                </button>
                              )}
                              
                              {/* Ship Button */}
                              {isItemProcessing && !isItemShipped && !isItemDelivered && (
                                <button
                                  className="btn btn-info btn-sm"
                                  onClick={() => handleUpdateItemStatus(item.id, 'shipped')}
                                  disabled={updating}
                                  title="Mark as Shipped"
                                >
                                  📦 Ship
                                </button>
                              )}
                              
                              {/* Deliver Button */}
                              {isItemShipped && !isItemDelivered && (
                                <button
                                  className="btn btn-success btn-sm"
                                  onClick={() => handleUpdateItemStatus(item.id, 'delivered')}
                                  disabled={updating}
                                  title="Mark as Delivered"
                                >
                                  ✅ Deliver
                                </button>
                              )}
                              
                              {/* Show delivered status */}
                              {isItemDelivered && (
                                <span className="delivered-label">✓ Delivered</span>
                              )}
                            </>
                          )}

                          {/* Recover Button - for cancelled items (admin only) - NEW */}
                          {isAdmin && isItemCancelled && !isCancelled && (
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleRecoverItem(item.id)}
                              disabled={updating}
                              title="Recover this item"
                            >
                              🔄 Recover
                            </button>
                          )}

                          {/* Cancel Action (both admin and user) */}
                          {!isItemCancelled && isPendingOrProcessing && !isCancelled && (
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleUpdateItemStatus(item.id, 'cancelled')}
                              disabled={updating}
                              title="Cancel this item"
                            >
                              🗑️ Cancel
                            </button>
                          )}

                          {/* Show if item is cancelled (for non-admin) */}
                          {isItemCancelled && !isAdmin && (
                            <span className="cancelled-label">Cancelled</span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Order Summary Footer */}
        <div className="order-summary-footer">
          <div className="order-total-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>${parseFloat(order.total_amount).toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping:</span>
              <span>Free</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>${parseFloat(order.total_amount).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Level Actions */}
      <div className="order-actions">
        {/* Admin Actions */}
        {isAdmin && !isCancelled && (
          <div className="admin-actions">
            <h4>Order Level Actions</h4>
            <div className="action-buttons order-level-actions">
              <button
                className="btn btn-warning"
                onClick={() => handleUpdateOrderStatus('processing')}
                disabled={updating}
                title="Move order to processing"
              >
                🔄 Process Order
              </button>
              <button
                className="btn btn-info"
                onClick={() => handleUpdateOrderStatus('shipped')}
                disabled={updating}
                title="Mark order as shipped"
              >
                📦 Ship Order
              </button>
              <button
                className="btn btn-success"
                onClick={() => handleUpdateOrderStatus('delivered')}
                disabled={updating}
                title="Mark order as delivered"
              >
                ✅ Deliver Order
              </button>
              <button
                className="btn btn-danger"
                onClick={handleCancelOrder}
                disabled={updating}
                title="Cancel entire order"
              >
                🗑️ Cancel Order
              </button>
            </div>
          </div>
        )}

        {/* Admin Recover Action (only for cancelled orders) */}
        {isAdmin && isCancelled && (
          <div className="admin-actions recover-section">
            <h4>Recover Order</h4>
            <div className="action-buttons order-level-actions">
              <button
                className="btn btn-success"
                onClick={handleRecoverOrder}
                disabled={updating}
                title="Recover this order"
              >
                🔄 Recover Order
              </button>
              <p className="helper-text">This will restore the order to pending status</p>
            </div>
          </div>
        )}

        {/* User Cancel Action */}
        {!isAdmin && isPendingOrProcessing && !isCancelled && (
          <div className="user-actions">
            <h4>Cancel Order</h4>
            <div className="action-buttons order-level-actions">
              <button
                className="btn btn-danger"
                onClick={handleCancelOrder}
                disabled={updating}
              >
                🗑️ Cancel Order
              </button>
              <p className="helper-text">Only pending or processing orders can be cancelled</p>
            </div>
          </div>
        )}

        {/* Order Cancelled Message */}
        {isCancelled && (
          <div className="order-cancelled-message">
            <p>⚠️ This order has been cancelled</p>
            {isAdmin && (
              <p>You can recover it using the "Recover Order" button above</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetail;