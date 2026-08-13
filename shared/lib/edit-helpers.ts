export function materialToEdit(m: { id?: number; name: string; quantity: string; cost: number; category?: string }) {
  return { id: m.id, material: m.name, quantity: m.quantity, cost: m.cost, category: m.category || '' };
}

export function workToEdit(w: { id?: number; name: string; quantity: string; cost: number; category?: string }) {
  return { id: w.id, work: w.name, quantity: w.quantity, cost: w.cost, category: w.category || '' };
}

export function toEditMaterial(item: { material: string; quantity: string; cost: number; category?: string; id?: number }) {
  return item;
}

export function toEditWork(item: { work: string; quantity: string; cost: number; category?: string; id?: number }) {
  return item;
}
