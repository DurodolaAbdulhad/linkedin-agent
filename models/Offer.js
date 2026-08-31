// In-memory offer catalog
let offers = [];
let nextId = 1;

export const initializeOffers = () => {
  offers = [
    { id: 1, productId: 1, name: 'Free Ascent Finance Access', type: 'free', value: 0, currency: 'USD', cta: 'Sign up free', url: 'https://durodola.africa' },
    { id: 2, productId: 2, name: 'Africa Fundraising Toolkit', type: 'guide', value: 29, currency: 'USD', cta: 'Download guide', url: 'https://durodola.africa/guides' },
    { id: 3, productId: 2, name: 'GTM Playbook', type: 'guide', value: 49, currency: 'USD', cta: 'Get playbook', url: 'https://durodola.africa/guides' },
    { id: 4, productId: 2, name: 'Africa Market Intelligence Pack', type: 'guide', value: 49, currency: 'USD', cta: 'Get intelligence', url: 'https://durodola.africa/guides' },
    { id: 5, productId: 2, name: 'Islamic Finance Brief', type: 'guide', value: 29, currency: 'USD', cta: 'Get brief', url: 'https://durodola.africa/guides' },
    { id: 6, productId: 3, name: 'GTM Strategy Session (60min)', type: 'consulting', value: 500, currency: 'USD', cta: 'Book session', url: 'https://durodola.africa/book' },
    { id: 7, productId: 3, name: 'Fundraising Coaching (90min)', type: 'consulting', value: 750, currency: 'USD', cta: 'Book session', url: 'https://durodola.africa/book' },
    { id: 8, productId: 3, name: 'Market Entry Advisory (3hr)', type: 'consulting', value: 1500, currency: 'USD', cta: 'Book advisory', url: 'https://durodola.africa/book' },
    { id: 9, productId: 3, name: 'Monthly Retainer', type: 'retainer', value: 2000, currency: 'USD', cta: 'Start retainer', url: 'https://durodola.africa/consulting' },
  ];
  nextId = 10;
};

export class Offer {
  static getAll() { return offers; }

  static findById(id) { return offers.find(o => o.id === parseInt(id)) || null; }

  static findByProductId(productId) { return offers.filter(o => o.productId === parseInt(productId)); }

  static findByType(type) { return offers.filter(o => o.type === type); }

  static create(data) {
    const offer = { id: nextId++, ...data, createdAt: new Date() };
    offers.push(offer);
    return offer;
  }

  static update(id, data) {
    const idx = offers.findIndex(o => o.id === parseInt(id));
    if (idx === -1) return null;
    offers[idx] = { ...offers[idx], ...data };
    return offers[idx];
  }
}
