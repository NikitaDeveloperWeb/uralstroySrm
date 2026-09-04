import { create } from 'zustand';
import type { UnitRate } from '@/shared/types/unitRate';
import { apiFetch, createQueryUrl, ApiResponse } from '@/shared/lib/api-client';

interface UnitRateStore {
  unitRates: UnitRate[];
  loading: boolean;
  error: string | null;
  
  fetchUnitRates: (category?: string, targetType?: string, isActive?: boolean) => Promise<void>;
  createUnitRate: (data: Partial<UnitRate>) => Promise<void>;
  updateUnitRate: (id: number, data: Partial<UnitRate>) => Promise<void>;
  deleteUnitRate: (id: number) => Promise<void>;
}

export const useUnitRateStore = create<UnitRateStore>((set) => ({
  unitRates: [],
  loading: false,
  error: null,
  
  fetchUnitRates: async (category?: string, targetType?: string, isActive?: boolean) => {
    set({ loading: true, error: null });
    try {
      const params: Record<string, string> = {};
      if (category) params.category = category;
      if (targetType) params.targetType = targetType;
      if (isActive !== undefined) params.isActive = String(isActive);
      
      const { data } = await apiFetch<ApiResponse<UnitRate[]>>(createQueryUrl('/api/unit-rates', Object.keys(params).length ? params : undefined));
      set({ unitRates: data ?? [], loading: false, error: null });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },
  
  createUnitRate: async (data) => {
    set({ loading: true, error: null });
    try {
      const { data: created } = await apiFetch<ApiResponse<UnitRate>>('/api/unit-rates', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      set((s) => ({
        unitRates: [created!, ...s.unitRates],
        loading: false,
        error: null,
      }));
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
      throw e;
    }
  },
  
  updateUnitRate: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const { data: updated } = await apiFetch<ApiResponse<UnitRate>>(`/api/unit-rates/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      set((s) => ({
        unitRates: s.unitRates.map(r => r.id === id ? updated! : r),
        loading: false,
        error: null,
      }));
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
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
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
      throw e;
    }
  },
}));
