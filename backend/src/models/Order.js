// backend/src/models/Order.js
const pool = require('../config/database');

class Order {
  // Create new order with items
  static async create({ user_id, total_amount, shipping_address, payment_method, items, notes = null, phone = null }) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const orderResult = await client.query(
        `INSERT INTO orders (user_id, total_amount, shipping_address, payment_method, notes, status, phone) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [user_id, total_amount, shipping_address, payment_method, notes, 'pending', phone]
      );
      const order = orderResult.rows[0];

      for (const item of items) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, quantity, price, status) 
           VALUES ($1, $2, $3, $4, $5)`,
          [order.id, item.product_id, item.quantity, item.price, 'active']
        );

        await client.query(
          'UPDATE products SET stock = stock - $1 WHERE id = $2',
          [item.quantity, item.product_id]
        );
      }

      await client.query('COMMIT');
      return {
        ...order,
        total_amount: parseFloat(order.total_amount)
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Find orders by user ID
  static async findByUserId(userId) {
    const result = await pool.query(`
      SELECT o.*, 
             COALESCE(
               json_agg(
                 json_build_object(
                   'product_id', oi.product_id,
                   'quantity', oi.quantity,
                   'price', oi.price,
                   'product_name', p.name
                 )
               ) FILTER (WHERE oi.id IS NOT NULL), 
               '[]'
             ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.user_id = $1 AND o.deleted_at IS NULL
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `, [userId]);
    return result.rows.map(row => ({
      ...row,
      total_amount: parseFloat(row.total_amount),
      items: row.items || []
    }));
  }

  // Get all orders (admin) - FIXED: This method was missing!
  static async findAll() {
    const result = await pool.query(`
      SELECT o.*, u.name as user_name, u.email as user_email,
             COALESCE(
               json_agg(
                 json_build_object(
                   'product_id', oi.product_id,
                   'quantity', oi.quantity,
                   'price', oi.price,
                   'product_name', p.name
                 )
               ) FILTER (WHERE oi.id IS NOT NULL), 
               '[]'
             ) as items
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.deleted_at IS NULL
      GROUP BY o.id, u.name, u.email
      ORDER BY o.created_at DESC
    `);
    return result.rows.map(row => ({
      ...row,
      total_amount: parseFloat(row.total_amount),
      items: row.items || []
    }));
  }

  // Find order by ID
  static async findById(id) {
    const result = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;
    return {
      ...result.rows[0],
      total_amount: parseFloat(result.rows[0].total_amount)
    };
  }

  // Get order with all items
  static async getOrderWithItems(orderId) {
    try {
      const orderCheck = await pool.query(
        'SELECT * FROM orders WHERE id = $1',
        [orderId]
      );
      
      if (orderCheck.rows.length === 0) return null;
      
      const orderData = orderCheck.rows[0];
      
      const itemsResult = await pool.query(`
        SELECT 
          oi.id,
          oi.product_id,
          oi.quantity,
          oi.price,
          oi.status as item_status,
          p.name as product_name,
          p.image_url as product_image,
          (oi.quantity * oi.price) as subtotal
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = $1
      `, [orderId]);
      
      const userResult = await pool.query(
        'SELECT name as user_name, email as user_email FROM users WHERE id = $1',
        [orderData.user_id]
      );
      
      return {
        ...orderData,
        total_amount: parseFloat(orderData.total_amount),
        user_name: userResult.rows[0]?.user_name || 'Unknown',
        user_email: userResult.rows[0]?.user_email || 'Unknown',
        phone: orderData.phone || 'N/A',
        items: itemsResult.rows.map(item => ({
          id: item.id,
          product_id: item.product_id,
          product_name: item.product_name || 'Product',
          product_image: item.product_image,
          quantity: parseInt(item.quantity),
          price: parseFloat(item.price),
          subtotal: parseFloat(item.subtotal),
          status: item.item_status || 'active'
        }))
      };
    } catch (error) {
      console.error('Error in getOrderWithItems:', error);
      throw error;
    }
  }

  // Get order items only
  static async getOrderItems(orderId) {
    const result = await pool.query(`
      SELECT oi.*, p.name as product_name, p.image_url
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
    `, [orderId]);
    return result.rows;
  }

  // Update order status
  static async updateStatus(id, status) {
    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    if (result.rows.length === 0) return null;
    return {
      ...result.rows[0],
      total_amount: parseFloat(result.rows[0].total_amount)
    };
  }

  // Update order item (quantity and price)
  static async updateOrderItem(orderId, itemId, { quantity, price }) {
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (quantity !== undefined) {
      updates.push(`quantity = $${paramCount}`);
      values.push(quantity);
      paramCount++;
    }
    if (price !== undefined) {
      updates.push(`price = $${paramCount}`);
      values.push(price);
      paramCount++;
    }

    if (updates.length === 0) return null;

    values.push(itemId, orderId);
    const result = await pool.query(
      `UPDATE order_items 
       SET ${updates.join(', ')} 
       WHERE id = $${paramCount} AND order_id = $${paramCount + 1}
       RETURNING *`,
      values
    );
    return result.rows[0];
  }

  // Update order item status (Process, Ship, Deliver, Cancel)
  static async updateOrderItemStatus(orderId, itemId, status) {
    const result = await pool.query(
      `UPDATE order_items SET status = $1 
       WHERE id = $2 AND order_id = $3
       RETURNING *`,
      [status, itemId, orderId]
    );
    return result.rows[0];
  }

  // Cancel order item (legacy - kept for compatibility)
  static async cancelOrderItem(orderId, itemId) {
    return await this.updateOrderItemStatus(orderId, itemId, 'cancelled');
  }

  // Recalculate order total
  static async recalculateTotal(orderId) {
    const result = await pool.query(`
      SELECT COALESCE(SUM(quantity * price), 0) as total
      FROM order_items
      WHERE order_id = $1 AND (status IS NULL OR status != 'cancelled')
    `, [orderId]);
    return parseFloat(result.rows[0].total);
  }

  // Update order total
  static async updateTotal(orderId, total) {
    const result = await pool.query(
      'UPDATE orders SET total_amount = $1 WHERE id = $2 RETURNING *',
      [total, orderId]
    );
    return result.rows[0];
  }

  // ============================================
  // 📌 RECYCLE BIN METHODS
  // ============================================

  // Soft delete order (move to recycle bin)
  static async softDelete(orderId) {
    const result = await pool.query(
      'UPDATE orders SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING *',
      [orderId]
    );
    if (result.rows.length === 0) return null;
    return {
      ...result.rows[0],
      total_amount: parseFloat(result.rows[0].total_amount)
    };
  }

  // Restore order from recycle bin
  static async restore(orderId) {
    const result = await pool.query(
      'UPDATE orders SET deleted_at = NULL WHERE id = $1 AND deleted_at IS NOT NULL RETURNING *',
      [orderId]
    );
    if (result.rows.length === 0) return null;
    return {
      ...result.rows[0],
      total_amount: parseFloat(result.rows[0].total_amount)
    };
  }

  // Permanently delete order (hard delete)
  static async permanentDelete(orderId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      await client.query('DELETE FROM order_items WHERE order_id = $1', [orderId]);
      
      const result = await client.query(
        'DELETE FROM orders WHERE id = $1 RETURNING *',
        [orderId]
      );
      
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Get all active orders (not deleted) - for admin
  static async findAllActive() {
    const result = await pool.query(`
      SELECT o.*, u.name as user_name, u.email as user_email,
             COALESCE(
               json_agg(
                 json_build_object(
                   'product_id', oi.product_id,
                   'quantity', oi.quantity,
                   'price', oi.price,
                   'product_name', p.name
                 )
               ) FILTER (WHERE oi.id IS NOT NULL), 
               '[]'
             ) as items
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.deleted_at IS NULL
      GROUP BY o.id, u.name, u.email
      ORDER BY o.created_at DESC
    `);
    return result.rows.map(row => ({
      ...row,
      total_amount: parseFloat(row.total_amount),
      items: row.items || []
    }));
  }

  // Get deleted orders (in recycle bin)
  static async findDeleted(userId = null) {
    let query = `
      SELECT o.*, u.name as user_name, u.email as user_email,
             COALESCE(
               json_agg(
                 json_build_object(
                   'product_id', oi.product_id,
                   'quantity', oi.quantity,
                   'price', oi.price,
                   'product_name', p.name
                 )
               ) FILTER (WHERE oi.id IS NOT NULL), 
               '[]'
             ) as items
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.deleted_at IS NOT NULL
    `;
    
    const params = [];
    if (userId) {
      query += ` AND o.user_id = $1`;
      params.push(userId);
    }
    
    query += ` GROUP BY o.id, u.name, u.email ORDER BY o.deleted_at DESC`;
    
    const result = await pool.query(query, params);
    return result.rows.map(row => ({
      ...row,
      total_amount: parseFloat(row.total_amount),
      items: row.items || []
    }));
  }

  // Count deleted orders
  static async countDeleted(userId = null) {
    let query = 'SELECT COUNT(*) as count FROM orders WHERE deleted_at IS NOT NULL';
    const params = [];
    if (userId) {
      query += ' AND user_id = $1';
      params.push(userId);
    }
    const result = await pool.query(query, params);
    return parseInt(result.rows[0].count);
  }
}

module.exports = Order;