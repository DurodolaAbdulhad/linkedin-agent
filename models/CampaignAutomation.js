// In-memory campaign automation execution tracking
let automations = [];
let nextId = 1;

export const initializeCampaignAutomation = () => {
  automations = [];
  nextId = 1;
};

export class CampaignAutomation {
  static getAll() { return automations; }

  static findById(id) { return automations.find(a => a.id === parseInt(id)) || null; }

  static findByCampaignId(campaignId) {
    return automations.filter(a => a.campaignId === String(campaignId));
  }

  static getStats(campaignId) {
    const campAutomations = automations.filter(a => a.campaignId === String(campaignId));
    return {
      total: campAutomations.length,
      executed: campAutomations.filter(a => a.status === 'executed').length,
      pending: campAutomations.filter(a => a.status === 'pending').length,
      failed: campAutomations.filter(a => a.status === 'failed').length,
    };
  }

  static create(data) {
    const automation = { id: nextId++, ...data, status: 'pending', createdAt: new Date() };
    automations.push(automation);
    return automation;
  }

  static markExecuted(id, result = {}) {
    const a = automations.find(a => a.id === parseInt(id));
    if (!a) return null;
    a.status = 'executed';
    a.executedAt = new Date();
    a.result = result;
    return a;
  }

  static markFailed(id, error) {
    const a = automations.find(a => a.id === parseInt(id));
    if (!a) return null;
    a.status = 'failed';
    a.error = error;
    return a;
  }
}
