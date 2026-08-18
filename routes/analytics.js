import express from 'express';
import {
  createConversion,
  getConversions,
  getConversionsByCampaign,
  getCampaignMetrics,
  updateConversion,
} from '../models/Conversion.js';
import { getCampaigns, getCampaignById } from '../models/DripCampaign.js';
import { getScheduledMessagesByCampaign } from '../utils/messageScheduler.js';

const router = express.Router();

// GET all conversions
router.get('/conversions', (req, res) => {
  res.json(getConversions());
});

// POST new conversion (meeting booked, deal closed, etc)
router.post('/conversions', (req, res) => {
  try {
    const { campaignId, profileId, type, details } = req.body;

    if (!campaignId || !profileId || !type) {
      return res.status(400).json({ error: 'campaignId, profileId, type required' });
    }

    const conversion = createConversion(campaignId, profileId, type, details);
    res.status(201).json(conversion);
  } catch (error) {
    console.error('Conversion creation error:', error);
    res.status(500).json({ error: 'Failed to create conversion' });
  }
});

// GET conversions for campaign
router.get('/conversions/campaign/:campaignId', (req, res) => {
  const conversions = getConversionsByCampaign(req.params.campaignId);
  res.json(conversions);
});

// PUT update conversion
router.put('/conversions/:id', (req, res) => {
  try {
    const conversion = updateConversion(req.params.id, req.body);
    if (!conversion) return res.status(404).json({ error: 'Conversion not found' });
    res.json(conversion);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update conversion' });
  }
});

// GET campaign metrics/analytics
router.get('/campaigns/:campaignId/metrics', (req, res) => {
  try {
    const campaign = getCampaignById(req.params.campaignId);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    const metrics = getCampaignMetrics(req.params.campaignId);
    const scheduledMessages = getScheduledMessagesByCampaign(req.params.campaignId);

    res.json({
      campaign: {
        id: campaign._id,
        profile: campaign.profileData.name,
        platform: campaign.platform,
        currentStage: campaign.currentStage,
        status: campaign.status,
        icpScore: campaign.icpScore,
        createdAt: campaign.createdAt,
      },
      metrics,
      scheduled: {
        totalScheduled: scheduledMessages.length,
        pending: scheduledMessages.filter(m => m.status === 'scheduled').length,
        sent: scheduledMessages.filter(m => m.status === 'sent').length,
        failed: scheduledMessages.filter(m => m.status === 'failed').length,
        messages: scheduledMessages,
      },
      conversions: metrics.details,
    });
  } catch (error) {
    console.error('Metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// GET dashboard overview
router.get('/dashboard', (req, res) => {
  try {
    const campaigns = getCampaigns();
    const conversions = getConversions();

    const totalMetrics = {
      campaigns: campaigns.length,
      activeCampaigns: campaigns.filter(c => c.status === 'active').length,
      totalConversions: conversions.length,
      totalMeetings: conversions.filter(c => c.type === 'meeting_booked').length,
      totalDeals: conversions.filter(c => c.status === 'won').length,
      totalRevenue: conversions.reduce((sum, c) => sum + (c.value || 0), 0),
      averageDealSize: conversions.length > 0
        ? conversions.reduce((sum, c) => sum + (c.amount || 0), 0) / conversions.length
        : 0,
    };

    // Campaign breakdown
    const campaignMetrics = campaigns.map(campaign => ({
      id: campaign._id,
      profile: campaign.profileData.name,
      stage: campaign.currentStage,
      metrics: getCampaignMetrics(campaign._id),
    }));

    res.json({
      summary: totalMetrics,
      campaigns: campaignMetrics,
      conversions,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
});

export default router;
