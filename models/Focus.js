// In-memory focus periods
let focuses = [];
let nextId = 1;

export const initializeFocus = () => {
  focuses = [
    {
      id: 1, name: 'Q3 2025 — Ascent Finance Launch', description: 'Focus on African SME financial tools',
      startDate: '2025-07-01', endDate: '2025-09-30',
      primaryProduct: 1, objective: 'Get first 100 SME signups', status: 'active',
    },
  ];
  nextId = 2;
};

export class Focus {
  static getAll() { return focuses; }

  static findActive() { return focuses.find(f => f.status === 'active') || null; }

  static findById(id) { return focuses.find(f => f.id === parseInt(id)) || null; }

  static create(data) {
    const focus = { id: nextId++, ...data, status: 'active', createdAt: new Date() };
    focuses.push(focus);
    return focus;
  }

  static update(id, data) {
    const idx = focuses.findIndex(f => f.id === parseInt(id));
    if (idx === -1) return null;
    focuses[idx] = { ...focuses[idx], ...data };
    return focuses[idx];
  }

  static delete(id) {
    const idx = focuses.findIndex(f => f.id === parseInt(id));
    if (idx === -1) return false;
    focuses.splice(idx, 1);
    return true;
  }

  static setActive(id) {
    focuses.forEach(f => { f.status = 'inactive'; });
    const focus = focuses.find(f => f.id === parseInt(id));
    if (focus) focus.status = 'active';
    return focus;
  }
}
