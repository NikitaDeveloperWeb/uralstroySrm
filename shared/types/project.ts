// ============================================================
// Общие типы для Project API
// ============================================================

import type { Client } from './client';

export interface ProjectMaterial {
  id: number;
  projectId: number;
  name: string;
  quantity: string;
  cost: number;
  category?: string | null;
  stage?: string | null;
  createdAt: string;
}

export interface ProjectCompletedWork {
  id: number;
  projectId: number;
  name: string;
  quantity: string;
  cost: number;
  category?: string | null;
  stage?: string | null;
  createdAt: string;
}

export interface UnitRate {
  id: number;
  name: string;
  category: string;
  unit: string;
  pricePerUnit: number;
  description: string | null;
  isActive: boolean;
}

export interface ProjectTransaction {
  id: number;
  projectId: number;
  amount: number;
  date: string;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: number;
  name: string;
  area: string;
  address: string;
  type: string;
  cost: number;
  deadline: string;
  complexity: string;
  status: string;
  code: string;
  prepayment: number | null;
  prepaymentDate: string | null;
  unitRateId: number | null;
  unitRate?: UnitRate | null;
  brigadeId: number | null;
  brigade?: Brigade | null;
  clientId: number | null;
  client?: Client | null;
  materials?: ProjectMaterial[];
  completedWorks?: ProjectCompletedWork[];
  transactions?: ProjectTransaction[];
  
  // Поля для карты объекта
  floors?: number | null;
  hasMansard?: boolean | null;
  roofType?: string | null;
  roofColor?: string | null;
  hasVeranda?: boolean | null;
  verandaSize?: string | null;
  hasPorhch?: boolean | null;
  foundations?: string | null;
  walls?: string | null;
  insulation?: string | null;
  windows?: string | null;
  doorType?: string | null;
  communication?: string | null;
  description?: string | null;
  baseType?: string | null;
  homeType?: string | null;
  insulationThickness?: string | null;
  roofMaterial?: string | null;
  layout?: string | null;
  
  createdAt: string;
  updatedAt: string;
}

export interface Brigade {
  id: number;
  name: string;
  leaderId: number;
  memberIds: string;
  skills: string | string[];
  employees?: Employee[];
  projects?: Project[];
}

export interface Employee {
  id: number;
  fullName: string;
  birthDate: string;
  phone: string;
  address: string;
  hireDate: string;
  workplace: string;
  paymentType: string;
  employmentType: string;
  skills: string | string[];
  brigadeId: number | null;
}

// Типы для form data
export interface CreateProjectInput {
  name: string;
  area: string;
  address: string;
  type: string;
  cost: number;
  deadline: string;
  complexity: string;
  status: string;
  code: string;
  prepayment?: number | null;
  prepaymentDate?: string | null;
  unitRateId?: number | null;
  brigadeId?: number | null;
  clientId?: number | null;
  
  // Поля для карты объекта
  floors?: number | null;
  hasMansard?: boolean | null;
  roofType?: string | null;
  roofColor?: string | null;
  hasVeranda?: boolean | null;
  verandaSize?: string | null;
  hasPorhch?: boolean | null;
  foundations?: string | null;
  walls?: string | null;
  insulation?: string | null;
  windows?: string | null;
  doorType?: string | null;
  communication?: string | null;
  description?: string | null;
  baseType?: string | null;
  homeType?: string | null;
  insulationThickness?: string | null;
  roofMaterial?: string | null;
  layout?: string | null;
}

export interface UpdateProjectInput {
  name?: string;
  area?: string;
  address?: string;
  type?: string;
  cost?: number;
  deadline?: string;
  complexity?: string;
  status?: string;
  code?: string;
  prepayment?: number | null;
  prepaymentDate?: string | null;
  unitRateId?: number | null;
  brigadeId?: number | null;
  clientId?: number | null;
  
  // Поля для карты объекта
  floors?: number | null;
  hasMansard?: boolean | null;
  roofType?: string | null;
  roofColor?: string | null;
  hasVeranda?: boolean | null;
  verandaSize?: string | null;
  hasPorhch?: boolean | null;
  foundations?: string | null;
  walls?: string | null;
  insulation?: string | null;
  windows?: string | null;
  doorType?: string | null;
  communication?: string | null;
  description?: string | null;
  baseType?: string | null;
  homeType?: string | null;
  insulationThickness?: string | null;
  roofMaterial?: string | null;
  layout?: string | null;
}
