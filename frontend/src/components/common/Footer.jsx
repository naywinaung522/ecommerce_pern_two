// frontend/src/components/common/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>About Us</h3>
          <p>
            Welcome to our e-commerce store! We offer the best products at competitive prices.
          </p>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/products">Products</Link></li>
            <li><Link to="/cart">Cart</Link></li>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/about">About</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Legal</h3>
          <ul>
            <li><Link to="/about">Terms & Conditions</Link></li>
            <li><Link to="/about">Privacy Policy</Link></li>
            <li><Link to="/about">About Me</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Contact Info</h3>
          <p>📧 info@ecommerce.com</p>
          <p>📞 +1 (555) 123-4567</p>
          <p>📍 123 Commerce St, City</p>
        </div>

        <div className="footer-section">
          <h3>Follow Us</h3>
          <div className="social-links">
            <a href="#" target="_blank" rel="noopener noreferrer">📘 Facebook</a>
            <a href="#" target="_blank" rel="noopener noreferrer">🐦 Twitter</a>
            <a href="#" target="_blank" rel="noopener noreferrer">📸 Instagram</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} E-Commerce Store. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;