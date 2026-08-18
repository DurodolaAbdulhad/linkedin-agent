import express from 'express';
import {
  createResource,
  getResources,
  getResourcesByPainPoint,
  getResourcesByCategory,
  getResourcesByType,
  updateResource,
  deleteResource,
  suggestResourceForProspect,
} from '../models/Resource.js';

const router = express.Router();

// GET all resources
router.get('/', (req, res) => {
  res.json(getResources());
});

// GET resources by pain point
router.get('/pain-point/:painPoint', (req, res) => {
  const resources = getResourcesByPainPoint(req.params.painPoint);
  res.json(resources);
});

// GET resources by category
router.get('/category/:category', (req, res) => {
  const resources = getResourcesByCategory(req.params.category);
  res.json(resources);
});

// GET resources by type (ebook, event, newsletter, product)
router.get('/type/:type', (req, res) => {
  const resources = getResourcesByType(req.params.type);
  res.json(resources);
});

// GET suggested resource for prospect
router.get('/suggest/:painPoint', (req, res) => {
  const resource = suggestResourceForProspect(req.params.painPoint);
  if (!resource) return res.status(404).json({ error: 'No resources for this pain point' });
  res.json(resource);
});

// POST create new resource
router.post('/', (req, res) => {
  try {
    const { name, type, price, url, category, painPoints, description } = req.body;

    if (!name || !type || !url || !category) {
      return res.status(400).json({ error: 'name, type, url, category required' });
    }

    const resource = createResource({
      name,
      type, // ebook, newsletter, event, product, webinar, etc
      price, // free or paid
      url,
      category, // Ascent Learn, Ascent Finance, etc
      painPoints: painPoints || [],
      description: description || '',
    });

    res.status(201).json(resource);
  } catch (error) {
    console.error('Resource creation error:', error);
    res.status(500).json({ error: 'Failed to create resource' });
  }
});

// PUT update resource
router.put('/:id', (req, res) => {
  try {
    const resource = updateResource(req.params.id, req.body);
    if (!resource) return res.status(404).json({ error: 'Resource not found' });
    res.json(resource);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update resource' });
  }
});

// DELETE resource
router.delete('/:id', (req, res) => {
  try {
    const resource = deleteResource(req.params.id);
    if (!resource) return res.status(404).json({ error: 'Resource not found' });
    res.json({ message: 'Resource deleted', resource });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete resource' });
  }
});

export default router;
