// In-memory audience profiles
let audiences = [];
let nextId = 1;

export const initializeAudiences = () => {
  audiences = [
    { id: 1, name: 'Nigerian Founders', productId: 1, painPoints: ['fundraising', 'GTM strategy'], preferredChannels: ['LinkedIn'], region: 'Nigeria' },
    { id: 2, name: 'East African Operators', productId: 1, painPoints: ['market entry', 'compliance'], preferredChannels: ['LinkedIn', 'Email'], region: 'Kenya' },
    { id: 3, name: 'West African SME Owners', productId: 1, painPoints: ['financial clarity'], preferredChannels: ['LinkedIn', 'WhatsApp'], region: 'Ghana' },
    { id: 4, name: 'African Tech Investors', productId: 2, painPoints: ['deal flow'], preferredChannels: ['LinkedIn', 'Twitter'], region: 'Pan-Africa' },
    { id: 5, name: 'Seed-Stage Founders', productId: 2, painPoints: ['fundraising', 'product-market fit'], preferredChannels: ['LinkedIn'], region: 'Pan-Africa' },
    { id: 6, name: 'Corporate Innovation Teams', productId: 3, painPoints: ['market intelligence'], preferredChannels: ['Email', 'LinkedIn'], region: 'Pan-Africa' },
    { id: 7, name: 'African Diaspora Founders', productId: 2, painPoints: ['market entry', 'GTM strategy'], preferredChannels: ['LinkedIn', 'Twitter'], region: 'Diaspora' },
    { id: 8, name: 'Islamic Finance Seekers', productId: 1, painPoints: ['financial clarity', 'compliance'], preferredChannels: ['LinkedIn', 'Email'], region: 'Pan-Africa' },
  ];
  nextId = 9;
};

export class Audience {
  static getAll() { return audiences; }

  static findById(id) { return audiences.find(a => a.id === parseInt(id)) || null; }

  static findByProductId(productId) { return audiences.filter(a => a.productId === parseInt(productId)); }

  static create(data) {
    const audience = { id: nextId++, ...data, createdAt: new Date() };
    audiences.push(audience);
    return audience;
  }

  static update(id, data) {
    const idx = audiences.findIndex(a => a.id === parseInt(id));
    if (idx === -1) return null;
    audiences[idx] = { ...audiences[idx], ...data };
    return audiences[idx];
  }
}
