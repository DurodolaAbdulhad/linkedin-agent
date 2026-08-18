import { Event, EVENT_TYPES } from '../models/Event.js';
import { AutomationRule } from '../models/AutomationRule.js';
import { CampaignAutomation } from '../models/CampaignAutomation.js';
import { getCampaignById } from '../models/DripCampaign.js';
import { Audience } from '../models/Audience.js';
import { Offer } from '../models/Offer.js';
import { getResources } from '../models/Resource.js';
import { ActionExecutor } from './ActionExecutor.js';

export class AutomationExecutor {
  static async executeAutomationsForEvent(eventId) {
    const event = Event.findById(eventId);
    if (!event) return { error: 'Event not found' };

    const campaign = getCampaignById(event.campaignId);
    if (!campaign) return { error: 'Campaign not found' };

    // Find rules that match this event type and product
    const matchingRules = AutomationRule.findByTriggerEvent(event.type);
    const relevantRules = matchingRules.filter(r => r.productId === campaign.profileData.productId || r.productId === event.productId);

    const executedRules = [];
    const failedRules = [];

    for (const rule of relevantRules) {
      const conditionsMet = this.evaluateConditions(rule.conditions, event, campaign);

      if (!conditionsMet) continue;

      // Check if rule has already executed max times for this campaign
      const executionCount = CampaignAutomation.findByCampaignId(campaign._id)
        .filter(ca => ca.ruleId === rule._id && ca.status === 'completed').length;

      if (executionCount >= rule.maxExecutionsPerCampaign) continue;

      // Create campaign automation record
      const automation = CampaignAutomation.create({
        campaignId: campaign._id,
        ruleId: rule._id,
        eventId: eventId,
        scheduledFor: this.calculateDelay(rule.delayBetweenExecutions)
      });

      try {
        // Execute actions
        const actionResults = [];
        for (const action of rule.actions) {
          const result = await ActionExecutor.executeAction(
            action,
            campaign,
            event,
            rule,
            automation
          );
          actionResults.push({ actionType: action.type, result, status: result.success ? 'completed' : 'failed' });

          if (!result.success && rule.retryOnFailure) {
            // Schedule retry
            automation.retryCount = (automation.retryCount || 0) + 1;
            if (automation.retryCount >= rule.maxRetries) {
              CampaignAutomation.markFailed(automation._id, `Max retries exceeded: ${result.error}`);
            }
          } else {
            CampaignAutomation.recordAction(automation._id, action.type, result);
          }
        }

        // Mark automation as completed
        CampaignAutomation.markCompleted(automation._id, { actions: actionResults });

        // Record execution on rule
        AutomationRule.recordExecution(rule._id, true);

        // Mark event as processed
        Event.markProcessed(eventId);
        Event.recordAutomationTriggered(eventId, rule._id, rule.actions.map(a => a.type));

        executedRules.push({
          ruleId: rule._id,
          ruleName: rule.name,
          automationId: automation._id,
          actionsExecuted: actionResults
        });

      } catch (error) {
        console.error(`Automation execution failed: ${error.message}`);
        CampaignAutomation.markFailed(automation._id, error.message);
        AutomationRule.recordExecution(rule._id, false);
        failedRules.push({
          ruleId: rule._id,
          ruleName: rule.name,
          error: error.message
        });
      }
    }

    return {
      eventId,
      campaignId: campaign._id,
      rulesEvaluated: relevantRules.length,
      rulesExecuted: executedRules.length,
      executedRules,
      failedRules,
      success: executedRules.length > 0
    };
  }

  static evaluateConditions(conditions, event, campaign) {
    for (const condition of conditions) {
      if (!this.evaluateCondition(condition, event, campaign)) {
        return false;
      }
    }
    return true;
  }

  static evaluateCondition(condition, event, campaign) {
    switch (condition.type) {
      case 'audience':
        return campaign.audienceId === condition.value;

      case 'funnel_stage':
        return campaign.currentStage === condition.value;

      case 'icp_score':
        const score = campaign.icpScore?.score || 0;
        return this.compareValue(score, condition.operator, condition.value);

      case 'reply_count':
        const replyCount = campaign.replies?.length || 0;
        return this.compareValue(replyCount, condition.operator, condition.value);

      case 'days_in_campaign':
        const daysInCampaign = Math.floor(
          (Date.now() - new Date(campaign.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        );
        return this.compareValue(daysInCampaign, condition.operator, condition.value);

      case 'days_since_last_message':
        const lastMessage = campaign.messages?.slice(-1)[0];
        if (!lastMessage) return true; // No messages yet
        const daysSinceLastMessage = Math.floor(
          (Date.now() - new Date(lastMessage.sentDate).getTime()) / (1000 * 60 * 60 * 24)
        );
        return this.compareValue(daysSinceLastMessage, condition.operator, condition.value);

      case 'no_reply_received':
        return (campaign.replies?.length || 0) === 0;

      case 'offer_id':
        return campaign.currentOffer?.id === condition.value;

      case 'sentiment':
        return campaign.lastReplySentiment === condition.value;

      default:
        return true;
    }
  }

  static compareValue(actual, operator, expected) {
    switch (operator) {
      case '>':
        return actual > expected;
      case '>=':
        return actual >= expected;
      case '<':
        return actual < expected;
      case '<=':
        return actual <= expected;
      case '=':
      case '==':
        return actual === expected;
      case '!=':
        return actual !== expected;
      default:
        return true;
    }
  }

  static calculateDelay(delayMinutes) {
    const delayMs = delayMinutes * 60 * 1000;
    return new Date(Date.now() + delayMs).toISOString();
  }

  static async executePendingAutomations() {
    const pending = CampaignAutomation.getPendingForExecution();
    const results = [];

    for (const automation of pending) {
      const result = await this.executeAutomation(automation);
      results.push(result);
    }

    return {
      totalPending: pending.length,
      executed: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    };
  }

  static async executeAutomation(automation) {
    try {
      CampaignAutomation.markExecuting(automation._id);

      const rule = AutomationRule.findById(automation.ruleId);
      const campaign = getCampaignById(automation.campaignId);

      if (!rule || !campaign) {
        return { success: false, automationId: automation._id, error: 'Rule or campaign not found' };
      }

      const actionResults = [];
      for (const action of rule.actions) {
        const result = await ActionExecutor.executeAction(action, campaign, null, rule, automation);
        actionResults.push(result);
        CampaignAutomation.recordAction(automation._id, action.type, result);
      }

      CampaignAutomation.markCompleted(automation._id, { actions: actionResults });
      AutomationRule.recordExecution(rule._id, true);

      return { success: true, automationId: automation._id, actionsExecuted: actionResults.length };

    } catch (error) {
      CampaignAutomation.markFailed(automation._id, error.message);
      AutomationRule.recordExecution(automation.ruleId, false);
      return { success: false, automationId: automation._id, error: error.message };
    }
  }
}
