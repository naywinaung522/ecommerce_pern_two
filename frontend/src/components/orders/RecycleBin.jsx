// frontend/src/components/orders/RecycleBin.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import '../../styles/RecycleBin.css';

const RecycleBin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchRecycleBin();
  }, []);

  const fetchRecycleBin = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/orders/recycle-bin`,
        config
      );
      setOrders(res.data.orders || []);
      setCount(res.data.count || 0);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching recycle bin:', error);
      toast.error('Failed to load recycle bin');
      setLoading(false);
    }
  };

  const handleRestore = async (orderId) => {
    if (!window.confirm('Are you sure you want to restore this order?')) return;

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
        `${process.env.REACT_APP_API_URL}/orders/${orderId}/restore`,
        {},
        config
      );
      toast.success('Order restored successfully!');
      fetchRecycleBin();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to restore order');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePermanentDelete = async (orderId) => {
    if (!window.confirm('Are you sure you want to permanently delete this order? This action cannot be undone!')) return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/orders/${orderId}/permanent`,
        config
      );
      toast.success('Order permanently deleted!');
      fetchRecycleBin();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete order');
    } finally {
      setActionLoading(false);
    }
  };

  const isAdmin = user?.role === 'admin';

  if (loading) {
    return <div className="loading">Loading recycle bin...</div>;
  }

  return (
    <div className="recycle-bin-container">
      <div className="recycle-bin-header">
        <h2 className="page-title">🗑️ Recycle Bin</h2>
        <div className="recycle-stats">
          <span className="badge">{count} orders</span>
          <Link to="/dashboard" className="btn btn-outline back-btn">
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="empty-recycle">
          <div className="empty-icon">🗑️</div>
          <h3>Recycle Bin is Empty</h3>
          <p>No orders have been deleted yet.</p>
          <Link to="/dashboard" className="btn btn-primary">
            Go to Dashboard
          </Link>
        </div>
      ) : (
        <div className="recycle-items">
          {orders.map(order => {
            const daysAgo = Math.floor((new Date() - new Date(order.deleted_at)) / (1000 * 60 * 60 * 24));
            
            return (
              <div key={order.id} className="recycle-item">
                <div className="item-header">
                  <div className="order-info">
                    <span className="order-id">#{order.id.substring(0, 8)}</span>
                    <span className="order-date">
                      Deleted {daysAgo} day{daysAgo !== 1 ? 's' : ''} ago
                    </span>
                    <span className={`status-badge status-${order.status}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="order-total">
                    ${parseFloat(order.total_amount).toFixed(2)}
                  </div>
                </div>

                <div className="item-details">
                  <div className="customer-info">
                    <span>👤 {order.user_name || 'N/A'}</span>
                    <span>📧 {order.user_email || 'N/A'}</span>
                  </div>
                  <div className="item-actions">
                    <Link to={`/order/${order.id}`} className="btn btn-info btn-sm">
                      👁️ View
                    </Link>
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleRestore(order.id)}
                      disabled={actionLoading}
                    >
                      🔄 Restore
                    </button>
                    {isAdmin && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handlePermanentDelete(order.id)}
                        disabled={actionLoading}
                      >
                        🗑️ Delete Permanently
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecycleBin;