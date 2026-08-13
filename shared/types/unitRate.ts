// ============================================================
// Типы для UnitRate API (Расценки по квадратуре)
// ============================================================

export interface UnitRate {
  id: number;
  name: string;
  category: string;
  unit: string;
  pricePerUnit: number;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUnitRateInput {
  name: string;
  category: string;
  unit?: string;
  pricePerUnit: number;
  description?: string | null;
  isActive?: boolean;
}

export interface UpdateUnitRateInput {
  name?: string;
  category?: string;
  unit?: string;
  pricePerUnit?: number;
  description?: string | null;
  isActive?: boolean;
}
