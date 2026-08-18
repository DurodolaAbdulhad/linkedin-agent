import express from 'express';
import { Audience } from '../models/Audience.js';

const router = express.Router();

// Get all audiences
router.get('/', (req, res) => {
  const allAudiences = Audience.getAll();
  res.json(allAudiences);
});

// Get audiences by product
router.get('/product/:productId', (req, res) => {
  const audiences = Audience.findByProductId(parseInt(req.params.productId));
  res.json(audiences);
});

// Get audience by ID
router.get('/:id', (req, res) => {
  const audience = Audience.findById(parseInt(req.params.id));
  if (!audience) {
    return res.status(404).json({ error: 'Audience not found' });
  }
  res.json(audience);
});

// Create new audience
router.post('/', (req, res) => {
  const { productId, name, description, roles, painPoints, goals, valueDriver, preferredContentTypes } = req.body;

  if (!productId || !name) {
    return res.status(400).json({ error: 'Product ID and audience name are required' });
  }

  const audience = Audience.create({
    productId,
    name,
    description,
    roles: roles || [],
    painPoints: painPoints || [],
    goals: goals || [],
    valueDriver,
    preferredContentTypes: preferredContentTypes || []
  });

  res.status(201).json(audience);
});

// Update audience
router.put('/:id', (req, res) => {
  const audience = Audience.update(parseInt(req.params.id), req.body);
  if (!audience) {
    return res.status(404).json({ error: 'Audience not found' });
  }
  res.json(audience);
});

// Delete audience
router.delete('/:id', (req, res) => {
  const deleted = Audience.delete(parseInt(req.params.id));
  if (!deleted) {
    return res.status(404).json({ error: 'Audience not found' });
  }
  res.json({ message: 'Audience deleted' });
});

export default router;
