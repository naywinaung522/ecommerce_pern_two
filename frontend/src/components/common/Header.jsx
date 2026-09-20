// frontend/src/components/common/Header.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';
import '../../styles/Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const { getTotalItems } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      toast.success('Logged out successfully!');
      navigate('/login');
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <Link to="/" className="logo">
            <h1>🛒 E-Commerce</h1>
          </Link>
        </div>

        <button className="mobile-menu-btn" onClick={toggleMenu}>
          ☰
        </button>

        <nav className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/products" className="nav-link">Products</Link>
          <Link to="/about" className="nav-link">About</Link>
          
          {user && (
            <>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <Link to="/profile" className="nav-link">Profile</Link>
              <Link to="/recycle-bin" className="nav-link">🗑️ Recycle Bin</Link>
              {user.role === 'admin' && (
                <>
                  <Link to="/admin" className="nav-link">Admin</Link>
                  <Link to="/admin/products" className="nav-link">Manage Products</Link>
                  <Link to="/admin/orders" className="nav-link">Manage Orders</Link>
                  <Link to="/admin/users" className="nav-link">Manage Users</Link>
                </>
              )}
            </>
          )}
        </nav>

        <div className="header-right">
          <Link to="/cart" className="cart-link">
            🛒 Cart
            {getTotalItems() > 0 && (
              <span className="cart-badge">{getTotalItems()}</span>
            )}
          </Link>

          {user ? (
            <div className="user-menu">
              <span className="user-name">👤 {user.name}</span>
              <button onClick={handleLogout} className="btn btn-danger logout-btn">
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-primary">Login</Link>
              <Link to="/register" className="btn btn-success">Register</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;