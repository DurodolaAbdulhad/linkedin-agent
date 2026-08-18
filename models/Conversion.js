// Track conversions: meetings, deals, revenue
let conversions = [];
let conversionId = 1;

export const createConversion = (campaignId, profileId, type, details = {}) => {
  const conversion = {
    _id: conversionId++,
    campaignId,
    profileId,
    type, // 'meeting_booked', 'deal_closed', 'consultation', 'demo', 'proposal'
    stage: details.stage || 'meeting_booked',
    value: details.value || 0,
    amount: details.amount || 0,
    currency: details.currency || 'USD',
    notes: details.notes || '',
    date: details.date || new Date(),
    status: details.status || 'pending',
    createdAt: new Date(),
  };

  conversions.push(conversion);
  return conversion;
};

export const getConversions = () => conversions;

export const getConversionsByCampaign = (campaignId) => {
  return conversions.filter(c => c.campaignId == campaignId);
};

export const getCampaignMetrics = (campaignId) => {
  const campaignConversions = getConversionsByCampaign(campaignId);
  return {
    totalConversions: campaignConversions.length,
    meetings: campaignConversions.filter(c => c.type === 'meeting_booked').length,
    deals: campaignConversions.filter(c => c.status === 'won').length,
    revenue: campaignConversions.reduce((sum, c) => sum + (c.value || 0), 0),
    averageDealSize: campaignConversions.length > 0
      ? campaignConversions.reduce((sum, c) => sum + (c.amount || 0), 0) / campaignConversions.length
      : 0,
    details: campaignConversions,
  };
};

export const updateConversion = (id, updates) => {
  const conversion = conversions.find(c => c._id == id);
  if (conversion) {
    Object.assign(conversion, updates, { updatedAt: new Date() });
  }
  return conversion;
};

export default {
  createConversion,
  getConversions,
  getConversionsByCampaign,
  getCampaignMetrics,
  updateConversion,
};
