import { databases, DATABASE_ID, COLLECTIONS } from '../utils/appwrite.js';
import { ID } from 'node-appwrite';

// Profile Service
export async function createProfile(profileData) {
  try {
    const doc = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.PROFILES,
      ID.unique(),
      {
        name: profileData.name,
        title: profileData.title || '',
        company: profileData.company || '',
        painPoint: profileData.painPoint || '',
        icp: profileData.icp || 0,
        email: profileData.email || '',
        linkedin_url: profileData.linkedin_url || '',
        twitter_url: profileData.twitter_url || '',
      }
    );
    return { _id: doc.$id, ...doc };
  } catch (error) {
    console.error('Error creating profile:', error);
    throw error;
  }
}

export async function getProfile(profileId) {
  try {
    const doc = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.PROFILES,
      profileId
    );
    return { _id: doc.$id, ...doc };
  } catch (error) {
    console.error('Error getting profile:', error);
    return null;
  }
}

export async function getAllProfiles() {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.PROFILES
    );
    return response.documents.map(doc => ({ _id: doc.$id, ...doc }));
  } catch (error) {
    console.error('Error getting profiles:', error);
    return [];
  }
}

// Campaign Service
export async function createCampaign(campaignData) {
  try {
    const profile = await getProfile(campaignData.profileId);

    const doc = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.CAMPAIGNS,
      ID.unique(),
      {
        profileId: campaignData.profileId,
        platform: campaignData.platform,
        currentStage: campaignData.currentStage || 1,
        status: 'active',
        icpScore: campaignData.icpScore || 0,
        messages: JSON.stringify(campaignData.messages || []),
        replies: JSON.stringify(campaignData.replies || []),
        scheduledMessages: JSON.stringify(campaignData.scheduledMessages || []),
      }
    );

    return {
      _id: doc.$id,
      profileId: doc.profileId,
      profileData: profile,
      platform: doc.platform,
      currentStage: doc.currentStage,
      status: doc.status,
      icpScore: doc.icpScore,
      messages: JSON.parse(doc.messages),
      replies: JSON.parse(doc.replies),
      scheduledMessages: JSON.parse(doc.scheduledMessages),
    };
  } catch (error) {
    console.error('Error creating campaign:', error);
    throw error;
  }
}

export async function getCampaign(campaignId) {
  try {
    const doc = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.CAMPAIGNS,
      campaignId
    );
    const profile = await getProfile(doc.profileId);

    return {
      _id: doc.$id,
      profileId: doc.profileId,
      profileData: profile,
      platform: doc.platform,
      currentStage: doc.currentStage,
      status: doc.status,
      icpScore: doc.icpScore,
      messages: JSON.parse(doc.messages || '[]'),
      replies: JSON.parse(doc.replies || '[]'),
      scheduledMessages: JSON.parse(doc.scheduledMessages || '[]'),
    };
  } catch (error) {
    console.error('Error getting campaign:', error);
    return null;
  }
}

export async function getAllCampaigns() {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.CAMPAIGNS
    );

    const campaigns = [];
    for (const doc of response.documents) {
      const profile = await getProfile(doc.profileId);
      campaigns.push({
        _id: doc.$id,
        profileId: doc.profileId,
        profileData: profile,
        platform: doc.platform,
        currentStage: doc.currentStage,
        status: doc.status,
        icpScore: doc.icpScore,
        messages: JSON.parse(doc.messages || '[]'),
        replies: JSON.parse(doc.replies || '[]'),
        scheduledMessages: JSON.parse(doc.scheduledMessages || '[]'),
      });
    }
    return campaigns;
  } catch (error) {
    console.error('Error getting campaigns:', error);
    return [];
  }
}

// Event Service
export async function createEvent(eventData) {
  try {
    const doc = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.EVENTS,
      ID.unique(),
      {
        type: eventData.type,
        profileId: eventData.profileId || '',
        campaignId: eventData.campaignId || '',
        sentiment: eventData.sentiment || 0,
        data: JSON.stringify(eventData.data || {}),
      }
    );
    return {
      _id: doc.$id,
      type: doc.type,
      profileId: doc.profileId,
      campaignId: doc.campaignId,
      sentiment: doc.sentiment,
      data: JSON.parse(doc.data),
      createdAt: doc.$createdAt,
    };
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
}

export async function getAllEvents() {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.EVENTS
    );

    return response.documents.map(doc => ({
      _id: doc.$id,
      type: doc.type,
      profileId: doc.profileId,
      campaignId: doc.campaignId,
      sentiment: doc.sentiment,
      data: JSON.parse(doc.data || '{}'),
      createdAt: doc.$createdAt,
    }));
  } catch (error) {
    console.error('Error getting events:', error);
    return [];
  }
}

// Conversion Service
export async function createConversion(conversionData) {
  try {
    const doc = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.CONVERSIONS,
      ID.unique(),
      {
        campaignId: conversionData.campaignId,
        type: conversionData.type,
        dealValue: conversionData.dealValue || 0,
        currency: conversionData.currency || 'USD',
        daysToConversion: conversionData.daysToConversion || 0,
      }
    );
    return { _id: doc.$id, ...doc };
  } catch (error) {
    console.error('Error creating conversion:', error);
    throw error;
  }
}

export async function getAllConversions() {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.CONVERSIONS
    );
    return response.documents.map(doc => ({ _id: doc.$id, ...doc }));
  } catch (error) {
    console.error('Error getting conversions:', error);
    return [];
  }
}