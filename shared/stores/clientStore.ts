import { create } from 'zustand';
import type { Client } from '@/shared/types/client';
import { apiFetch, createQueryUrl, ApiResponse } from '@/shared/lib/api-client';

interface ClientStore {
  clients: Client[];
  loading: boolean;
  error: string | null;
  
  fetchClients: (search?: string) => Promise<void>;
  createClient: (data: Partial<Client>) => Promise<void>;
  updateClient: (id: number, data: Partial<Client>) => Promise<void>;
  deleteClient: (id: number) => Promise<void>;
}

export const useClientStore = create<ClientStore>((set) => ({
  clients: [],
  loading: false,
  error: null,
  
  fetchClients: async (search?: string) => {
    set({ loading: true, error: null });
    try {
      const { data } = await apiFetch<ApiResponse<Client[]>>(createQueryUrl('/api/clients', search ? { search } : undefined));
      set({ clients: data ?? [], loading: false, error: null });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },
  
  createClient: async (data) => {
    set({ loading: true, error: null });
    try {
      const { data: created } = await apiFetch<ApiResponse<Client>>('/api/clients', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      set((s) => ({
        clients: [created!, ...s.clients],
        loading: false,
        error: null,
      }));
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
      throw e;
    }
  },
  
  updateClient: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const { data: updated } = await apiFetch<ApiResponse<Client>>(`/api/clients/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      set((s) => ({
        clients: s.clients.map(c => c.id === id ? updated! : c),
        loading: false,
        error: null,
      }));
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
      throw e;
    }
  },
  
  deleteClient: async (id) => {
    set({ loading: true, error: null });
    try {
      await apiFetch(`/api/clients/${id}`, { method: 'DELETE' });
      set((s) => ({
        clients: s.clients.filter(c => c.id !== id),
        loading: false,
        error: null,
      }));
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
      throw e;
    }
  },
}));
