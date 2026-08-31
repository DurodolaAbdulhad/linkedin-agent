// In-memory audience-resource mappings
let mappings = [];
let nextId = 1;

export const initializeAudienceResources = () => {
  mappings = [
    { id: 1, productId: 1, audienceId: 1, resourceId: 1, funnelStage: 'awareness', priority: 1 },
    { id: 2, productId: 1, audienceId: 2, resourceId: 3, funnelStage: 'consideration', priority: 1 },
    { id: 3, productId: 1, audienceId: 8, resourceId: 4, funnelStage: 'awareness', priority: 1 },
    { id: 4, productId: 2, audienceId: 5, resourceId: 2, funnelStage: 'consideration', priority: 1 },
    { id: 5, productId: 2, audienceId: 7, resourceId: 2, funnelStage: 'awareness', priority: 1 },
    { id: 6, productId: 3, audienceId: 6, resourceId: 3, funnelStage: 'decision', priority: 1 },
  ];
  nextId = 7;
};

export class AudienceResource {
  static getAll() { return mappings; }

  static findByProductAndAudience(productId, audienceId) {
    return mappings.filter(m => m.productId === parseInt(productId) && m.audienceId === parseInt(audienceId));
  }

  static findByAudienceId(audienceId) {
    return mappings.filter(m => m.audienceId === parseInt(audienceId));
  }

  static create(data) {
    const mapping = { id: nextId++, ...data };
    mappings.push(mapping);
    return mapping;
  }
}
