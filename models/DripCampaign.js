// In-memory drip campaign store (Appwrite is primary persistence)
let campaigns = [];
let nextId = 1;

export const DRIP_STAGES = {
  PROSPECT: { name: 'Prospect & Build Rapport', stage: 1 },
  DISCOVER: { name: 'Ask Questions & Identify Needs', stage: 2 },
  PRESENT: { name: 'Present Solution', stage: 3 },
  HANDLE_OBJECTIONS: { name: 'Answer Objections', stage: 4 },
  CLOSE: { name: 'Close the Sale', stage: 5 },
  EXPAND: { name: 'Resale & Expansion', stage: 6 },
  REFERRAL: { name: 'Get Referrals', stage: 7 },
};

export const createDripCampaign = (profileData, platform = 'LinkedIn') => {
  const campaign = {
    _id: String(nextId++),
    profileData,
    platform,
    currentStage: 1,
    messages: [],
    replies: [],
    scheduledMessages: [],
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  campaigns.push(campaign);
  return campaign;
};

export const getCampaigns = () => campaigns;

export const getCampaignById = (id) => campaigns.find(c => c._id === String(id));

export const getCampaignsByProfile = (profileId) =>
  campaigns.filter(c => c.profileData?._id === String(profileId) || c.profileData?.id === String(profileId));

export const updateCampaignStage = (id, stage) => {
  const campaign = campaigns.find(c => c._id === String(id));
  if (!campaign) return null;
  campaign.currentStage = stage;
  campaign.updatedAt = new Date();
  return campaign;
};

export const addReplyToCampaign = (id, reply) => {
  const campaign = campaigns.find(c => c._id === String(id));
  if (!campaign) return null;
  campaign.replies.push({ ...reply, timestamp: new Date() });
  campaign.updatedAt = new Date();
  return campaign;
};
