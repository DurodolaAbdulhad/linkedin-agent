import express from 'express';
import { AudienceResource } from '../models/AudienceResource.js';

const router = express.Router();

// Get all audience resource mappings
router.get('/', (req, res) => {
  const mappings = AudienceResource.getAll();
  res.json(mappings);
});

// Get resource mappings for a product + audience
router.get('/product/:productId/audience/:audienceId', (req, res) => {
  const mappings = AudienceResource.findByProductAndAudience(
    parseInt(req.params.productId),
    parseInt(req.params.audienceId)
  );
  res.json(mappings);
});

// Get resource mappings by funnel stage
router.get('/product/:productId/audience/:audienceId/stage/:stage', (req, res) => {
  const mappings = AudienceResource.findByFunnelStage(
    parseInt(req.params.productId),
    parseInt(req.params.audienceId),
    req.params.stage
  );
  res.json(mappings);
});

// Get resource mappings by pain point
router.get('/product/:productId/audience/:audienceId/pain/:painPoint', (req, res) => {
  const mappings = AudienceResource.findByProductAudiencePain(
    parseInt(req.params.productId),
    parseInt(req.params.audienceId),
    decodeURIComponent(req.params.painPoint)
  );
  res.json(mappings);
});

// Get single mapping by ID
router.get('/:id', (req, res) => {
  const mapping = AudienceResource.findById(parseInt(req.params.id));
  if (!mapping) {
    return res.status(404).json({ error: 'Mapping not found' });
  }
  res.json(mapping);
});

// Create new audience resource mapping
router.post('/', (req, res) => {
  const { productId, audienceId, resourceId, painPoint, funnelStage, priority, sequence, triggerEvent } = req.body;

  if (!productId || !audienceId || !resourceId) {
    return res.status(400).json({ error: 'Product ID, audience ID, and resource ID are required' });
  }

  const mapping = AudienceResource.create({
    productId,
    audienceId,
    resourceId,
    painPoint,
    funnelStage,
    priority,
    sequence,
    triggerEvent
  });

  res.status(201).json(mapping);
});

// Update mapping
router.put('/:id', (req, res) => {
  const mapping = AudienceResource.update(parseInt(req.params.id), req.body);
  if (!mapping) {
    return res.status(404).json({ error: 'Mapping not found' });
  }
  res.json(mapping);
});

// Delete mapping
router.delete('/:id', (req, res) => {
  const deleted = AudienceResource.delete(parseInt(req.params.id));
  if (!deleted) {
    return res.status(404).json({ error: 'Mapping not found' });
  }
  res.json({ message: 'Mapping deleted' });
});

export default router;
