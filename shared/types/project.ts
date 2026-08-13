// ============================================================
// Общие типы для Project API
// ============================================================

export interface ProjectMaterial {
  id: number;
  projectId: number;
  name: string;
  quantity: string;
  cost: number;
  category?: string | null;
  createdAt: string;
}

export interface ProjectCompletedWork {
  id: number;
  projectId: number;
  name: string;
  quantity: string;
  cost: number;
  category?: string | null;
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
  materials?: ProjectMaterial[];
  completedWorks?: ProjectCompletedWork[];
  createdAt: string;
  updatedAt: string;
}

export interface Brigade {
  id: number;
  name: string;
  leaderId: number;
  memberIds: string;
  skills: string;
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
  skills: string;
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
}
