// backend/src/routes/orderRoutes.js
const express = require('express');
const { body } = require('express-validator');
const {
  createOrder,
  getUserOrders,
  getAllOrders,
  getOrderDetails,
  updateOrderStatus,
  cancelOrder,
  recoverOrder,
  updateOrderItem,
  updateOrderItemStatus,
  cancelOrderItem,
  recoverOrderItem,
  deleteOrder,           // Add this
  restoreOrder,          // Add this
  permanentDeleteOrder,  // Add this
  getRecycleBin          // Add this
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// ============================================
// 📌 SPECIFIC ROUTES FIRST (BEFORE generic ones)
// ============================================

// Get user's orders (protected)
router.get('/my-orders', protect, getUserOrders);

// Get all orders (admin only)
router.get('/all', protect, admin, getAllOrders);

// Get recycle bin (protected)
router.get('/recycle-bin', protect, getRecycleBin);

// ============================================
// 📌 ORDER ITEM ROUTES (SPECIFIC)
// ============================================

// Update order item status (admin only)
router.put('/:orderId/items/:itemId/status', protect, admin, updateOrderItemStatus);

// Update order item (quantity and price) - admin only
router.put('/:orderId/items/:itemId', protect, admin, updateOrderItem);

// Cancel order item (protected)
router.delete('/:orderId/items/:itemId', protect, cancelOrderItem);

// Recover order item (admin only)
router.put('/:orderId/items/:itemId/recover', protect, admin, recoverOrderItem);

// ============================================
// 📌 ORDER DELETE/RESTORE ROUTES (SPECIFIC)
// ============================================

// Move order to recycle bin (soft delete)
router.put('/:id/delete', protect, deleteOrder);

// Restore order from recycle bin
router.put('/:id/restore', protect, restoreOrder);

// Permanently delete order (admin only)
router.delete('/:id/permanent', protect, admin, permanentDeleteOrder);

// ============================================
// 📌 ORDER CANCEL/RECOVER ROUTES (SPECIFIC)
// ============================================

// Cancel order (user or admin)
router.put('/:id/cancel', protect, cancelOrder);

// Recover order (admin only)
router.put('/:id/recover', protect, admin, recoverOrder);

// ============================================
// 📌 GENERIC ORDER ROUTES (LAST)
// ============================================

// Get order details (protected) - generic :id route
router.get('/:id', protect, getOrderDetails);

// Update order status (admin only)
router.put('/:id/status', protect, admin, updateOrderStatus);

// Create order (protected)
router.post(
  '/',
  protect,
  [
    body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
    body('shipping_address').notEmpty().withMessage('Shipping address is required'),
    body('payment_method').notEmpty().withMessage('Payment method is required')
  ],
  createOrder
);

module.exports = router;