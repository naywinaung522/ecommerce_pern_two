// frontend/src/components/products/ProductDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';
import '../../styles/ProductDetails.css';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/products/${id}`);
      // Ensure price is a number
      const productData = {
        ...res.data.product,
        price: parseFloat(res.data.product.price) || 0,
        stock: parseInt(res.data.product.stock) || 0
      };
      setProduct(productData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching product:', error);
      setLoading(false);
      toast.error('Product not found');
    }
  };

  // Get image URL with correct path
  const getImageUrl = () => {
    if (!product?.image_url) {
      return null;
    }
    if (product.image_url.startsWith('http://') || product.image_url.startsWith('https://')) {
      return product.image_url;
    }
    if (product.image_url.startsWith('/uploads')) {
      return `http://localhost:5000${product.image_url}`;
    }
    return `http://localhost:5000/${product.image_url}`;
  };

  const handleAddToCart = () => {
    if (product.stock === 0) {
      toast.error('Product is out of stock');
      return;
    }
    addToCart(product, quantity);
    toast.success(`${product.name} added to cart!`);
  };

  if (loading) {
    return <div className="loading">Loading product details...</div>;
  }

  if (!product) {
    return <div className="alert alert-danger">Product not found</div>;
  }

  return (
    <div className="product-details-container">
      <Link to="/products" className="btn btn-outline back-link">
        ← Back to Products
      </Link>

      <div className="product-details">
        <div className="product-details-image">
          {getImageUrl() ? (
            <img src={getImageUrl()} alt={product.name} />
          ) : (
            <div className="product-placeholder-large">📦</div>
          )}
        </div>

        <div className="product-details-info">
          <h2>{product.name}</h2>
          {product.category_name && (
            <span className="product-category-badge">{product.category_name}</span>
          )}
          
          <div className="product-description">
            {product.description || 'No description available'}
          </div>

          <div className="product-price-large">
            ${product.price.toFixed(2)}
          </div>

          <div className={`product-stock-info ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
            {product.stock > 0 ? `✅ In Stock (${product.stock} available)` : '❌ Out of Stock'}
          </div>

          {product.stock > 0 && (
            <div className="product-actions">
              <div className="quantity-selector">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}>+</button>
              </div>
              <button
                className="btn btn-success add-to-cart-large"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                Add to Cart
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;