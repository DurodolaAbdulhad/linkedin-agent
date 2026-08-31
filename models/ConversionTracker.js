// ConversionTracker — class-based wrapper used by analytics services
let conversions = [];
let nextId = 1;

export class Conversion {
  static create(data) {
    const c = { _id: String(nextId++), ...data, createdAt: new Date() };
    conversions.push(c);
    return c;
  }

  static getAll() { return conversions; }

  static findById(id) { return conversions.find(c => c._id === String(id)); }

  static findByCampaignId(campaignId) {
    return conversions.filter(c => c.campaignId === String(campaignId));
  }

  static getTotalRevenue() {
    return conversions.reduce((sum, c) => sum + (c.value || 0), 0);
  }

  static getDashboardMetrics() {
    return {
      total: conversions.length,
      totalRevenue: this.getTotalRevenue(),
      meetings: conversions.filter(c => c.type === 'meeting_booked').length,
      deals: conversions.filter(c => c.type === 'deal_closed').length,
    };
  }
}
