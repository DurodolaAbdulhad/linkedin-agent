import express from 'express';
import { Focus } from '../models/Focus.js';

const router = express.Router();

// Get active focus
router.get('/active', (req, res) => {
  const activeFocus = Focus.findActive();
  res.json(activeFocus || { message: 'No active focus' });
});

// Get all focuses
router.get('/', (req, res) => {
  const allFocuses = Focus.getAll();
  res.json(allFocuses);
});

// Get focus by ID
router.get('/:id', (req, res) => {
  const focus = Focus.findById(parseInt(req.params.id));
  if (!focus) {
    return res.status(404).json({ error: 'Focus not found' });
  }
  res.json(focus);
});

// Create new focus period
router.post('/', (req, res) => {
  const { name, description, startDate, endDate, primaryProduct, secondaryProducts, objective, productAllocation, targetMetrics } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Focus name is required' });
  }

  const focus = Focus.create({
    name,
    description,
    startDate,
    endDate,
    primaryProduct,
    secondaryProducts: secondaryProducts || [],
    objective,
    productAllocation: productAllocation || {},
    targetMetrics: targetMetrics || {}
  });

  res.status(201).json(focus);
});

// Update focus
router.put('/:id', (req, res) => {
  const focus = Focus.update(parseInt(req.params.id), req.body);
  if (!focus) {
    return res.status(404).json({ error: 'Focus not found' });
  }
  res.json(focus);
});

// Set focus as active
router.put('/:id/activate', (req, res) => {
  const focus = Focus.setActive(parseInt(req.params.id));
  if (!focus) {
    return res.status(404).json({ error: 'Focus not found' });
  }
  res.json({ message: 'Focus activated', focus });
});

// Update product allocation weights
router.put('/:id/allocate', (req, res) => {
  const { productAllocation } = req.body;

  // Validate that allocations sum to 100
  const total = Object.values(productAllocation || {}).reduce((sum, val) => sum + val, 0);
  if (total !== 100) {
    return res.status(400).json({ error: 'Product allocations must sum to 100%' });
  }

  const focus = Focus.update(parseInt(req.params.id), { productAllocation });
  if (!focus) {
    return res.status(404).json({ error: 'Focus not found' });
  }
  res.json(focus);
});

// Delete focus
router.delete('/:id', (req, res) => {
  const deleted = Focus.delete(parseInt(req.params.id));
  if (!deleted) {
    return res.status(404).json({ error: 'Focus not found' });
  }
  res.json({ message: 'Focus deleted' });
});

export default router;
