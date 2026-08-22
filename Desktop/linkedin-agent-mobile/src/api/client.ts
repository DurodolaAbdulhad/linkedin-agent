import axios from 'axios';

const API_URL = 'https://agent.durodola.africa/api';

const client = axios.create({
  baseURL: API_URL,
  timeout: 180000, // 3 minutes for Ollama LLM generation
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Profile {
  _id: number;
  name: string;
  title: string;
  company: string;
  painPoint: string;
  location?: string;
  icpSegment?: string;
  createdAt?: string;
}

export interface DM {
  _id: number;
  profileId: number;
  dmText: string;
  status: string;
  sentDate?: string;
  createdAt?: string;
}

export interface ICPScore {
  score: number;
  fitLevel: 'High' | 'Medium' | 'Low';
  breakdown: {
    companySize: number;
    industry: number;
    role: number;
    painPoint: number;
    geography: number;
  };
}

export interface Campaign {
  _id: number;
  profileId: number;
  profileData: Profile;
  platform: 'LinkedIn' | 'Twitter';
  icpScore: number;
  currentStage: number;
  status: string;
  replies: any[];
  messages: any[];
  createdAt: string;
}

export const getProfiles = async (): Promise<Profile[]> => {
  const response = await client.get<Profile[]>('/profiles');
  return response.data;
};

export const addProfile = async (profile: Partial<Profile>): Promise<Profile> => {
  const response = await client.post<Profile>('/profiles', profile);
  return response.data;
};

export const generateDM = async (profile: Profile): Promise<DM> => {
  const response = await client.post<DM>('/dms/generate', {
    profileId: profile._id,
    name: profile.name,
    title: profile.title,
    company: profile.company,
    painPoint: profile.painPoint,
  });
  return response.data;
};

export const getDMs = async (): Promise<DM[]> => {
  const response = await client.get<DM[]>('/dms');
  return response.data;
};

export const sendDM = async (dmId: number): Promise<DM> => {
  const response = await client.post<DM>(`/dms/${dmId}/send`, {});
  return response.data;
};

// Week 4: Drip Campaigns
export const createCampaign = async (profileId: number, platform: 'LinkedIn' | 'Twitter' = 'LinkedIn'): Promise<{ campaign: Campaign; icpScore: ICPScore }> => {
  const response = await client.post('/campaigns', {
    profileId,
    platform,
  });
  return response.data;
};

export const getCampaigns = async (): Promise<Campaign[]> => {
  const response = await client.get<Campaign[]>('/campaigns');
  return response.data;
};

export const getCampaignById = async (campaignId: number): Promise<Campaign> => {
  const response = await client.get<Campaign>(`/campaigns/${campaignId}`);
  return response.data;
};

export const getCampaignsByProfile = async (profileId: number): Promise<Campaign[]> => {
  const response = await client.get<Campaign[]>(`/campaigns/profile/${profileId}`);
  return response.data;
};

export const generateNextMessage = async (campaignId: number): Promise<{ stage: number; stageName: string; message: string; campaign: Campaign }> => {
  const response = await client.post(`/campaigns/${campaignId}/next-message`, {});
  return response.data;
};

export const addReply = async (campaignId: number, text: string, source: string = 'LinkedIn'): Promise<{ reply: any; nextMessageIn: string; shouldContinue: boolean }> => {
  const response = await client.post(`/campaigns/${campaignId}/reply`, {
    text,
    source,
  });
  return response.data;
};

// Week 4: Twitter/X Integration
export const createTwitterProfile = async (mainProfileId: number, handle: string, url?: string): Promise<any> => {
  const response = await client.post('/twitter/profiles', {
    mainProfileId,
    handle,
    url,
  });
  return response.data;
};

export const getTwitterProfiles = async (mainProfileId: number): Promise<any[]> => {
  const response = await client.get(`/twitter/profiles/${mainProfileId}`);
  return response.data;
};

export const generateTwitterMessage = async (campaignId: number, stage: number, twitterHandle: string, messageType: 'direct' | 'public_reply' = 'direct'): Promise<any> => {
  const response = await client.post(`/twitter/message/${campaignId}`, {
    stage,
    messageType,
    twitterHandle,
  });
  return response.data;
};

export const sendTwitterMessage = async (dmId: number): Promise<any> => {
  const response = await client.post(`/twitter/send/${dmId}`, {});
  return response.data;
};

export const getTwitterDMs = async (campaignId: number): Promise<any[]> => {
  const response = await client.get(`/twitter/dms/campaign/${campaignId}`);
  return response.data;
};

export const trackTwitterReply = async (campaignId: number, text: string, engagementType: string = 'reply'): Promise<any> => {
  const response = await client.post(`/twitter/reply/${campaignId}`, {
    text,
    engagementType,
  });
  return response.data;
};

export const createTwitterCampaign = async (profileId: number, twitterHandle: string, messageType: 'direct' | 'public_reply' = 'direct'): Promise<any> => {
  const response = await client.post('/twitter/campaigns', {
    profileId,
    twitterHandle,
    messageType,
  });
  return response.data;
};

// Phase 1: Focus & Products
export const getActiveFocus = async (): Promise<any> => {
  const response = await client.get('/focus/active');
  return response.data;
};

export const getAllFocus = async (): Promise<any[]> => {
  const response = await client.get('/focus');
  return response.data;
};

export const createFocus = async (data: any): Promise<any> => {
  const response = await client.post('/focus', data);
  return response.data;
};

export const updateFocus = async (id: number, data: any): Promise<any> => {
  const response = await client.put(`/focus/${id}`, data);
  return response.data;
};

export const activateFocus = async (id: number): Promise<any> => {
  const response = await client.put(`/focus/${id}/activate`, {});
  return response.data;
};

export const updateFocusAllocation = async (id: number, productAllocation: any): Promise<any> => {
  const response = await client.put(`/focus/${id}/allocate`, { productAllocation });
  return response.data;
};

export const getProducts = async (): Promise<any[]> => {
  const response = await client.get('/products');
  return response.data;
};

export const getProductById = async (id: number): Promise<any> => {
  const response = await client.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (data: any): Promise<any> => {
  const response = await client.post('/products', data);
  return response.data;
};

export const updateProduct = async (id: number, data: any): Promise<any> => {
  const response = await client.put(`/products/${id}`, data);
  return response.data;
};

export const updateProductObjective = async (id: number, objective: string): Promise<any> => {
  const response = await client.put(`/products/${id}/objective`, { objective });
  return response.data;
};

export const updateProductICP = async (id: number, icp: any): Promise<any> => {
  const response = await client.put(`/products/${id}/icp`, { icp });
  return response.data;
};

export const addProductAudience = async (productId: number, audience: any): Promise<any> => {
  const response = await client.post(`/products/${productId}/audiences`, audience);
  return response.data;
};

// Phase 2: Audiences, Offers & Resource Mapping
export const getAudiencesByProduct = async (productId: number): Promise<any[]> => {
  const response = await client.get(`/audiences/product/${productId}`);
  return response.data;
};

export const createAudience = async (data: any): Promise<any> => {
  const response = await client.post('/audiences', data);
  return response.data;
};

export const updateAudience = async (id: number, data: any): Promise<any> => {
  const response = await client.put(`/audiences/${id}`, data);
  return response.data;
};

export const getOffersByProduct = async (productId: number): Promise<any[]> => {
  const response = await client.get(`/offers/product/${productId}`);
  return response.data;
};

export const createOffer = async (data: any): Promise<any> => {
  const response = await client.post('/offers', data);
  return response.data;
};

export const updateOffer = async (id: number, data: any): Promise<any> => {
  const response = await client.put(`/offers/${id}`, data);
  return response.data;
};

export const recordOfferConversion = async (id: number): Promise<any> => {
  const response = await client.post(`/offers/${id}/conversion`, {});
  return response.data;
};

export const getAudienceResources = async (productId: number, audienceId: number): Promise<any[]> => {
  const response = await client.get(`/audience-resources/product/${productId}/audience/${audienceId}`);
  return response.data;
};

export const getResourcesByFunnelStage = async (productId: number, audienceId: number, stage: string): Promise<any[]> => {
  const response = await client.get(`/audience-resources/product/${productId}/audience/${audienceId}/stage/${stage}`);
  return response.data;
};

export const createAudienceResourceMapping = async (data: any): Promise<any> => {
  const response = await client.post('/audience-resources', data);
  return response.data;
};

// Phase 3: Events & Automation
export const getEventsByCampaign = async (campaignId: number): Promise<any[]> => {
  const response = await client.get(`/events/campaign/${campaignId}`);
  return response.data;
};

export const getRecentEvents = async (campaignId: number, hours: number = 24): Promise<any[]> => {
  const response = await client.get(`/events/campaign/${campaignId}/recent?hours=${hours}`);
  return response.data;
};

export const logEvent = async (event: any): Promise<any> => {
  const response = await client.post('/events', event);
  return response.data;
};

export const logReply = async (campaignId: number, profileId: number, replyText: string, source: string = 'LinkedIn'): Promise<any> => {
  const response = await client.post('/events/reply', {
    campaignId,
    profileId,
    replyText,
    source
  });
  return response.data;
};

export const getAutomationRules = async (productId: number): Promise<any[]> => {
  const response = await client.get(`/automation-rules/product/${productId}`);
  return response.data;
};

export const getActiveAutomationRules = async (productId: number): Promise<any[]> => {
  const response = await client.get(`/automation-rules/product/${productId}/active`);
  return response.data;
};

export const createAutomationRule = async (data: any): Promise<any> => {
  const response = await client.post('/automation-rules', data);
  return response.data;
};

export const updateAutomationRule = async (id: number, data: any): Promise<any> => {
  const response = await client.put(`/automation-rules/${id}`, data);
  return response.data;
};

export const pauseAutomationRule = async (id: number): Promise<any> => {
  const response = await client.put(`/automation-rules/${id}/status`, { status: 'paused' });
  return response.data;
};

export const getCampaignAutomationStats = async (campaignId: number): Promise<any> => {
  const response = await client.get(`/campaign-automation/campaign/${campaignId}/stats`);
  return response.data;
};

export const getCampaignAutomations = async (campaignId: number): Promise<any[]> => {
  const response = await client.get(`/campaign-automation/campaign/${campaignId}`);
  return response.data;
};

// Phase 4: Autonomous Execution
export const executeAutomationForEvent = async (eventId: number): Promise<any> => {
  const response = await client.post(`/automation/execute/event/${eventId}`);
  return response.data;
};

export const executeAutomationsForCampaign = async (campaignId: number, hours: number = 24): Promise<any> => {
  const response = await client.post(`/automation/execute/campaign/${campaignId}/recent?hours=${hours}`);
  return response.data;
};

export const executePendingAutomations = async (): Promise<any> => {
  const response = await client.post('/automation/execute/pending/execute');
  return response.data;
};

export const getAutomationExecutionStats = async (campaignId: number): Promise<any> => {
  const response = await client.get(`/automation/execute/stats/campaign/${campaignId}`);
  return response.data;
};

export const getAutomationExecutionDetails = async (automationId: number): Promise<any> => {
  const response = await client.get(`/automation/execute/${automationId}/details`);
  return response.data;
};

export const getRecentAutomationActivity = async (limit: number = 20): Promise<any> => {
  const response = await client.get(`/automation/execute/activity/recent?limit=${limit}`);
  return response.data;
};

export const retryFailedAutomation = async (automationId: number): Promise<any> => {
  const response = await client.post(`/automation/execute/${automationId}/retry`);
  return response.data;
};

// Phase 5: Real-time Analytics & Multi-channel
export const getDashboardMetrics = async (): Promise<any> => {
  const response = await client.get('/analytics/dashboard');
  return response.data;
};

export const getCampaignMetrics = async (campaignId: number): Promise<any> => {
  const response = await client.get(`/analytics/campaign/${campaignId}`);
  return response.data;
};

export const getFunnelAnalytics = async (): Promise<any> => {
  const response = await client.get('/analytics/funnel');
  return response.data;
};

export const getChannelPerformance = async (): Promise<any> => {
  const response = await client.get('/analytics/channels');
  return response.data;
};

export const getAutomationROI = async (): Promise<any> => {
  const response = await client.get('/analytics/automation-roi');
  return response.data;
};

export const getAnalyticsSummary = async (): Promise<any> => {
  const response = await client.get('/analytics/summary');
  return response.data;
};

export const logConversion = async (campaignId: number, profileId: number, type: string, dealValue?: number, notes?: string): Promise<any> => {
  const response = await client.post('/analytics/conversions', {
    campaignId,
    profileId,
    type,
    dealValue,
    meetingNotes: notes
  });
  return response.data;
};

export const getConversions = async (campaignId?: number): Promise<any[]> => {
  const url = campaignId ? `/analytics/conversions/campaign/${campaignId}` : '/analytics/conversions';
  const response = await client.get(url);
  return response.data;
};

export const getOptimalChannels = async (audienceId: number): Promise<any> => {
  const response = await client.get(`/analytics/channel/optimal/${audienceId}`);
  return response.data;
};

export const getChannelSequence = async (audienceId: number, stage: string): Promise<any> => {
  const response = await client.get(`/analytics/channel/sequence/${audienceId}/${stage}`);
  return response.data;
};

export const getMessageFrequency = async (stage: string, daysInStage?: number): Promise<any> => {
  const query = daysInStage ? `?daysInStage=${daysInStage}` : '';
  const response = await client.get(`/analytics/frequency/${stage}${query}`);
  return response.data;
};

export default client;
