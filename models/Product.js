let products = [];
let nextProductId = 1;

export class Product {
  constructor(data) {
    this._id = nextProductId++;
    this.name = data.name || 'Unnamed Product';
    this.slug = data.slug || data.name?.toLowerCase().replace(/\s+/g, '-') || 'product';
    this.category = data.category || ''; // Fintech, Edtech, Enterprise, etc.
    this.description = data.description || '';
    this.website = data.website || '';
    this.status = data.status || 'active'; // active, beta, archived

    // Pricing & Business Model
    this.pricing = data.pricing || {
      model: 'freemium', // freemium, subscription, one-time, hybrid
      freePrice: 0,
      paidPricing: [], // [{ name, price, currency, billingPeriod }]
      currency: 'NGN'
    };

    // Strategic Configuration
    this.objective = data.objective || 'awareness'; // awareness, leads, trials, sales, revenue, retention, expansion
    this.targetMarket = data.targetMarket || {
      industries: [],
      companySizeMin: 1,
      companySizeMax: 500,
      geography: [],
      revenueMin: null,
      revenueMax: null,
      growthStage: []
    };

    // ICP (Ideal Customer Profile)
    this.icp = data.icp || {
      roles: [], // Founder, CEO, CFO, Finance Manager, etc.
      decisionMakers: [],
      purchaseAuthority: 'high',
      buyingCycle: 'medium', // short, medium, long
      budgetRange: null
    };

    // Pain Points & Value
    this.painPoints = data.painPoints || [];
    this.valueProposition = data.valueProposition || '';
    this.coreOffer = data.coreOffer || '';
    this.offer = data.offer || {
      name: '',
      description: '',
      price: 0,
      discount: 0,
      trial: false,
      trialDays: 0,
      guarantee: null,
      bonus: null,
      deadline: null,
      landingPage: '',
      cta: 'Start Free' // Call-to-action
    };

    // Conversion Path
    this.conversionPath = data.conversionPath || {
      stages: ['awareness', 'education', 'consideration', 'evaluation', 'conversion'],
      avgConversionTime: null,
      expectedConversionRate: 0
    };

    // Resources & Content
    this.resources = data.resources || []; // Array of resource IDs
    this.contentThemes = data.contentThemes || [];

    // Audiences (can have multiple per product)
    this.audiences = data.audiences || [];

    // Metrics & Targets
    this.targets = data.targets || {
      monthlyProspects: 0,
      monthlyLeads: 0,
      monthlyConversions: 0,
      avgDealSize: 0,
      targetARR: 0
    };

    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  static create(data) {
    const product = new Product(data);
    products.push(product);
    return product;
  }

  static findById(id) {
    return products.find(p => p._id === id);
  }

  static findBySlug(slug) {
    return products.find(p => p.slug === slug);
  }

  static getAll() {
    return products;
  }

  static getActive() {
    return products.filter(p => p.status === 'active');
  }

  static update(id, data) {
    const product = this.findById(id);
    if (!product) return null;

    Object.assign(product, data, { updatedAt: new Date().toISOString() });
    return product;
  }

  static delete(id) {
    const index = products.findIndex(p => p._id === id);
    if (index > -1) {
      products.splice(index, 1);
      return true;
    }
    return false;
  }

  static addAudience(productId, audience) {
    const product = this.findById(productId);
    if (!product) return null;

    product.audiences.push(audience);
    product.updatedAt = new Date().toISOString();
    return product;
  }

  static removeAudience(productId, audienceId) {
    const product = this.findById(productId);
    if (!product) return null;

    product.audiences = product.audiences.filter(a => a._id !== audienceId);
    product.updatedAt = new Date().toISOString();
    return product;
  }
}

export function initializeProducts() {
  if (products.length === 0) {
    // Ascent Finance
    Product.create({
      name: 'Ascent Finance',
      slug: 'ascent-finance',
      category: 'Fintech',
      description: 'All-in-one financial tools suite for African SMEs — accounting, payments, HR, CRM',
      website: 'https://ascentfinance.com',
      status: 'active',
      objective: 'sales',
      pricing: {
        model: 'freemium',
        freePrice: 0,
        paidPricing: [
          { name: 'Growth Plan', price: 15000, currency: 'NGN', billingPeriod: 'monthly' },
          { name: 'Scale Plan', price: 35000, currency: 'NGN', billingPeriod: 'monthly' }
        ]
      },
      targetMarket: {
        industries: ['Retail', 'Services', 'Manufacturing', 'E-commerce', 'Distribution'],
        companySizeMin: 1,
        companySizeMax: 500,
        geography: ['Nigeria', 'Africa'],
        growthStage: ['early', 'growth']
      },
      icp: {
        roles: ['Founder', 'CEO', 'CFO', 'Finance Manager'],
        decisionMakers: ['Founder', 'CEO'],
        purchaseAuthority: 'high'
      },
      painPoints: [
        'Poor financial visibility',
        'Manual bookkeeping',
        'Tax uncertainty',
        'Payroll complexity',
        'Cash flow management'
      ],
      valueProposition: 'Financial clarity, time savings, compliance-ready infrastructure',
      coreOffer: 'Free Forever Plan with core accounting features',
      offer: {
        name: 'Ascent Finance Free Plan',
        description: 'Start managing your finances with zero cost',
        price: 0,
        trial: true,
        trialDays: 14,
        cta: 'Start Free',
        landingPage: 'https://ascentfinance.com/free'
      },
      targets: {
        monthlyProspects: 500,
        monthlyLeads: 150,
        monthlyConversions: 30,
        avgDealSize: 15000,
        targetARR: 5400000
      }
    });

    // Ascent Learn
    Product.create({
      name: 'Ascent Learn',
      slug: 'ascent-learn',
      category: 'Edtech',
      description: 'Skills and education platform for African professionals and entrepreneurs',
      website: 'https://ascentlearn.com',
      status: 'active',
      objective: 'leads',
      pricing: {
        model: 'hybrid',
        freePrice: 0,
        paidPricing: [
          { name: 'Basic Course', price: 5000, currency: 'NGN', billingPeriod: 'one-time' },
          { name: 'Professional Track', price: 25000, currency: 'NGN', billingPeriod: 'one-time' }
        ]
      },
      targetMarket: {
        industries: [],
        companySizeMin: 1,
        companySizeMax: 1000,
        geography: ['Africa'],
        growthStage: ['early', 'growth', 'mature']
      },
      icp: {
        roles: ['Student', 'Graduate', 'Young Professional', 'Career Switcher'],
        decisionMakers: ['Individual', 'Parent'],
        purchaseAuthority: 'medium'
      },
      painPoints: [
        'Lack of practical skills',
        'Career uncertainty',
        'Limited access to quality education',
        'Affordable upskilling needs'
      ],
      valueProposition: 'Africa-focused, practical, affordable skills training',
      coreOffer: 'Free course access with optional certification',
      offer: {
        name: 'Ascent Learn Free Access',
        description: 'Explore courses and start learning today',
        price: 0,
        cta: 'Explore Courses',
        landingPage: 'https://ascentlearn.com'
      },
      targets: {
        monthlyProspects: 2000,
        monthlyLeads: 600,
        monthlyConversions: 120,
        avgDealSize: 12500,
        targetARR: 1800000
      }
    });

    // Ascent Corporate
    Product.create({
      name: 'Ascent Corporate',
      slug: 'ascent-corporate',
      category: 'Enterprise',
      description: 'Full-service creative agency for African businesses — branding, campaigns, design',
      website: 'https://ascentcreative.com',
      status: 'active',
      objective: 'sales',
      pricing: {
        model: 'custom',
        freePrice: 0,
        paidPricing: []
      },
      targetMarket: {
        industries: ['All'],
        companySizeMin: 10,
        companySizeMax: 5000,
        geography: ['Africa'],
        growthStage: ['growth', 'mature', 'scale']
      },
      icp: {
        roles: ['Marketing Director', 'CEO', 'CMO'],
        decisionMakers: ['CEO', 'CMO'],
        purchaseAuthority: 'high'
      },
      painPoints: [
        'Inconsistent brand identity',
        'Poor campaign execution',
        'Lack of design resources',
        'Campaign measurement issues'
      ],
      valueProposition: 'End-to-end creative services with African market expertise',
      coreOffer: 'Strategic consultation and campaign design',
      offer: {
        name: 'Ascent Creative Consultation',
        description: 'Strategic brand and campaign planning session',
        price: 500,
        currency: 'USD',
        cta: 'Book Consultation',
        landingPage: 'https://ascentcreative.com/consult'
      },
      targets: {
        monthlyProspects: 100,
        monthlyLeads: 25,
        monthlyConversions: 5,
        avgDealSize: 50000,
        targetARR: 3000000
      }
    });
  }
}
