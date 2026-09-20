// frontend/src/components/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../../styles/Admin.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const productsRes = await axios.get(`${process.env.REACT_APP_API_URL}/products`);
      const ordersRes = await axios.get(`${process.env.REACT_APP_API_URL}/orders/all`);
      
      const orders = ordersRes.data.orders || [];
      const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
      
      setStats({
        totalUsers: 10,
        totalProducts: productsRes.data.products.length,
        totalOrders: orders.length,
        totalRevenue: totalRevenue
      });
      
      setRecentOrders(orders.slice(0, 5));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <h2 className="page-title">Admin Dashboard</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>Total Users</h3>
            <p className="stat-number">{stats.totalUsers}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <h3>Total Products</h3>
            <p className="stat-number">{stats.totalProducts}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <h3>Total Orders</h3>
            <p className="stat-number">{stats.totalOrders}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>Total Revenue</h3>
            <p className="stat-number">${stats.totalRevenue.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="admin-actions">
        <Link to="/admin/products" className="btn btn-primary">
          Manage Products
        </Link>
        <Link to="/admin/orders" className="btn btn-success">
          Manage Orders
        </Link>
        <Link to="/admin/users" className="btn btn-info">
          Manage Users
        </Link>
      </div>

      <div className="recent-orders">
        <h3>Recent Orders</h3>
        {recentOrders.length === 0 ? (
          <p>No orders yet</p>
        ) : (
          <div className="orders-table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id}>
                    <td>#{order.id.substring(0, 8)}</td>
                    <td>{order.user_name || 'N/A'}</td>
                    <td>${parseFloat(order.total_amount).toFixed(2)}</td>
                    <td>
                      <span className={`status-badge status-${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;