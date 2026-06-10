const express = require('express');
const cors = require('cors');
const ordersStore = require('./orders-store');
const productsStore = require('./products-store');
const usersStore = require('./users-store');

const PORT = Number(process.env.PORT) || 3000;
const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, mode: 'sample-backend' });
});

app.get('/api/users', (_req, res) => {
  res.json(usersStore.getAll());
});

app.delete('/api/users', (req, res) => {
  const ids = req.body?.ids;
  if (!Array.isArray(ids) || ids.some((id) => typeof id !== 'string')) {
    res.status(400).json({ error: 'Body must be { ids: string[] }' });
    return;
  }
  usersStore.deleteMany(ids);
  res.status(204).end();
});

app.patch('/api/users/:id', (req, res) => {
  try {
    const user = usersStore.update(req.params.id, req.body ?? {});
    res.json(user);
  } catch (err) {
    const status = err.status ?? 500;
    res.status(status).json({ error: err.message ?? 'Update failed' });
  }
});

app.get('/api/orders', (req, res) => {
  res.json(ordersStore.queryPage(req.query));
});

app.get('/api/products', (req, res) => {
  res.json(productsStore.queryPage(req.query));
});

app.patch('/api/products/:id', (req, res) => {
  try {
    const product = productsStore.update(req.params.id, req.body ?? {});
    res.json(product);
  } catch (err) {
    const status = err.status ?? 500;
    res.status(status).json({ error: err.message ?? 'Update failed' });
  }
});

app.post('/api/reset', (_req, res) => {
  usersStore.reset();
  res.json({ ok: true, message: 'Users reset to seed data' });
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`Demo API listening on http://localhost:${PORT}`);
  console.log('  GET    /api/users');
  console.log('  DELETE /api/users');
  console.log('  PATCH  /api/users/:id');
  console.log('  GET    /api/orders?offset&limit&sort&filter');
  console.log('  GET    /api/products?offset&limit&sort&filter');
  console.log('  PATCH  /api/products/:id');
  console.log('  POST   /api/reset (restore user seed data)');
});
