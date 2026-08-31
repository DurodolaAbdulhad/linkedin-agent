// In-memory settings store
let settings = {
  icp: {
    targetTitles: ['Founder', 'CEO', 'CTO', 'CMO', 'COO', 'Director', 'Head of', 'VP'],
    targetIndustries: ['Fintech', 'Healthtech', 'Edtech', 'Logistics', 'Agtech', 'SaaS'],
    targetRegions: ['Nigeria', 'Kenya', 'Ghana', 'South Africa', 'Egypt', 'Ethiopia'],
    companySizes: ['1-10', '11-50', '51-200'],
    fundingStages: ['Pre-seed', 'Seed', 'Series A'],
    minScore: 60,
  },
  painPoints: [
    'GTM strategy',
    'fundraising',
    'financial clarity',
    'compliance',
    'team building',
    'product-market fit',
    'market entry',
  ],
  categories: ['tech', 'finance', 'operations', 'marketing', 'legal'],
  campaignDefaults: {
    platform: 'LinkedIn',
    stageDelayDays: 2,
    maxStages: 7,
    autoProgress: false,
  },
};

export const getSettings = () => settings;
export const getICP = () => settings.icp;
export const getPainPoints = () => settings.painPoints;
export const getCategories = () => settings.categories;

export const getCampaignDefaults = () => settings.campaignDefaults;

export const updateICP = (data) => {
  settings.icp = { ...settings.icp, ...data };
  return settings.icp;
};

export const updatePainPoints = (painPoints) => {
  settings.painPoints = painPoints;
  return settings.painPoints;
};

export const addPainPoint = (painPoint) => {
  if (!settings.painPoints.includes(painPoint)) settings.painPoints.push(painPoint);
  return settings.painPoints;
};

export const removePainPoint = (painPoint) => {
  settings.painPoints = settings.painPoints.filter(p => p !== painPoint);
  return settings.painPoints;
};

export const addCategory = (category) => {
  if (!settings.categories.includes(category)) settings.categories.push(category);
  return settings.categories;
};

export const updateCampaignDefaults = (data) => {
  settings.campaignDefaults = { ...settings.campaignDefaults, ...data };
  return settings.campaignDefaults;
};
