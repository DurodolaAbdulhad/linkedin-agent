// In-memory resource library
let resources = [];
let nextId = 1;

export const initializeResources = () => {
  resources = [
    { id: 1, title: 'Africa Fundraising Toolkit', category: 'fundraising', type: 'guide', painPoint: 'fundraising', url: 'https://durodola.africa/guides' },
    { id: 2, title: 'GTM Playbook for African Startups', category: 'gtm', type: 'guide', painPoint: 'GTM strategy', url: 'https://durodola.africa/guides' },
    { id: 3, title: 'Africa Market Intelligence Pack', category: 'market-intel', type: 'guide', painPoint: 'market entry', url: 'https://durodola.africa/guides' },
    { id: 4, title: 'Islamic Finance Brief', category: 'finance', type: 'guide', painPoint: 'financial clarity', url: 'https://durodola.africa/guides' },
    { id: 5, title: 'AI Readiness Assessment', category: 'ai', type: 'assessment', painPoint: 'product-market fit', url: 'https://durodola.africa/guides' },
  ];
  nextId = resources.length + 1;
};

export const getResources = () => resources;

export const getResourcesByPainPoint = (painPoint) =>
  resources.filter(r => r.painPoint?.toLowerCase().includes(painPoint.toLowerCase()));

export const getResourcesByCategory = (category) =>
  resources.filter(r => r.category === category);

export const getResourcesByType = (type) =>
  resources.filter(r => r.type === type);

export const createResource = (data) => {
  const resource = { id: nextId++, ...data, createdAt: new Date() };
  resources.push(resource);
  return resource;
};

export const updateResource = (id, data) => {
  const idx = resources.findIndex(r => r.id === parseInt(id));
  if (idx === -1) return null;
  resources[idx] = { ...resources[idx], ...data, updatedAt: new Date() };
  return resources[idx];
};

export const deleteResource = (id) => {
  const idx = resources.findIndex(r => r.id === parseInt(id));
  if (idx === -1) return false;
  resources.splice(idx, 1);
  return true;
};

export const suggestResourceForProspect = (profile) => {
  const painPoint = profile.painPoint || '';
  const matched = getResourcesByPainPoint(painPoint);
  return matched.length > 0 ? matched[0] : resources[0] || null;
};
