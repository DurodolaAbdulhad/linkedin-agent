import { getCampaignById, getCampaigns } from '../models/DripCampaign.js';
import { Event } from '../models/Event.js';
import { Conversion } from '../models/ConversionTracker.js';
import { CampaignAutomation } from '../models/CampaignAutomation.js';
import { AutomationRule } from '../models/AutomationRule.js';

export class CampaignAnalytics {
  static getCampaignMetrics(campaignId) {
    const campaign = getCampaignById(campaignId);
    if (!campaign) return null;

    const events = Event.findByCampaignId(campaignId);
    const conversions = Conversion.findByCampaignId(campaignId);
    const automations = CampaignAutomation.findByCampaignId(campaignId);

    // Funnel metrics
    const funnelMetrics = {
      awareness: events.filter(e => campaign.currentStage === 'awareness').length,
      consideration: events.filter(e => campaign.currentStage === 'consideration').length,
      evaluation: events.filter(e => campaign.currentStage === 'evaluation').length,
      conversion: conversions.length
    };

    // Engagement metrics
    const engagementMetrics = {
      messagesReceived: campaign.messages?.length || 0,
      repliesReceived: campaign.replies?.length || 0,
      resourcesSent: campaign.resourcesSent?.length || 0,
      offersSent: campaign.currentOffer ? 1 : 0,
      automationsTriggered: automations.filter(a => a.status === 'completed').length,
      automationsFailed: automations.filter(a => a.status === 'failed').length
    };

    // Conversion metrics
    const conversionMetrics = Conversion.getMetricsByCampaign(campaignId);

    // Timeline metrics
    const createdAt = new Date(campaign.createdAt);
    const now = new Date();
    const daysActive = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));

    // Calculate ROI (simplified)
    const estimatedCost = 0; // In production, track actual cost per prospect
    const revenue = conversionMetrics.totalRevenue;
    const roi = estimatedCost > 0 ? ((revenue - estimatedCost) / estimatedCost * 100).toFixed(2) : null;

    return {
      campaignId,
      profileName: campaign.profileData?.name,
      platform: campaign.platform,
      status: campaign.status,
      daysActive,
      funnelStage: campaign.currentStage,
      funnelMetrics,
      engagementMetrics,
      conversionMetrics,
      roi,
      summary: {
        totalProspects: 1,
        engagedProspects: campaign.replies?.length || 0,
        qualifiedProspects: conversions.filter(c => c.status === 'confirmed').length,
        conversions: conversions.length,
        conversionRate: conversions.length > 0 ? '100%' : '0%'
      }
    };
  }

  static getDashboardMetrics() {
    const campaigns = getCampaigns();
    const allConversions = Conversion.getAll();
    const allEvents = Event.getAll();
    const allAutomations = CampaignAutomation.getAll();

    // Campaign metrics
    const campaignMetrics = {
      total: campaigns.length,
      active: campaigns.filter(c => c.status === 'active').length,
      qualified: campaigns.filter(c => c.status === 'qualified_for_sales').length,
      converted: campaigns.filter(c => c.status === 'converted').length
    };

    // Prospect pipeline
    const prospectMetrics = {
      total: campaigns.length,
      inAwareness: campaigns.filter(c => c.currentStage === 'awareness').length,
      inConsideration: campaigns.filter(c => c.currentStage === 'consideration').length,
      inEvaluation: campaigns.filter(c => c.currentStage === 'evaluation').length,
      converted: campaigns.filter(c => c.status === 'converted').length
    };

    // Engagement metrics
    const engagementMetrics = {
      totalMessagesReceived: campaigns.reduce((sum, c) => sum + (c.messages?.length || 0), 0),
      totalReplies: campaigns.reduce((sum, c) => sum + (c.replies?.length || 0), 0),
      totalResourcesSent: campaigns.reduce((sum, c) => sum + (c.resourcesSent?.length || 0), 0),
      totalOffers: campaigns.filter(c => c.currentOffer).length,
      totalEvents: allEvents.length
    };

    // Automation metrics
    const automationMetrics = {
      total: allAutomations.length,
      completed: allAutomations.filter(a => a.status === 'completed').length,
      failed: allAutomations.filter(a => a.status === 'failed').length,
      pending: allAutomations.filter(a => a.status === 'pending').length,
      successRate: allAutomations.length > 0
        ? ((allAutomations.filter(a => a.status === 'completed').length / allAutomations.length) * 100).toFixed(2) + '%'
        : 'N/A'
    };

    // Conversion metrics
    const conversionMetrics = allConversions.length > 0
      ? {
          total: allConversions.length,
          totalRevenue: allConversions
            .filter(c => ['purchase', 'deal_won'].includes(c.type))
            .reduce((sum, c) => sum + (c.dealValue || 0), 0),
          byType: Object.entries(allConversions.reduce((acc, c) => {
            acc[c.type] = (acc[c.type] || 0) + 1;
            return acc;
          }, {})),
          avgDaysToConversion: Math.round(
            allConversions.reduce((sum, c) => sum + (c.daysToConversion || 0), 0) / allConversions.length
          )
        }
      : {
          total: 0,
          totalRevenue: 0,
          byType: [],
          avgDaysToConversion: 0
        };

    // Overall metrics
    const overallMetrics = {
      conversionRate: campaigns.length > 0 ? ((allConversions.length / campaigns.length) * 100).toFixed(2) + '%' : '0%',
      avgEngagementPerCampaign: campaigns.length > 0
        ? (engagementMetrics.totalReplies / campaigns.length).toFixed(2)
        : 0,
      avgAutomationsPerCampaign: campaigns.length > 0
        ? (automationMetrics.total / campaigns.length).toFixed(2)
        : 0
    };

    return {
      timestamp: new Date().toISOString(),
      campaignMetrics,
      prospectMetrics,
      engagementMetrics,
      automationMetrics,
      conversionMetrics,
      overallMetrics
    };
  }

  static getChannelPerformance() {
    const campaigns = getCampaigns();

    const channelMetrics = {
      LinkedIn: {
        campaigns: campaigns.filter(c => c.platform === 'LinkedIn').length,
        totalEngagement: campaigns
          .filter(c => c.platform === 'LinkedIn')
          .reduce((sum, c) => sum + (c.replies?.length || 0), 0),
        conversions: Conversion.getAll()
          .filter(c => {
            const campaign = getCampaignById(c.campaignId);
            return campaign?.platform === 'LinkedIn';
          }).length
      },
      Twitter: {
        campaigns: campaigns.filter(c => c.platform === 'Twitter').length,
        totalEngagement: campaigns
          .filter(c => c.platform === 'Twitter')
          .reduce((sum, c) => sum + (c.replies?.length || 0), 0),
        conversions: Conversion.getAll()
          .filter(c => {
            const campaign = getCampaignById(c.campaignId);
            return campaign?.platform === 'Twitter';
          }).length
      }
    };

    // Calculate performance metrics per channel
    const performance = {};
    Object.entries(channelMetrics).forEach(([channel, metrics]) => {
      if (metrics.campaigns > 0) {
        performance[channel] = {
          ...metrics,
          conversionRate: ((metrics.conversions / metrics.campaigns) * 100).toFixed(2) + '%',
          avgEngagementPerCampaign: (metrics.totalEngagement / metrics.campaigns).toFixed(2)
        };
      }
    });

    return performance;
  }

  static getFunnelAnalytics() {
    const campaigns = getCampaigns();

    return {
      awareness: campaigns.filter(c => c.currentStage === 'awareness').length,
      consideration: campaigns.filter(c => c.currentStage === 'consideration').length,
      evaluation: campaigns.filter(c => c.currentStage === 'evaluation').length,
      conversion: campaigns.filter(c => c.status === 'converted').length,
      conversionRate: campaigns.length > 0
        ? ((campaigns.filter(c => c.status === 'converted').length / campaigns.length) * 100).toFixed(2) + '%'
        : '0%',
      dropoffRate: campaigns.length > 0
        ? ((campaigns.filter(c => c.status === 'paused' || c.status === 'disqualified').length / campaigns.length) * 100).toFixed(2) + '%'
        : '0%'
    };
  }

  static getAutomationROI() {
    const automations = CampaignAutomation.getAll();
    const conversions = Conversion.getAll();

    if (automations.length === 0) {
      return { roi: 0, message: 'No automations executed' };
    }

    const completedAutomations = automations.filter(a => a.status === 'completed').length;
    const successRate = (completedAutomations / automations.length * 100).toFixed(2);

    const estimatedCostPerAutomation = 0.10; // Estimate: $0.10 per automation run
    const totalCost = automations.length * estimatedCostPerAutomation;
    const totalRevenue = conversions
      .filter(c => ['purchase', 'deal_won'].includes(c.type))
      .reduce((sum, c) => sum + (c.dealValue || 0), 0);

    const roi = totalCost > 0 ? (((totalRevenue - totalCost) / totalCost) * 100).toFixed(2) : null;

    return {
      totalAutomations: automations.length,
      completedAutomations,
      successRate: successRate + '%',
      totalCost: totalCost.toFixed(2),
      totalRevenue: totalRevenue.toFixed(2),
      roi: roi ? roi + '%' : 'Infinite (no cost)',
      message: roi > 0 ? `For every $1 spent on automation, you made $${(totalRevenue / totalCost).toFixed(2)}` : 'Positive ROI'
    };
  }
}
