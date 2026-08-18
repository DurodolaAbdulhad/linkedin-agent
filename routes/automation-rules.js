import express from 'express';
import { AutomationRule } from '../models/AutomationRule.js';

const router = express.Router();

// Get all automation rules
router.get('/', (req, res) => {
  const allRules = AutomationRule.getAll();
  res.json(allRules);
});

// Get rules by product
router.get('/product/:productId', (req, res) => {
  const rules = AutomationRule.findByProductId(parseInt(req.params.productId));
  res.json(rules);
});

// Get active rules by product
router.get('/product/:productId/active', (req, res) => {
  const rules = AutomationRule.findActiveByProductId(parseInt(req.params.productId));
  res.json(rules);
});

// Get rules by trigger event
router.get('/trigger/:triggerEvent', (req, res) => {
  const rules = AutomationRule.findByTriggerEvent(req.params.triggerEvent);
  res.json(rules);
});

// Get single rule
router.get('/:id', (req, res) => {
  const rule = AutomationRule.findById(parseInt(req.params.id));
  if (!rule) {
    return res.status(404).json({ error: 'Rule not found' });
  }
  res.json(rule);
});

// Create new automation rule
router.post('/', (req, res) => {
  const { productId, name, description, triggerEvent, conditions, actions, maxExecutionsPerCampaign } = req.body;

  if (!productId || !name || !triggerEvent) {
    return res.status(400).json({ error: 'productId, name, and triggerEvent are required' });
  }

  const rule = AutomationRule.create({
    productId,
    name,
    description,
    triggerEvent,
    conditions: conditions || [],
    actions: actions || [],
    maxExecutionsPerCampaign: maxExecutionsPerCampaign || 1
  });

  res.status(201).json(rule);
});

// Update rule
router.put('/:id', (req, res) => {
  const rule = AutomationRule.update(parseInt(req.params.id), req.body);
  if (!rule) {
    return res.status(404).json({ error: 'Rule not found' });
  }
  res.json(rule);
});

// Pause/activate rule
router.put('/:id/status', (req, res) => {
  const { status } = req.body;
  if (!status || !['active', 'paused', 'archived'].includes(status)) {
    return res.status(400).json({ error: 'Status must be one of: active, paused, archived' });
  }

  const rule = AutomationRule.update(parseInt(req.params.id), { status });
  if (!rule) {
    return res.status(404).json({ error: 'Rule not found' });
  }
  res.json(rule);
});

// Record execution
router.post('/:id/execution', (req, res) => {
  const { successful } = req.body;
  const rule = AutomationRule.recordExecution(parseInt(req.params.id), successful !== false);
  if (!rule) {
    return res.status(404).json({ error: 'Rule not found' });
  }
  res.json({
    message: 'Execution recorded',
    rule: {
      name: rule.name,
      totalExecutions: rule.totalExecutions,
      successfulExecutions: rule.successfulExecutions,
      failedExecutions: rule.failedExecutions
    }
  });
});

// Delete rule
router.delete('/:id', (req, res) => {
  const deleted = AutomationRule.delete(parseInt(req.params.id));
  if (!deleted) {
    return res.status(404).json({ error: 'Rule not found' });
  }
  res.json({ message: 'Rule deleted' });
});

export default router;
