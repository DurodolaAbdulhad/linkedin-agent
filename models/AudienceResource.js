let audienceResources = [];
let nextMappingId = 1;

export class AudienceResource {
  constructor(data) {
    this._id = nextMappingId++;
    this.productId = data.productId; // Which product
    this.audienceId = data.audienceId; // Which audience
    this.resourceId = data.resourceId; // Which resource
    this.painPoint = data.painPoint; // Which pain point does this resource address?
    this.funnelStage = data.funnelStage || 'awareness'; // awareness, education, consideration, evaluation, conversion
    this.priority = data.priority || 'medium'; // low, medium, high
    this.sequence = data.sequence || 0; // Order in the journey (0, 1, 2, etc.)
    this.triggerEvent = data.triggerEvent || null; // What triggers sending this resource?
    this.createdAt = new Date().toISOString();
  }

  static create(data) {
    const mapping = new AudienceResource(data);
    audienceResources.push(mapping);
    return mapping;
  }

  static findById(id) {
    return audienceResources.find(m => m._id === id);
  }

  static findByProductAndAudience(productId, audienceId) {
    return audienceResources.filter(m => m.productId === productId && m.audienceId === audienceId);
  }

  static findByProductAudiencePain(productId, audienceId, painPoint) {
    return audienceResources.filter(
      m => m.productId === productId && m.audienceId === audienceId && m.painPoint === painPoint
    );
  }

  static findByFunnelStage(productId, audienceId, funnelStage) {
    return audienceResources.filter(
      m => m.productId === productId && m.audienceId === audienceId && m.funnelStage === funnelStage
    );
  }

  static getAll() {
    return audienceResources;
  }

  static update(id, data) {
    const mapping = this.findById(id);
    if (!mapping) return null;

    Object.assign(mapping, data, { updatedAt: new Date().toISOString() });
    return mapping;
  }

  static delete(id) {
    const index = audienceResources.findIndex(m => m._id === id);
    if (index > -1) {
      audienceResources.splice(index, 1);
      return true;
    }
    return false;
  }

  static deleteByProductId(productId) {
    audienceResources = audienceResources.filter(m => m.productId !== productId);
    return true;
  }

  static deleteByAudienceId(audienceId) {
    audienceResources = audienceResources.filter(m => m.audienceId !== audienceId);
    return true;
  }
}

export function initializeAudienceResources() {
  if (audienceResources.length === 0) {
    // Ascent Finance → SME Founder (Audience 1)

    // Awareness stage: Educational content about financial management
    AudienceResource.create({
      productId: 1,
      audienceId: 1, // SME Founder
      resourceId: 1, // "7 Financial Mistakes Nigerian SMEs Make" (from existing Resource Library)
      painPoint: 'Poor financial visibility',
      funnelStage: 'awareness',
      priority: 'high',
      sequence: 0,
      triggerEvent: 'profile_added'
    });

    AudienceResource.create({
      productId: 1,
      audienceId: 1,
      resourceId: 2, // Ascent Finance Newsletter
      painPoint: 'Cash flow management',
      funnelStage: 'awareness',
      priority: 'high',
      sequence: 1,
      triggerEvent: 'first_dm_opened'
    });

    // Consideration stage: Use-case and ROI content
    AudienceResource.create({
      productId: 1,
      audienceId: 1,
      resourceId: 3, // Case study: How a retail SME saved 20 hours/month
      painPoint: 'Poor financial visibility',
      funnelStage: 'consideration',
      priority: 'high',
      sequence: 2,
      triggerEvent: 'reply_positive_sentiment'
    });

    AudienceResource.create({
      productId: 1,
      audienceId: 1,
      resourceId: 4, // Event: Finance for Founders Webinar
      painPoint: 'All',
      funnelStage: 'consideration',
      priority: 'medium',
      sequence: 3,
      triggerEvent: 'second_reply_received'
    });

    // Evaluation stage: Technical and pricing info
    AudienceResource.create({
      productId: 1,
      audienceId: 1,
      resourceId: 5, // Product: Ascent Finance (link to actual product)
      painPoint: 'All',
      funnelStage: 'evaluation',
      priority: 'high',
      sequence: 4,
      triggerEvent: 'high_icp_score'
    });

    // Ascent Finance → Finance Manager (Audience 2)
    AudienceResource.create({
      productId: 1,
      audienceId: 2, // Finance Manager
      resourceId: 1, // Mistakes guide (technical angle)
      painPoint: 'Manual bookkeeping',
      funnelStage: 'awareness',
      priority: 'high',
      sequence: 0,
      triggerEvent: 'profile_added'
    });

    AudienceResource.create({
      productId: 1,
      audienceId: 2,
      resourceId: 2, // Newsletter (compliance focus)
      painPoint: 'Tax uncertainty',
      funnelStage: 'awareness',
      priority: 'high',
      sequence: 1,
      triggerEvent: 'first_dm_opened'
    });

    AudienceResource.create({
      productId: 1,
      audienceId: 2,
      resourceId: 3, // Case study (technical/compliance angle)
      painPoint: 'Manual bookkeeping',
      funnelStage: 'consideration',
      priority: 'high',
      sequence: 2,
      triggerEvent: 'reply_positive_sentiment'
    });

    // Ascent Learn → Career Switcher (Audience 4)
    AudienceResource.create({
      productId: 2,
      audienceId: 4, // Career Switcher
      resourceId: 1, // Success stories
      painPoint: 'Fear of starting over',
      funnelStage: 'awareness',
      priority: 'high',
      sequence: 0,
      triggerEvent: 'profile_added'
    });

    AudienceResource.create({
      productId: 2,
      audienceId: 4,
      resourceId: 2, // Career transition guide
      painPoint: 'Lack of skills for new industry',
      funnelStage: 'consideration',
      priority: 'high',
      sequence: 1,
      triggerEvent: 'first_dm_opened'
    });

    AudienceResource.create({
      productId: 2,
      audienceId: 4,
      resourceId: 4, // Live workshop: Career transition strategies
      painPoint: 'All',
      funnelStage: 'evaluation',
      priority: 'medium',
      sequence: 2,
      triggerEvent: 'second_reply_received'
    });

    // Ascent Learn → University Graduate (Audience 5)
    AudienceResource.create({
      productId: 2,
      audienceId: 5, // University Graduate
      resourceId: 1, // Success stories from recent grads
      painPoint: 'Theoretical vs practical skills gap',
      funnelStage: 'awareness',
      priority: 'high',
      sequence: 0,
      triggerEvent: 'profile_added'
    });

    AudienceResource.create({
      productId: 2,
      audienceId: 5,
      resourceId: 2, // Job-readiness guide
      painPoint: 'No job experience',
      funnelStage: 'consideration',
      priority: 'high',
      sequence: 1,
      triggerEvent: 'first_dm_opened'
    });

    AudienceResource.create({
      productId: 2,
      audienceId: 5,
      resourceId: 4, // Portfolio-building workshop
      painPoint: 'No job experience',
      funnelStage: 'evaluation',
      priority: 'high',
      sequence: 2,
      triggerEvent: 'positive_reply_received'
    });

    // Ascent Corporate → CMO/Marketing Director (Audience 7)
    AudienceResource.create({
      productId: 3,
      audienceId: 7, // CMO
      resourceId: 1, // Brand strategy playbook
      painPoint: 'Inconsistent brand identity',
      funnelStage: 'awareness',
      priority: 'high',
      sequence: 0,
      triggerEvent: 'profile_added'
    });

    AudienceResource.create({
      productId: 3,
      audienceId: 7,
      resourceId: 3, // Case study: Brand transformation
      painPoint: 'Campaign execution delays',
      funnelStage: 'consideration',
      priority: 'high',
      sequence: 1,
      triggerEvent: 'first_dm_opened'
    });

    AudienceResource.create({
      productId: 3,
      audienceId: 7,
      resourceId: 4, // Strategy workshop
      painPoint: 'All',
      funnelStage: 'evaluation',
      priority: 'high',
      sequence: 2,
      triggerEvent: 'high_icp_score'
    });

    // Ascent Corporate → Startup Founder (Audience 8)
    AudienceResource.create({
      productId: 3,
      audienceId: 8, // Startup Founder
      resourceId: 1, // DIY branding guide (budget-friendly)
      painPoint: 'Limited budget for marketing',
      funnelStage: 'awareness',
      priority: 'high',
      sequence: 0,
      triggerEvent: 'profile_added'
    });

    AudienceResource.create({
      productId: 3,
      audienceId: 8,
      resourceId: 2, // Startup brand checklist
      painPoint: 'Need to do everything DIY',
      funnelStage: 'consideration',
      priority: 'high',
      sequence: 1,
      triggerEvent: 'first_dm_opened'
    });

    AudienceResource.create({
      productId: 3,
      audienceId: 8,
      resourceId: 3, // Case study: Founder's first brand
      painPoint: 'No brand identity yet',
      funnelStage: 'consideration',
      priority: 'medium',
      sequence: 2,
      triggerEvent: 'reply_received'
    });
  }
}
