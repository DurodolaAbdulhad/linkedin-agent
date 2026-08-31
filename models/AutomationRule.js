// In-memory automation rules (IF event → THEN action)
let rules = [];
let nextId = 1;

export const initializeAutomationRules = () => {
  rules = [
    { id: 1, productId: 1, name: 'Send resource on connection', trigger: 'connection_accepted', action: { type: 'send_resource', resourceId: 1 }, active: true },
    { id: 2, productId: 1, name: 'Follow up after 2 days', trigger: 'no_reply', action: { type: 'send_dm', stage: 2 }, active: true, delayDays: 2 },
    { id: 3, productId: 1, name: 'Send GTM guide on interest', trigger: 'positive_reply', action: { type: 'send_resource', resourceId: 2 }, active: true },
    { id: 4, productId: 2, name: 'Offer consulting on objection', trigger: 'objection_reply', action: { type: 'send_offer', offerId: 6 }, active: true },
    { id: 5, productId: 2, name: 'Book meeting on high interest', trigger: 'high_interest', action: { type: 'send_offer', offerId: 6 }, active: true },
    { id: 6, productId: 3, name: 'Send market intel on inquiry', trigger: 'market_inquiry', action: { type: 'send_resource', resourceId: 3 }, active: true },
    { id: 7, productId: 1, name: 'Upsell after first conversion', trigger: 'conversion', action: { type: 'send_offer', offerId: 2 }, active: true },
    { id: 8, productId: 2, name: 'Ask for referral at stage 7', trigger: 'stage_7', action: { type: 'send_dm', stage: 7 }, active: true },
    { id: 9, productId: 3, name: 'Pause campaign on negative', trigger: 'negative_reply', action: { type: 'pause_campaign' }, active: true },
  ];
  nextId = 10;
};

export class AutomationRule {
  static getAll() { return rules; }

  static findById(id) { return rules.find(r => r.id === parseInt(id)) || null; }

  static findByProductId(productId) { return rules.filter(r => r.productId === parseInt(productId)); }

  static findActiveByProductId(productId) { return rules.filter(r => r.productId === parseInt(productId) && r.active); }

  static findByTrigger(trigger) { return rules.filter(r => r.trigger === trigger && r.active); }

  static create(data) {
    const rule = { id: nextId++, ...data, active: true, createdAt: new Date() };
    rules.push(rule);
    return rule;
  }

  static update(id, data) {
    const idx = rules.findIndex(r => r.id === parseInt(id));
    if (idx === -1) return null;
    rules[idx] = { ...rules[idx], ...data };
    return rules[idx];
  }

  static toggle(id) {
    const rule = rules.find(r => r.id === parseInt(id));
    if (!rule) return null;
    rule.active = !rule.active;
    return rule;
  }
}
