import { create } from 'zustand';
import type { Employee, Brigade } from '@/shared/types/project';

interface EmployeeStore {
  // Данные
  employees: Employee[];
  brigades: Brigade[];
  
  // Состояние загрузки
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchEmployees: () => Promise<void>;
  fetchBrigades: () => Promise<void>;
  createEmployee: (data: Partial<Employee>) => Promise<void>;
  updateEmployee: (id: number, data: Partial<Employee>) => Promise<void>;
  deleteEmployee: (id: number) => Promise<void>;
  createBrigade: (data: Partial<Brigade>) => Promise<void>;
  updateBrigade: (id: number, data: Partial<Brigade>) => Promise<void>;
  deleteBrigade: (id: number) => Promise<void>;
}

async function apiFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `API error: ${res.status}`);
  }
  // DELETE возвращает 204 без тела
  if (res.status === 204) return null;
  return res.json();
}

export const useEmployeeStore = create<EmployeeStore>((set) => ({
  employees: [],
  brigades: [],
  loading: false,
  error: null,
  
  fetchEmployees: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await apiFetch('/api/employees');
      set({ employees: data as Employee[], loading: false, error: null });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },
  
  fetchBrigades: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await apiFetch('/api/brigades');
      set({ brigades: data as Brigade[], loading: false, error: null });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },
  
  createEmployee: async (data) => {
    set({ loading: true, error: null });
    try {
      const { data: created } = await apiFetch('/api/employees', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      set((s) => ({
        employees: [created as Employee, ...s.employees],
        loading: false,
        error: null,
      }));
    } catch (e: any) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },
  
  updateEmployee: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const { data: updated } = await apiFetch(`/api/employees/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      set((s) => ({
        employees: s.employees.map(e => e.id === id ? updated as Employee : e),
        loading: false,
        error: null,
      }));
    } catch (e: any) {
      set({ error: e.message, loading: false });
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
    } catch (e: any) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },
  
  createBrigade: async (data) => {
    set({ loading: true, error: null });
    try {
      const { data: created } = await apiFetch('/api/brigades', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      set((s) => ({
        brigades: [created as Brigade, ...s.brigades],
        loading: false,
        error: null,
      }));
    } catch (e: any) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },
  
  updateBrigade: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const { data: updated } = await apiFetch(`/api/brigades/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      set((s) => ({
        brigades: s.brigades.map(b => b.id === id ? updated as Brigade : b),
        loading: false,
        error: null,
      }));
    } catch (e: any) {
      set({ error: e.message, loading: false });
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
    } catch (e: any) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },
}));
