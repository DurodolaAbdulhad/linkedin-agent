// Resource library: ebooks, newsletters, events, products, etc
let resources = [];
let resourceId = 1;

// Pre-populated resource library
export const defaultResources = [
  {
    name: 'The Fundraising Playbook',
    type: 'ebook',
    price: 'free',
    url: 'https://example.com/fundraising-playbook',
    category: 'Ascent Finance',
    painPoints: ['fundraising', 'financial clarity'],
    description: '10 strategies for closing funding rounds',
  },
  {
    name: 'GTM Strategy Blueprint',
    type: 'ebook',
    price: 'free',
    url: 'https://example.com/gtm-blueprint',
    category: 'Ascent Finance',
    painPoints: ['GTM strategy', 'product-market fit'],
    description: 'Step-by-step go-to-market playbook',
  },
  {
    name: 'Ascent Finance Webinar: Building Financial Systems',
    type: 'event',
    price: 'free',
    url: 'https://example.com/finance-webinar',
    category: 'Ascent Finance',
    painPoints: ['financial clarity', 'compliance'],
    description: 'Live workshop on financial infrastructure',
  },
  {
    name: 'Ascent Learn Newsletter',
    type: 'newsletter',
    price: 'free',
    url: 'https://example.com/subscribe-learn',
    category: 'Ascent Learn',
    painPoints: ['team building', 'compliance'],
    description: 'Weekly insights on tech, business, and growth',
  },
  {
    name: 'Ascent Finance - SME Toolkit',
    type: 'product',
    price: 'paid',
    url: 'https://example.com/finance-toolkit',
    category: 'Ascent Finance',
    painPoints: ['financial clarity', 'compliance'],
    description: 'All-in-one accounting and payments suite',
  },
];

export const initializeResources = () => {
  defaultResources.forEach(resource => {
    resources.push({
      _id: resourceId++,
      ...resource,
      createdAt: new Date(),
    });
  });
};

export const createResource = (resource) => {
  const newResource = {
    _id: resourceId++,
    ...resource,
    createdAt: new Date(),
  };
  resources.push(newResource);
  return newResource;
};

export const getResources = () => resources;

export const getResourcesByPainPoint = (painPoint) => {
  return resources.filter(r => r.painPoints.includes(painPoint));
};

export const getResourcesByCategory = (category) => {
  return resources.filter(r => r.category === category);
};

export const getResourcesByType = (type) => {
  return resources.filter(r => r.type === type);
};

export const updateResource = (id, updates) => {
  const resource = resources.find(r => r._id == id);
  if (resource) {
    Object.assign(resource, updates, { updatedAt: new Date() });
  }
  return resource;
};

export const deleteResource = (id) => {
  const index = resources.findIndex(r => r._id == id);
  if (index !== -1) {
    const deleted = resources.splice(index, 1);
    return deleted[0];
  }
  return null;
};

// Suggest best resource for a prospect
export const suggestResourceForProspect = (painPoint) => {
  const matches = getResourcesByPainPoint(painPoint);
  if (matches.length === 0) return null;
  
  // Prefer free resources
  const freeResources = matches.filter(r => r.price === 'free');
  return freeResources.length > 0 ? freeResources[0] : matches[0];
};

export default {
  initializeResources,
  createResource,
  getResources,
  getResourcesByPainPoint,
  getResourcesByCategory,
  getResourcesByType,
  updateResource,
  deleteResource,
  suggestResourceForProspect,
};
