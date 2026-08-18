let automationRules = [];
let nextRuleId = 1;

export const ACTION_TYPES = {
  SEND_DM: 'send_dm',
  SEND_RESOURCE: 'send_resource',
  SEND_OFFER: 'send_offer',
  CHANGE_FUNNEL_STAGE: 'change_funnel_stage',
  UPDATE_ICP_SCORE: 'update_icp_score',
  SCHEDULE_MESSAGE: 'schedule_message',
  NOTIFY_FOUNDER: 'notify_founder',
  PAUSE_CAMPAIGN: 'pause_campaign',
  MOVE_TO_SALES: 'move_to_sales'
};

export class AutomationRule {
  constructor(data) {
    this._id = nextRuleId++;
    this.productId = data.productId;
    this.name = data.name || 'Unnamed Rule';
    this.description = data.description || '';
    this.status = data.status || 'active'; // active, paused, archived

    // Trigger: WHEN this event happens
    this.triggerEvent = data.triggerEvent; // See EVENT_TYPES
    this.triggerDescription = data.triggerDescription || '';

    // Conditions: AND these conditions are true
    this.conditions = data.conditions || [];

    // Actions: THEN do this/these
    this.actions = data.actions || [];

    // Execution control
    this.maxExecutionsPerCampaign = data.maxExecutionsPerCampaign || 1;
    this.delayBetweenExecutions = data.delayBetweenExecutions || 0;
    this.retryOnFailure = data.retryOnFailure || true;
    this.maxRetries = data.maxRetries || 2;

    // Analytics
    this.totalExecutions = data.totalExecutions || 0;
    this.successfulExecutions = data.successfulExecutions || 0;
    this.failedExecutions = data.failedExecutions || 0;
    this.averageConversionRate = data.averageConversionRate || 0;

    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  static create(data) {
    const rule = new AutomationRule(data);
    automationRules.push(rule);
    return rule;
  }

  static findById(id) {
    return automationRules.find(r => r._id === id);
  }

  static findByProductId(productId) {
    return automationRules.filter(r => r.productId === productId);
  }

  static findActiveByProductId(productId) {
    return automationRules.filter(r => r.productId === productId && r.status === 'active');
  }

  static findByTriggerEvent(triggerEvent) {
    return automationRules.filter(r => r.triggerEvent === triggerEvent && r.status === 'active');
  }

  static getAll() {
    return automationRules;
  }

  static update(id, data) {
    const rule = this.findById(id);
    if (!rule) return null;

    Object.assign(rule, data, { updatedAt: new Date().toISOString() });
    return rule;
  }

  static recordExecution(id, successful = true) {
    const rule = this.findById(id);
    if (!rule) return null;

    rule.totalExecutions = (rule.totalExecutions || 0) + 1;
    if (successful) {
      rule.successfulExecutions = (rule.successfulExecutions || 0) + 1;
    } else {
      rule.failedExecutions = (rule.failedExecutions || 0) + 1;
    }
    rule.updatedAt = new Date().toISOString();
    return rule;
  }

  static delete(id) {
    const index = automationRules.findIndex(r => r._id === id);
    if (index > -1) {
      automationRules.splice(index, 1);
      return true;
    }
    return false;
  }

  static deleteByProductId(productId) {
    automationRules = automationRules.filter(r => r.productId !== productId);
    return true;
  }
}

export function initializeAutomationRules() {
  if (automationRules.length === 0) {
    // Rule 1: Positive reply -> Send case study
    AutomationRule.create({
      productId: 1,
      name: "Positive Reply -> Case Study",
      description: "When prospect replies positively, send relevant case study",
      status: "active",
      triggerEvent: "reply_positive_sentiment",
      triggerDescription: "Prospect replies with positive sentiment",
      conditions: [
        { type: "audience", value: 1 },
        { type: "funnel_stage", value: "awareness" }
      ],
      actions: [
        {
          type: "send_resource",
          resourceId: 3,
          delayMinutes: 60,
          message: "Since you seem interested, I thought you would find this case study valuable."
        },
        {
          type: "change_funnel_stage",
          newStage: "consideration",
          delayMinutes: 0
        }
      ],
      maxExecutionsPerCampaign: 1,
      delayBetweenExecutions: 0,
      retryOnFailure: true,
      maxRetries: 2
    });

    // Rule 2: High ICP score -> Send offer
    AutomationRule.create({
      productId: 1,
      name: "High ICP Score -> Send Offer",
      description: "When prospect reaches high ICP score, send Growth Plan offer",
      status: "active",
      triggerEvent: "high_icp_score",
      triggerDescription: "ICP score reaches 70+",
      conditions: [
        { type: "icp_score", operator: ">=", value: 70 },
        { type: "funnel_stage", value: "consideration" }
      ],
      actions: [
        {
          type: "send_offer",
          offerId: 2,
          delayMinutes: 0,
          message: "You seem like a perfect fit for our Growth Plan. Here is a 14-day free trial."
        },
        {
          type: "change_funnel_stage",
          newStage: "evaluation",
          delayMinutes: 0
        }
      ],
      maxExecutionsPerCampaign: 1,
      retryOnFailure: true
    });

    // Rule 3: Objection -> Send FAQ
    AutomationRule.create({
      productId: 1,
      name: "Objection Detected -> Send FAQ",
      description: "When prospect raises objection, send FAQ addressing concerns",
      status: "active",
      triggerEvent: "reply_objection",
      triggerDescription: "Prospect raises an objection",
      conditions: [
        { type: "funnel_stage", value: "consideration" }
      ],
      actions: [
        {
          type: "send_resource",
          resourceId: 1,
          delayMinutes: 30,
          message: "Great question! Many founders ask the same thing. Here is a guide."
        }
      ],
      maxExecutionsPerCampaign: 3,
      delayBetweenExecutions: 120,
      retryOnFailure: true
    });

    // Rule 4: No response after 5 days
    AutomationRule.create({
      productId: 1,
      name: "Silence After 5 Days -> Resend",
      description: "If prospect has not engaged for 5 days, resend with different angle",
      status: "active",
      triggerEvent: "campaign_started",
      triggerDescription: "Campaign running and no engagement for 5 days",
      conditions: [
        { type: "days_since_last_message", operator: ">=", value: 5 },
        { type: "no_reply_received", value: true },
        { type: "funnel_stage", value: "awareness" }
      ],
      actions: [
        {
          type: "send_dm",
          delayMinutes: 0,
          message: "Quick follow-up - wanted to make sure my last message did not get lost."
        }
      ],
      maxExecutionsPerCampaign: 2,
      delayBetweenExecutions: 240,
      retryOnFailure: true
    });

    // Rule 5: Trial started
    AutomationRule.create({
      productId: 1,
      name: "Trial Started -> Send Onboarding",
      description: "When prospect starts trial, send onboarding resources",
      status: "active",
      triggerEvent: "trial_started",
      triggerDescription: "Prospect activates trial",
      conditions: [
        { type: "offer_id", value: 2 }
      ],
      actions: [
        {
          type: "send_resource",
          resourceId: 4,
          delayMinutes: 60,
          message: "Welcome! Here is a guide to get the most out of your 14-day trial."
        },
        {
          type: "notify_founder",
          delayMinutes: 5,
          message: "New trial signup!"
        }
      ],
      maxExecutionsPerCampaign: 1,
      retryOnFailure: false
    });

    // Rule 6: Career Switcher engagement
    AutomationRule.create({
      productId: 2,
      name: "Career Switcher Engagement -> Professional Track",
      description: "Career switchers who engage positively get offered Professional Track",
      status: "active",
      triggerEvent: "reply_positive_sentiment",
      triggerDescription: "Career switcher replies positively",
      conditions: [
        { type: "audience", value: 4 },
        { type: "funnel_stage", value: "awareness" }
      ],
      actions: [
        {
          type: "send_offer",
          offerId: 6,
          delayMinutes: 120,
          message: "You seem serious about this transition. Our Professional Track is exactly for you."
        },
        {
          type: "change_funnel_stage",
          newStage: "consideration",
          delayMinutes: 0
        }
      ],
      maxExecutionsPerCampaign: 1,
      retryOnFailure: true
    });

    // Rule 7: University Graduate path
    AutomationRule.create({
      productId: 2,
      name: "Graduate -> Job-Readiness Path",
      description: "University graduates get job-readiness focused path",
      status: "active",
      triggerEvent: "profile_added",
      triggerDescription: "University graduate profile added",
      conditions: [
        { type: "audience", value: 5 }
      ],
      actions: [
        {
          type: "send_resource",
          resourceId: 2,
          delayMinutes: 360,
          message: "Hey! You are at a critical point in your career. Here is what employers look for."
        }
      ],
      maxExecutionsPerCampaign: 1,
      retryOnFailure: true
    });

    // Rule 8: CMO high fit
    AutomationRule.create({
      productId: 3,
      name: "CMO High Fit -> Schedule Call",
      description: "When CMO reaches high ICP fit, notify founder to schedule call",
      status: "active",
      triggerEvent: "high_icp_score",
      triggerDescription: "CMO prospect reaches high ICP score",
      conditions: [
        { type: "audience", value: 7 },
        { type: "icp_score", operator: ">=", value: 75 }
      ],
      actions: [
        {
          type: "send_offer",
          offerId: 7,
          delayMinutes: 0,
          message: "Based on your profile, we could really help. Let us schedule a call."
        },
        {
          type: "notify_founder",
          delayMinutes: 5,
          message: "High-fit CMO prospect ready for outreach!"
        },
        {
          type: "move_to_sales",
          delayMinutes: 0
        }
      ],
      maxExecutionsPerCampaign: 1,
      retryOnFailure: false
    });

    // Rule 9: Multiple replies
    AutomationRule.create({
      productId: 3,
      name: "Engaged Prospect -> Evaluation",
      description: "After 2+ replies, move to evaluation and send full campaign offer",
      status: "active",
      triggerEvent: "reply_received",
      triggerDescription: "Prospect sends second reply",
      conditions: [
        { type: "reply_count", operator: ">=", value: 2 },
        { type: "funnel_stage", value: "consideration" }
      ],
      actions: [
        {
          type: "change_funnel_stage",
          newStage: "evaluation",
          delayMinutes: 0
        },
        {
          type: "send_offer",
          offerId: 9,
          delayMinutes: 120,
          message: "You have clearly thought about this. Let me show you a full integrated campaign."
        }
      ],
      maxExecutionsPerCampaign: 1,
      retryOnFailure: true
    });
  }
}
