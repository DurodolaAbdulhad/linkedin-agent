// Social media profile management (LinkedIn, Twitter/X, etc)

let socialProfiles = [];
let socialProfileId = 1;

export const createSocialProfile = (mainProfileId, platform, handle, url = null) => {
  const profile = {
    _id: socialProfileId++,
    mainProfileId, // Links to main Profile.js
    platform, // 'LinkedIn', 'Twitter', 'Email', etc
    handle, // @username or email
    url, // Profile URL
    followers: null, // For Twitter
    engagement: null, // For Twitter - last engagement score
    createdAt: new Date(),
  };

  socialProfiles.push(profile);
  return profile;
};

export const getSocialProfiles = () => socialProfiles;

export const getSocialProfilesByMainProfile = (mainProfileId) => {
  return socialProfiles.filter(p => p.mainProfileId == mainProfileId);
};

export const getSocialProfileByPlatform = (mainProfileId, platform) => {
  return socialProfiles.find(p => p.mainProfileId == mainProfileId && p.platform === platform);
};

export const updateSocialProfile = (id, updates) => {
  const profile = socialProfiles.find(p => p._id == id);
  if (profile) {
    Object.assign(profile, updates, { updatedAt: new Date() });
  }
  return profile;
};

// Twitter DM tracking
let twitterDMs = [];
let twitterDMId = 1;

export const createTwitterDM = (campaignId, twitterHandle, dmText, type = 'direct') => {
  const dm = {
    _id: twitterDMId++,
    campaignId,
    twitterHandle,
    dmText,
    type, // 'direct' or 'public_reply'
    status: 'draft', // draft, sent, delivered, failed
    sentAt: null,
    createdAt: new Date(),
  };

  twitterDMs.push(dm);
  return dm;
};

export const getTwitterDMs = () => twitterDMs;

export const getTwitterDMsByCampaign = (campaignId) => {
  return twitterDMs.filter(dm => dm.campaignId == campaignId);
};

export const updateTwitterDM = (id, updates) => {
  const dm = twitterDMs.find(d => d._id == id);
  if (dm) {
    Object.assign(dm, updates);
  }
  return dm;
};

export default {
  createSocialProfile,
  getSocialProfiles,
  getSocialProfilesByMainProfile,
  getSocialProfileByPlatform,
  updateSocialProfile,
  createTwitterDM,
  getTwitterDMs,
  getTwitterDMsByCampaign,
  updateTwitterDM,
};
