// In-memory event system
let events = [];
let nextId = 1;

export const EVENT_TYPES = {
  CONNECTION_ACCEPTED: 'connection_accepted',
  MESSAGE_SENT: 'message_sent',
  MESSAGE_OPENED: 'message_opened',
  REPLY_RECEIVED: 'reply_received',
  POSITIVE_REPLY: 'positive_reply',
  NEGATIVE_REPLY: 'negative_reply',
  OBJECTION_REPLY: 'objection_reply',
  NO_REPLY: 'no_reply',
  CONVERSION: 'conversion',
  STAGE_ADVANCE: 'stage_advance',
  CAMPAIGN_PAUSED: 'campaign_paused',
  CAMPAIGN_COMPLETED: 'campaign_completed',
};

export const initializeEvents = () => {
  events = [];
  nextId = 1;
};

export class Event {
  static getAll() { return events; }

  static findById(id) { return events.find(e => e.id === parseInt(id)) || null; }

  static findByCampaignId(campaignId) {
    return events.filter(e => e.campaignId === String(campaignId));
  }

  static findRecentByCampaignId(campaignId, hoursBack = 24) {
    const cutoff = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
    return events.filter(e => e.campaignId === String(campaignId) && new Date(e.createdAt) >= cutoff);
  }

  static create(data) {
    const event = { id: nextId++, ...data, createdAt: new Date() };
    events.push(event);
    return event;
  }

  static getStats() {
    return {
      total: events.length,
      byType: events.reduce((acc, e) => {
        acc[e.type] = (acc[e.type] || 0) + 1;
        return acc;
      }, {}),
    };
  }
}
