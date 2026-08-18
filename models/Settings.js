// System settings: ICP config, pain points, etc

let settings = {
  icp: {
    companySizeMin: 10,
    companySizeMax: 5000,
    industries: ['Fintech', 'SaaS', 'Edtech', 'B2B Services'],
    targetRoles: ['Founder', 'CEO', 'CTO', 'CFO', 'Head of Sales', 'Head of Marketing'],
    geography: ['Africa', 'Global', 'US', 'EU'],
    growthStage: ['Startup', 'Scale-up', 'Growth'],
    budget: 'Any',
  },
  painPoints: [
    'GTM strategy',
    'fundraising',
    'financial clarity',
    'compliance',
    'team building',
    'product-market fit',
  ],
  campaignDefaults: {
    messageDelays: [0, 2, 4, 6, 8, 10, 14], // Days for each stage
    autoSchedule: true,
    schedulerInterval: 5, // Minutes
  },
  platforms: ['LinkedIn', 'Twitter'],
  categories: ['Ascent Learn', 'Ascent Finance', 'Ascent Creative', 'General'],
};

export const getSettings = () => settings;

export const updateICP = (updates) => {
  settings.icp = { ...settings.icp, ...updates };
  return settings.icp;
};

export const updatePainPoints = (painPoints) => {
  settings.painPoints = painPoints;
  return settings.painPoints;
};

export const addPainPoint = (painPoint) => {
  if (!settings.painPoints.includes(painPoint)) {
    settings.painPoints.push(painPoint);
  }
  return settings.painPoints;
};

export const removePainPoint = (painPoint) => {
  settings.painPoints = settings.painPoints.filter(p => p !== painPoint);
  return settings.painPoints;
};

export const updateCampaignDefaults = (updates) => {
  settings.campaignDefaults = { ...settings.campaignDefaults, ...updates };
  return settings.campaignDefaults;
};

export const addCategory = (category) => {
  if (!settings.categories.includes(category)) {
    settings.categories.push(category);
  }
  return settings.categories;
};

export const getCategories = () => settings.categories;

export const getPainPoints = () => settings.painPoints;

export const getICP = () => settings.icp;

export const getCampaignDefaults = () => settings.campaignDefaults;

export default {
  getSettings,
  updateICP,
  updatePainPoints,
  addPainPoint,
  removePainPoint,
  updateCampaignDefaults,
  addCategory,
  getCategories,
  getPainPoints,
  getICP,
  getCampaignDefaults,
};
