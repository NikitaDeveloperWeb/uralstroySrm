import { create } from 'zustand';
import { ProjectTransaction } from '@/shared/types/project';
import { apiFetch, ApiResponse } from '@/shared/lib/api-client';

interface CreateTransactionInput {
  projectId: number;
  amount: number;
  date: string | Date;
  comment?: string | null;
}

interface UpdateTransactionInput {
  amount?: number;
  date?: string | Date;
  comment?: string | null;
}

interface ProjectTransactionState {
  transactions: ProjectTransaction[];
  loading: boolean;
  error: string | null;

  fetchTransactions: (projectId: number) => Promise<void>;
  createTransaction: (data: CreateTransactionInput) => Promise<void>;
  updateTransaction: (projectId: number, id: number, data: UpdateTransactionInput) => Promise<void>;
  deleteTransaction: (projectId: number, id: number) => Promise<void>;
  clearError: () => void;
}

export const useProjectTransactionStore = create<ProjectTransactionState>((set) => ({
  transactions: [],
  loading: false,
  error: null,

  fetchTransactions: async (projectId: number) => {
    try {
      set({ loading: true, error: null });
      const { data } = await apiFetch<ApiResponse<ProjectTransaction[]>>(`/api/projects/${projectId}/transactions`);
      set({ transactions: data ?? [], loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  createTransaction: async (data) => {
    try {
      set({ loading: true, error: null });
      const { data: created } = await apiFetch<ApiResponse<ProjectTransaction>>(`/api/projects/${data.projectId}/transactions`, {
        method: 'POST',
        body: JSON.stringify({
          projectId: data.projectId,
          amount: data.amount,
          date: data.date,
          comment: data.comment,
        }),
      });
      set((state) => ({
        transactions: [...state.transactions, created!],
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  updateTransaction: async (projectId, id, data) => {
    try {
      set({ loading: true, error: null });
      const { data: updated } = await apiFetch<ApiResponse<ProjectTransaction>>(`/api/projects/${projectId}/transactions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      set((state) => ({
        transactions: state.transactions.map(t => t.id === id ? updated! : t),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  deleteTransaction: async (projectId, id) => {
    try {
      set({ loading: true, error: null });
      await apiFetch(`/api/projects/${projectId}/transactions/${id}`, { method: 'DELETE' });
      set((state) => ({
        transactions: state.transactions.filter(t => t.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
