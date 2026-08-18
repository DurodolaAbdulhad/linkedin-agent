import express from 'express';
import { Product } from '../models/Product.js';

const router = express.Router();

// Get all products
router.get('/', (req, res) => {
  const allProducts = Product.getAll();
  res.json(allProducts);
});

// Get active products only
router.get('/active/only', (req, res) => {
  const activeProducts = Product.getActive();
  res.json(activeProducts);
});

// Get product by ID
router.get('/:id', (req, res) => {
  const product = Product.findById(parseInt(req.params.id));
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

// Get product by slug
router.get('/slug/:slug', (req, res) => {
  const product = Product.findBySlug(req.params.slug);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

// Create new product
router.post('/', (req, res) => {
  const { name, slug, category, description, website, objective, pricing, targetMarket, icp, painPoints, valueProposition, offer, targets } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Product name is required' });
  }

  const product = Product.create({
    name,
    slug,
    category,
    description,
    website,
    objective,
    pricing,
    targetMarket,
    icp,
    painPoints,
    valueProposition,
    offer,
    targets
  });

  res.status(201).json(product);
});

// Update product
router.put('/:id', (req, res) => {
  const product = Product.update(parseInt(req.params.id), req.body);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

// Update product objective (strategic intent)
router.put('/:id/objective', (req, res) => {
  const { objective } = req.body;
  if (!objective) {
    return res.status(400).json({ error: 'Objective is required' });
  }

  const product = Product.update(parseInt(req.params.id), { objective });
  res.json(product);
});

// Update product ICP
router.put('/:id/icp', (req, res) => {
  const { icp } = req.body;
  if (!icp) {
    return res.status(400).json({ error: 'ICP is required' });
  }

  const product = Product.update(parseInt(req.params.id), { icp });
  res.json(product);
});

// Update product pain points
router.put('/:id/pain-points', (req, res) => {
  const { painPoints } = req.body;
  if (!Array.isArray(painPoints)) {
    return res.status(400).json({ error: 'Pain points must be an array' });
  }

  const product = Product.update(parseInt(req.params.id), { painPoints });
  res.json(product);
});

// Add audience to product
router.post('/:id/audiences', (req, res) => {
  const { name, description, painPoints, goals, roles } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Audience name is required' });
  }

  const audience = {
    _id: Date.now(),
    name,
    description: description || '',
    painPoints: painPoints || [],
    goals: goals || [],
    roles: roles || [],
    createdAt: new Date().toISOString()
  };

  const product = Product.addAudience(parseInt(req.params.id), audience);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  res.status(201).json({ audience, product });
});

// Remove audience from product
router.delete('/:id/audiences/:audienceId', (req, res) => {
  const product = Product.removeAudience(parseInt(req.params.id), parseInt(req.params.audienceId));
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  res.json({ message: 'Audience removed', product });
});

// Delete product
router.delete('/:id', (req, res) => {
  const deleted = Product.delete(parseInt(req.params.id));
  if (!deleted) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json({ message: 'Product deleted' });
});

export default router;
