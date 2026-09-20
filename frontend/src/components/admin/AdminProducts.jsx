// frontend/src/components/admin/AdminProducts.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../../styles/Admin.css';

const AdminProducts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    image: null
  });
  const [editingId, setEditingId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Get filters from URL
  const currentPage = parseInt(searchParams.get('page')) || 1;
  const searchTerm = searchParams.get('search') || '';
  const categoryFilter = searchParams.get('category') || '';

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [currentPage, searchTerm, categoryFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/products?page=${currentPage}&limit=10&search=${searchTerm}&category=${categoryFilter}`,
        config
      );
      setProducts(res.data.products);
      setPagination(res.data.pagination);
      setSelectedProducts([]);
      setSelectAll(false);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
      toast.error('Failed to fetch products');
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

  // Handle page change
  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (categoryFilter) params.set('category', categoryFilter);
    params.set('page', '1');
    setSearchParams(params);
  };

  // Handle category filter
  const handleCategoryFilter = (e) => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (e.target.value) params.set('category', e.target.value);
    params.set('page', '1');
    setSearchParams(params);
  };

  // Handle search input change
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

  // Handle individual product selection
  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedProducts([]);
    } else {
      const allIds = products.map(product => product.id);
      setSelectedProducts(allIds);
    }
    setSelectAll(!selectAll);
  };

  // Bulk delete selected products
  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) {
      toast.warning('Please select at least one product');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedProducts.length} selected product(s)?`)) return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      let successCount = 0;
      let failCount = 0;

      for (const productId of selectedProducts) {
        try {
          await axios.delete(
            `${process.env.REACT_APP_API_URL}/products/${productId}`,
            config
          );
          successCount++;
        } catch (error) {
          failCount++;
          console.error(`Failed to delete product ${productId}:`, error);
        }
      }

      if (successCount > 0) {
        toast.success(`✅ ${successCount} product(s) deleted successfully${failCount > 0 ? `, ${failCount} failed` : ''}`);
      } else {
        toast.error('Failed to delete products');
      }
      
      fetchProducts();
    } catch (error) {
      toast.error('Bulk delete failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Bulk category update
  const handleBulkCategoryUpdate = async (categoryId) => {
    if (selectedProducts.length === 0) {
      toast.warning('Please select at least one product');
      return;
    }

    if (!window.confirm(`Are you sure you want to update ${selectedProducts.length} product(s) to this category?`)) return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      let successCount = 0;
      let failCount = 0;

      for (const productId of selectedProducts) {
        try {
          await axios.put(
            `${process.env.REACT_APP_API_URL}/products/${productId}`,
            { category_id: categoryId },
            config
          );
          successCount++;
        } catch (error) {
          failCount++;
          console.error(`Failed to update product ${productId}:`, error);
        }
      }

      if (successCount > 0) {
        toast.success(`✅ ${successCount} product(s) category updated${failCount > 0 ? `, ${failCount} failed` : ''}`);
      } else {
        toast.error('Failed to update products');
      }
      
      fetchProducts();
    } catch (error) {
      toast.error('Bulk category update failed');
    } finally {
      setActionLoading(false);
    }
  };

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(compressedFile);
          }, 'image/jpeg', 0.8);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleChange = async (e) => {
    if (e.target.name === 'image') {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 10 * 1024 * 1024) {
          toast.error('File is too large. Please select an image under 10MB.');
          return;
        }
        
        try {
          const compressedFile = await compressImage(file);
          setFormData({
            ...formData,
            image: compressedFile
          });
          
          const reader = new FileReader();
          reader.onloadend = () => {
            setImagePreview(reader.result);
          };
          reader.readAsDataURL(compressedFile);
        } catch (error) {
          toast.error('Failed to compress image');
        }
      } else {
        setImagePreview(null);
        setFormData({
          ...formData,
          image: null
        });
      }
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    };

    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('description', formData.description);
    submitData.append('price', formData.price);
    submitData.append('stock', formData.stock);
    submitData.append('category_id', formData.category_id);
    if (formData.image) {
      submitData.append('image', formData.image);
    }

    try {
      if (editingId) {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/products/${editingId}`,
          submitData,
          config
        );
        toast.success('Product updated successfully!');
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/products`,
          submitData,
          config
        );
        toast.success('Product created successfully!');
      }
      
      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        category_id: '',
        image: null
      });
      setImagePreview(null);
      setEditingId(null);
      setShowForm(false);
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
      category_id: product.category_id || '',
      image: null
    });
    setImagePreview(product.image_url ? `http://localhost:5000${product.image_url}` : null);
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };
        await axios.delete(`${process.env.REACT_APP_API_URL}/products/${id}`, config);
        toast.success('Product deleted successfully!');
        fetchProducts();
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
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

  const selectedCount = selectedProducts.length;

  return (
    <div className="admin-dashboard">
      <h2 className="page-title">Manage Products</h2>
      
      {/* Search and Filter */}
      <div className="admin-filters">
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
          onChange={handleCategoryFilter}
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

      <div className="admin-header">
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add New Product'}
        </button>
        
        {/* Results count */}
        <div className="results-info">
          <span>Showing {products.length} of {pagination.totalItems} products</span>
        </div>
        
        {/* Bulk Actions Toolbar */}
        {products.length > 0 && (
          <div className="bulk-actions-toolbar">
            <div className="selection-info">
              <span className="selected-count">
                {selectedCount > 0 ? `✅ ${selectedCount} product(s) selected` : 'No products selected'}
              </span>
            </div>
            <div className="bulk-actions">
              <select
                className="bulk-status-select"
                onChange={(e) => {
                  if (e.target.value) {
                    handleBulkCategoryUpdate(e.target.value);
                    e.target.value = '';
                  }
                }}
                disabled={actionLoading || selectedCount === 0}
              >
                <option value="">📌 Bulk Update Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <button
                className="btn btn-danger"
                onClick={handleBulkDelete}
                disabled={actionLoading || selectedCount === 0}
              >
                🗑️ Bulk Delete ({selectedCount})
              </button>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <div className="product-form">
          <h3>{editingId ? 'Edit Product' : 'Add New Product'}</h3>
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="form-group">
              <label>Product Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Price ($)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  step="0.01"
                  required
                />
              </div>
              <div className="form-group">
                <label>Stock</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Category</label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Product Image</label>
              <input
                type="file"
                name="image"
                onChange={handleChange}
                accept="image/*"
              />
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" style={{ maxWidth: '200px', marginTop: '10px' }} />
                  <p style={{ textAlign: 'center', marginTop: '5px', fontSize: '12px', color: '#888' }}>Current image preview</p>
                </div>
              )}
            </div>
            
            <button type="submit" className="btn btn-success">
              {editingId ? 'Update' : 'Create'} Product
            </button>
          </form>
        </div>
      )}

      <div className="products-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th className="checkbox-column">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  disabled={actionLoading}
                  className="select-all-checkbox"
                />
              </th>
              <th>Image</th>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => {
              const isSelected = selectedProducts.includes(product.id);
              return (
                <tr key={product.id} className={isSelected ? 'selected-row' : ''}>
                  <td className="checkbox-column">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectProduct(product.id)}
                      disabled={actionLoading}
                      className="product-checkbox"
                    />
                  </td>
                  <td>
                    {product.image_url ? (
                      <img 
                        src={`http://localhost:5000${product.image_url}`} 
                        alt={product.name}
                        style={{ 
                          width: '50px', 
                          height: '50px', 
                          objectFit: 'cover', 
                          borderRadius: '5px' 
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iMTUiIHk9IjMwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM5OTkiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                        }}
                      />
                    ) : (
                      <span style={{ color: '#999', fontSize: '12px' }}>No image</span>
                    )}
                  </td>
                  <td>{product.name}</td>
                  <td>${parseFloat(product.price).toFixed(2)}</td>
                  <td>{product.stock}</td>
                  <td>{product.category_name || 'N/A'}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn-warning btn-sm" onClick={() => handleEdit(product)}>
                        ✏️ Edit
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(product.id)}>
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

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
      </div>
    </div>
  );
};

export default AdminProducts;