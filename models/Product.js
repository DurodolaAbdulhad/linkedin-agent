// In-memory product catalog
let products = [];
let nextId = 1;

export const initializeProducts = () => {
  products = [
    { id: 1, name: 'Ascent Finance', slug: 'ascent-finance', description: 'Financial tools for African SMEs', status: 'active', price: 0, currency: 'USD' },
    { id: 2, name: 'Ascent Learn', slug: 'ascent-learn', description: 'GTM and fundraising education for African founders', status: 'active', price: 29, currency: 'USD' },
    { id: 3, name: 'Ascent Corporate', slug: 'ascent-corporate', description: 'Enterprise GTM consulting and intelligence', status: 'active', price: 500, currency: 'USD' },
  ];
  nextId = 4;
};

export class Product {
  static getAll() { return products; }

  static getActive() { return products.filter(p => p.status === 'active'); }

  static findById(id) { return products.find(p => p.id === parseInt(id)) || null; }

  static findBySlug(slug) { return products.find(p => p.slug === slug) || null; }

  static create(data) {
    const product = { id: nextId++, ...data, createdAt: new Date() };
    products.push(product);
    return product;
  }

  static update(id, data) {
    const idx = products.findIndex(p => p.id === parseInt(id));
    if (idx === -1) return null;
    products[idx] = { ...products[idx], ...data };
    return products[idx];
  }
}
