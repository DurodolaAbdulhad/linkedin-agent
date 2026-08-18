let campaignAutomations = [];
let nextExecutionId = 1;

export class CampaignAutomation {
  constructor(data) {
    this._id = nextExecutionId++;
    this.campaignId = data.campaignId;
    this.ruleId = data.ruleId;
    this.eventId = data.eventId;

    // Execution details
    this.status = data.status || 'pending'; // pending, executing, completed, failed
    this.executedActions = data.executedActions || []; // Array of executed actions
    this.failureReason = data.failureReason || null;
    this.retryCount = data.retryCount || 0;

    // Timing
    this.scheduledFor = data.scheduledFor || new Date().toISOString();
    this.executedAt = data.executedAt || null;
    this.completedAt = data.completedAt || null;

    // Results
    this.results = data.results || {}; // Result data from execution
    this.impactOnConversion = data.impactOnConversion || null; // Did this help conversion?

    this.createdAt = new Date().toISOString();
  }

  static create(data) {
    const execution = new CampaignAutomation(data);
    campaignAutomations.push(execution);
    return execution;
  }

  static findById(id) {
    return campaignAutomations.find(ca => ca._id === id);
  }

  static findByCampaignId(campaignId) {
    return campaignAutomations.filter(ca => ca.campaignId === campaignId);
  }

  static findByRuleId(ruleId) {
    return campaignAutomations.filter(ca => ca.ruleId === ruleId);
  }

  static findPending() {
    return campaignAutomations.filter(ca => ca.status === 'pending');
  }

  static findPendingByCampaign(campaignId) {
    return campaignAutomations.filter(ca => ca.campaignId === campaignId && ca.status === 'pending');
  }

  static getPendingForExecution(limitMinutes = 5) {
    const cutoff = new Date();
    return campaignAutomations.filter(
      ca => ca.status === 'pending' && new Date(ca.scheduledFor) <= cutoff
    );
  }

  static markExecuting(id) {
    const automation = this.findById(id);
    if (automation) {
      automation.status = 'executing';
      automation.executedAt = new Date().toISOString();
    }
    return automation;
  }

  static markCompleted(id, results = {}) {
    const automation = this.findById(id);
    if (automation) {
      automation.status = 'completed';
      automation.completedAt = new Date().toISOString();
      automation.results = results;
    }
    return automation;
  }

  static markFailed(id, reason) {
    const automation = this.findById(id);
    if (automation) {
      automation.status = 'failed';
      automation.failureReason = reason;
      automation.retryCount = (automation.retryCount || 0) + 1;
    }
    return automation;
  }

  static recordAction(id, actionType, actionResult) {
    const automation = this.findById(id);
    if (automation) {
      automation.executedActions.push({
        type: actionType,
        result: actionResult,
        executedAt: new Date().toISOString()
      });
    }
    return automation;
  }

  static getAll() {
    return campaignAutomations;
  }

  static getStats(campaignId) {
    const automations = this.findByCampaignId(campaignId);
    return {
      total: automations.length,
      pending: automations.filter(a => a.status === 'pending').length,
      executing: automations.filter(a => a.status === 'executing').length,
      completed: automations.filter(a => a.status === 'completed').length,
      failed: automations.filter(a => a.status === 'failed').length
    };
  }

  static delete(id) {
    const index = campaignAutomations.findIndex(ca => ca._id === id);
    if (index > -1) {
      campaignAutomations.splice(index, 1);
      return true;
    }
    return false;
  }

  static deleteOlderThan(daysBack = 90) {
    const cutoff = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
    const before = campaignAutomations.length;
    campaignAutomations = campaignAutomations.filter(ca => new Date(ca.createdAt) > cutoff);
    return { deletedCount: before - campaignAutomations.length };
  }
}

export function initializeCampaignAutomation() {
  // No initialization needed - automations are created at runtime
}
