import express from 'express';
import { CampaignAnalytics } from '../services/CampaignAnalytics.js';
import { ChannelOrchestrator } from '../services/ChannelOrchestrator.js';
import { Conversion } from '../models/ConversionTracker.js';

const router = express.Router();

// Get dashboard metrics (all campaigns)
router.get('/dashboard', (req, res) => {
  try {
    const metrics = CampaignAnalytics.getDashboardMetrics();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get campaign metrics
router.get('/campaign/:campaignId', (req, res) => {
  try {
    const campaignId = parseInt(req.params.campaignId);
    const metrics = CampaignAnalytics.getCampaignMetrics(campaignId);

    if (!metrics) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get funnel analytics
router.get('/funnel', (req, res) => {
  try {
    const funnelData = CampaignAnalytics.getFunnelAnalytics();
    res.json(funnelData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get channel performance
router.get('/channels', (req, res) => {
  try {
    const channelPerformance = CampaignAnalytics.getChannelPerformance();
    res.json(channelPerformance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get automation ROI
router.get('/automation-roi', (req, res) => {
  try {
    const roi = CampaignAnalytics.getAutomationROI();
    res.json(roi);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Log a conversion
router.post('/conversions', (req, res) => {
  try {
    const { campaignId, profileId, type, dealValue, currency, meetingDate, notes } = req.body;

    if (!campaignId || !profileId || !type) {
      return res.status(400).json({ error: 'campaignId, profileId, and type are required' });
    }

    const conversion = Conversion.create({
      campaignId,
      profileId,
      type,
      dealValue: dealValue || 0,
      currency: currency || 'NGN',
      meetingDate,
      meetingNotes: notes || '',
      source: 'manual',
      status: 'confirmed'
    });

    res.status(201).json({
      success: true,
      message: `Conversion logged: ${type}`,
      conversion
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get conversions by campaign
router.get('/conversions/campaign/:campaignId', (req, res) => {
  try {
    const campaignId = parseInt(req.params.campaignId);
    const conversions = Conversion.findByCampaignId(campaignId);
    res.json(conversions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all conversions
router.get('/conversions', (req, res) => {
  try {
    const conversions = Conversion.getAll();
    res.json(conversions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get optimal channel for audience
router.get('/channel/optimal/:audienceId', (req, res) => {
  try {
    const audienceId = parseInt(req.params.audienceId);
    const channels = ChannelOrchestrator.getOptimalChannelForAudience(audienceId);
    res.json({ audienceId, optimalChannels: channels });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get channel sequence for funnel stage
router.get('/channel/sequence/:audienceId/:stage', (req, res) => {
  try {
    const audienceId = parseInt(req.params.audienceId);
    const stage = req.params.stage;
    const sequence = ChannelOrchestrator.getOptimalChannelSequence(audienceId, stage);
    res.json({ audienceId, stage, sequence });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get message frequency for stage
router.get('/frequency/:stage', (req, res) => {
  try {
    const stage = req.params.stage;
    const daysInStage = parseInt(req.query.daysInStage) || 0;
    const frequency = ChannelOrchestrator.calculateMessageFrequency(stage, daysInStage);
    res.json({ stage, daysInStage, frequency });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get real-time metrics summary
router.get('/summary', (req, res) => {
  try {
    const dashboard = CampaignAnalytics.getDashboardMetrics();
    const funnelData = CampaignAnalytics.getFunnelAnalytics();
    const channelPerformance = CampaignAnalytics.getChannelPerformance();
    const automationROI = CampaignAnalytics.getAutomationROI();

    res.json({
      timestamp: new Date().toISOString(),
      campaigns: dashboard.campaignMetrics,
      pipeline: dashboard.prospectMetrics,
      conversions: dashboard.conversionMetrics,
      automations: dashboard.automationMetrics,
      funnel: funnelData,
      channels: channelPerformance,
      roi: automationROI
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
