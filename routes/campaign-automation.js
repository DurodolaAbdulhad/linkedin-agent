import express from 'express';
import { CampaignAutomation } from '../models/CampaignAutomation.js';

const router = express.Router();

// Get all campaign automations
router.get('/', (req, res) => {
  const allAutomations = CampaignAutomation.getAll();
  res.json(allAutomations);
});

// Get automations by campaign
router.get('/campaign/:campaignId', (req, res) => {
  const automations = CampaignAutomation.findByCampaignId(parseInt(req.params.campaignId));
  res.json(automations);
});

// Get automation stats for campaign
router.get('/campaign/:campaignId/stats', (req, res) => {
  const stats = CampaignAutomation.getStats(parseInt(req.params.campaignId));
  res.json(stats);
});

// Get automations by rule
router.get('/rule/:ruleId', (req, res) => {
  const automations = CampaignAutomation.findByRuleId(parseInt(req.params.ruleId));
  res.json(automations);
});

// Get pending automations
router.get('/status/pending', (req, res) => {
  const pending = CampaignAutomation.findPending();
  res.json(pending);
});

// Get pending automations for campaign
router.get('/campaign/:campaignId/pending', (req, res) => {
  const pending = CampaignAutomation.findPendingByCampaign(parseInt(req.params.campaignId));
  res.json(pending);
});

// Get single automation
router.get('/:id', (req, res) => {
  const automation = CampaignAutomation.findById(parseInt(req.params.id));
  if (!automation) {
    return res.status(404).json({ error: 'Automation not found' });
  }
  res.json(automation);
});

// Schedule an automation execution
router.post('/', (req, res) => {
  const { campaignId, ruleId, eventId, scheduledFor } = req.body;

  if (!campaignId || !ruleId) {
    return res.status(400).json({ error: 'campaignId and ruleId are required' });
  }

  const automation = CampaignAutomation.create({
    campaignId,
    ruleId,
    eventId,
    scheduledFor: scheduledFor || new Date().toISOString()
  });

  res.status(201).json(automation);
});

// Mark automation as executing
router.put('/:id/execute', (req, res) => {
  const automation = CampaignAutomation.markExecuting(parseInt(req.params.id));
  if (!automation) {
    return res.status(404).json({ error: 'Automation not found' });
  }
  res.json(automation);
});

// Mark automation as completed
router.put('/:id/completed', (req, res) => {
  const { results } = req.body;
  const automation = CampaignAutomation.markCompleted(parseInt(req.params.id), results || {});
  if (!automation) {
    return res.status(404).json({ error: 'Automation not found' });
  }
  res.json(automation);
});

// Mark automation as failed
router.put('/:id/failed', (req, res) => {
  const { reason } = req.body;
  const automation = CampaignAutomation.markFailed(parseInt(req.params.id), reason);
  if (!automation) {
    return res.status(404).json({ error: 'Automation not found' });
  }
  res.json(automation);
});

// Record action execution
router.post('/:id/action', (req, res) => {
  const { actionType, actionResult } = req.body;
  if (!actionType) {
    return res.status(400).json({ error: 'actionType is required' });
  }

  const automation = CampaignAutomation.recordAction(parseInt(req.params.id), actionType, actionResult);
  if (!automation) {
    return res.status(404).json({ error: 'Automation not found' });
  }
  res.json(automation);
});

// Delete automation
router.delete('/:id', (req, res) => {
  const deleted = CampaignAutomation.delete(parseInt(req.params.id));
  if (!deleted) {
    return res.status(404).json({ error: 'Automation not found' });
  }
  res.json({ message: 'Automation deleted' });
});

export default router;
