import express from 'express';
import { Offer } from '../models/Offer.js';

const router = express.Router();

// Get all offers
router.get('/', (req, res) => {
  const allOffers = Offer.getAll();
  res.json(allOffers);
});

// Get offers by product
router.get('/product/:productId', (req, res) => {
  const offers = Offer.findByProductId(parseInt(req.params.productId));
  res.json(offers);
});

// Get active offers by product
router.get('/product/:productId/active', (req, res) => {
  const offers = Offer.findActiveByProductId(parseInt(req.params.productId));
  res.json(offers);
});

// Get offer by ID
router.get('/:id', (req, res) => {
  const offer = Offer.findById(parseInt(req.params.id));
  if (!offer) {
    return res.status(404).json({ error: 'Offer not found' });
  }
  res.json(offer);
});

// Create new offer
router.post('/', (req, res) => {
  const { productId, name, description, price, currency, funnelStage, cta, ctaUrl, expectedConversionRate } = req.body;

  if (!productId || !name) {
    return res.status(400).json({ error: 'Product ID and offer name are required' });
  }

  const offer = Offer.create({
    productId,
    name,
    description,
    price,
    currency,
    funnelStage,
    cta,
    ctaUrl,
    expectedConversionRate
  });

  res.status(201).json(offer);
});

// Update offer
router.put('/:id', (req, res) => {
  const offer = Offer.update(parseInt(req.params.id), req.body);
  if (!offer) {
    return res.status(404).json({ error: 'Offer not found' });
  }
  res.json(offer);
});

// Record a conversion for an offer
router.post('/:id/conversion', (req, res) => {
  const offer = Offer.recordConversion(parseInt(req.params.id));
  if (!offer) {
    return res.status(404).json({ error: 'Offer not found' });
  }
  res.json({ message: 'Conversion recorded', offer });
});

// Delete offer
router.delete('/:id', (req, res) => {
  const deleted = Offer.delete(parseInt(req.params.id));
  if (!deleted) {
    return res.status(404).json({ error: 'Offer not found' });
  }
  res.json({ message: 'Offer deleted' });
});

export default router;
