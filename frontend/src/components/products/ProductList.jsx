// frontend/src/components/products/ProductList.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from './ProductCard';
import '../../styles/ProductList.css';

const ProductList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Get filters from URL
  const searchTerm = searchParams.get('search') || '';
  const categoryFilter = searchParams.get('category') || '';
  const currentPage = parseInt(searchParams.get('page')) || 1;

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [currentPage, searchTerm, categoryFilter]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/products?page=${currentPage}&limit=12&search=${searchTerm}&category=${categoryFilter}`
      );
      
      setProducts(res.data.products);
      setPagination(res.data.pagination);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/categories`);
      setCategories(res.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (categoryFilter) params.set('category', categoryFilter);
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleCategoryChange = (e) => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (e.target.value) params.set('category', e.target.value);
    params.set('page', '1');
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
    // Scroll to top when changing page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchInputChange = (e) => {
    const params = new URLSearchParams(searchParams);
    if (e.target.value) {
      params.set('search', e.target.value);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const totalPages = pagination.totalPages;
    const current = pagination.currentPage;
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (current > 3) pages.push('...');
      for (let i = Math.max(2, current - 1); i <= Math.min(totalPages - 1, current + 1); i++) {
        pages.push(i);
      }
      if (current < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div className="product-list-container">
      <h2 className="page-title">All Products</h2>
      
      <div className="filters-section">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={handleSearchInputChange}
            className="search-input"
          />
          <button onClick={handleSearch} className="btn btn-primary search-btn">
            Search
          </button>
        </div>
        
        <select
          value={categoryFilter}
          onChange={handleCategoryChange}
          className="category-filter"
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Show results info */}
      <div className="results-info">
        <p>
          Showing {products.length} of {pagination.totalItems} products
          {searchTerm && ` for "${searchTerm}"`}
          {categoryFilter && ` in ${categories.find(c => c.id === categoryFilter)?.name || ''}`}
        </p>
      </div>

      {products.length === 0 ? (
        <div className="no-products">
          <p>No products found</p>
          <button 
            className="btn btn-primary"
            onClick={() => setSearchParams({})}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          <div className="products-grid">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage}
              >
                ← Previous
              </button>

              <div className="page-numbers">
                {getPageNumbers().map((page, index) => (
                  <button
                    key={index}
                    className={`page-btn ${page === pagination.currentPage ? 'active' : ''}`}
                    onClick={() => typeof page === 'number' && handlePageChange(page)}
                    disabled={page === '...'}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                className="page-btn"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductList;