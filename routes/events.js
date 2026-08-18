import express from 'express';
import { Event, EVENT_TYPES } from '../models/Event.js';
import { CampaignAutomation } from '../models/CampaignAutomation.js';

const router = express.Router();

// Get all events
router.get('/', (req, res) => {
  const allEvents = Event.getAll();
  res.json(allEvents);
});

// Get events by campaign
router.get('/campaign/:campaignId', (req, res) => {
  const events = Event.findByCampaignId(parseInt(req.params.campaignId));
  res.json(events);
});

// Get recent events for campaign (last 24 hours by default)
router.get('/campaign/:campaignId/recent', (req, res) => {
  const hoursBack = parseInt(req.query.hours) || 24;
  const events = Event.getRecentEvents(parseInt(req.params.campaignId), hoursBack);
  res.json(events);
});

// Get events by profile
router.get('/profile/:profileId', (req, res) => {
  const events = Event.findByProfileId(parseInt(req.params.profileId));
  res.json(events);
});

// Get events by type
router.get('/type/:type', (req, res) => {
  const events = Event.findByType(req.params.type);
  res.json(events);
});

// Get single event
router.get('/:id', (req, res) => {
  const event = Event.findById(parseInt(req.params.id));
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }
  res.json(event);
});

// Log a new event
router.post('/', (req, res) => {
  const { type, profileId, campaignId, description, sentiment, metadata } = req.body;

  if (!type || !profileId) {
    return res.status(400).json({ error: 'Type and profileId are required' });
  }

  if (!Object.values(EVENT_TYPES).includes(type)) {
    return res.status(400).json({ error: `Invalid event type. Must be one of: ${Object.values(EVENT_TYPES).join(', ')}` });
  }

  const event = Event.create({
    type,
    profileId,
    campaignId,
    description,
    sentiment,
    metadata
  });

  res.status(201).json(event);
});

// Log event with sentiment analysis
router.post('/reply', (req, res) => {
  const { campaignId, profileId, replyText, source } = req.body;

  if (!campaignId || !profileId || !replyText) {
    return res.status(400).json({ error: 'campaignId, profileId, and replyText are required' });
  }

  // Simple sentiment analysis (could be improved with NLP)
  const text = replyText.toLowerCase();
  let sentiment = 'neutral';
  let type = EVENT_TYPES.REPLY_RECEIVED;

  if (
    text.includes('yes') || text.includes('interested') || text.includes('sounds good') ||
    text.includes('perfect') || text.includes('great') || text.includes('love')
  ) {
    sentiment = 'positive';
    type = EVENT_TYPES.REPLY_POSITIVE;
  } else if (
    text.includes('no') || text.includes('not interested') || text.includes('too expensive') ||
    text.includes('don\'t need') || text.includes('pass') || text.includes('not now')
  ) {
    sentiment = 'negative';
    type = EVENT_TYPES.REPLY_NEGATIVE;
  } else if (
    text.includes('how') || text.includes('when') || text.includes('what') ||
    text.includes('cost') || text.includes('price') || text.includes('features')
  ) {
    sentiment = 'question';
    type = EVENT_TYPES.REPLY_QUESTION;
  } else if (
    text.includes('but') || text.includes('concern') || text.includes('worried') ||
    text.includes('hesitant') || text.includes('integration')
  ) {
    type = EVENT_TYPES.REPLY_OBJECTION;
  }

  const event = Event.create({
    type,
    profileId,
    campaignId,
    description: `Reply received from ${source || 'unknown source'}`,
    sentiment,
    sentimentScore: sentiment === 'positive' ? 0.8 : sentiment === 'negative' ? -0.8 : 0,
    metadata: { replyText, source }
  });

  res.status(201).json(event);
});

// Mark event as processed by automation
router.put('/:id/processed', (req, res) => {
  const event = Event.markProcessed(parseInt(req.params.id));
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }
  res.json(event);
});

// Record automation triggers on an event
router.put('/:id/automation-triggered', (req, res) => {
  const { ruleId, actions } = req.body;
  if (!ruleId) {
    return res.status(400).json({ error: 'ruleId is required' });
  }

  const event = Event.recordAutomationTriggered(parseInt(req.params.id), ruleId, actions);
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }
  res.json(event);
});

export default router;
