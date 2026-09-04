import { create } from 'zustand';
import type { ProjectMaterial, ProjectCompletedWork } from '@/shared/types/project';
import type { Material } from '@/shared/types/material';
import { apiFetch, createQueryUrl, ApiResponse } from '@/shared/lib/api-client';

export interface UnitRate {
  id: number;
  name: string;
  category: string;
  unit: string;
  pricePerUnit: number;
  targetType: 'client' | 'employee';
  description: string | null;
  isActive: boolean;
}

export interface MaterialTemplate {
  id: number;
  name: string;
  quantity: string;
  cost: number;
  category?: string | null;
  isSystem: boolean;
}

export interface WorkTemplate {
  id: number;
  name: string;
  quantity: string;
  cost: number;
  category?: string | null;
  isSystem: boolean;
}

export interface CompletedWorkItem {
  id: number;
  projectId: number;
  name: string;
  quantity: string;
  cost: number;
  category?: string | null;
  createdAt: string;
}

interface MaterialEstimateStore {
  materialEstimates: ProjectMaterial[];
  materialTemplates: MaterialTemplate[];
  materials: Material[];
  completedWorks: CompletedWorkItem[];
  workTemplates: WorkTemplate[];
  surveyUnitRates: UnitRate[];
  loading: boolean;
  error: string | null;
  
  fetchMaterialEstimates: (projectId?: number) => Promise<void>;
  createMaterialEstimate: (data: { projectId: number; name: string; quantity: string; cost: number; category?: string }) => Promise<void>;
  updateMaterialEstimate: (id: number, data: { name?: string; quantity?: string; cost?: number; category?: string }) => Promise<void>;
  deleteMaterialEstimate: (id: number) => Promise<void>;
  deleteAllForProject: (projectId: number) => Promise<void>;
  
  fetchMaterialTemplates: () => Promise<void>;
  createMaterialTemplate: (data: { name: string; quantity: string; cost: number; category?: string }) => Promise<void>;
  updateMaterialTemplate: (id: number, data: { name?: string; quantity?: string; cost?: number; category?: string }) => Promise<void>;
  deleteMaterialTemplate: (id: number) => Promise<void>;
  
  fetchMaterials: () => Promise<void>;
  getMaterialsByStatus: (status: 'in-stock' | 'ordered') => Material[];
  
  fetchCompletedWorks: (projectId?: number) => Promise<void>;
  createCompletedWork: (data: { projectId: number; name: string; quantity: string; cost: number; category?: string }) => Promise<void>;
  updateCompletedWork: (id: number, data: { name?: string; quantity?: string; cost?: number; category?: string }) => Promise<void>;
  deleteCompletedWork: (id: number) => Promise<void>;
  deleteAllCompletedWorks: (projectId: number) => Promise<void>;
  
  fetchWorkTemplates: () => Promise<void>;
  createWorkTemplate: (data: { name: string; quantity: string; cost: number; category?: string }) => Promise<void>;
  updateWorkTemplate: (id: number, data: { name?: string; quantity?: string; cost?: number; category?: string }) => Promise<void>;
  deleteWorkTemplate: (id: number) => Promise<void>;
  
  fetchSurveyUnitRates: (targetType?: string) => Promise<void>;
}

export const useMaterialEstimateStore = create<MaterialEstimateStore>((set, get) => ({
  materialEstimates: [],
  materialTemplates: [],
  materials: [],
  completedWorks: [],
  workTemplates: [],
  surveyUnitRates: [],
  loading: false,
  error: null,
  
  fetchMaterialEstimates: async (projectId?: number) => {
    set({ loading: true, error: null });
    try {
      const { data } = await apiFetch<ApiResponse<ProjectMaterial[]>>(createQueryUrl('/api/material-estimates', projectId ? { projectId: String(projectId) } : undefined));
      set({ materialEstimates: data ?? [], loading: false, error: null });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },
  
  createMaterialEstimate: async (data) => {
    set({ loading: true, error: null });
    try {
      const { data: created } = await apiFetch<ApiResponse<ProjectMaterial>>('/api/material-estimates', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      set((s) => ({
        materialEstimates: [created!, ...s.materialEstimates],
        loading: false,
        error: null,
      }));
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
      throw e;
    }
  },
  
  updateMaterialEstimate: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const { data: updated } = await apiFetch<ApiResponse<ProjectMaterial>>(`/api/material-estimates/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      set((s) => ({
        materialEstimates: s.materialEstimates.map(r => r.id === id ? updated! : r),
        loading: false,
        error: null,
      }));
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
      throw e;
    }
  },
  
  deleteMaterialEstimate: async (id) => {
    set({ loading: true, error: null });
    try {
      await apiFetch(`/api/material-estimates/${id}`, { method: 'DELETE' });
      set((s) => ({
        materialEstimates: s.materialEstimates.filter(r => r.id !== id),
        loading: false,
        error: null,
      }));
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
      throw e;
    }
  },
  
  deleteAllForProject: async (projectId) => {
    set({ loading: true, error: null });
    try {
      const { materialEstimates } = get();
      const projectEstimates = materialEstimates.filter(e => e.projectId === projectId);
      for (const estimate of projectEstimates) {
        await apiFetch(`/api/material-estimates/${estimate.id}`, { method: 'DELETE' });
      }
      set((s) => ({
        materialEstimates: s.materialEstimates.filter(e => e.projectId !== projectId),
        loading: false,
        error: null,
      }));
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
      throw e;
    }
  },
  
  fetchMaterialTemplates: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await apiFetch<ApiResponse<MaterialTemplate[]>>('/api/material-templates');
      set({ materialTemplates: data ?? [], loading: false, error: null });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },
  
  createMaterialTemplate: async (data) => {
    set({ loading: true, error: null });
    try {
      const { data: created } = await apiFetch<ApiResponse<MaterialTemplate>>('/api/material-templates', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      set((s) => ({
        materialTemplates: [created!, ...s.materialTemplates],
        loading: false,
        error: null,
      }));
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
      throw e;
    }
  },
  
  updateMaterialTemplate: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const { data: updated } = await apiFetch<ApiResponse<MaterialTemplate>>(`/api/material-templates/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      set((s) => ({
        materialTemplates: s.materialTemplates.map(t => t.id === id ? updated! : t),
        loading: false,
        error: null,
      }));
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
      throw e;
    }
  },
  
  deleteMaterialTemplate: async (id) => {
    set({ loading: true, error: null });
    try {
      await apiFetch(`/api/material-templates/${id}`, { method: 'DELETE' });
      set((s) => ({
        materialTemplates: s.materialTemplates.filter(t => t.id !== id),
        loading: false,
        error: null,
      }));
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
      throw e;
    }
  },
  
  fetchCompletedWorks: async (projectId?: number) => {
    set({ loading: true, error: null });
    try {
      const { data } = await apiFetch<ApiResponse<CompletedWorkItem[]>>(createQueryUrl('/api/completed-works', projectId ? { projectId: String(projectId) } : undefined));
      set({ completedWorks: data ?? [], loading: false, error: null });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },
  
  createCompletedWork: async (data) => {
    set({ loading: true, error: null });
    try {
      const { data: created } = await apiFetch<ApiResponse<CompletedWorkItem>>('/api/completed-works', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      set((s) => ({
        completedWorks: [created!, ...s.completedWorks],
        loading: false,
        error: null,
      }));
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
      throw e;
    }
  },
  
  updateCompletedWork: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const { data: updated } = await apiFetch<ApiResponse<CompletedWorkItem>>(`/api/completed-works/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      set((s) => ({
        completedWorks: s.completedWorks.map(w => w.id === id ? updated! : w),
        loading: false,
        error: null,
      }));
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
      throw e;
    }
  },
  
  deleteCompletedWork: async (id) => {
    set({ loading: true, error: null });
    try {
      await apiFetch(`/api/completed-works/${id}`, { method: 'DELETE' });
      set((s) => ({
        completedWorks: s.completedWorks.filter(w => w.id !== id),
        loading: false,
        error: null,
      }));
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
      throw e;
    }
  },
  
  deleteAllCompletedWorks: async (projectId) => {
    set({ loading: true, error: null });
    try {
      const { completedWorks } = get();
      const projectWorks = completedWorks.filter(w => w.projectId === projectId);
      for (const work of projectWorks) {
        await apiFetch(`/api/completed-works/${work.id}`, { method: 'DELETE' });
      }
      set((s) => ({
        completedWorks: s.completedWorks.filter(w => w.projectId !== projectId),
        loading: false,
        error: null,
      }));
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
      throw e;
    }
  },
  
  fetchWorkTemplates: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await apiFetch<ApiResponse<WorkTemplate[]>>('/api/work-templates');
      set({ workTemplates: data ?? [], loading: false, error: null });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },
  
  createWorkTemplate: async (data) => {
    set({ loading: true, error: null });
    try {
      const { data: created } = await apiFetch<ApiResponse<WorkTemplate>>('/api/work-templates', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      set((s) => ({
        workTemplates: [created!, ...s.workTemplates],
        loading: false,
        error: null,
      }));
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
      throw e;
    }
  },
  
  updateWorkTemplate: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const { data: updated } = await apiFetch<ApiResponse<WorkTemplate>>(`/api/work-templates/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      set((s) => ({
        workTemplates: s.workTemplates.map(t => t.id === id ? updated! : t),
        loading: false,
        error: null,
      }));
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
      throw e;
    }
  },
  
  deleteWorkTemplate: async (id) => {
    set({ loading: true, error: null });
    try {
      await apiFetch(`/api/work-templates/${id}`, { method: 'DELETE' });
      set((s) => ({
        workTemplates: s.workTemplates.filter(t => t.id !== id),
        loading: false,
        error: null,
      }));
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
      throw e;
    }
  },
  
  fetchMaterials: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await apiFetch<ApiResponse<Material[]>>('/api/warehouse');
      set({ materials: data ?? [], loading: false, error: null });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },
  
  getMaterialsByStatus: (status) => {
    return get().materials.filter(m => m.status === status);
  },
  
  fetchSurveyUnitRates: async (targetType?: string) => {
    set({ loading: true, error: null });
    try {
      const { data } = await apiFetch<ApiResponse<UnitRate[]>>(createQueryUrl('/api/unit-rates/survey', targetType ? { targetType } : undefined));
      set({ surveyUnitRates: data ?? [], loading: false, error: null });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },
}));
