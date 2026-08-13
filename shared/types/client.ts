// ============================================================
// Типы для Client API
// ============================================================

export interface ClientProject {
  id: number;
  name: string;
  address: string;
  type: string;
  area: string | number;
  status: string;
  cost: number;
  deadline: string;
}

export interface Client {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  projects: ClientProject[];
  createdAt: string;
  updatedAt: string;
}

// Типы для form data
export interface CreateClientInput {
  name: string;
  phone: string;
  email?: string | null;
}

export interface UpdateClientInput {
  name?: string;
  phone?: string;
  email?: string | null;
}
