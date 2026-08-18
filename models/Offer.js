let offers = [];
let nextOfferId = 1;

export class Offer {
  constructor(data) {
    this._id = nextOfferId++;
    this.productId = data.productId; // Which product this offer is for
    this.name = data.name || 'Unnamed Offer';
    this.slug = data.slug || data.name?.toLowerCase().replace(/\s+/g, '-') || 'offer';
    this.description = data.description || '';
    this.status = data.status || 'active'; // active, paused, archived

    // Offer Details
    this.price = data.price || 0;
    this.currency = data.currency || 'NGN';
    this.billingPeriod = data.billingPeriod || 'monthly'; // monthly, annual, one-time
    this.discount = data.discount || 0; // % discount if applicable
    this.originalPrice = data.originalPrice || null; // For showing "was X, now Y"

    // Trial & Guarantee
    this.hasTrial = data.hasTrial || false;
    this.trialDays = data.trialDays || 0;
    this.trialPrice = data.trialPrice || 0; // Price during trial (usually 0)

    this.hasGuarantee = data.hasGuarantee || false;
    this.guaranteeDays = data.guaranteeDays || 0;
    this.guaranteeDescription = data.guaranteeDescription || '';

    // Bonuses & Sweeteners
    this.bonuses = data.bonuses || []; // Array of bonus items
    this.freeResources = data.freeResources || []; // Free ebooks, templates, etc.

    // Urgency & Scarcity
    this.hasDeadline = data.hasDeadline || false;
    this.deadlineDate = data.deadlineDate || null;
    this.deadlineText = data.deadlineText || ''; // "Offer expires in 7 days"
    this.limitedSeats = data.limitedSeats || null; // Number of available seats
    this.seatsRemaining = data.seatsRemaining || null;

    // Targeting & Rules
    this.targetAudiences = data.targetAudiences || []; // Audience IDs this offer is for
    this.targetPainPoints = data.targetPainPoints || []; // Which pain points does this solve?
    this.funnelStage = data.funnelStage || 'awareness'; // awareness, consideration, evaluation, decision
    this.minQualificationScore = data.minQualificationScore || 0; // ICP score threshold to show offer

    // Call-to-Action
    this.cta = data.cta || 'Start Free'; // Button text
    this.ctaUrl = data.ctaUrl || ''; // Where CTA button goes
    this.landingPageUrl = data.landingPageUrl || '';

    // Messaging
    this.headline = data.headline || ''; // Main offer headline
    this.subheadline = data.subheadline || ''; // Supporting message
    this.bulletPoints = data.bulletPoints || []; // Key benefits

    // Conversion & Analytics
    this.expectedConversionRate = data.expectedConversionRate || 0; // 0-100
    this.monthlyTarget = data.monthlyTarget || 0; // How many to convert per month
    this.conversionsThusFar = data.conversionsThusFar || 0;
    this.revenueGenerated = data.revenueGenerated || 0;

    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  static create(data) {
    const offer = new Offer(data);
    offers.push(offer);
    return offer;
  }

  static findById(id) {
    return offers.find(o => o._id === id);
  }

  static findByProductId(productId) {
    return offers.filter(o => o.productId === productId);
  }

  static findActiveByProductId(productId) {
    return offers.filter(o => o.productId === productId && o.status === 'active');
  }

  static getAll() {
    return offers;
  }

  static update(id, data) {
    const offer = this.findById(id);
    if (!offer) return null;

    Object.assign(offer, data, { updatedAt: new Date().toISOString() });
    return offer;
  }

  static delete(id) {
    const index = offers.findIndex(o => o._id === id);
    if (index > -1) {
      offers.splice(index, 1);
      return true;
    }
    return false;
  }

  static deleteByProductId(productId) {
    offers = offers.filter(o => o.productId !== productId);
    return true;
  }

  static recordConversion(id) {
    const offer = this.findById(id);
    if (!offer) return null;

    offer.conversionsThusFar = (offer.conversionsThusFar || 0) + 1;
    offer.updatedAt = new Date().toISOString();
    return offer;
  }
}

export function initializeOffers() {
  if (offers.length === 0) {
    // Ascent Finance Offers

    // Offer 1: Free Forever Plan
    Offer.create({
      productId: 1,
      name: 'Free Forever Plan',
      slug: 'free-forever',
      description: 'Start managing finances with zero cost. Core accounting features, unlimited users.',
      price: 0,
      hasTrial: false,
      targetAudiences: [1, 2, 3], // SME Founder, Finance Manager, HR Manager
      targetPainPoints: ['Poor financial visibility', 'Manual bookkeeping'],
      funnelStage: 'awareness',
      cta: 'Start Free',
      ctaUrl: 'https://ascentfinance.com/free',
      landingPageUrl: 'https://ascentfinance.com/free',
      headline: 'Start managing your finances with zero cost',
      subheadline: 'No credit card required. Core accounting features forever.',
      bulletPoints: [
        'Unlimited invoices',
        'Basic expense tracking',
        'Team collaboration (up to 3 users)',
        'Monthly reports',
        'Mobile app access'
      ],
      expectedConversionRate: 45,
      monthlyTarget: 500
    });

    // Offer 2: Growth Plan
    Offer.create({
      productId: 1,
      name: 'Growth Plan',
      slug: 'growth-plan',
      description: 'Advanced features for growing SMEs. Payments, advanced reports, tax support.',
      price: 15000,
      currency: 'NGN',
      billingPeriod: 'monthly',
      originalPrice: 20000,
      discount: 25,
      hasTrial: true,
      trialDays: 14,
      trialPrice: 0,
      hasGuarantee: true,
      guaranteeDays: 30,
      guaranteeDescription: 'Full refund if not satisfied',
      targetAudiences: [1, 2, 3],
      targetPainPoints: ['Manual bookkeeping', 'Tax uncertainty', 'Payroll complexity'],
      funnelStage: 'consideration',
      cta: 'Start 14-Day Free Trial',
      ctaUrl: 'https://ascentfinance.com/trial',
      landingPageUrl: 'https://ascentfinance.com/growth',
      headline: 'Everything you need to scale your business',
      subheadline: 'All Free features + Payments, Tax Reports, Payroll',
      bulletPoints: [
        'All Free features',
        'Payment processing (Stripe, Paystack, bank transfers)',
        'Advanced tax reports (ready for accountant)',
        'Payroll automation',
        'Expense categorization',
        'Priority support',
        'Up to 10 team members'
      ],
      expectedConversionRate: 25,
      monthlyTarget: 150,
      bonuses: [
        'Free tax filing guide (PDF)',
        '1 hour strategy call with accountant'
      ]
    });

    // Offer 3: Scale Plan
    Offer.create({
      productId: 1,
      name: 'Scale Plan',
      slug: 'scale-plan',
      description: 'Enterprise-grade features for scaling businesses. API access, custom integrations.',
      price: 35000,
      currency: 'NGN',
      billingPeriod: 'monthly',
      originalPrice: 50000,
      discount: 30,
      hasTrial: true,
      trialDays: 30,
      trialPrice: 0,
      hasGuarantee: true,
      guaranteeDays: 60,
      guaranteeDescription: 'Full refund within 60 days',
      targetAudiences: [1, 2, 3],
      targetPainPoints: ['All'],
      funnelStage: 'evaluation',
      cta: 'Schedule Demo',
      ctaUrl: 'https://ascentfinance.com/demo',
      landingPageUrl: 'https://ascentfinance.com/scale',
      headline: 'Enterprise finance management for scale-ups',
      subheadline: 'All Growth features + API, Custom integrations, Dedicated support',
      bulletPoints: [
        'All Growth features',
        'API access for custom integrations',
        'Bulk import/export',
        'Advanced analytics & forecasting',
        'Multi-company management',
        'Custom workflows',
        'Unlimited team members',
        'Dedicated account manager',
        '24/7 priority support'
      ],
      expectedConversionRate: 15,
      monthlyTarget: 30,
      bonuses: [
        'Custom onboarding (8 hours)',
        'Integration setup assistance',
        'Quarterly business review'
      ]
    });

    // Ascent Learn Offers

    // Offer 4: Free Access
    Offer.create({
      productId: 2,
      name: 'Free Access',
      slug: 'free-access',
      description: 'Browse and start learning for free. No credit card required.',
      price: 0,
      hasTrial: false,
      targetAudiences: [4, 5, 6], // All Learn audiences
      targetPainPoints: ['Lack of practical skills'],
      funnelStage: 'awareness',
      cta: 'Explore Courses',
      ctaUrl: 'https://ascentlearn.com',
      landingPageUrl: 'https://ascentlearn.com',
      headline: 'Start learning skills that move careers forward',
      subheadline: 'Free access to select courses. No credit card needed.',
      bulletPoints: [
        'Access to free courses',
        'Read lesson materials',
        'Community forum access',
        'Progress tracking',
        'Mobile app (read-only)'
      ],
      expectedConversionRate: 60,
      monthlyTarget: 2000
    });

    // Offer 5: Basic Course
    Offer.create({
      productId: 2,
      name: 'Single Course',
      slug: 'single-course',
      description: 'Unlock one full course with video, projects, and certificate.',
      price: 5000,
      currency: 'NGN',
      billingPeriod: 'one-time',
      hasTrial: true,
      trialDays: 3,
      trialPrice: 0,
      hasGuarantee: true,
      guaranteeDays: 7,
      guaranteeDescription: 'Full refund if not satisfied',
      targetAudiences: [4, 5, 6],
      targetPainPoints: ['Lack of practical skills'],
      funnelStage: 'consideration',
      cta: 'Enroll Now',
      ctaUrl: 'https://ascentlearn.com/enroll',
      landingPageUrl: 'https://ascentlearn.com/courses',
      headline: 'Learn a new skill in 30 days',
      subheadline: 'Video lessons + 5 real-world projects + Certificate of completion',
      bulletPoints: [
        'Video lessons (2-4 hours)',
        '5 hands-on projects',
        'Code templates & resources',
        'Certificate of completion',
        'Lifetime access',
        'Mobile app access',
        'Community peer review'
      ],
      expectedConversionRate: 30,
      monthlyTarget: 600,
      freeResources: ['Project starter templates', 'Job search guide']
    });

    // Offer 6: Professional Track
    Offer.create({
      productId: 2,
      name: 'Professional Track',
      slug: 'professional-track',
      description: 'Complete learning path: 3 courses + mentorship + job prep.',
      price: 25000,
      currency: 'NGN',
      billingPeriod: 'one-time',
      originalPrice: 35000,
      discount: 28,
      hasTrial: true,
      trialDays: 7,
      trialPrice: 0,
      hasGuarantee: true,
      guaranteeDays: 14,
      guaranteeDescription: 'Full refund if not satisfied',
      limitedSeats: 100,
      seatsRemaining: 42,
      hasDeadline: true,
      deadlineDate: '2026-09-30',
      deadlineText: 'Enroll by Sept 30 for lifetime access',
      targetAudiences: [4, 5], // Career Switcher, University Graduate
      targetPainPoints: ['Lack of practical skills', 'Need affordable training'],
      funnelStage: 'evaluation',
      cta: 'Start Professional Track',
      ctaUrl: 'https://ascentlearn.com/professional',
      landingPageUrl: 'https://ascentlearn.com/professional',
      headline: 'Career transformation in 90 days',
      subheadline: '3 courses + 1:1 mentorship + Portfolio building + Job guarantee',
      bulletPoints: [
        '3 full courses (12 hours each)',
        '30 real-world projects',
        '1:1 mentorship (4 sessions)',
        'Portfolio review & feedback',
        'LinkedIn optimization session',
        'Interview prep',
        'Job board access (12 months)',
        'Lifetime course updates',
        'Community access',
        'Money-back guarantee'
      ],
      expectedConversionRate: 20,
      monthlyTarget: 120,
      bonuses: [
        'LinkedIn profile audit',
        'Portfolio template',
        'Interview prep guide',
        '3-month job search support'
      ]
    });

    // Ascent Corporate Offers

    // Offer 7: Free Consultation
    Offer.create({
      productId: 3,
      name: 'Free Consultation',
      slug: 'free-consultation',
      description: '30-min call to understand your brand challenges and opportunities.',
      price: 0,
      hasTrial: false,
      targetAudiences: [7, 8], // CMO, Startup Founder
      targetPainPoints: ['Inconsistent brand identity'],
      funnelStage: 'awareness',
      cta: 'Book Consultation',
      ctaUrl: 'https://ascentcreative.com/consult',
      landingPageUrl: 'https://ascentcreative.com/consult',
      headline: 'Get expert feedback on your brand strategy',
      subheadline: 'Free 30-min consultation with a senior strategist. No obligation.',
      bulletPoints: [
        '30-min video call',
        'Brand audit',
        'Competitive analysis',
        'Strategic recommendations',
        'Customized proposal (if you want to proceed)'
      ],
      expectedConversionRate: 40,
      monthlyTarget: 100
    });

    // Offer 8: Brand Strategy Workshop
    Offer.create({
      productId: 3,
      name: 'Brand Strategy Workshop',
      slug: 'brand-strategy',
      description: '2-day workshop to define brand strategy, positioning, and messaging.',
      price: 500,
      currency: 'USD',
      billingPeriod: 'one-time',
      hasGuarantee: true,
      guaranteeDays: 30,
      guaranteeDescription: 'Full refund if outcomes not met',
      targetAudiences: [7, 8],
      targetPainPoints: ['Inconsistent brand identity'],
      funnelStage: 'consideration',
      cta: 'Schedule Workshop',
      ctaUrl: 'https://ascentcreative.com/workshop',
      landingPageUrl: 'https://ascentcreative.com/workshop',
      headline: 'Define your brand in 2 days',
      subheadline: 'Interactive workshop with strategy deliverables and implementation roadmap',
      bulletPoints: [
        '2 full days (in-person or remote)',
        'Brand positioning statement',
        'Messaging framework',
        'Visual identity direction',
        'Competitive differentiation',
        'Implementation roadmap',
        'Post-workshop support (4 weeks)'
      ],
      expectedConversionRate: 25,
      monthlyTarget: 8,
      bonuses: [
        'Brand book template',
        'Messaging guidelines',
        'Social media strategy outline'
      ]
    });

    // Offer 9: Full Campaign Execution
    Offer.create({
      productId: 3,
      name: 'Integrated Campaign',
      slug: 'integrated-campaign',
      description: '90-day end-to-end campaign: strategy, design, content, execution, analytics.',
      price: 5000,
      currency: 'USD',
      billingPeriod: 'one-time',
      hasGuarantee: true,
      guaranteeDays: 60,
      guaranteeDescription: 'Performance guarantee or money back',
      targetAudiences: [7, 8],
      targetPainPoints: ['All'],
      funnelStage: 'evaluation',
      cta: 'Start Campaign',
      ctaUrl: 'https://ascentcreative.com/campaign',
      landingPageUrl: 'https://ascentcreative.com/campaign',
      headline: 'Launch your biggest campaign yet',
      subheadline: 'Full-service 90-day campaign with strategy, design, content, and launch',
      bulletPoints: [
        'Campaign strategy & planning',
        'Creative direction & design',
        'Content production (video, copy, graphics)',
        'Campaign launch (LinkedIn, Twitter, Email)',
        'Performance optimization',
        'Weekly reporting',
        'Post-campaign analysis',
        'Team training on results'
      ],
      expectedConversionRate: 15,
      monthlyTarget: 5,
      bonuses: [
        'Post-campaign strategy session',
        'Team training workshop',
        'Next quarter planning session'
      ]
    });
  }
}
