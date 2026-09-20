// backend/src/controllers/orderController.js
const Order = require('../models/Order');
const Product = require('../models/Product'); // ✅ This was missing!
const { validationResult } = require('express-validator');

// Create order
const createOrder = async (req, res) => {
  try {
    console.log('📝 Creating order with data:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { items, shipping_address, payment_method, cod_instructions, phone } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Order must contain at least one item' 
      });
    }
    
    if (!shipping_address) {
      return res.status(400).json({ 
        success: false, 
        message: 'Shipping address is required' 
      });
    }

    let total_amount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product_id);
      if (!product) {
        return res.status(404).json({ 
          success: false, 
          message: `Product ${item.product_id} not found` 
        });
      }
      
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          success: false, 
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}` 
        });
      }
      
      const itemTotal = parseFloat(product.price) * parseInt(item.quantity);
      total_amount += itemTotal;
      
      orderItems.push({
        product_id: item.product_id,
        quantity: parseInt(item.quantity),
        price: parseFloat(product.price)
      });
    }

    let order;
    if (payment_method === 'cod' || payment_method === 'Cash on Delivery') {
      order = await Order.create({
        user_id: req.user.id,
        total_amount,
        shipping_address,
        payment_method: 'Cash on Delivery',
        items: orderItems,
        notes: cod_instructions || 'Cash on Delivery',
        phone: phone || null
      });
    } else {
      order = await Order.create({
        user_id: req.user.id,
        total_amount,
        shipping_address,
        payment_method,
        items: orderItems,
        phone: phone || null
      });
    }

    res.status(201).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('❌ Error creating order:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while creating order',
      error: error.message 
    });
  }
};

// Get user's orders
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.findByUserId(req.user.id);
    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Get all orders (admin only)
const getAllOrders = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }
    const orders = await Order.findAll();
    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Get order details
const getOrderDetails = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    const order = await Order.getOrderWithItems(orderId);
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    if (userRole !== 'admin' && order.user_id !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Update order status (admin only)
const updateOrderStatus = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin only.' 
      });
    }

    const { status } = req.body;
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status' 
      });
    }

    const order = await Order.updateStatus(req.params.id, status);
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    // If cancelling order, restore stock for all items
    if (status === 'cancelled') {
      const items = await Order.getOrderItems(req.params.id);
      for (const item of items) {
        if (item.status !== 'cancelled') {
          await Product.updateStock(item.product_id, -item.quantity);
        }
      }
    }

    res.json({
      success: true,
      message: `Order ${status} successfully`,
      order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Cancel order (user or admin)
const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    // Check permission
    if (userRole !== 'admin' && order.user_id !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    // Check if order can be cancelled
    if (!['pending', 'processing'].includes(order.status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Only pending or processing orders can be cancelled' 
      });
    }

    // Cancel the order
    const cancelledOrder = await Order.updateStatus(orderId, 'cancelled');
    
    // Restore stock for all items
    const items = await Order.getOrderItems(orderId);
    for (const item of items) {
      if (item.status !== 'cancelled') {
        await Product.updateStock(item.product_id, -item.quantity);
      }
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      order: cancelledOrder
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Recover cancelled order (admin only)
const recoverOrder = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin only.' 
      });
    }

    const orderId = req.params.id;

    // Check if order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    // Check if order is cancelled
    if (order.status !== 'cancelled') {
      return res.status(400).json({ 
        success: false, 
        message: 'Only cancelled orders can be recovered' 
      });
    }

    // Recover the order
    const recoveredOrder = await Order.updateStatus(orderId, 'pending');
    
    // Restore stock back (remove items from stock again)
    const items = await Order.getOrderItems(orderId);
    for (const item of items) {
      if (item.status !== 'cancelled') {
        await Product.updateStock(item.product_id, item.quantity);
      }
    }

    res.json({
      success: true,
      message: 'Order recovered successfully',
      order: recoveredOrder
    });
  } catch (error) {
    console.error('Error recovering order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Update order item (quantity and price) - admin only
const updateOrderItem = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin only.' 
      });
    }

    const { orderId, itemId } = req.params;
    const { quantity, price } = req.body;

    if (quantity !== undefined && (isNaN(quantity) || quantity < 1)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Quantity must be positive' 
      });
    }

    if (price !== undefined && (isNaN(price) || price < 0)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Price must be a valid number' 
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    const updatedItem = await Order.updateOrderItem(orderId, itemId, { quantity, price });
    if (!updatedItem) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order item not found' 
      });
    }

    const newTotal = await Order.recalculateTotal(orderId);
    await Order.updateTotal(orderId, newTotal);
    const updatedOrder = await Order.getOrderWithItems(orderId);

    res.json({
      success: true,
      message: 'Order item updated',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order item:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Update order item status (Process, Ship, Deliver) - admin only
const updateOrderItemStatus = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin only.' 
      });
    }

    const { orderId, itemId } = req.params;
    const { status } = req.body;

    console.log(`📝 Updating item ${itemId} in order ${orderId} to status: ${status}`);

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'active'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status' 
      });
    }

    // Check if order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    // Check if order is cancelled
    if (order.status === 'cancelled') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot update items of a cancelled order' 
      });
    }

    // Update the item status
    const updatedItem = await Order.updateOrderItemStatus(orderId, itemId, status);
    if (!updatedItem) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order item not found' 
      });
    }

    console.log('✅ Item updated:', updatedItem);

    // If item is cancelled, restore stock
    if (status === 'cancelled') {
      await Product.updateStock(updatedItem.product_id, -updatedItem.quantity);
    }

    // Recalculate order total
    const newTotal = await Order.recalculateTotal(orderId);
    await Order.updateTotal(orderId, newTotal);
    const updatedOrder = await Order.getOrderWithItems(orderId);

    res.json({
      success: true,
      message: 'Item status updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('❌ Error updating item status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while updating item status',
      error: error.message 
    });
  }
};

// Cancel order item (protected - both user and admin)
const cancelOrderItem = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    if (userRole !== 'admin' && order.user_id !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    if (!['pending', 'processing'].includes(order.status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Items can only be cancelled for pending or processing orders' 
      });
    }

    // Use the updateOrderItemStatus method
    const cancelledItem = await Order.updateOrderItemStatus(orderId, itemId, 'cancelled');
    if (!cancelledItem) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order item not found' 
      });
    }

    await Product.updateStock(cancelledItem.product_id, -cancelledItem.quantity);
    const newTotal = await Order.recalculateTotal(orderId);
    await Order.updateTotal(orderId, newTotal);
    const updatedOrder = await Order.getOrderWithItems(orderId);

    res.json({
      success: true,
      message: 'Order item cancelled',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error cancelling order item:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// backend/src/controllers/orderController.js
// Add this new function before module.exports

// Recover cancelled order item (admin only)
const recoverOrderItem = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin only.' 
      });
    }

    const { orderId, itemId } = req.params;

    // Check if order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    // Check if order is cancelled
    if (order.status === 'cancelled') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot recover items from a cancelled order' 
      });
    }

    // Recover the item - set status back to 'active'
    const recoveredItem = await Order.updateOrderItemStatus(orderId, itemId, 'active');
    if (!recoveredItem) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order item not found' 
      });
    }

    // Restore stock (remove items from stock again since they were restored)
    await Product.updateStock(recoveredItem.product_id, recoveredItem.quantity);

    // Recalculate order total
    const newTotal = await Order.recalculateTotal(orderId);
    await Order.updateTotal(orderId, newTotal);
    const updatedOrder = await Order.getOrderWithItems(orderId);

    res.json({
      success: true,
      message: 'Item recovered successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error recovering order item:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while recovering item' 
    });
  }
};

/// backend/src/controllers/orderController.js
// Add these new functions after the existing ones

// Move order to recycle bin (soft delete)
const deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    // Check permission
    if (userRole !== 'admin' && order.user_id !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    // Only allow deletion of delivered or cancelled orders
    if (!['delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Only delivered or cancelled orders can be deleted' 
      });
    }

    // Soft delete the order
    const deletedOrder = await Order.softDelete(orderId);
    
    res.json({
      success: true,
      message: 'Order moved to recycle bin',
      order: deletedOrder
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Restore order from recycle bin
const restoreOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if order exists in recycle bin
    const order = await Order.findById(orderId);
    if (!order || !order.deleted_at) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found in recycle bin' 
      });
    }

    // Check permission
    if (userRole !== 'admin' && order.user_id !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    // Restore the order
    const restoredOrder = await Order.restore(orderId);
    
    res.json({
      success: true,
      message: 'Order restored from recycle bin',
      order: restoredOrder
    });
  } catch (error) {
    console.error('Error restoring order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Permanently delete order (hard delete - admin only)
const permanentDeleteOrder = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin only.' 
      });
    }

    const orderId = req.params.id;

    // Check if order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    // Permanently delete the order
    const deletedOrder = await Order.permanentDelete(orderId);
    
    res.json({
      success: true,
      message: 'Order permanently deleted',
      order: deletedOrder
    });
  } catch (error) {
    console.error('Error permanently deleting order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Get all deleted orders (recycle bin)
const getRecycleBin = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const isAdmin = userRole === 'admin';

    // Admin sees all deleted orders, user sees only theirs
    const deletedOrders = await Order.findDeleted(isAdmin ? null : userId);
    const count = await Order.countDeleted(isAdmin ? null : userId);

    res.json({
      success: true,
      count,
      orders: deletedOrders
    });
  } catch (error) {
    console.error('Error fetching recycle bin:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Update the module.exports
module.exports = {
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
};