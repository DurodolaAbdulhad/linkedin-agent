let audiences = [];
let nextAudienceId = 1;

export class Audience {
  constructor(data) {
    this._id = nextAudienceId++;
    this.productId = data.productId; // Which product this audience is for
    this.name = data.name || 'Unnamed Audience';
    this.slug = data.slug || data.name?.toLowerCase().replace(/\s+/g, '-') || 'audience';
    this.description = data.description || '';
    this.icon = data.icon || '👤'; // emoji for visual identification

    // Audience Characteristics
    this.roles = data.roles || []; // Founder, CEO, CFO, etc.
    this.decisionMaker = data.decisionMaker || false; // Is this the buyer?
    this.buyingInfluence = data.buyingInfluence || 'medium'; // low, medium, high

    // Pain Points Specific to This Audience
    this.painPoints = data.painPoints || []; // Subset of product pain points
    this.goals = data.goals || []; // What this audience wants to achieve
    this.objections = data.objections || []; // Common objections

    // Messaging & Tone
    this.messagingTone = data.messagingTone || 'professional'; // professional, casual, technical, executive
    this.valueDriver = data.valueDriver || ''; // What matters most: time, cost, control, status, etc.

    // Funnel Behavior
    this.avgConversionTime = data.avgConversionTime || null; // days
    this.expectedConversionRate = data.expectedConversionRate || 0; // 0-100
    this.engagementLevel = data.engagementLevel || 'medium'; // low, medium, high

    // Preferred Content & Resources
    this.preferredContentTypes = data.preferredContentTypes || []; // ebook, video, webinar, case study, etc.
    this.preferredChannels = data.preferredChannels || []; // LinkedIn, email, SMS, etc.

    // Audience Size & Targets
    this.estimatedSize = data.estimatedSize || null; // % of market
    this.targetReach = data.targetReach || null; // how many to target monthly

    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  static create(data) {
    const audience = new Audience(data);
    audiences.push(audience);
    return audience;
  }

  static findById(id) {
    return audiences.find(a => a._id === id);
  }

  static findByProductId(productId) {
    return audiences.filter(a => a.productId === productId);
  }

  static getAll() {
    return audiences;
  }

  static update(id, data) {
    const audience = this.findById(id);
    if (!audience) return null;

    Object.assign(audience, data, { updatedAt: new Date().toISOString() });
    return audience;
  }

  static delete(id) {
    const index = audiences.findIndex(a => a._id === id);
    if (index > -1) {
      audiences.splice(index, 1);
      return true;
    }
    return false;
  }

  static deleteByProductId(productId) {
    audiences = audiences.filter(a => a.productId !== productId);
    return true;
  }
}

export function initializeAudiences() {
  if (audiences.length === 0) {
    // Ascent Finance Audiences
    // Audience 1: SME Founder
    Audience.create({
      productId: 1,
      name: 'SME Founder',
      slug: 'sme-founder',
      icon: '🚀',
      description: 'Business owner, typically wears many hats, focused on growth and survival',
      roles: ['Founder', 'Owner'],
      decisionMaker: true,
      buyingInfluence: 'high',
      painPoints: [
        'Poor financial visibility',
        'Cash flow management',
        'Time management (too many manual tasks)'
      ],
      goals: [
        'Grow revenue 50%+ annually',
        'Reduce admin burden',
        'Make faster decisions with data'
      ],
      objections: [
        'Too expensive',
        'Takes too long to implement',
        'Need to see proof it works for my industry'
      ],
      messagingTone: 'casual',
      valueDriver: 'time',
      avgConversionTime: 14,
      expectedConversionRate: 25,
      engagementLevel: 'high',
      preferredContentTypes: ['case-study', 'webinar', 'how-to-guide'],
      preferredChannels: ['LinkedIn', 'Email', 'WhatsApp'],
      targetReach: 150
    });

    // Audience 2: Finance Manager
    Audience.create({
      productId: 1,
      name: 'Finance Manager',
      slug: 'finance-manager',
      icon: '📊',
      description: 'Handles accounting, payroll, tax compliance. Reports to founder/CEO',
      roles: ['Finance Manager', 'Accountant', 'CFO'],
      decisionMaker: false,
      buyingInfluence: 'high',
      painPoints: [
        'Manual bookkeeping',
        'Tax uncertainty',
        'Compliance headaches'
      ],
      goals: [
        'Streamline tax filing',
        'Automate invoice processing',
        'Ensure compliance'
      ],
      objections: [
        'Integration with existing systems',
        'Data security concerns',
        'Learning curve'
      ],
      messagingTone: 'professional',
      valueDriver: 'accuracy',
      avgConversionTime: 21,
      expectedConversionRate: 35,
      engagementLevel: 'medium',
      preferredContentTypes: ['whitepaper', 'technical-guide', 'webinar'],
      preferredChannels: ['LinkedIn', 'Email'],
      targetReach: 100
    });

    // Audience 3: HR Manager
    Audience.create({
      productId: 1,
      name: 'HR Manager',
      slug: 'hr-manager',
      icon: '👥',
      description: 'Manages payroll, benefits, compliance. Often stretched thin',
      roles: ['HR Manager', 'Operations Manager'],
      decisionMaker: false,
      buyingInfluence: 'medium',
      painPoints: [
        'Payroll complexity',
        'Tax compliance (PAYE, pension)',
        'Manual HR processes'
      ],
      goals: [
        'Automate payroll',
        'Stay compliant with labor laws',
        'Reduce admin time'
      ],
      objections: [
        'Employee resistance to change',
        'Cost concerns',
        'Integration challenges'
      ],
      messagingTone: 'professional',
      valueDriver: 'compliance',
      avgConversionTime: 21,
      expectedConversionRate: 20,
      engagementLevel: 'medium',
      preferredContentTypes: ['compliance-guide', 'video', 'webinar'],
      preferredChannels: ['Email', 'LinkedIn'],
      targetReach: 80
    });

    // Ascent Learn Audiences
    // Audience 4: Career Switcher
    Audience.create({
      productId: 2,
      name: 'Career Switcher',
      slug: 'career-switcher',
      icon: '🔄',
      description: 'Professional changing careers, needs practical skills quickly',
      roles: ['Professional', 'Student'],
      decisionMaker: true,
      buyingInfluence: 'high',
      painPoints: [
        'Lack of skills for new industry',
        'Fear of starting over',
        'Need affordable training'
      ],
      goals: [
        'Gain marketable skills in 3-6 months',
        'Land a job in new field',
        'Build confidence'
      ],
      objections: [
        'Too expensive',
        'Will I actually get hired?',
        'Time commitment concerns'
      ],
      messagingTone: 'casual',
      valueDriver: 'opportunity',
      avgConversionTime: 7,
      expectedConversionRate: 30,
      engagementLevel: 'high',
      preferredContentTypes: ['video', 'project-based', 'success-stories'],
      preferredChannels: ['YouTube', 'Instagram', 'Email'],
      targetReach: 600
    });

    // Audience 5: University Graduate
    Audience.create({
      productId: 2,
      name: 'University Graduate',
      slug: 'university-graduate',
      icon: '🎓',
      description: 'Fresh graduate entering job market, needs job-ready skills',
      roles: ['Student', 'Entry-level Professional'],
      decisionMaker: true,
      buyingInfluence: 'high',
      painPoints: [
        'Theoretical vs practical skills gap',
        'No job experience',
        'Uncertain what employers want'
      ],
      goals: [
        'Land first professional job',
        'Build portfolio projects',
        'Understand industry expectations'
      ],
      objections: [
        'Low budget',
        'Information overload',
        'Not sure what to learn'
      ],
      messagingTone: 'casual',
      valueDriver: 'career',
      avgConversionTime: 5,
      expectedConversionRate: 40,
      engagementLevel: 'high',
      preferredContentTypes: ['video', 'interactive-course', 'mentorship'],
      preferredChannels: ['Instagram', 'TikTok', 'Discord'],
      targetReach: 800
    });

    // Audience 6: Working Professional
    Audience.create({
      productId: 2,
      name: 'Working Professional',
      slug: 'working-professional',
      icon: '💼',
      description: 'Employed, upskilling to advance or switch roles',
      roles: ['Professional', 'Manager'],
      decisionMaker: true,
      buyingInfluence: 'high',
      painPoints: [
        'Limited time for learning',
        'Skills gap for promotion',
        'Fear of being replaced by AI'
      ],
      goals: [
        'Get promoted in 12 months',
        'Learn AI/tech skills',
        'Increase earning potential'
      ],
      objections: [
        'No time to study',
        'Cost concerns',
        'Skeptical of online learning'
      ],
      messagingTone: 'professional',
      valueDriver: 'growth',
      avgConversionTime: 14,
      expectedConversionRate: 25,
      engagementLevel: 'medium',
      preferredContentTypes: ['micro-learning', 'certificate', 'case-study'],
      preferredChannels: ['LinkedIn', 'Email'],
      targetReach: 400
    });

    // Ascent Corporate Audiences
    // Audience 7: CMO/Marketing Director
    Audience.create({
      productId: 3,
      name: 'CMO/Marketing Director',
      slug: 'cmo-marketing-director',
      icon: '📢',
      description: 'Leads marketing strategy, manages budgets and creative direction',
      roles: ['CMO', 'Marketing Director', 'Marketing Manager'],
      decisionMaker: true,
      buyingInfluence: 'high',
      painPoints: [
        'Inconsistent brand identity',
        'Campaign measurement issues',
        'Creative execution delays'
      ],
      goals: [
        'Launch integrated campaign in 60 days',
        'Improve brand awareness 40%',
        'Measure ROI accurately'
      ],
      objections: [
        'Agency costs',
        'Communication friction',
        'Results uncertainty'
      ],
      messagingTone: 'professional',
      valueDriver: 'results',
      avgConversionTime: 30,
      expectedConversionRate: 15,
      engagementLevel: 'medium',
      preferredContentTypes: ['case-study', 'portfolio', 'strategy-workshop'],
      preferredChannels: ['LinkedIn', 'Email'],
      targetReach: 25
    });

    // Audience 8: Startup Founder
    Audience.create({
      productId: 3,
      name: 'Startup Founder',
      slug: 'startup-founder',
      icon: '🚀',
      description: 'Early-stage founder building brand and awareness with limited budget',
      roles: ['Founder', 'CEO'],
      decisionMaker: true,
      buyingInfluence: 'high',
      painPoints: [
        'Limited budget for marketing',
        'Need to do everything DIY',
        'No brand identity yet'
      ],
      goals: [
        'Build brand identity',
        'Launch product with fanfare',
        'Get first 1000 users'
      ],
      objections: [
        'Can\'t afford agency fees',
        'Too early to need design',
        'DIY is good enough'
      ],
      messagingTone: 'casual',
      valueDriver: 'efficiency',
      avgConversionTime: 21,
      expectedConversionRate: 12,
      engagementLevel: 'high',
      preferredContentTypes: ['template', 'guide', 'case-study'],
      preferredChannels: ['Twitter', 'LinkedIn', 'Email'],
      targetReach: 50
    });
  }
}
