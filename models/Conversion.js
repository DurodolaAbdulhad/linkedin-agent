// In-memory conversion tracking
let conversions = [];
let nextId = 1;

export const createConversion = (campaignId, profileId, type, details = {}) => {
  const conversion = {
    _id: String(nextId++),
    campaignId: String(campaignId),
    profileId: String(profileId),
    type, // 'meeting_booked' | 'demo_completed' | 'deal_closed' | 'referral'
    details,
    value: details.value || 0,
    currency: details.currency || 'USD',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  conversions.push(conversion);
  return conversion;
};

export const getConversions = () => conversions;

export const getConversionsByCampaign = (campaignId) =>
  conversions.filter(c => c.campaignId === String(campaignId));

export const getCampaignMetrics = (campaignId) => {
  const campConversions = getConversionsByCampaign(campaignId);
  return {
    total: campConversions.length,
    totalRevenue: campConversions.reduce((sum, c) => sum + (c.value || 0), 0),
    byType: campConversions.reduce((acc, c) => {
      acc[c.type] = (acc[c.type] || 0) + 1;
      return acc;
    }, {}),
  };
};

export const updateConversion = (id, data) => {
  const idx = conversions.findIndex(c => c._id === String(id));
  if (idx === -1) return null;
  conversions[idx] = { ...conversions[idx], ...data, updatedAt: new Date() };
  return conversions[idx];
};
