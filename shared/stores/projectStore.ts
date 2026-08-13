import { create } from 'zustand';
import type { Project, Brigade, ProjectMaterial, ProjectCompletedWork, UnitRate as ProjectUnitRate, CreateProjectInput, UpdateProjectInput } from '@/shared/types/project';

interface ProjectState {
  // Данные
  projects: Project[];
  brigades: Brigade[];
  unitRates: ProjectUnitRate[];
  materials: ProjectMaterial[];
  completedWorks: ProjectCompletedWork[];
  materialTemplates: Array<{ id: number; name: string; quantity: string; cost: number; category?: string | null; isSystem: boolean }>;
  workTemplates: Array<{ id: number; name: string; quantity: string; cost: number; category?: string | null; isSystem: boolean }>;
  
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
}

async function apiFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    console.error('API Error:', res.status, JSON.stringify(body, null, 2));
    throw new Error(body.error || `API error: ${res.status}`);
  }
  return res.json();
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  brigades: [],
  unitRates: [],
  materials: [],
  completedWorks: [],
  materialTemplates: [],
  workTemplates: [],
  loading: false,
  error: null,
  
  fetchProjects: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await apiFetch('/api/projects');
      set({ projects: data as Project[], loading: false, error: null });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },
  
  fetchBrigades: async () => {
    try {
      const { data } = await apiFetch('/api/brigades');
      set({ brigades: data as Brigade[] });
    } catch (e: any) {
      set({ error: e.message });
    }
  },
  
  fetchUnitRates: async () => {
    try {
      const { data } = await apiFetch('/api/unit-rates');
      set({ unitRates: data as ProjectUnitRate[] });
    } catch (e: any) {
      set({ error: e.message });
    }
  },
  
  fetchProjectDetail: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const { data } = await apiFetch(`/api/projects/${id}`);
      const project = data as Project;
      
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
      const { data: created } = await apiFetch('/api/projects', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      set((s) => ({
        projects: [created as Project, ...s.projects],
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
      const { data: updated } = await apiFetch(`/api/projects/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      set((s) => ({
        projects: s.projects.map(p => p.id === id ? updated as Project : p),
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
      const { data } = await apiFetch(`/api/material-estimates?projectId=${projectId}`);
      set({ materials: data as ProjectMaterial[] });
    } catch (e: any) {
      set({ error: e.message });
    }
  },
  
  fetchProjectCompletedWorks: async (projectId: number) => {
    try {
      const { data } = await apiFetch(`/api/completed-works?projectId=${projectId}`);
      set({ completedWorks: data as ProjectCompletedWork[] });
    } catch (e: any) {
      set({ error: e.message });
    }
  },
  
  fetchMaterialTemplates: async () => {
    try {
      const { data } = await apiFetch('/api/material-templates');
      set({ materialTemplates: data });
    } catch (e: any) {
      set({ error: e.message });
    }
  },
  
  fetchWorkTemplates: async () => {
    try {
      const { data } = await apiFetch('/api/work-templates');
      set({ workTemplates: data });
    } catch (e: any) {
      set({ error: e.message });
    }
  },
}));
