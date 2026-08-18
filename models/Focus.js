let focuses = [];
let nextFocusId = 1;

export class Focus {
  constructor(data) {
    this._id = nextFocusId++;
    this.name = data.name || 'Unnamed Focus';
    this.description = data.description || '';
    this.startDate = data.startDate || new Date().toISOString();
    this.endDate = data.endDate || null;
    this.status = data.status || 'active'; // active, completed, archived
    this.founder = data.founder || 'Durodola Abdulhad';
    this.primaryProduct = data.primaryProduct || null;
    this.secondaryProducts = data.secondaryProducts || [];
    this.supportingProducts = data.supportingProducts || [];
    this.productAllocation = data.productAllocation || {}; // { productId: percentage }
    this.objective = data.objective || '';
    this.targetMetrics = data.targetMetrics || {}; // { metric: value }
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  static create(data) {
    const focus = new Focus(data);
    focuses.push(focus);
    return focus;
  }

  static findById(id) {
    return focuses.find(f => f._id === id);
  }

  static findActive() {
    return focuses.find(f => f.status === 'active');
  }

  static getAll() {
    return focuses;
  }

  static update(id, data) {
    const focus = this.findById(id);
    if (!focus) return null;

    Object.assign(focus, data, { updatedAt: new Date().toISOString() });
    return focus;
  }

  static delete(id) {
    const index = focuses.findIndex(f => f._id === id);
    if (index > -1) {
      focuses.splice(index, 1);
      return true;
    }
    return false;
  }

  static setActive(id) {
    focuses.forEach(f => f.status = f._id === id ? 'active' : f.status);
    return this.findById(id);
  }
}

export function initializeFocus() {
  if (focuses.length === 0) {
    Focus.create({
      name: 'Q3 2026 Growth Focus',
      description: 'Primary focus on Ascent Finance user acquisition',
      startDate: new Date().toISOString(),
      endDate: null,
      status: 'active',
      founder: 'Durodola Abdulhad',
      primaryProduct: 1, // Will link to Ascent Finance product ID
      secondaryProducts: [2, 3], // Ascent Learn, Ascent Corporate
      objective: 'Acquire 500 qualified SME customers',
      productAllocation: {
        '1': 60, // Ascent Finance 60%
        '2': 25, // Ascent Learn 25%
        '3': 15  // Ascent Corporate 15%
      }
    });
  }
}
