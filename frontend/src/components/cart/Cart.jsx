// frontend/src/components/cart/Cart.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import '../../styles/Cart.css';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.warning('Please login to checkout');
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty">
        <div className="empty-cart-icon">🛒</div>
        <h2>Your cart is empty</h2>
        <p>Start shopping to add items to your cart</p>
        <Link to="/products" className="btn btn-primary">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h2 className="page-title">Shopping Cart</h2>
      
      <div className="cart-content">
        <div className="cart-items">
          {cartItems.map(item => {
            // Ensure price is a number
            const price = parseFloat(item.price) || 0;
            const quantity = parseInt(item.quantity) || 0;
            
            return (
              <div key={item.id} className="cart-item">
                <div className="cart-item-image">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} />
                  ) : (
                    <div className="item-placeholder">📦</div>
                  )}
                </div>
                
                <div className="cart-item-details">
                  <Link to={`/products/${item.id}`} className="cart-item-name">
                    {item.name}
                  </Link>
                  <p className="cart-item-price">${price.toFixed(2)}</p>
                </div>
                
                <div className="cart-item-quantity">
                  <button
                    onClick={() => updateQuantity(item.id, quantity - 1)}
                    className="qty-btn"
                  >
                    -
                  </button>
                  <span className="qty-value">{quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, quantity + 1)}
                    className="qty-btn"
                  >
                    +
                  </button>
                </div>
                
                <div className="cart-item-total">
                  ${(price * quantity).toFixed(2)}
                </div>
                
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="btn btn-danger remove-btn"
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
        
        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>${getTotalPrice().toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>${getTotalPrice().toFixed(2)}</span>
          </div>
          <button className="btn btn-success checkout-btn" onClick={handleCheckout}>
            Proceed to Checkout
          </button>
          <Link to="/products" className="btn btn-outline continue-shopping">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;