import { create } from 'zustand';
import { apiFetch } from '@/shared/lib/api-client';
import type { ApiResponse } from '@/shared/lib/api-client';
import type { Material, CreateMaterialInput, UpdateMaterialInput } from '@/shared/types/material';

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface MaterialStore {
  materials: Material[];
  pagination: PaginationInfo | null;
  isLoading: boolean;
  error: string | null;
  fetchMaterials: (page?: number, limit?: number, status?: string) => Promise<void>;
  createMaterial: (data: CreateMaterialInput) => Promise<Material | null>;
  updateMaterial: (id: number, data: UpdateMaterialInput) => Promise<Material | null>;
  deleteMaterial: (id: number) => Promise<boolean>;
}

export const useMaterialStore = create<MaterialStore>((set) => ({
  materials: [],
  pagination: null,
  isLoading: false,
  error: null,

  fetchMaterials: async (page = 1, limit = 1000, status?: string) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('limit', String(limit));
      if (status) params.append('status', status);

      const { data } = await apiFetch<ApiResponse<{ items: Material[]; pagination: PaginationInfo }>>(
        `/api/warehouse?${params.toString()}`
      );
      set({
        materials: data?.items || [],
        isLoading: false,
      });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Ошибка загрузки', isLoading: false });
    }
  },

  createMaterial: async (data) => {
    try {
      const { data: item } = await apiFetch<ApiResponse<Material>>('/api/warehouse', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (!item) return null;
      set((state) => ({ materials: [item, ...state.materials] }));
      return item;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Ошибка создания' });
      return null;
    }
  },

  updateMaterial: async (id, data) => {
    try {
      const { data: item } = await apiFetch<ApiResponse<Material>>(`/api/warehouse/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      if (!item) return null;
      set((state) => ({
        materials: state.materials.map((m) => (m.id === id ? item : m)),
      }));
      return item;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Ошибка обновления' });
      return null;
    }
  },

  deleteMaterial: async (id) => {
    try {
      await apiFetch(`/api/warehouse/${id}`, { method: 'DELETE' });
      set((state) => ({
        materials: state.materials.filter((m) => m.id !== id),
      }));
      return true;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Ошибка удаления' });
      return false;
    }
  },
}));
