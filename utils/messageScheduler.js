import { getCampaignById, updateCampaignStage } from '../models/DripCampaign.js';
import { generateStagedDM } from './stageLLM.js';
import { generateTwitterMessage } from './twitterLLM.js';

let scheduledJobs = [];
let jobId = 1;

export const STAGE_DELAYS = {
  1: 0,    // Send immediately
  2: 2,    // 2 days later
  3: 4,    // 4 days later
  4: 6,    // 6 days later
  5: 8,    // 8 days later
  6: 10,   // 10 days later
  7: 14,   // 14 days later
};

export const scheduleMessage = (campaignId, stage, platform = 'LinkedIn') => {
  const campaign = getCampaignById(campaignId);
  if (!campaign) return null;

  const delayDays = STAGE_DELAYS[stage] || 0;
  const scheduledDate = new Date();
  scheduledDate.setDate(scheduledDate.getDate() + delayDays);

  const job = {
    _id: jobId++,
    campaignId,
    stage,
    platform,
    scheduledDate,
    sent: false,
    sentDate: null,
    status: 'scheduled', // scheduled, sent, failed, cancelled
    retries: 0,
    createdAt: new Date(),
  };

  scheduledJobs.push(job);
  return job;
};

export const getScheduledMessages = () => scheduledJobs;

export const getScheduledMessagesByCampaign = (campaignId) => {
  return scheduledJobs.filter(j => j.campaignId == campaignId);
};

export const getPendingMessages = () => {
  const now = new Date();
  return scheduledJobs.filter(j => 
    j.status === 'scheduled' && 
    j.scheduledDate <= now && 
    !j.sent
  );
};

export const sendScheduledMessage = async (jobId) => {
  const job = scheduledJobs.find(j => j._id == jobId);
  if (!job) return null;

  try {
    const campaign = getCampaignById(job.campaignId);
    if (!campaign) throw new Error('Campaign not found');

    let messageText = '';

    if (job.platform === 'LinkedIn') {
      messageText = await generateStagedDM(job.stage, campaign.profileData);
    } else if (job.platform === 'Twitter') {
      messageText = await generateTwitterMessage(job.stage, campaign.profileData, 'direct');
    }

    // Mark as sent
    job.status = 'sent';
    job.sent = true;
    job.sentDate = new Date();

    // Move campaign to next stage
    if (job.stage < 7) {
      const nextStage = job.stage + 1;
      updateCampaignStage(campaign._id, nextStage);
      
      // Schedule next message
      scheduleMessage(campaign._id, nextStage, job.platform);
    }

    return {
      job,
      messageText,
      campaign,
      nextStageScheduled: job.stage < 7,
    };
  } catch (error) {
    console.error('Error sending scheduled message:', error);
    job.status = 'failed';
    job.retries += 1;
    
    // Retry up to 3 times
    if (job.retries < 3) {
      job.status = 'scheduled';
      job.scheduledDate = new Date(Date.now() + 60 * 60 * 1000); // Retry in 1 hour
    }

    throw error;
  }
};

export const startScheduler = (intervalMinutes = 5) => {
  console.log(`🚀 Message Scheduler started (checking every ${intervalMinutes} minutes)`);

  const interval = setInterval(async () => {
    const pendingMessages = getPendingMessages();

    if (pendingMessages.length > 0) {
      console.log(`📨 Found ${pendingMessages.length} messages to send`);

      for (const job of pendingMessages) {
        try {
          await sendScheduledMessage(job._id);
          console.log(`✓ Sent message for campaign ${job.campaignId}, stage ${job.stage}`);
        } catch (error) {
          console.error(`✗ Failed to send message: ${error.message}`);
        }
      }
    }
  }, intervalMinutes * 60 * 1000);

  return interval;
};

export const cancelScheduledMessage = (jobId) => {
  const job = scheduledJobs.find(j => j._id == jobId);
  if (job) {
    job.status = 'cancelled';
  }
  return job;
};

export const updateScheduledDate = (jobId, newDate) => {
  const job = scheduledJobs.find(j => j._id == jobId);
  if (job) {
    job.scheduledDate = newDate;
  }
  return job;
};

export default {
  scheduleMessage,
  getScheduledMessages,
  getScheduledMessagesByCampaign,
  getPendingMessages,
  sendScheduledMessage,
  startScheduler,
  cancelScheduledMessage,
  updateScheduledDate,
  STAGE_DELAYS,
};
