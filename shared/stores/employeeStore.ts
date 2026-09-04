import { create } from 'zustand';
import type { Employee, Brigade } from '@/shared/types/project';
import { apiFetch, ApiResponse } from '@/shared/lib/api-client';

interface EmployeeStore {
  employees: Employee[];
  brigades: Brigade[];
  loading: boolean;
  error: string | null;
  
  fetchEmployees: () => Promise<void>;
  fetchBrigades: () => Promise<void>;
  createEmployee: (data: Partial<Employee>) => Promise<void>;
  updateEmployee: (id: number, data: Partial<Employee>) => Promise<void>;
  deleteEmployee: (id: number) => Promise<void>;
  createBrigade: (data: Partial<Brigade>) => Promise<void>;
  updateBrigade: (id: number, data: Partial<Brigade>) => Promise<void>;
  deleteBrigade: (id: number) => Promise<void>;
}

export const useEmployeeStore = create<EmployeeStore>((set) => ({
  employees: [],
  brigades: [],
  loading: false,
  error: null,
  
  fetchEmployees: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await apiFetch<ApiResponse<Employee[]>>('/api/employees');
      set({ employees: data ?? [], loading: false, error: null });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },
  
  fetchBrigades: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await apiFetch<ApiResponse<Brigade[]>>('/api/brigades');
      set({ brigades: data ?? [], loading: false, error: null });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },
  
  createEmployee: async (data) => {
    set({ loading: true, error: null });
    try {
      const { data: created } = await apiFetch<ApiResponse<Employee>>('/api/employees', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      set((s) => ({
        employees: [created!, ...s.employees],
        loading: false,
        error: null,
      }));
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
      throw e;
    }
  },
  
  updateEmployee: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const { data: updated } = await apiFetch<ApiResponse<Employee>>(`/api/employees/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      set((s) => ({
        employees: s.employees.map(e => e.id === id ? updated! : e),
        loading: false,
        error: null,
      }));
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
      throw e;
    }
  },
  
  deleteEmployee: async (id) => {
    set({ loading: true, error: null });
    try {
      await apiFetch(`/api/employees/${id}`, { method: 'DELETE' });
      set((s) => ({
        employees: s.employees.filter(e => e.id !== id),
        loading: false,
        error: null,
      }));
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
      throw e;
    }
  },
  
  createBrigade: async (data) => {
    set({ loading: true, error: null });
    try {
      const { data: created } = await apiFetch<ApiResponse<Brigade>>('/api/brigades', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      set((s) => ({
        brigades: [created!, ...s.brigades],
        loading: false,
        error: null,
      }));
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
      throw e;
    }
  },
  
  updateBrigade: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const { data: updated } = await apiFetch<ApiResponse<Brigade>>(`/api/brigades/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      set((s) => ({
        brigades: s.brigades.map(b => b.id === id ? updated! : b),
        loading: false,
        error: null,
      }));
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
      throw e;
    }
  },
  
  deleteBrigade: async (id) => {
    set({ loading: true, error: null });
    try {
      await apiFetch(`/api/brigades/${id}`, { method: 'DELETE' });
      set((s) => ({
        brigades: s.brigades.filter(b => b.id !== id),
        loading: false,
        error: null,
      }));
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
      throw e;
    }
  },
}));
