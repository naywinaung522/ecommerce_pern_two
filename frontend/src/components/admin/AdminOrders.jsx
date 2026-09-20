// frontend/src/components/admin/AdminOrders.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../../styles/Admin.css';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/orders/all`, config);
      setOrders(res.data.orders || []);
      setLoading(false);
      setSelectedOrders([]);
      setSelectAll(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
      toast.error('Failed to fetch orders');
    }
  };

  // Handle individual order selection
  const handleSelectOrder = (orderId) => {
    setSelectedOrders(prev => {
      if (prev.includes(orderId)) {
        return prev.filter(id => id !== orderId);
      } else {
        return [...prev, orderId];
      }
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedOrders([]);
    } else {
      const allIds = orders.map(order => order.id);
      setSelectedOrders(allIds);
    }
    setSelectAll(!selectAll);
  };

  // Bulk delete selected orders
  const handleBulkDelete = async () => {
    if (selectedOrders.length === 0) {
      toast.warning('Please select at least one order');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedOrders.length} selected order(s)?`)) return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      // Process each selected order
      let successCount = 0;
      let failCount = 0;

      for (const orderId of selectedOrders) {
        try {
          await axios.put(
            `${process.env.REACT_APP_API_URL}/orders/${orderId}/delete`,
            {},
            config
          );
          successCount++;
        } catch (error) {
          failCount++;
          console.error(`Failed to delete order ${orderId}:`, error);
        }
      }

      if (successCount > 0) {
        toast.success(`✅ ${successCount} order(s) moved to recycle bin${failCount > 0 ? `, ${failCount} failed` : ''}`);
      } else {
        toast.error('Failed to delete orders');
      }
      
      fetchOrders();
    } catch (error) {
      toast.error('Bulk delete failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Bulk status update
  const handleBulkStatusUpdate = async (status) => {
    if (selectedOrders.length === 0) {
      toast.warning('Please select at least one order');
      return;
    }

    if (!window.confirm(`Are you sure you want to update ${selectedOrders.length} order(s) to "${status}"?`)) return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      let successCount = 0;
      let failCount = 0;

      for (const orderId of selectedOrders) {
        try {
          await axios.put(
            `${process.env.REACT_APP_API_URL}/orders/${orderId}/status`,
            { status },
            config
          );
          successCount++;
        } catch (error) {
          failCount++;
          console.error(`Failed to update order ${orderId}:`, error);
        }
      }

      if (successCount > 0) {
        toast.success(`✅ ${successCount} order(s) updated to ${status}${failCount > 0 ? `, ${failCount} failed` : ''}`);
      } else {
        toast.error('Failed to update orders');
      }
      
      fetchOrders();
    } catch (error) {
      toast.error('Bulk status update failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Update single order status
  const updateOrderStatus = async (orderId, status) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      await axios.put(
        `${process.env.REACT_APP_API_URL}/orders/${orderId}/status`,
        { status },
        config
      );
      toast.success(`Order ${status} successfully!`);
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update order status');
    } finally {
      setActionLoading(false);
    }
  };

  // Cancel single order
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      await axios.put(
        `${process.env.REACT_APP_API_URL}/orders/${orderId}/cancel`,
        {},
        config
      );
      toast.success('Order cancelled successfully!');
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    } finally {
      setActionLoading(false);
    }
  };

  // Recover single order
  const handleRecoverOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to recover this order?')) return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      await axios.put(
        `${process.env.REACT_APP_API_URL}/orders/${orderId}/recover`,
        {},
        config
      );
      toast.success('Order recovered successfully!');
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to recover order');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete single order
  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to move this order to recycle bin?')) return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      await axios.put(
        `${process.env.REACT_APP_API_URL}/orders/${orderId}/delete`,
        {},
        config
      );
      toast.success('Order moved to recycle bin!');
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete order');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  const selectedCount = selectedOrders.length;

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h2 className="page-title">Manage Orders</h2>
        <Link to="/recycle-bin" className="btn btn-warning">
          🗑️ Recycle Bin
        </Link>
      </div>

      {/* Bulk Actions Toolbar */}
      {orders.length > 0 && (
        <div className="bulk-actions-toolbar">
          <div className="selection-info">
            <span className="selected-count">
              {selectedCount > 0 ? `✅ ${selectedCount} order(s) selected` : 'No orders selected'}
            </span>
          </div>
          <div className="bulk-actions">
            <select
              className="bulk-status-select"
              onChange={(e) => {
                if (e.target.value) {
                  handleBulkStatusUpdate(e.target.value);
                  e.target.value = '';
                }
              }}
              disabled={actionLoading || selectedCount === 0}
            >
              <option value="">📌 Bulk Update Status</option>
              <option value="processing">🔄 Processing</option>
              <option value="shipped">📦 Shipped</option>
              <option value="delivered">✅ Delivered</option>
              <option value="cancelled">❌ Cancelled</option>
            </select>
            <button
              className="btn btn-danger"
              onClick={handleBulkDelete}
              disabled={actionLoading || selectedCount === 0}
            >
              🗑️ Bulk Delete ({selectedCount})
            </button>
          </div>
        </div>
      )}
      
      {orders.length === 0 ? (
        <div className="alert alert-info">No orders found</div>
      ) : (
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th className="checkbox-column">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    disabled={actionLoading}
                    className="select-all-checkbox"
                  />
                </th>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => {
                const isCOD = order.payment_method === 'Cash on Delivery';
                const isCancelled = order.status === 'cancelled';
                const isPending = order.status === 'pending';
                const isProcessing = order.status === 'processing';
                const isShipped = order.status === 'shipped';
                const isDelivered = order.status === 'delivered';
                const canDelete = isDelivered || isCancelled;
                const isSelected = selectedOrders.includes(order.id);

                return (
                  <tr key={order.id} className={isSelected ? 'selected-row' : ''}>
                    <td className="checkbox-column">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectOrder(order.id)}
                        disabled={actionLoading}
                        className="order-checkbox"
                      />
                    </td>
                    <td>
                      <Link to={`/order/${order.id}`} className="order-link">
                        #{order.id.substring(0, 8)}
                      </Link>
                    </td>
                    <td>{order.user_name || 'N/A'}</td>
                    <td>${parseFloat(order.total_amount).toFixed(2)}</td>
                    <td>
                      {isCOD ? (
                        <span className="payment-badge cod-badge">💵 COD</span>
                      ) : (
                        <span className="payment-badge">{order.payment_method}</span>
                      )}
                    </td>
                    <td>
                      <span className={`status-badge status-${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        {/* View Details Button */}
                        <Link to={`/order/${order.id}`} className="btn btn-info btn-sm">
                          👁️ View
                        </Link>

                        {/* Status Update Dropdown (for non-cancelled orders) */}
                        {!isCancelled && (
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className="status-select"
                            disabled={actionLoading}
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                          </select>
                        )}

                        {/* Cancel Button (for pending/processing orders) */}
                        {!isCancelled && (isPending || isProcessing) && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleCancelOrder(order.id)}
                            disabled={actionLoading}
                          >
                            🗑️ Cancel
                          </button>
                        )}

                        {/* Recover Button (for cancelled orders only) */}
                        {isCancelled && (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleRecoverOrder(order.id)}
                            disabled={actionLoading}
                          >
                            🔄 Recover
                          </button>
                        )}

                        {/* Delete Button (for delivered or cancelled orders) */}
                        {canDelete ? (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteOrder(order.id)}
                            disabled={actionLoading}
                          >
                            🗑️ Delete
                          </button>
                        ) : (
                          <span className="not-deletable" title="Only delivered or cancelled orders can be deleted">
                            🔒
                          </span>
                        )}

                        {/* Delivered Badge */}
                        {isDelivered && (
                          <span className="delivered-label">✓ Done</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;