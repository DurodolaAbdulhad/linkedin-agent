// Drip campaign stages and templates
export const DRIP_STAGES = {
  PROSPECT: {
    stage: 1,
    name: 'Prospect & Build Rapport',
    daysDelay: 0,
    description: 'Initial outreach, establish connection',
  },
  ASK_QUESTIONS: {
    stage: 2,
    name: 'Ask Questions & Identify Needs',
    daysDelay: 2,
    description: 'Understand their pain points deeper',
  },
  PRESENT: {
    stage: 3,
    name: 'Present Solution',
    daysDelay: 4,
    description: 'Show how your product solves their problem',
  },
  OBJECTIONS: {
    stage: 4,
    name: 'Answer Objections',
    daysDelay: 6,
    description: 'Address concerns and build confidence',
  },
  CLOSE: {
    stage: 5,
    name: 'Close the Sale',
    daysDelay: 8,
    description: 'Ask for the meeting or commitment',
  },
  RESALE: {
    stage: 6,
    name: 'Resale & Expansion',
    daysDelay: 10,
    description: 'Upsell and expand the relationship',
  },
  REFERRAL: {
    stage: 7,
    name: 'Get Referrals',
    daysDelay: 14,
    description: 'Ask for introductions to other prospects',
  },
};

// In-memory drip campaign storage
let campaigns = [];
let campaignId = 1;

export const createDripCampaign = (profileId, profileData, platform = 'LinkedIn', icpScore = 0) => {
  const campaign = {
    _id: campaignId++,
    profileId,
    profileData,
    platform, // LinkedIn or Twitter
    icpScore,
    currentStage: 1,
    status: 'active', // active, paused, completed
    replies: [],
    messages: [], // Generated messages for each stage
    createdAt: new Date(),
    scheduledMessages: [], // Array of { stage, scheduledDate, sent, sentDate }
  };

  campaigns.push(campaign);
  return campaign;
};

export const getCampaigns = () => campaigns;

export const getCampaignById = (id) => campaigns.find(c => c._id == id);

export const getCampaignsByProfile = (profileId) => campaigns.filter(c => c.profileId == profileId);

export const updateCampaignStage = (campaignId, stage) => {
  const campaign = campaigns.find(c => c._id == campaignId);
  if (campaign) {
    campaign.currentStage = stage;
    campaign.updatedAt = new Date();
  }
  return campaign;
};

export const addReplyToCampaign = (campaignId, reply) => {
  const campaign = campaigns.find(c => c._id == campaignId);
  if (campaign) {
    campaign.replies.push({
      ...reply,
      timestamp: new Date(),
    });
  }
  return campaign;
};

export const scheduleMessage = (campaignId, stage, scheduledDate) => {
  const campaign = campaigns.find(c => c._id == campaignId);
  if (campaign) {
    campaign.scheduledMessages.push({
      stage,
      scheduledDate,
      sent: false,
      sentDate: null,
    });
  }
  return campaign;
};

export default {
  DRIP_STAGES,
  createDripCampaign,
  getCampaigns,
  getCampaignById,
  getCampaignsByProfile,
  updateCampaignStage,
  addReplyToCampaign,
  scheduleMessage,
};
