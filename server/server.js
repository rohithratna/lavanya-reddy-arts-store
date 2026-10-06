const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 AS ok');
    res.json({ status: 'running', db: rows[0].ok === 1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get('/api/products', async (req, res) => {
  try {
    const { category } = req.query;
    const [rows] = category
      ? await db.query('SELECT * FROM products WHERE category = ?', [category])
      : await db.query('SELECT * FROM products ORDER BY id');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'This email is already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)',
      [name, email, phone || null, hashed]
    );
    res.json({ message: 'Registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
function auth(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Please login first' });
  }
}

app.post('/api/orders', auth, async (req, res) => {
  const { address, phone, items } = req.body;
  if (!address || !phone || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Address, phone and at least one item are required' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    let total = 0;
    const priced = [];
    for (const item of items) {
      const [rows] = await conn.query('SELECT price FROM products WHERE id = ?', [item.product_id]);
      if (rows.length === 0) throw new Error('Product not found');
      const qty = Math.max(1, parseInt(item.quantity) || 1);
      const price = Number(rows[0].price);
      total += price * qty;
      priced.push({ ...item, quantity: qty, price });
    }

    const [orderResult] = await conn.query(
      'INSERT INTO orders (user_id, total, address, phone) VALUES (?, ?, ?, ?)',
      [req.user.id, total, address, phone]
    );
    const orderId = orderResult.insertId;

    for (const it of priced) {
      await conn.query(
        `INSERT INTO order_items
         (order_id, product_id, quantity, price, size, frame, custom_text, reference_image, needed_by, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [orderId, it.product_id, it.quantity, it.price, it.size || null, it.frame || null,
         it.custom_text || null, it.reference_image || null, it.needed_by || null, it.notes || null]
      );
    }

    await conn.commit();
    res.json({ message: 'Order placed', orderId, total });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

app.get('/api/orders/my', auth, async (req, res) => {
  try {
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC', [req.user.id]
    );
    for (const o of orders) {
      const [items] = await db.query(
        `SELECT oi.*, p.name FROM order_items oi
         JOIN products p ON p.id = oi.product_id WHERE oi.order_id = ?`, [o.id]
      );
      o.items = items;
    }
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.listen(process.env.PORT, () =>
  console.log('Server running on port ' + process.env.PORT)
);