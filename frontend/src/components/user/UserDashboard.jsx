// frontend/src/components/user/UserDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import '../../styles/Dashboard.css';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/orders/my-orders`, config);
      setOrders(res.data.orders || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      <h2 className="page-title">My Dashboard</h2>

      <div className="dashboard-grid">
        {/* Sidebar */}
        <div className="dashboard-sidebar">
          <div className="user-profile-card">
            <div className="user-avatar">👤</div>
            <h3>{user?.name || 'User'}</h3>
            <p>{user?.email || ''}</p>
            <p>
              <span className={`status-badge status-${user?.role || 'user'}`}>
                {user?.role || 'user'}
              </span>
            </p>
          </div>

          <nav className="dashboard-nav">
            <Link to="/dashboard" className="dashboard-nav-link active">
              📋 My Orders
            </Link>
            <Link to="/profile" className="dashboard-nav-link">
              👤 Profile Settings
            </Link>
            <button onClick={handleLogout} className="dashboard-nav-link logout-btn">
              🚪 Logout
            </button>
            // Add this in the sidebar navigation
            <Link to="/recycle-bin" className="dashboard-nav-link">
              🗑️ Recycle Bin
            </Link>
          </nav>
        </div>

        {/* Main Content */}
        <div className="dashboard-content">
          <div className="dashboard-header">
            <h2>My Orders</h2>
            <Link to="/profile" className="btn btn-primary profile-btn">
              👤 Edit Profile
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="no-orders">
              <p>You haven't placed any orders yet.</p>
              <p>Start shopping to see your orders here!</p>
              <Link to="/products" className="btn btn-primary">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map(order => (
                <div key={order.id} className="order-card">


                  <div className="order-header">
                    <span className="order-id">
                      <Link to={`/order/${order.id}`} className="order-link">
                        Order #{order.id.substring(0, 8)}
                      </Link>
                    </span>



                    <span className="order-date">
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                    <span className={`order-status-badge status-${order.status}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="order-details">
                    <div className="order-items">
                      {order.items && order.items.map((item, index) => (
                        <div key={index} className="order-item">
                          <span>{item.product_name || 'Product'} × {item.quantity}</span>
                          <span>${parseFloat(item.price).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="order-total">
                      <strong>Total: ${parseFloat(order.total_amount).toFixed(2)}</strong>
                    </div>
                  </div>


                  <div className="order-actions">
                    <Link to={`/order/${order.id}`} className="btn btn-primary btn-sm">
                      View Details
                    </Link>
                  </div>

                  // In the order card, add this button
                  <div className="order-actions">
                    <Link to={`/order/${order.id}`} className="btn btn-primary btn-sm">
                      View Details
                    </Link>
                  </div>
                </div>




              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;