import { create } from 'zustand';
import type { Client } from '@/shared/types/client';

interface ClientStore {
  // Данные
  clients: Client[];
  
  // Состояние загрузки
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchClients: (search?: string) => Promise<void>;
  createClient: (data: Partial<Client>) => Promise<void>;
  updateClient: (id: number, data: Partial<Client>) => Promise<void>;
  deleteClient: (id: number) => Promise<void>;
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

export const useClientStore = create<ClientStore>((set) => ({
  clients: [],
  loading: false,
  error: null,
  
  fetchClients: async (search?: string) => {
    set({ loading: true, error: null });
    try {
      const url = search ? `/api/clients?search=${encodeURIComponent(search)}` : '/api/clients';
      const { data } = await apiFetch(url);
      set({ clients: data as Client[], loading: false, error: null });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },
  
  createClient: async (data) => {
    set({ loading: true, error: null });
    try {
      const { data: created } = await apiFetch('/api/clients', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      set((s) => ({
        clients: [created as Client, ...s.clients],
        loading: false,
        error: null,
      }));
    } catch (e: any) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },
  
  updateClient: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const { data: updated } = await apiFetch(`/api/clients/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      set((s) => ({
        clients: s.clients.map(c => c.id === id ? updated as Client : c),
        loading: false,
        error: null,
      }));
    } catch (e: any) {
      set({ error: e.message, loading: false });
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
    } catch (e: any) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },
}));
