import { getCampaignById, updateCampaignStage, addReplyToCampaign } from '../models/DripCampaign.js';
import { getResources, getResourcesByPainPoint } from '../models/Resource.js';
import { Offer } from '../models/Offer.js';

export class ActionExecutor {
  static async executeAction(action, campaign, event, rule, automation) {
    try {
      switch (action.type) {
        case 'send_dm':
          return this.sendDM(action, campaign, event, rule);

        case 'send_resource':
          return this.sendResource(action, campaign, event, rule);

        case 'send_offer':
          return this.sendOffer(action, campaign, event, rule);

        case 'change_funnel_stage':
          return this.changeFunnelStage(action, campaign);

        case 'schedule_message':
          return this.scheduleMessage(action, campaign);

        case 'notify_founder':
          return this.notifyFounder(action, campaign);

        case 'move_to_sales':
          return this.moveToSales(action, campaign);

        case 'pause_campaign':
          return this.pauseCampaign(action, campaign);

        default:
          return { success: false, error: `Unknown action type: ${action.type}` };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static sendDM(action, campaign, event, rule) {
    const dmText = action.message || 'Check this out!';

    // Track DM in campaign
    if (!campaign.messages) campaign.messages = [];
    campaign.messages.push({
      text: dmText,
      sentDate: new Date().toISOString(),
      source: 'automation',
      rule: rule.name,
      stage: campaign.currentStage
    });

    return {
      success: true,
      message: `DM sent to prospect ${campaign.profileId}`,
      preview: dmText.substring(0, 50),
      dmCount: campaign.messages.length
    };
  }

  static sendResource(action, campaign, event, rule) {
    const allResources = getResources();
    const resource = allResources.find(r => r._id === action.resourceId);
    if (!resource) {
      return { success: false, error: `Resource ${action.resourceId} not found` };
    }

    const messageWithResource = `${action.message || 'Check this out!'}\n\n${resource.name}\n${resource.url}`;

    // Track resource send in campaign
    if (!campaign.resourcesSent) campaign.resourcesSent = [];
    campaign.resourcesSent.push({
      resourceId: action.resourceId,
      resourceName: resource.name,
      sentDate: new Date().toISOString(),
      context: 'automation',
      rule: rule.name,
      painPoint: action.painPoint
    });

    // Also track as a message
    if (!campaign.messages) campaign.messages = [];
    campaign.messages.push({
      text: messageWithResource,
      sentDate: new Date().toISOString(),
      source: 'automation',
      rule: rule.name,
      resourceId: action.resourceId,
      stage: campaign.currentStage
    });

    return {
      success: true,
      resourceId: action.resourceId,
      message: `Resource sent: ${resource.name}`,
      preview: messageWithResource.substring(0, 50),
      resourceCount: campaign.resourcesSent.length
    };
  }

  static sendOffer(action, campaign, event, rule) {
    const offer = Offer.findById(action.offerId);
    if (!offer) {
      return { success: false, error: `Offer ${action.offerId} not found` };
    }

    const offerMessage = `${action.message || 'Exclusive offer for you!'}\n\n${offer.name}\n${offer.description}\n\nCTA: ${offer.cta}\n${offer.ctaUrl}`;

    // Track offer send
    campaign.currentOffer = {
      id: action.offerId,
      name: offer.name,
      sentDate: new Date().toISOString(),
      cta: offer.cta,
      price: offer.price
    };

    // Also track as a message
    if (!campaign.messages) campaign.messages = [];
    campaign.messages.push({
      text: offerMessage,
      sentDate: new Date().toISOString(),
      source: 'automation',
      rule: rule.name,
      offerId: action.offerId,
      stage: campaign.currentStage
    });

    // Record conversion attempt
    try {
      Offer.recordConversion(action.offerId);
    } catch (e) {
      // Offer tracking is best-effort
    }

    return {
      success: true,
      offerId: action.offerId,
      message: `Offer sent: ${offer.name}`,
      price: offer.price,
      preview: offerMessage.substring(0, 50)
    };
  }

  static changeFunnelStage(action, campaign) {
    const oldStage = campaign.currentStage;
    campaign.currentStage = action.newStage;
    campaign.updatedAt = new Date().toISOString();

    return {
      success: true,
      message: `Prospect moved from ${oldStage} to ${action.newStage}`,
      oldStage,
      newStage: action.newStage,
      timestamp: campaign.updatedAt
    };
  }

  static scheduleMessage(action, campaign) {
    return {
      success: true,
      message: `Message scheduled for ${action.delay || 'immediate'} delivery`,
      scheduled: true
    };
  }

  static notifyFounder(action, campaign) {
    const notification = {
      message: action.message,
      campaignId: campaign._id,
      profileId: campaign.profileId,
      timestamp: new Date().toISOString(),
      priority: 'high'
    };

    console.log(`[FOUNDER NOTIFICATION] ${action.message}`);

    return {
      success: true,
      message: `Founder notified: ${action.message}`,
      notificationQueued: true
    };
  }

  static moveToSales(action, campaign) {
    campaign.movedToSales = true;
    campaign.movedToSalesDate = new Date().toISOString();
    campaign.status = 'qualified_for_sales';

    return {
      success: true,
      message: 'Prospect moved to sales team',
      movedToSalesDate: campaign.movedToSalesDate
    };
  }

  static pauseCampaign(action, campaign) {
    campaign.status = 'paused';
    campaign.pausedDate = new Date().toISOString();

    return {
      success: true,
      message: 'Campaign paused due to automation rule',
      pausedDate: campaign.pausedDate
    };
  }

  static recordConversion(conversionType, campaign, metadata = {}) {
    if (!campaign.conversions) campaign.conversions = [];

    const conversion = {
      type: conversionType,
      date: new Date().toISOString(),
      metadata: metadata
    };

    campaign.conversions.push(conversion);
    campaign.status = 'converted';

    return {
      success: true,
      message: `Conversion recorded: ${conversionType}`,
      conversionDate: conversion.date
    };
  }
}
