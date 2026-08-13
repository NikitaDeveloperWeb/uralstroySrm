import { create } from 'zustand';
import type { UnitRate } from '@/shared/types/unitRate';

interface UnitRateStore {
  // Данные
  unitRates: UnitRate[];
  
  // Состояние загрузки
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchUnitRates: (category?: string, isActive?: boolean) => Promise<void>;
  createUnitRate: (data: Partial<UnitRate>) => Promise<void>;
  updateUnitRate: (id: number, data: Partial<UnitRate>) => Promise<void>;
  deleteUnitRate: (id: number) => Promise<void>;
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
  if (res.status === 204) return null;
  return res.json();
}

export const useUnitRateStore = create<UnitRateStore>((set) => ({
  unitRates: [],
  loading: false,
  error: null,
  
  fetchUnitRates: async (category?: string, isActive?: boolean) => {
    set({ loading: true, error: null });
    try {
      let url = '/api/unit-rates';
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      if (isActive !== undefined) params.set('isActive', String(isActive));
      if (params.toString()) url += `?${params.toString()}`;
      
      const { data } = await apiFetch(url);
      set({ unitRates: data as UnitRate[], loading: false, error: null });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },
  
  createUnitRate: async (data) => {
    set({ loading: true, error: null });
    try {
      const { data: created } = await apiFetch('/api/unit-rates', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      set((s) => ({
        unitRates: [created as UnitRate, ...s.unitRates],
        loading: false,
        error: null,
      }));
    } catch (e: any) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },
  
  updateUnitRate: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const { data: updated } = await apiFetch(`/api/unit-rates/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      set((s) => ({
        unitRates: s.unitRates.map(r => r.id === id ? updated as UnitRate : r),
        loading: false,
        error: null,
      }));
    } catch (e: any) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },
  
  deleteUnitRate: async (id) => {
    set({ loading: true, error: null });
    try {
      await apiFetch(`/api/unit-rates/${id}`, { method: 'DELETE' });
      set((s) => ({
        unitRates: s.unitRates.filter(r => r.id !== id),
        loading: false,
        error: null,
      }));
    } catch (e: any) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },
}));
