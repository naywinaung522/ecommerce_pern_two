// backend/src/routes/productRoutes.js
const express = require('express');
const { body } = require('express-validator');
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/auth');
const upload = require('../config/upload');

const router = express.Router();

// Multer error handling middleware
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'FILE_TOO_LARGE') {
      return res.status(400).json({
        success: false,
        message: 'File is too large. Maximum file size is 10MB.'
      });
    }
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File is too large. Maximum file size is 10MB.'
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next(err);
};

// Serve static files from uploads folder
router.use('/uploads', express.static('uploads'));

// Apply multer error handling to routes that use upload
router.route('/')
  .get(getProducts)
  .post(
    protect,
    admin,
    (req, res, next) => {
      upload.single('image')(req, res, (err) => {
        if (err) {
          req.fileValidationError = err.message;
        }
        next();
      });
    },
    [
      body('name').notEmpty().withMessage('Name is required'),
      body('price').isNumeric().withMessage('Price must be a number'),
      body('stock').isInt({ min: 0 }).withMessage('Stock must be a positive integer')
    ],
    createProduct
  );

router.route('/:id')
  .get(getProductById)
  .put(
    protect, 
    admin,
    (req, res, next) => {
      upload.single('image')(req, res, (err) => {
        if (err) {
          req.fileValidationError = err.message;
        }
        next();
      });
    },
    updateProduct
  )
  .delete(protect, admin, deleteProduct);

// Add error handling middleware for multer
router.use(handleMulterError);

module.exports = router;