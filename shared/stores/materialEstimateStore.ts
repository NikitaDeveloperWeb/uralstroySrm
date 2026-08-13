import { create } from 'zustand';
import type { ProjectMaterial, ProjectCompletedWork } from '@/shared/types/project';

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
  // Материалы
  materialEstimates: ProjectMaterial[];
  materialTemplates: MaterialTemplate[];
  
  // Работы
  completedWorks: CompletedWorkItem[];
  workTemplates: WorkTemplate[];
  
  // Состояние загрузки
  loading: boolean;
  error: string | null;
  
  // Actions - материалы
  fetchMaterialEstimates: (projectId?: number) => Promise<void>;
  createMaterialEstimate: (data: { projectId: number; name: string; quantity: string; cost: number; category?: string }) => Promise<void>;
  updateMaterialEstimate: (id: number, data: { name?: string; quantity?: string; cost?: number; category?: string }) => Promise<void>;
  deleteMaterialEstimate: (id: number) => Promise<void>;
  deleteAllForProject: (projectId: number) => Promise<void>;
  
  // Actions - шаблоны материалов
  fetchMaterialTemplates: () => Promise<void>;
  createMaterialTemplate: (data: { name: string; quantity: string; cost: number; category?: string }) => Promise<void>;
  updateMaterialTemplate: (id: number, data: { name?: string; quantity?: string; cost?: number; category?: string }) => Promise<void>;
  deleteMaterialTemplate: (id: number) => Promise<void>;
  
  // Actions - работы
  fetchCompletedWorks: (projectId?: number) => Promise<void>;
  createCompletedWork: (data: { projectId: number; name: string; quantity: string; cost: number; category?: string }) => Promise<void>;
  updateCompletedWork: (id: number, data: { name?: string; quantity?: string; cost?: number; category?: string }) => Promise<void>;
  deleteCompletedWork: (id: number) => Promise<void>;
  deleteAllCompletedWorks: (projectId: number) => Promise<void>;
  
  // Actions - шаблоны работ
  fetchWorkTemplates: () => Promise<void>;
  createWorkTemplate: (data: { name: string; quantity: string; cost: number; category?: string }) => Promise<void>;
  updateWorkTemplate: (id: number, data: { name?: string; quantity?: string; cost?: number; category?: string }) => Promise<void>;
  deleteWorkTemplate: (id: number) => Promise<void>;
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

export const useMaterialEstimateStore = create<MaterialEstimateStore>((set, get) => ({
  // Initial state
  materialEstimates: [],
  materialTemplates: [],
  completedWorks: [],
  workTemplates: [],
  loading: false,
  error: null,
  
  // ===== Materials =====
  fetchMaterialEstimates: async (projectId?: number) => {
    set({ loading: true, error: null });
    try {
      let url = '/api/material-estimates';
      if (projectId) {
        url += `?projectId=${projectId}`;
      }
      
      const { data } = await apiFetch(url);
      set({ materialEstimates: data as ProjectMaterial[], loading: false, error: null });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },
  
  createMaterialEstimate: async (data) => {
    set({ loading: true, error: null });
    try {
      const { data: created } = await apiFetch('/api/material-estimates', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      set((s) => ({
        materialEstimates: [created as ProjectMaterial, ...s.materialEstimates],
        loading: false,
        error: null,
      }));
    } catch (e: any) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },
  
  updateMaterialEstimate: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const { data: updated } = await apiFetch(`/api/material-estimates/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      set((s) => ({
        materialEstimates: s.materialEstimates.map(r => r.id === id ? updated as ProjectMaterial : r),
        loading: false,
        error: null,
      }));
    } catch (e: any) {
      set({ error: e.message, loading: false });
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
    } catch (e: any) {
      set({ error: e.message, loading: false });
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
    } catch (e: any) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },
  
  // ===== Material Templates =====
  fetchMaterialTemplates: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await apiFetch('/api/material-templates');
      set({ materialTemplates: data as MaterialTemplate[], loading: false, error: null });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },
  
  createMaterialTemplate: async (data) => {
    set({ loading: true, error: null });
    try {
      const { data: created } = await apiFetch('/api/material-templates', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      set((s) => ({
        materialTemplates: [created as MaterialTemplate, ...s.materialTemplates],
        loading: false,
        error: null,
      }));
    } catch (e: any) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },
  
  updateMaterialTemplate: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const { data: updated } = await apiFetch(`/api/material-templates/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      set((s) => ({
        materialTemplates: s.materialTemplates.map(t => t.id === id ? updated as MaterialTemplate : t),
        loading: false,
        error: null,
      }));
    } catch (e: any) {
      set({ error: e.message, loading: false });
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
    } catch (e: any) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },
  
  // ===== Completed Works =====
  fetchCompletedWorks: async (projectId?: number) => {
    set({ loading: true, error: null });
    try {
      let url = '/api/completed-works';
      if (projectId) {
        url += `?projectId=${projectId}`;
      }
      const { data } = await apiFetch(url);
      set({ completedWorks: data as CompletedWorkItem[], loading: false, error: null });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },
  
  createCompletedWork: async (data) => {
    set({ loading: true, error: null });
    try {
      const { data: created } = await apiFetch('/api/completed-works', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      set((s) => ({
        completedWorks: [created as CompletedWorkItem, ...s.completedWorks],
        loading: false,
        error: null,
      }));
    } catch (e: any) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },
  
  updateCompletedWork: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const { data: updated } = await apiFetch(`/api/completed-works/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      set((s) => ({
        completedWorks: s.completedWorks.map(w => w.id === id ? updated as CompletedWorkItem : w),
        loading: false,
        error: null,
      }));
    } catch (e: any) {
      set({ error: e.message, loading: false });
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
    } catch (e: any) {
      set({ error: e.message, loading: false });
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
    } catch (e: any) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },
  
  // ===== Work Templates =====
  fetchWorkTemplates: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await apiFetch('/api/work-templates');
      set({ workTemplates: data as WorkTemplate[], loading: false, error: null });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },
  
  createWorkTemplate: async (data) => {
    set({ loading: true, error: null });
    try {
      const { data: created } = await apiFetch('/api/work-templates', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      set((s) => ({
        workTemplates: [created as WorkTemplate, ...s.workTemplates],
        loading: false,
        error: null,
      }));
    } catch (e: any) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },
  
  updateWorkTemplate: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const { data: updated } = await apiFetch(`/api/work-templates/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      set((s) => ({
        workTemplates: s.workTemplates.map(t => t.id === id ? updated as WorkTemplate : t),
        loading: false,
        error: null,
      }));
    } catch (e: any) {
      set({ error: e.message, loading: false });
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
    } catch (e: any) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },
}));
