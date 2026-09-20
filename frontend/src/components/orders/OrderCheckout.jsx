// frontend/src/components/orders/OrderCheckout.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import '../../styles/Checkout.css';

const OrderCheckout = () => {
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    shipping_address: '',
    phone: '',
    payment_method: 'credit_card',
    cod_instructions: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Format phone number as user types
  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    
    // Format as (XXX) XXX-XXXX
    if (value.length <= 3) {
      value = value;
    } else if (value.length <= 6) {
      value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
    } else {
      value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
    }
    
    setFormData({
      ...formData,
      phone: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!formData.shipping_address) {
      toast.error('Please enter shipping address');
      return;
    }

    if (!formData.phone || formData.phone.replace(/\D/g, '').length < 10) {
      toast.error('Please enter a valid phone number (10 digits)');
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        items: cartItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
        shipping_address: formData.shipping_address,
        phone: formData.phone,
        payment_method: formData.payment_method,
        cod_instructions: formData.payment_method === 'cod' ? formData.cod_instructions : undefined
      };

      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/orders`,
        orderData
      );

      clearCart();
      
      if (formData.payment_method === 'cod') {
        toast.success('Order placed successfully! Pay on delivery.');
      } else {
        toast.success('Order placed successfully!');
      }
      
      navigate('/order-success', { 
        state: { 
          order: res.data.order,
          payment_method: formData.payment_method 
        } 
      });
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout-container">
        <div className="alert alert-warning">
          Your cart is empty. <Link to="/products">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <h2 className="page-title">Checkout</h2>

      <div className="checkout-content">
        <div className="checkout-summary">
          <h3>Order Summary</h3>
          {cartItems.map(item => (
            <div key={item.id} className="checkout-item">
              <span>{item.name} × {item.quantity}</span>
              <span>${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="checkout-total">
            <span>Total</span>
            <span>${getTotalPrice().toFixed(2)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="checkout-form">
          <div className="form-group">
            <label>Shipping Address</label>
            <textarea
              name="shipping_address"
              value={formData.shipping_address}
              onChange={handleChange}
              required
              placeholder="Enter your shipping address"
            />
          </div>

          <div className="form-group">
            <label>Phone Number <span className="required">*</span></label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handlePhoneChange}
              required
              placeholder="(555) 123-4567"
              maxLength="16"
            />
            <small className="helper-text">We'll use this to contact you about your delivery</small>
          </div>

          <div className="form-group">
            <label>Payment Method</label>
            <select
              name="payment_method"
              value={formData.payment_method}
              onChange={handleChange}
              className="payment-select"
            >
              <option value="credit_card">💳 Credit Card</option>
              <option value="paypal">💰 PayPal</option>
              <option value="bank_transfer">🏦 Bank Transfer</option>
              <option value="cod">💵 Cash on Delivery</option>
            </select>
          </div>

          {/* COD Instructions - only shown when COD is selected */}
          {formData.payment_method === 'cod' && (
            <div className="form-group cod-instructions">
              <label>Delivery Instructions (Optional)</label>
              <textarea
                name="cod_instructions"
                value={formData.cod_instructions}
                onChange={handleChange}
                placeholder="Any special instructions for delivery? (e.g., call before delivery, exact change, etc.)"
                rows="3"
              />
              <div className="cod-info">
                <p>💡 <strong>Cash on Delivery Information:</strong></p>
                <ul>
                  <li>Pay in cash when your order arrives</li>
                  <li>Please have exact change ready</li>
                  <li>Delivery person will contact you at {formData.phone || 'your provided number'}</li>
                </ul>
              </div>
            </div>
          )}

          <button
            type="submit"
            className={`btn btn-success place-order-btn ${formData.payment_method === 'cod' ? 'cod-btn' : ''}`}
            disabled={loading}
          >
            {loading ? 'Placing Order...' : 
              formData.payment_method === 'cod' ? 
                `Place Order - Pay on Delivery ($${getTotalPrice().toFixed(2)})` : 
                `Place Order - $${getTotalPrice().toFixed(2)}`
            }
          </button>
        </form>
      </div>
    </div>
  );
};

export default OrderCheckout;