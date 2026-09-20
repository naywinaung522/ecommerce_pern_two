// backend/src/controllers/productController.js
const Product = require('../models/Product');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

// Get products with pagination
exports.getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const categoryId = req.query.category || '';

    let query = `
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;

    if (search) {
      query += ` AND (p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (categoryId) {
      query += ` AND p.category_id = $${paramCount}`;
      params.push(categoryId);
      paramCount++;
    }

    // Get total count for pagination
    const countQuery = query.replace(
      'SELECT p.*, c.name as category_name',
      'SELECT COUNT(*) as total'
    );
    
    const countResult = await pool.query(countQuery, params);
    const totalItems = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalItems / limit);

    // Add pagination
    query += ` ORDER BY p.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    
    const products = result.rows.map(row => ({
      ...row,
      price: parseFloat(row.price),
      stock: parseInt(row.stock)
    }));

    res.json({
      success: true,
      products,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalItems: totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Server error while fetching products' 
    });
  }
};

// Create product
exports.createProduct = async (req, res) => {
  try {
    // Check for multer errors
    if (req.fileValidationError) {
      return res.status(400).json({ 
        success: false, 
        message: req.fileValidationError 
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // If file was uploaded but validation failed, delete the file
      if (req.file) {
        const filePath = path.join(__dirname, '..', '..', 'uploads/products', req.file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      return res.status(400).json({ errors: errors.array() });
    }

    // If file was uploaded, use the file path
    let image_url = req.body.image_url;
    if (req.file) {
      image_url = `/uploads/products/${req.file.filename}`;
    }

    const productData = {
      name: req.body.name,
      description: req.body.description || '',
      price: parseFloat(req.body.price),
      stock: parseInt(req.body.stock),
      category_id: req.body.category_id || null,
      image_url: image_url
    };

    const product = await Product.create(productData);
    res.status(201).json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    
    // If file was uploaded but error occurred, delete the file
    if (req.file) {
      const filePath = path.join(__dirname, '..', '..', 'uploads/products', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    res.status(500).json({ 
      success: false,
      message: error.message || 'Server error while creating product' 
    });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    // Check for multer errors
    if (req.fileValidationError) {
      return res.status(400).json({ 
        success: false, 
        message: req.fileValidationError 
      });
    }

    let image_url = req.body.image_url;
    
    // If new file was uploaded, use the new file path
    if (req.file) {
      image_url = `/uploads/products/${req.file.filename}`;
      
      // Delete old image if exists
      const existingProduct = await Product.findById(req.params.id);
      if (existingProduct && existingProduct.image_url) {
        const oldPath = path.join(__dirname, '..', '..', existingProduct.image_url);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    }

    const productData = {
      name: req.body.name,
      description: req.body.description || '',
      price: parseFloat(req.body.price),
      stock: parseInt(req.body.stock),
      category_id: req.body.category_id || null,
      image_url: image_url
    };

    const product = await Product.update(req.params.id, productData);
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }
    res.json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    
    // If new file was uploaded but error occurred, delete the file
    if (req.file) {
      const filePath = path.join(__dirname, '..', '..', 'uploads/products', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    res.status(500).json({ 
      success: false,
      message: error.message || 'Server error while updating product' 
    });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.delete(req.params.id);
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }
    
    // Delete image file if exists
    if (product.image_url) {
      const imagePath = path.join(__dirname, '..', '..', product.image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Server error while deleting product' 
    });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }
    res.json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Server error while fetching product' 
    });
  }
};