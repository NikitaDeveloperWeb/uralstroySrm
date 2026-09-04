export type MaterialStatus = 'in-stock' | 'ordered';

export interface Material {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  price?: number;
  lotNumber?: string;
  cost?: number;
  location?: string;
  status: MaterialStatus;
  supplierId?: number;
  orderDate?: string;
  expectedDelivery?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMaterialInput {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  price?: number;
  lotNumber?: string;
  status: MaterialStatus;
  location?: string;
  supplierId?: number;
  orderDate?: string;
  expectedDelivery?: string;
}

export interface UpdateMaterialInput {
  name?: string;
  category?: string;
  quantity?: number;
  unit?: string;
  status?: MaterialStatus;
  location?: string;
  supplierId?: number;
  orderDate?: string;
  expectedDelivery?: string;
}
