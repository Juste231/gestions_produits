const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = 3000;
const PASSWORD = process.env.PASSWORD;
const DATA_FILE = 'products.json';

app.use(bodyParser.json());


function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function findProductById(products, id) {
  return products.find(product => product.id === id);
}

// Routes
app.get('/products', (req, res) => {
  const products = readData();
  res.json(products);
});

app.get('/products/:id', (req, res) => {
  const products = readData();
  const product = findProductById(products, req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

app.post('/products', (req, res) => {
  const { password, ...newProduct } = req.body;
  if (password !== PASSWORD) return res.status(403).json({ error: 'Invalid password' });

  const products = readData();
  products.push({ ...newProduct });
  writeData(products);
  res.status(201).json({ message: 'Product added successfully' });
});

app.put('/products/:id', (req, res) => {
  const { password, ...updates } = req.body;
  if (password !== PASSWORD) return res.status(403).json({ error: 'Invalid password' });

  const products = readData();
  const product = findProductById(products, req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  Object.assign(product, updates);
  writeData(products);
  res.json({ message: 'Product updated successfully' });
});

app.delete('/products/:id', (req, res) => {
  const { password } = req.body;
  if (password !== PASSWORD) return res.status(403).json({ error: 'Invalid password' });

  let products = readData();
  const initialLength = products.length;
  products = products.filter(product => product.id !== req.params.id);
  if (products.length === initialLength) return res.status(404).json({ error: 'Product not found' });

  writeData(products);
  res.json({ message: 'Product deleted successfully' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

