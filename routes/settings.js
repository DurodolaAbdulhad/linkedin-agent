import express from 'express';
import {
  getSettings,
  updateICP,
  updatePainPoints,
  addPainPoint,
  removePainPoint,
  updateCampaignDefaults,
  addCategory,
  getCategories,
  getPainPoints,
  getICP,
} from '../models/Settings.js';

const router = express.Router();

// GET all settings
router.get('/', (req, res) => {
  res.json(getSettings());
});

// GET ICP settings
router.get('/icp', (req, res) => {
  res.json(getICP());
});

// PUT update ICP
router.put('/icp', (req, res) => {
  try {
    const icp = updateICP(req.body);
    res.json(icp);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update ICP' });
  }
});

// GET pain points
router.get('/pain-points', (req, res) => {
  res.json(getPainPoints());
});

// PUT update all pain points
router.put('/pain-points', (req, res) => {
  try {
    const { painPoints } = req.body;
    if (!Array.isArray(painPoints)) {
      return res.status(400).json({ error: 'painPoints must be an array' });
    }
    const updated = updatePainPoints(painPoints);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update pain points' });
  }
});

// POST add pain point
router.post('/pain-points', (req, res) => {
  try {
    const { painPoint } = req.body;
    if (!painPoint) return res.status(400).json({ error: 'painPoint required' });
    const updated = addPainPoint(painPoint);
    res.json({ painPoints: updated, message: `Added pain point: ${painPoint}` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add pain point' });
  }
});

// DELETE pain point
router.delete('/pain-points/:painPoint', (req, res) => {
  try {
    const updated = removePainPoint(req.params.painPoint);
    res.json({ painPoints: updated, message: `Removed pain point: ${req.params.painPoint}` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove pain point' });
  }
});

// GET categories
router.get('/categories', (req, res) => {
  res.json(getCategories());
});

// POST add category
router.post('/categories', (req, res) => {
  try {
    const { category } = req.body;
    if (!category) return res.status(400).json({ error: 'category required' });
    const updated = addCategory(category);
    res.json({ categories: updated, message: `Added category: ${category}` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add category' });
  }
});

// GET campaign defaults
router.get('/campaign-defaults', (req, res) => {
  const { getCampaignDefaults } = require('../models/Settings.js');
  res.json(getCampaignDefaults());
});

// PUT update campaign defaults
router.put('/campaign-defaults', (req, res) => {
  try {
    const defaults = updateCampaignDefaults(req.body);
    res.json(defaults);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update campaign defaults' });
  }
});

export default router;
