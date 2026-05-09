try { require('dotenv').config(); } catch (e) { /* ignore if dotenv not installed */ }
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 4000;

app.get('/api/products', async (req, res) => {
  const products = await prisma.product.findMany();
  res.json(products);
});

app.get('/api/users', async (req, res) => {
  const users = await prisma.user.findMany();
  const safe = users.map((u) => ({ id: u.id, email: u.email, fullName: u.fullName, role: u.role, phone: u.phone, address: u.address, createdAt: u.createdAt }));
  res.json(safe);
});

app.get('/api/categories', async (req, res) => {
  const categories = await prisma.category.findMany();
  res.json(categories);
});

app.get('/api/vouchers', async (req, res) => {
  const vouchers = await prisma.voucher.findMany();
  res.json(vouchers);
});

app.get('/api/reviews', async (req, res) => {
  const reviews = await prisma.review.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(reviews);
});

app.post('/api/reviews', async (req, res) => {
  const { productId, userId, userName, rating, comment } = req.body;
  if (!productId || !userId) return res.status(400).json({ error: 'Missing fields' });
  const r = await prisma.review.create({ data: { productId, userId, userName, rating: Number(rating), comment } });
  res.json(r);
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const u = await prisma.user.findUnique({ where: { email } });
  if (!u || u.password !== password) return res.status(401).json({ error: 'Invalid credentials' });
  const safe = { id: u.id, email: u.email, fullName: u.fullName, role: u.role, phone: u.phone, address: u.address, createdAt: u.createdAt };
  res.json(safe);
});

app.post('/api/auth/register', async (req, res) => {
  const { email, password, fullName, role } = req.body;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(400).json({ error: 'Email exists' });
  const u = await prisma.user.create({ data: { email, password, fullName, role: role ?? 'customer' } });
  const safe = { id: u.id, email: u.email, fullName: u.fullName, role: u.role, createdAt: u.createdAt };
  res.json(safe);
});

app.post('/api/orders', async (req, res) => {
  const data = req.body;
  if (!data.userId) return res.status(400).json({ error: 'Missing userId' });
  const order = await prisma.order.create({ data: {
    userId: data.userId,
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    customerAddress: data.customerAddress,
    subtotal: Number(data.subtotal || 0),
    discount: Number(data.discount || 0),
    shippingFee: Number(data.shippingFee || 0),
    total: Number(data.total || 0),
    voucherCode: data.voucherCode,
    paymentMethod: data.paymentMethod,
    status: 'pending',
    note: data.note,
  }});
  // create items
  for (const it of data.items || []) {
    // ensure the productId exists in DB; fall back to lookup by name
    let dbProductId = it.productId;

    try {
      const exists = dbProductId ? await prisma.product.findUnique({ where: { id: dbProductId } }) : null;
      if (!exists) {
        // try exact name match
        let found = null;
        if (it.name) found = await prisma.product.findFirst({ where: { name: it.name } });
        // try partial name match
        if (!found && it.name) {
          const token = it.name.split(' ')[0];
          if (token) found = await prisma.product.findFirst({ where: { name: { contains: token } } });
        }
        // fallback to any product in DB
        if (!found) {
          const any = await prisma.product.findFirst();
          if (any) found = any;
        }
        if (found) dbProductId = found.id; else dbProductId = null;
      }
    } catch (e) {
      dbProductId = null;
    }

    // create order item using resolved product id
    await prisma.orderItem.create({ data: { orderId: order.id, productId: dbProductId, name: it.name, image: it.image, price: Number(it.price), quantity: Number(it.quantity) } });
    // reduce stock if product exists
    if (dbProductId) {
      await prisma.product.update({ where: { id: dbProductId }, data: { stock: { decrement: Number(it.quantity) } } }).catch(() => {});
    }
  }
  res.json({ orderId: order.id });
});

app.listen(PORT, () => console.log(`API server running on http://localhost:${PORT}`));
