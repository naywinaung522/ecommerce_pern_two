// frontend/src/components/products/ProductCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';
import '../../styles/ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product, 1);
    toast.success(`${product.name} added to cart!`);
  };

  // Convert price to number safely
  const price = parseFloat(product.price) || 0;
  const stock = parseInt(product.stock) || 0;

  // Get image URL with correct path
  const getImageUrl = () => {
    if (!product.image_url) {
      return null;
    }
    // If it's already a full URL, use it as is
    if (product.image_url.startsWith('http://') || product.image_url.startsWith('https://')) {
      return product.image_url;
    }
    // If it starts with /uploads, prepend the backend URL
    if (product.image_url.startsWith('/uploads')) {
      return `http://localhost:5000${product.image_url}`;
    }
    // Otherwise, assume it's a relative path
    return `http://localhost:5000${product.image_url.startsWith('/') ? '' : '/'}${product.image_url}`;
  };

  const imageUrl = getImageUrl();

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`} className="product-link">
        <div className="product-image">
          {imageUrl ? (
            <img src={imageUrl} alt={product.name} />
          ) : (
            <div className="product-placeholder">📦</div>
          )}
        </div>
        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          <p className="product-category">{product.category_name || 'Uncategorized'}</p>
          <p className="product-price">${price.toFixed(2)}</p>
          <p className="product-stock">
            {stock > 0 ? `In Stock (${stock})` : 'Out of Stock'}
          </p>
        </div>
      </Link>
      <button
        className="btn btn-success add-to-cart-btn"
        onClick={handleAddToCart}
        disabled={stock === 0}
      >
        Add to Cart
      </button>
    </div>
  );
};

export default ProductCard;