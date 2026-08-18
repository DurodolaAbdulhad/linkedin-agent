let conversions = [];
let nextConversionId = 1;

export const CONVERSION_TYPES = {
  MEETING_BOOKED: 'meeting_booked',
  DEMO_SCHEDULED: 'demo_scheduled',
  TRIAL_STARTED: 'trial_started',
  PURCHASE: 'purchase',
  DEAL_WON: 'deal_won',
  DEAL_LOST: 'deal_lost',
  RENEWAL: 'renewal'
};

export class Conversion {
  constructor(data) {
    this._id = nextConversionId++;
    this.campaignId = data.campaignId;
    this.profileId = data.profileId;
    this.type = data.type; // See CONVERSION_TYPES
    this.status = data.status || 'pending'; // pending, confirmed, lost

    // Deal details
    this.dealName = data.dealName || null;
    this.dealValue = data.dealValue || 0;
    this.currency = data.currency || 'NGN';
    this.closureDate = data.closureDate || null;

    // Meeting details
    this.meetingDate = data.meetingDate || null;
    this.meetingDuration = data.meetingDuration || null; // minutes
    this.meetingNotes = data.meetingNotes || '';

    // Metadata
    this.source = data.source || 'automation'; // automation, manual, api
    this.automationRuleId = data.automationRuleId || null;
    this.metadata = data.metadata || {};

    // Conversion funnel
    this.funnelStageAtConversion = data.funnelStageAtConversion || 'conversion';
    this.daysToConversion = data.daysToConversion || null;
    this.touchpointCount = data.touchpointCount || 0;

    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  static create(data) {
    const conversion = new Conversion(data);
    conversions.push(conversion);
    return conversion;
  }

  static findById(id) {
    return conversions.find(c => c._id === id);
  }

  static findByCampaignId(campaignId) {
    return conversions.filter(c => c.campaignId === campaignId);
  }

  static findByProfileId(profileId) {
    return conversions.filter(c => c.profileId === profileId);
  }

  static findByType(type) {
    return conversions.filter(c => c.type === type);
  }

  static findByCampaignAndType(campaignId, type) {
    return conversions.filter(c => c.campaignId === campaignId && c.type === type);
  }

  static getAll() {
    return conversions;
  }

  static update(id, data) {
    const conversion = this.findById(id);
    if (!conversion) return null;

    Object.assign(conversion, data, { updatedAt: new Date().toISOString() });
    return conversion;
  }

  static delete(id) {
    const index = conversions.findIndex(c => c._id === id);
    if (index > -1) {
      conversions.splice(index, 1);
      return true;
    }
    return false;
  }

  static getMetrics() {
    const totalConversions = conversions.length;
    const totalRevenue = conversions
      .filter(c => c.type === CONVERSION_TYPES.PURCHASE || c.type === CONVERSION_TYPES.DEAL_WON)
      .reduce((sum, c) => sum + (c.dealValue || 0), 0);

    const byType = {};
    Object.values(CONVERSION_TYPES).forEach(type => {
      byType[type] = conversions.filter(c => c.type === type).length;
    });

    const avgDaysToConversion = conversions.length > 0
      ? conversions.reduce((sum, c) => sum + (c.daysToConversion || 0), 0) / totalConversions
      : 0;

    return {
      total: totalConversions,
      totalRevenue,
      byType,
      avgDaysToConversion: Math.round(avgDaysToConversion),
      conversions
    };
  }

  static getMetricsByCampaign(campaignId) {
    const campaignConversions = this.findByCampaignId(campaignId);

    const totalConversions = campaignConversions.length;
    const totalRevenue = campaignConversions
      .filter(c => c.type === CONVERSION_TYPES.PURCHASE || c.type === CONVERSION_TYPES.DEAL_WON)
      .reduce((sum, c) => sum + (c.dealValue || 0), 0);

    const byType = {};
    Object.values(CONVERSION_TYPES).forEach(type => {
      byType[type] = campaignConversions.filter(c => c.type === type).length;
    });

    const avgDaysToConversion = campaignConversions.length > 0
      ? campaignConversions.reduce((sum, c) => sum + (c.daysToConversion || 0), 0) / totalConversions
      : 0;

    return {
      campaignId,
      total: totalConversions,
      totalRevenue,
      byType,
      avgDaysToConversion: Math.round(avgDaysToConversion)
    };
  }
}

export function initializeConversions() {
  // No initialization needed - conversions are created at runtime
}
