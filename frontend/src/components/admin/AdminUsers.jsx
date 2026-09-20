// frontend/src/components/admin/AdminUsers.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../../styles/Admin.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user'
  });
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Get current user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
    fetchUsers();
    fetchStats();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/users`, config);
      setUsers(res.data.users);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
      toast.error(error.response?.data?.message || 'Failed to fetch users');
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/users/stats`, config);
      setStats(res.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role
    });
    setShowEditModal(true);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      // Update profile
      await axios.put(
        `${process.env.REACT_APP_API_URL}/users/profile/${editingUser.id}`,
        {
          name: formData.name,
          email: formData.email
        },
        config
      );
      
      // Update role if changed
      if (formData.role !== editingUser.role) {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/users/role/${editingUser.id}`,
          { role: formData.role },
          config
        );
      }
      
      toast.success('User updated successfully!');
      setShowEditModal(false);
      fetchUsers();
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update user');
    }
  };

  const handleUpdateRole = async (userId, role) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      await axios.put(
        `${process.env.REACT_APP_API_URL}/users/role/${userId}`,
        { role },
        config
      );
      toast.success('User role updated!');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      await axios.delete(`${process.env.REACT_APP_API_URL}/users/${userId}`, config);
      toast.success('User deleted successfully!');
      fetchUsers();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  return (
    <div className="admin-dashboard">
      <h2 className="page-title">Manage Users</h2>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>Total Users</h3>
            <p className="stat-number">{stats.total_users || 0}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👑</div>
          <div className="stat-info">
            <h3>Admins</h3>
            <p className="stat-number">{stats.admin_count || 0}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👤</div>
          <div className="stat-info">
            <h3>Regular Users</h3>
            <p className="stat-number">{stats.user_count || 0}</p>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => {
              const isCurrentUser = currentUser && user.id === currentUser.id;
              return (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge ${user.role === 'admin' ? 'admin-badge' : 'user-badge'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td>
                    <button 
                      className="btn btn-warning" 
                      onClick={() => handleEdit(user)}
                      style={{ marginRight: '5px' }}
                    >
                      Edit
                    </button>
                    <select
                      value={user.role}
                      onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                      className="role-select"
                      disabled={isCurrentUser}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button 
                      className="btn btn-danger" 
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={isCurrentUser}
                      style={{ marginLeft: '5px' }}
                    >
                      Delete
                    </button>
                    {isCurrentUser && (
                      <span style={{ marginLeft: '5px', color: '#667eea', fontSize: '12px' }}>
                        (You)
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edit User</h3>
            <form onSubmit={handleUpdateUser}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  disabled={editingUser && editingUser.id === currentUser?.id}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                {editingUser && editingUser.id === currentUser?.id && (
                  <small>You cannot change your own role</small>
                )}
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">Update</button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;