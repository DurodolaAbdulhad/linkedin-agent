import express from 'express';
import {
  createSocialProfile,
  getSocialProfiles,
  getSocialProfilesByMainProfile,
  createTwitterDM,
  getTwitterDMsByCampaign,
  updateTwitterDM,
} from '../models/SocialProfile.js';
import { generateTwitterMessage, getTwitterEngagementStrategy } from '../utils/twitterLLM.js';
import {
  getCampaignById,
  updateCampaignStage,
  addReplyToCampaign,
  DRIP_STAGES,
} from '../models/DripCampaign.js';
import { getAllProfiles } from '../services/AppwriteService.js';

const router = express.Router();

// GET all social profiles
router.get('/profiles', (req, res) => {
  res.json(getSocialProfiles());
});

// POST add Twitter profile to prospect
router.post('/profiles', (req, res) => {
  try {
    const { mainProfileId, handle, url = null } = req.body;

    if (!mainProfileId || !handle) {
      return res.status(400).json({ error: 'mainProfileId and handle required' });
    }

    const profile = createSocialProfile(mainProfileId, 'Twitter', handle, url);
    res.status(201).json(profile);
  } catch (error) {
    console.error('Error creating social profile:', error);
    res.status(500).json({ error: 'Failed to create social profile' });
  }
});

// GET Twitter profiles for a prospect
router.get('/profiles/:mainProfileId', (req, res) => {
  const profiles = getSocialProfilesByMainProfile(req.params.mainProfileId);
  res.json(profiles);
});

// POST generate Twitter message for campaign stage
router.post('/message/:campaignId', async (req, res) => {
  try {
    const campaign = getCampaignById(req.params.campaignId);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    const { stage, messageType = 'direct', twitterHandle } = req.body;

    if (!stage || !twitterHandle) {
      return res.status(400).json({ error: 'stage and twitterHandle required' });
    }

    // Get latest reply if exists
    const latestReply = campaign.replies.length > 0 ? campaign.replies[campaign.replies.length - 1].text : null;

    // Generate Twitter message
    const message = await generateTwitterMessage(stage, campaign.profileData, messageType, latestReply);

    // Create Twitter DM record
    const dm = createTwitterDM(campaign._id, twitterHandle, message, messageType);

    // Get engagement strategy for this stage
    const strategy = getTwitterEngagementStrategy(stage, messageType);

    res.json({
      stage,
      stageName: DRIP_STAGES[Object.keys(DRIP_STAGES)[stage - 1]].name,
      messageType,
      strategy,
      message,
      charCount: message.length,
      dm,
    });
  } catch (error) {
    console.error('Error generating Twitter message:', error);
    res.status(500).json({ error: 'Failed to generate Twitter message' });
  }
});

// POST send Twitter message
router.post('/send/:dmId', async (req, res) => {
  try {
    const dm = updateTwitterDM(req.params.dmId, {
      status: 'sent',
      sentAt: new Date(),
    });

    if (!dm) return res.status(404).json({ error: 'DM not found' });

    res.json({
      dm,
      message: `Twitter ${dm.type === 'direct' ? 'DM' : 'reply'} sent to ${dm.twitterHandle}`,
    });
  } catch (error) {
    console.error('Error sending Twitter message:', error);
    res.status(500).json({ error: 'Failed to send Twitter message' });
  }
});

// GET Twitter DMs for campaign
router.get('/dms/campaign/:campaignId', (req, res) => {
  const dms = getTwitterDMsByCampaign(req.params.campaignId);
  res.json(dms);
});

// POST track Twitter reply/engagement
router.post('/reply/:campaignId', (req, res) => {
  try {
    const campaign = getCampaignById(req.params.campaignId);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    const { text, engagementType = 'reply' } = req.body; // reply, like, retweet, quote

    // Add to campaign replies
    addReplyToCampaign(campaign._id, {
      text,
      source: 'Twitter',
      engagementType,
    });

    res.json({
      reply: {
        text,
        engagementType,
        timestamp: new Date(),
      },
      campaign,
    });
  } catch (error) {
    console.error('Error tracking Twitter reply:', error);
    res.status(500).json({ error: 'Failed to track reply' });
  }
});

// POST create Twitter campaign (variant of LinkedIn campaign)
router.post('/campaigns', async (req, res) => {
  try {
    const { profileId, twitterHandle, messageType = 'direct' } = req.body;

    if (!profileId || !twitterHandle) {
      return res.status(400).json({ error: 'profileId and twitterHandle required' });
    }

    // Find profile
    const allProfiles = await getAllProfiles();
    const profile = allProfiles.find(p => p.$id == profileId || p._id == profileId);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    // Create social profile if doesn't exist
    const socialProfile = createSocialProfile(profileId, 'Twitter', twitterHandle);

    res.json({
      socialProfile,
      campaign: {
        profileId,
        platform: 'Twitter',
        messageType, // 'direct' or 'public_reply'
        handle: twitterHandle,
        stage: 1,
        ready: true,
      },
      message: `Twitter campaign ready for ${twitterHandle}. Message type: ${messageType}`,
    });
  } catch (error) {
    console.error('Error creating Twitter campaign:', error);
    res.status(500).json({ error: 'Failed to create Twitter campaign' });
  }
});

export default router;
