import express from 'express';
import {
  createDripCampaign,
  getCampaigns,
  getCampaignById,
  getCampaignsByProfile,
  updateCampaignStage,
  addReplyToCampaign,
  DRIP_STAGES,
} from '../models/DripCampaign.js';
import { generateStagedDM, analyzeSentiment, calculateNextMessageDelay } from '../utils/stageLLM.js';
import { scoreProspectAgainstICP } from '../models/ICP.js';
import { profiles } from './profiles.js';

const router = express.Router();

// GET all campaigns
router.get('/', (req, res) => {
  res.json(getCampaigns());
});

// GET campaign by ID
router.get('/:id', (req, res) => {
  const campaign = getCampaignById(req.params.id);
  if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
  res.json(campaign);
});

// GET campaigns by profile
router.get('/profile/:profileId', (req, res) => {
  const campaigns = getCampaignsByProfile(req.params.profileId);
  res.json(campaigns);
});

// POST create new drip campaign (with ICP check)
router.post('/', async (req, res) => {
  try {
    const { profileId, platform = 'LinkedIn' } = req.body;

    // Find profile
    const profile = profiles.find(p => p._id == profileId);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    // Score against ICP
    const icpScore = scoreProspectAgainstICP(profile);
    console.log(`ICP Score for ${profile.name}: ${icpScore.score} (${icpScore.fitLevel})`);

    // Create campaign
    const campaign = createDripCampaign(profileId, profile, platform, icpScore.score);

    // Generate Stage 1 message immediately
    try {
      const stage1Message = await generateStagedDM(1, profile);
      campaign.messages[0] = {
        stage: 1,
        message: stage1Message,
        generatedAt: new Date(),
      };
    } catch (error) {
      console.error('Error generating Stage 1 message:', error.message);
      campaign.messages[0] = {
        stage: 1,
        message: `Hey ${profile.name}! I noticed you're the ${profile.title} at ${profile.company}. Would love to connect.`,
      };
    }

    res.status(201).json({
      campaign,
      icpScore,
      message: `Campaign created for ${profile.name} (ICP Fit: ${icpScore.fitLevel})`,
    });
  } catch (error) {
    console.error('Campaign creation error:', error);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

// POST generate next stage message
router.post('/:campaignId/next-message', async (req, res) => {
  try {
    const campaign = getCampaignById(req.params.campaignId);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    const nextStage = campaign.currentStage + 1;
    if (nextStage > 7) {
      return res.status(400).json({ error: 'Campaign completed - no more stages' });
    }

    // Get latest reply if exists
    const latestReply = campaign.replies.length > 0 ? campaign.replies[campaign.replies.length - 1].text : null;

    // Generate message for next stage
    const message = await generateStagedDM(nextStage, campaign.profileData, latestReply);

    campaign.messages[nextStage - 1] = {
      stage: nextStage,
      message,
      generatedAt: new Date(),
    };

    updateCampaignStage(campaign._id, nextStage);

    res.json({
      stage: nextStage,
      stageName: DRIP_STAGES[Object.keys(DRIP_STAGES)[nextStage - 1]].name,
      message,
      campaign,
    });
  } catch (error) {
    console.error('Error generating next message:', error);
    res.status(500).json({ error: 'Failed to generate message' });
  }
});

// POST add reply to campaign
router.post('/:campaignId/reply', (req, res) => {
  try {
    const campaign = getCampaignById(req.params.campaignId);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    const { text, source = 'LinkedIn' } = req.body;

    // Analyze sentiment
    const sentiment = analyzeSentiment(text);

    // Add reply
    addReplyToCampaign(campaign._id, { text, source, sentiment });

    // Calculate when to send next message
    const delayDays = calculateNextMessageDelay(sentiment, campaign.currentStage);

    res.json({
      reply: {
        text,
        sentiment,
        timestamp: new Date(),
      },
      nextMessageIn: delayDays ? `${delayDays} days` : 'Campaign paused',
      shouldContinue: delayDays !== null,
    });
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({ error: 'Failed to add reply' });
  }
});

// POST send campaign message
router.post('/:campaignId/send/:stage', async (req, res) => {
  try {
    const campaign = getCampaignById(req.params.campaignId);
    const stage = parseInt(req.params.stage);

    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    if (stage < 1 || stage > 7) return res.status(400).json({ error: 'Invalid stage' });

    const message = campaign.messages[stage - 1];
    if (!message) return res.status(400).json({ error: 'Message not generated for this stage' });

    // Mark as sent
    const scheduledMsg = campaign.scheduledMessages.find(m => m.stage === stage);
    if (scheduledMsg) {
      scheduledMsg.sent = true;
      scheduledMsg.sentDate = new Date();
    }

    res.json({
      stage,
      message: message.message,
      sentAt: new Date(),
      campaign,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;
