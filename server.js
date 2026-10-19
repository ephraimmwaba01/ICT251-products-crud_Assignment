require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Check and clean the request body. Returns { error } or { data }.
function validate(body) {
  const name = typeof body.product_name === 'string' ? body.product_name.trim() : '';
  if (!name) return { error: 'product_name is required' };

  const price = Number(body.price ?? 0);
  if (!Number.isFinite(price) || price < 0) return { error: 'price must be a number, 0 or more' };

  const stock = Number(body.stock_quantity ?? 0);
  if (!Number.isInteger(stock) || stock < 0) return { error: 'stock_quantity must be a whole number, 0 or more' };

  return {
    data: {
      product_name: name,
      brand: body.brand ? String(body.brand).trim() : null,
      category: body.category ? String(body.category).trim() : null,
      price,
      stock_quantity: stock,
      description: body.description ? String(body.description).trim() : null,
    },
  };
}

// GET /api/products - list all
app.get('/api/products', (req, res) => {
  const rows = db.prepare('SELECT * FROM products ORDER BY id').all();
  res.json(rows);
});

// GET /api/products/:id - get one
app.get('/api/products/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Product not found' });
  res.json(row);
});

// POST /api/products - create
app.post('/api/products', (req, res) => {
  const { error, data } = validate(req.body || {});
  if (error) return res.status(400).json({ error });

  const result = db.prepare(
    `INSERT INTO products (product_name, brand, category, price, stock_quantity, description)
     VALUES (@product_name, @brand, @category, @price, @stock_quantity, @description)`
  ).run(data);

  const created = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(created);
});

// PUT /api/products/:id - update
app.put('/api/products/:id', (req, res) => {
  const existing = db.prepare('SELECT id FROM products WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Product not found' });

  const { error, data } = validate(req.body || {});
  if (error) return res.status(400).json({ error });

  db.prepare(
    `UPDATE products
     SET product_name = @product_name, brand = @brand, category = @category,
         price = @price, stock_quantity = @stock_quantity, description = @description,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = @id`
  ).run({ ...data, id: req.params.id });

  res.json(db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id));
});

// DELETE /api/products/:id - delete
app.delete('/api/products/:id', (req, res) => {
  const result = db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Product not found' });
  res.json({ message: 'Product deleted', id: Number(req.params.id) });
});

// Unknown API routes return JSON too
app.use('/api', (req, res) => res.status(404).json({ error: 'Route not found' }));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
