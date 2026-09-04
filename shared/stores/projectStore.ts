import { create } from 'zustand';
import type { Project, Brigade, ProjectMaterial, ProjectCompletedWork, UnitRate as ProjectUnitRate, CreateProjectInput, UpdateProjectInput } from '@/shared/types/project';
import { apiFetch, createQueryUrl, ApiResponse } from '@/shared/lib/api-client';

interface ProjectState {
  // Данные
  projects: Project[];
  brigades: Brigade[];
  unitRates: ProjectUnitRate[];
  materials: ProjectMaterial[];
  completedWorks: ProjectCompletedWork[];
  materialTemplates: Array<{ id: number; name: string; quantity: string; cost: number; category?: string | null; isSystem: boolean }>;
  workTemplates: Array<{ id: number; name: string; quantity: string; cost: number; category?: string | null; isSystem: boolean }>;
  workUnitRates: Array<{ id: number; name: string; quantity: string; cost: number; category?: string | null }>;
  
  // Состояние загрузки
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchProjects: () => Promise<void>;
  fetchBrigades: () => Promise<void>;
  fetchUnitRates: () => Promise<void>;
  fetchProjectDetail: (id: number) => Promise<void>;
  createProject: (data: CreateProjectInput) => Promise<void>;
  updateProject: (id: number, data: UpdateProjectInput) => Promise<void>;
  deleteProject: (id: number) => Promise<void>;
  fetchProjectMaterials: (projectId: number) => Promise<void>;
  fetchProjectCompletedWorks: (projectId: number) => Promise<void>;
  fetchMaterialTemplates: () => Promise<void>;
  fetchWorkTemplates: () => Promise<void>;
  fetchWorkUnitRates: () => Promise<void>;
}



export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  brigades: [],
  unitRates: [],
  materials: [],
  completedWorks: [],
  materialTemplates: [],
  workTemplates: [],
  workUnitRates: [],
  loading: false,
  error: null,
  
  fetchProjects: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await apiFetch<ApiResponse<Project[]>>('/api/projects');
      set({ projects: data!, loading: false, error: null });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },
  
  fetchBrigades: async () => {
    try {
      const { data } = await apiFetch<ApiResponse<Brigade[]>>('/api/brigades');
      set({ brigades: data! });
    } catch (e: any) {
      set({ error: e.message });
    }
  },
  
  fetchUnitRates: async () => {
    try {
      const { data } = await apiFetch<ApiResponse<ProjectUnitRate[]>>('/api/unit-rates');
      set({ unitRates: data! });
    } catch (e: any) {
      set({ error: e.message });
    }
  },
  
  fetchProjectDetail: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const { data } = await apiFetch<ApiResponse<Project>>(`/api/projects/${id}`);
      const project = data!;
      
      // Обновить проект в списке
      set((s) => ({
        projects: s.projects.map(p => p.id === id ? project : p),
        loading: false,
        error: null,
      }));
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },
  
  createProject: async (data: CreateProjectInput) => {
    set({ loading: true, error: null });
    try {
      const { data: created } = await apiFetch<ApiResponse<Project>>('/api/projects', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      set((s) => ({
        projects: [created!, ...s.projects],
        loading: false,
        error: null,
      }));
    } catch (e: any) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },
  
  updateProject: async (id: number, data: UpdateProjectInput) => {
    set({ loading: true, error: null });
    try {
      const { data: updated } = await apiFetch<ApiResponse<Project>>(`/api/projects/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      set((s) => ({
        projects: s.projects.map(p => p.id === id ? updated! : p),
        loading: false,
        error: null,
      }));
    } catch (e: any) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },
  
  deleteProject: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await apiFetch(`/api/projects/${id}`, { method: 'DELETE' });
      set((s) => ({
        projects: s.projects.filter(p => p.id !== id),
        loading: false,
        error: null,
      }));
    } catch (e: any) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },
  
  fetchProjectMaterials: async (projectId: number) => {
    try {
      const { data } = await apiFetch<ApiResponse<ProjectMaterial[]>>(createQueryUrl('/api/material-estimates', { projectId }));
      set({ materials: data! });
    } catch (e: any) {
      set({ error: e.message });
    }
  },
  
  fetchProjectCompletedWorks: async (projectId: number) => {
    try {
      const { data } = await apiFetch<ApiResponse<ProjectCompletedWork[]>>(createQueryUrl('/api/completed-works', { projectId }));
      set({ completedWorks: data! });
    } catch (e: any) {
      set({ error: e.message });
    }
  },
  
  fetchMaterialTemplates: async () => {
    try {
      const { data } = await apiFetch<ApiResponse<Array<{ id: number; name: string; quantity: string; cost: number; category?: string | null; isSystem: boolean }>>>('/api/material-templates');
      set({ materialTemplates: data! });
    } catch (e: any) {
      set({ error: e.message });
    }
  },
  
  fetchWorkTemplates: async () => {
    try {
      const { data } = await apiFetch<ApiResponse<Array<{ id: number; name: string; quantity: string; cost: number; category?: string | null; isSystem: boolean }>>>('/api/work-templates');
      set({ workTemplates: data! });
    } catch (e: any) {
      set({ error: e.message });
    }
  },
  
  fetchWorkUnitRates: async () => {
    try {
      const { data } = await apiFetch<ApiResponse<ProjectUnitRate[]>>(createQueryUrl('/api/unit-rates', { targetType: 'client' }));
      set({ workUnitRates: (data ?? []).map((ur) => ({
        id: ur.id,
        name: ur.name,
        quantity: ur.unit || 'м²',
        cost: Math.round(ur.pricePerUnit),
        category: ur.category || null,
      }))});
    } catch (e: any) {
      set({ error: e.message });
    }
  },
}));
