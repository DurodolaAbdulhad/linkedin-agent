import express from 'express';
import { AutomationExecutor } from '../services/AutomationExecutor.js';
import { CampaignAutomation } from '../models/CampaignAutomation.js';
import { Event } from '../models/Event.js';

const router = express.Router();

// Execute automations for a specific event
router.post('/event/:eventId', async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const result = await AutomationExecutor.executeAutomationsForEvent(eventId);

    if (result.error) {
      return res.status(404).json(result);
    }

    res.json({
      success: true,
      eventId,
      rulesEvaluated: result.rulesEvaluated,
      rulesExecuted: result.rulesExecuted,
      executedRules: result.executedRules,
      failedRules: result.failedRules,
      message: `Processed ${result.rulesExecuted} automation rules`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Execute automations for all recent events in a campaign
router.post('/campaign/:campaignId/recent', async (req, res) => {
  try {
    const campaignId = parseInt(req.params.campaignId);
    const hoursBack = parseInt(req.query.hours) || 24;

    const recentEvents = Event.getRecentEvents(campaignId, hoursBack);

    if (recentEvents.length === 0) {
      return res.json({
        success: true,
        campaignId,
        message: 'No recent events to process',
        eventsProcessed: 0
      });
    }

    const results = [];
    for (const event of recentEvents) {
      if (!event.processedAt) {
        const result = await AutomationExecutor.executeAutomationsForEvent(event._id);
        results.push(result);
      }
    }

    res.json({
      success: true,
      campaignId,
      eventsProcessed: results.length,
      totalRulesExecuted: results.reduce((sum, r) => sum + r.rulesExecuted, 0),
      results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Execute all pending automations
router.post('/pending/execute', async (req, res) => {
  try {
    const result = await AutomationExecutor.executePendingAutomations();

    res.json({
      success: true,
      message: `Executed ${result.executed} automations`,
      totalPending: result.totalPending,
      executed: result.executed,
      failed: result.failed,
      results: result.results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get automation execution stats
router.get('/stats/campaign/:campaignId', (req, res) => {
  try {
    const campaignId = parseInt(req.params.campaignId);
    const automations = CampaignAutomation.findByCampaignId(campaignId);

    const stats = {
      total: automations.length,
      pending: automations.filter(a => a.status === 'pending').length,
      executing: automations.filter(a => a.status === 'executing').length,
      completed: automations.filter(a => a.status === 'completed').length,
      failed: automations.filter(a => a.status === 'failed').length,
      successRate: automations.length > 0
        ? ((automations.filter(a => a.status === 'completed').length / automations.length) * 100).toFixed(2) + '%'
        : 'N/A'
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Retry failed automation
router.post('/:automationId/retry', async (req, res) => {
  try {
    const automationId = parseInt(req.params.automationId);
    const automation = CampaignAutomation.findById(automationId);

    if (!automation) {
      return res.status(404).json({ error: 'Automation not found' });
    }

    if (automation.status !== 'failed') {
      return res.status(400).json({ error: 'Can only retry failed automations' });
    }

    // Reset to pending for retry
    automation.status = 'pending';
    automation.retryCount = (automation.retryCount || 0) + 1;
    automation.scheduledFor = new Date().toISOString();

    res.json({
      success: true,
      message: `Automation scheduled for retry (attempt ${automation.retryCount})`,
      automationId,
      scheduledFor: automation.scheduledFor
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get automation execution details
router.get('/:automationId/details', (req, res) => {
  try {
    const automationId = parseInt(req.params.automationId);
    const automation = CampaignAutomation.findById(automationId);

    if (!automation) {
      return res.status(404).json({ error: 'Automation not found' });
    }

    res.json({
      _id: automation._id,
      campaignId: automation.campaignId,
      ruleId: automation.ruleId,
      status: automation.status,
      executedActions: automation.executedActions,
      failureReason: automation.failureReason,
      retryCount: automation.retryCount,
      results: automation.results,
      scheduledFor: automation.scheduledFor,
      executedAt: automation.executedAt,
      completedAt: automation.completedAt,
      createdAt: automation.createdAt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recent automation activity (for dashboard)
router.get('/activity/recent', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const allAutomations = CampaignAutomation.getAll();

    const recent = allAutomations
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit)
      .map(a => ({
        _id: a._id,
        campaignId: a.campaignId,
        ruleId: a.ruleId,
        status: a.status,
        actionsCount: a.executedActions.length,
        createdAt: a.createdAt,
        completedAt: a.completedAt
      }));

    res.json({
      total: allAutomations.length,
      recent: recent,
      summary: {
        completed: allAutomations.filter(a => a.status === 'completed').length,
        failed: allAutomations.filter(a => a.status === 'failed').length,
        pending: allAutomations.filter(a => a.status === 'pending').length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
