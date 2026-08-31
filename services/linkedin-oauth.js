// LinkedIn OAuth service — token management + API calls
import axios from 'axios';

const LINKEDIN_API = 'https://api.linkedin.com/v2';
const LI_VERSION = '202407';

// Shared token store (synced with routes/linkedin-oauth.js via module state)
const tokenStore = {};

export const setToken = (accessToken, expiresIn) => {
  tokenStore.accessToken = accessToken;
  tokenStore.expiresAt = Date.now() + expiresIn * 1000;
};

export const getStoredToken = () => {
  if (!tokenStore.accessToken) return null;
  if (Date.now() > tokenStore.expiresAt) return null; // expired
  return tokenStore.accessToken;
};

export const getTokenStatus = () => ({
  hasToken: !!tokenStore.accessToken,
  isExpired: tokenStore.accessToken ? Date.now() > tokenStore.expiresAt : true,
  expiresAt: tokenStore.expiresAt ? new Date(tokenStore.expiresAt).toISOString() : null,
});

// Get the authenticated LinkedIn member's profile
export const getLinkedInProfile = async (accessToken) => {
  const token = accessToken || getStoredToken();
  if (!token) throw new Error('No valid LinkedIn token');

  const res = await axios.get(`${LINKEDIN_API}/userinfo`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Publish a post to LinkedIn feed
export const publishLinkedInPost = async (text, accessToken) => {
  const token = accessToken || getStoredToken();
  if (!token) throw new Error('No valid LinkedIn token');

  const profile = await getLinkedInProfile(token);
  const authorUrn = `urn:li:person:${profile.sub}`;

  const res = await axios.post(
    `${LINKEDIN_API}/posts`,
    {
      author: authorUrn,
      lifecycleState: 'PUBLISHED',
      visibility: 'PUBLIC',
      commentary: text,
      distribution: {
        feedDistribution: 'MAIN_FEED',
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'LinkedIn-Version': LI_VERSION,
      },
    }
  );

  return { postId: res.headers['x-linkedin-id'] || null, status: res.status };
};

// Send a connection request (requires w_member_social scope)
export const sendConnectionRequest = async (targetProfileUrn, message = '', accessToken) => {
  const token = accessToken || getStoredToken();
  if (!token) throw new Error('No valid LinkedIn token');

  try {
    const res = await axios.post(
      `${LINKEDIN_API}/invitations`,
      {
        invitee: { com_linkedin_voyager_growth_invitation_InviteeProfile: { profileId: targetProfileUrn } },
        ...(message && { message }),
      },
      {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      }
    );
    return { success: true, status: res.status };
  } catch (err) {
    const status = err.response?.status;
    if (status === 403) {
      return { success: false, reason: 'LinkedIn API partner access required for invitations. Generate the message and send manually.', generatedMessage: message };
    }
    throw err;
  }
};

// Queue a DM for manual sending (fallback when API access is restricted)
const dmQueue = [];

export const queueDMForManualSend = (profileData, message, stage) => {
  const item = {
    id: String(Date.now()),
    profileName: profileData.name,
    profileTitle: profileData.title,
    profileCompany: profileData.company,
    message,
    stage,
    queuedAt: new Date().toISOString(),
    status: 'queued',
  };
  dmQueue.push(item);
  return item;
};

export const getDMQueue = () => dmQueue;

export const markDMSent = (id) => {
  const item = dmQueue.find(d => d.id === id);
  if (item) item.status = 'sent';
  return item;
};
