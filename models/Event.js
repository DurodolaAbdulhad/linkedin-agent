let events = [];
let nextEventId = 1;

export const EVENT_TYPES = {
  // Prospect lifecycle
  PROFILE_ADDED: 'profile_added',
  CAMPAIGN_STARTED: 'campaign_started',

  // Message engagement
  MESSAGE_SENT: 'message_sent',
  MESSAGE_OPENED: 'message_opened',
  MESSAGE_CLICKED: 'message_clicked',

  // Engagement & Response
  REPLY_RECEIVED: 'reply_received',
  REPLY_POSITIVE: 'reply_positive_sentiment',
  REPLY_NEGATIVE: 'reply_negative_sentiment',
  REPLY_OBJECTION: 'reply_objection',
  REPLY_QUESTION: 'reply_question',

  // Qualification
  ICP_SCORE_HIGH: 'high_icp_score',
  ICP_SCORE_MEDIUM: 'medium_icp_score',
  ICP_SCORE_LOW: 'low_icp_score',
  QUALIFIED: 'prospect_qualified',
  DISQUALIFIED: 'prospect_disqualified',

  // Resource interaction
  RESOURCE_VIEWED: 'resource_viewed',
  RESOURCE_DOWNLOADED: 'resource_downloaded',
  RESOURCE_SHARED: 'resource_shared',

  // Offer interaction
  OFFER_VIEWED: 'offer_viewed',
  OFFER_CLICKED: 'offer_clicked',
  TRIAL_STARTED: 'trial_started',

  // Conversion
  CONVERSION_BOOKED: 'conversion_booked',
  CONVERSION_PURCHASED: 'conversion_purchased',
  CONVERSION_TRIAL_SIGNUP: 'conversion_trial_signup',

  // Funnel progression
  FUNNEL_STAGE_CHANGE: 'funnel_stage_changed',

  // Automation
  AUTOMATION_TRIGGERED: 'automation_triggered',
  AUTOMATION_FAILED: 'automation_failed'
};

export class Event {
  constructor(data) {
    this._id = nextEventId++;
    this.type = data.type; // See EVENT_TYPES
    this.profileId = data.profileId;
    this.campaignId = data.campaignId;
    this.audienceId = data.audienceId || null;
    this.productId = data.productId || null;

    // Event details
    this.description = data.description || '';
    this.metadata = data.metadata || {}; // Extra context (reply text, score, etc.)
    this.severity = data.severity || 'info'; // info, warning, critical
    this.confidence = data.confidence || 1.0; // 0-1 confidence level

    // Sentiment (for reply events)
    this.sentiment = data.sentiment || null; // positive, negative, neutral, objection
    this.sentimentScore = data.sentimentScore || 0; // -1 to 1

    // Funnel tracking
    this.funnelStageBefore = data.funnelStageBefore || null;
    this.funnelStageAfter = data.funnelStageAfter || null;

    // Automation
    this.triggeredAutomationRules = data.triggeredAutomationRules || []; // IDs of rules triggered
    this.actionsTaken = data.actionsTaken || []; // Actions executed as result

    this.timestamp = new Date().toISOString();
    this.processedAt = null; // When automation processed this event
  }

  static create(data) {
    const event = new Event(data);
    events.push(event);
    return event;
  }

  static findById(id) {
    return events.find(e => e._id === id);
  }

  static findByCampaignId(campaignId) {
    return events.filter(e => e.campaignId === campaignId);
  }

  static findByProfileId(profileId) {
    return events.filter(e => e.profileId === profileId);
  }

  static findByType(type) {
    return events.filter(e => e.type === type);
  }

  static findByTypeAndCampaign(type, campaignId) {
    return events.filter(e => e.type === type && e.campaignId === campaignId);
  }

  static getRecentEvents(campaignId, hoursBack = 24) {
    const cutoff = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
    return events.filter(e => e.campaignId === campaignId && new Date(e.timestamp) > cutoff);
  }

  static markProcessed(id) {
    const event = this.findById(id);
    if (event) {
      event.processedAt = new Date().toISOString();
    }
    return event;
  }

  static recordAutomationTriggered(id, ruleId, actions) {
    const event = this.findById(id);
    if (event) {
      if (!event.triggeredAutomationRules.includes(ruleId)) {
        event.triggeredAutomationRules.push(ruleId);
      }
      event.actionsTaken = event.actionsTaken.concat(actions || []);
    }
    return event;
  }

  static getAll() {
    return events;
  }

  static deleteOlderThan(daysBack = 90) {
    const cutoff = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
    const before = events.length;
    events = events.filter(e => new Date(e.timestamp) > cutoff);
    return { deletedCount: before - events.length };
  }
}

export function initializeEvents() {
  // No initialization needed - events are created at runtime
}
