// backend/src/models/Product.js
const pool = require('../config/database');

class Product {
  static async create({ name, description, price, stock, image_url, category_id }) {
    const result = await pool.query(
      'INSERT INTO products (name, description, price, stock, image_url, category_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, description, price, stock, image_url, category_id]
    );
    const product = result.rows[0];
    return {
      ...product,
      price: parseFloat(product.price),
      stock: parseInt(product.stock)
    };
  }

  static async findAll() {
    const result = await pool.query(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      ORDER BY p.created_at DESC
    `);
    return result.rows.map(row => ({
      ...row,
      price: parseFloat(row.price),
      stock: parseInt(row.stock)
    }));
  }

  static async findById(id) {
    const result = await pool.query(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.id = $1
    `, [id]);
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      ...row,
      price: parseFloat(row.price),
      stock: parseInt(row.stock)
    };
  }

  static async update(id, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${paramCount}`);
      values.push(data.name);
      paramCount++;
    }
    if (data.description !== undefined) {
      fields.push(`description = $${paramCount}`);
      values.push(data.description);
      paramCount++;
    }
    if (data.price !== undefined) {
      fields.push(`price = $${paramCount}`);
      values.push(data.price);
      paramCount++;
    }
    if (data.stock !== undefined) {
      fields.push(`stock = $${paramCount}`);
      values.push(data.stock);
      paramCount++;
    }
    if (data.image_url !== undefined) {
      fields.push(`image_url = $${paramCount}`);
      values.push(data.image_url);
      paramCount++;
    }
    if (data.category_id !== undefined) {
      fields.push(`category_id = $${paramCount}`);
      values.push(data.category_id);
      paramCount++;
    }

    if (fields.length === 0) {
      return null;
    }

    values.push(id);
    const result = await pool.query(
      `UPDATE products SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      ...row,
      price: parseFloat(row.price),
      stock: parseInt(row.stock)
    };
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  static async updateStock(id, quantity) {
    const result = await pool.query(
      'UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock >= $1 RETURNING *',
      [quantity, id]
    );
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      ...row,
      price: parseFloat(row.price),
      stock: parseInt(row.stock)
    };
  }
}

module.exports = Product;