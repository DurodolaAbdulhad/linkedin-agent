// In-memory social profile and Twitter DM store
let socialProfiles = [];
let twitterDMs = [];
let profileId = 1;
let dmId = 1;

export const createSocialProfile = (data) => {
  const profile = { _id: String(profileId++), ...data, createdAt: new Date() };
  socialProfiles.push(profile);
  return profile;
};

export const getSocialProfiles = () => socialProfiles;

export const getSocialProfilesByMainProfile = (mainProfileId) =>
  socialProfiles.filter(p => p.mainProfileId === String(mainProfileId));

export const createTwitterDM = (data) => {
  const dm = { _id: String(dmId++), ...data, status: 'pending', createdAt: new Date() };
  twitterDMs.push(dm);
  return dm;
};

export const getTwitterDMsByCampaign = (campaignId) =>
  twitterDMs.filter(d => d.campaignId === String(campaignId));

export const updateTwitterDM = (id, data) => {
  const idx = twitterDMs.findIndex(d => d._id === String(id));
  if (idx === -1) return null;
  twitterDMs[idx] = { ...twitterDMs[idx], ...data, updatedAt: new Date() };
  return twitterDMs[idx];
};
