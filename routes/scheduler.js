import express from 'express';
import {
  scheduleMessage,
  getScheduledMessages,
  getScheduledMessagesByCampaign,
  getPendingMessages,
  sendScheduledMessage,
  cancelScheduledMessage,
  updateScheduledDate,
  STAGE_DELAYS,
} from '../utils/messageScheduler.js';
import { getCampaignById } from '../models/DripCampaign.js';

const router = express.Router();

// GET all scheduled messages
router.get('/', (req, res) => {
  res.json(getScheduledMessages());
});

// GET scheduled messages for campaign
router.get('/campaign/:campaignId', (req, res) => {
  const messages = getScheduledMessagesByCampaign(req.params.campaignId);
  res.json(messages);
});

// GET pending messages (ready to send)
router.get('/pending', (req, res) => {
  const pending = getPendingMessages();
  res.json({
    count: pending.length,
    messages: pending,
  });
});

// POST schedule message for campaign
router.post('/', (req, res) => {
  try {
    const { campaignId, stage, platform = 'LinkedIn' } = req.body;

    if (!campaignId || !stage) {
      return res.status(400).json({ error: 'campaignId and stage required' });
    }

    const campaign = getCampaignById(campaignId);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    const job = scheduleMessage(campaignId, stage, platform);

    res.status(201).json({
      job,
      delayDays: STAGE_DELAYS[stage],
      message: `Message scheduled for stage ${stage} in ${STAGE_DELAYS[stage]} days`,
    });
  } catch (error) {
    console.error('Scheduling error:', error);
    res.status(500).json({ error: 'Failed to schedule message' });
  }
});

// POST schedule entire campaign (all 7 stages)
router.post('/campaign/:campaignId/schedule-all', (req, res) => {
  try {
    const campaign = getCampaignById(req.params.campaignId);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    const platform = req.body.platform || 'LinkedIn';
    const jobs = [];

    // Schedule all 7 stages
    for (let stage = 1; stage <= 7; stage++) {
      const job = scheduleMessage(campaign._id, stage, platform);
      jobs.push(job);
    }

    res.json({
      campaign: campaign._id,
      platform,
      jobs,
      message: `Scheduled all 7 stages for campaign ${campaign._id}`,
      totalDays: 14, // Stage 7 is 14 days out
    });
  } catch (error) {
    console.error('Campaign scheduling error:', error);
    res.status(500).json({ error: 'Failed to schedule campaign' });
  }
});

// POST send scheduled message now
router.post('/:jobId/send', async (req, res) => {
  try {
    const result = await sendScheduledMessage(req.params.jobId);
    if (!result) return res.status(404).json({ error: 'Scheduled message not found' });

    res.json({
      job: result.job,
      message: result.messageText,
      campaign: result.campaign._id,
      nextStageScheduled: result.nextStageScheduled,
    });
  } catch (error) {
    console.error('Send error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// POST cancel scheduled message
router.post('/:jobId/cancel', (req, res) => {
  const job = cancelScheduledMessage(req.params.jobId);
  if (!job) return res.status(404).json({ error: 'Scheduled message not found' });

  res.json({
    job,
    message: 'Message cancelled',
  });
});

// PUT reschedule message
router.put('/:jobId/reschedule', (req, res) => {
  try {
    const { newDate } = req.body;
    if (!newDate) return res.status(400).json({ error: 'newDate required' });

    const job = updateScheduledDate(req.params.jobId, new Date(newDate));
    if (!job) return res.status(404).json({ error: 'Scheduled message not found' });

    res.json({
      job,
      message: 'Message rescheduled',
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reschedule message' });
  }
});

export default router;
