// frontend/src/components/orders/OrderSuccess.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../styles/OrderSuccess.css';

const OrderSuccess = () => {
  const location = useLocation();
  const order = location.state?.order;
  const payment_method = location.state?.payment_method;

  const isCOD = payment_method === 'cod' || order?.payment_method === 'Cash on Delivery';

  return (
    <div className="order-success-container">
      <div className="success-icon">✅</div>
      <h2>Order Placed Successfully!</h2>
      
      {isCOD ? (
        <div className="cod-success-message">
          <p className="success-message">
            Thank you for your order! You will pay when your order arrives.
          </p>
          <div className="cod-delivery-info">
            <p>📦 <strong>Cash on Delivery</strong></p>
            <p>Please have the exact amount ready for the delivery person.</p>
            {order?.phone && (
              <p>📞 We'll contact you at: <strong>{order.phone}</strong></p>
            )}
          </div>
        </div>
      ) : (
        <p className="success-message">
          Thank you for your order. We'll send you a confirmation email shortly.
        </p>
      )}

      {order && (
        <div className="order-details-summary">
          <h3>Order Details</h3>
          <div className="detail-row">
            <span className="detail-label">Order ID</span>
            <span className="detail-value">#{order.id.substring(0, 8)}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Total Amount</span>
            <span className="detail-value">${parseFloat(order.total_amount).toFixed(2)}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Payment Method</span>
            <span className="detail-value">
              {isCOD ? '💵 Cash on Delivery' : order.payment_method}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Phone</span>
            <span className="detail-value">{order.phone || 'N/A'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Status</span>
            <span className="detail-value">
              <span className={`order-status-badge status-${order.status}`}>
                {order.status}
              </span>
            </span>
          </div>
          {isCOD && (
            <div className="detail-row cod-note">
              <span className="detail-label">📝 Note</span>
              <span className="detail-value">Pay cash upon delivery</span>
            </div>
          )}
        </div>
      )}

      <div className="success-actions">
        <Link to="/" className="btn btn-primary">
          Continue Shopping
        </Link>
        <Link to="/dashboard" className="btn btn-outline">
          View My Orders
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;