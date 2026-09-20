// frontend/src/components/layout/Home.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../products/ProductCard';
import '../../styles/Home.css';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      // Get first 4 products as featured
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/products?page=1&limit=4`);
      const products = res.data.products.map(product => ({
        ...product,
        price: parseFloat(product.price) || 0,
        stock: parseInt(product.stock) || 0
      }));
      setFeaturedProducts(products);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  return (
    <div className="home">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Welcome to Our Store</h1>
          <p>Discover amazing products at unbeatable prices</p>
          <Link to="/products" className="btn btn-primary hero-btn">
            Shop Now
          </Link>
        </div>
      </section>

      <section className="features-section">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🚚</div>
            <h3>Free Shipping</h3>
            <p>On orders over $50</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔄</div>
            <h3>Easy Returns</h3>
            <p>30-day return policy</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure Payment</h3>
            <p>100% secure transactions</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⭐</div>
            <h3>Quality Products</h3>
            <p>Best quality guaranteed</p>
          </div>
        </div>
      </section>

      <section className="featured-products">
        <h2 className="section-title">Featured Products</h2>
        {loading ? (
          <div className="loading">Loading products...</div>
        ) : (
          <div className="products-grid">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        <div className="view-all">
          <Link to="/products" className="btn btn-primary">View All Products</Link>
        </div>
      </section>
    </div>
  );
};

export default Home;