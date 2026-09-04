import { create } from 'zustand';
import { apiFetch, ApiResponse } from '@/shared/lib/api-client';

export interface Fund {
  id: number;
  name: string;
  description?: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
  transactions: FundTransaction[];
}

export interface FundTransaction {
  id: number;
  fundId: number;
  amount: number;
  type: 'income' | 'expense';
  description?: string;
  date: string;
  createdAt: string;
  fund?: Fund;
}

interface FundStore {
  funds: Fund[];
  loading: boolean;
  error: string | null;

  fetchFunds: () => Promise<void>;
  createFund: (data: { name: string; description?: string }) => Promise<Fund>;
  updateFund: (id: number, data: { name?: string; description?: string }) => Promise<Fund>;
  deleteFund: (id: number) => Promise<void>;
  createTransaction: (data: { fundId: number; amount: number; type: 'income' | 'expense'; description?: string; date: string }) => Promise<FundTransaction>;
}

export const useFundStore = create<FundStore>((set) => ({
  funds: [],
  loading: false,
  error: null,

  fetchFunds: async () => {
    set({ loading: true });
    try {
      const { data } = await apiFetch<ApiResponse<Fund[]>>('/api/funds');
      set({ funds: data ?? [], loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  createFund: async (data) => {
    try {
      const { data: created } = await apiFetch<ApiResponse<Fund>>('/api/funds', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      set(state => ({ funds: [created!, ...state.funds] }));
      return created!;
    } catch (e: unknown) {
      throw e;
    }
  },

  updateFund: async (id, data) => {
    try {
      const { data: updated } = await apiFetch<ApiResponse<Fund>>(`/api/funds/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      set(state => ({
        funds: state.funds.map(f => f.id === id ? updated! : f),
      }));
      return updated!;
    } catch (e: unknown) {
      throw e;
    }
  },

  deleteFund: async (id) => {
    try {
      await apiFetch(`/api/funds/${id}`, { method: 'DELETE' });
      set(state => ({ funds: state.funds.filter(f => f.id !== id) }));
    } catch (e: unknown) {
      throw e;
    }
  },

  createTransaction: async (data) => {
    try {
      const { data: created } = await apiFetch<ApiResponse<FundTransaction>>('/api/funds/transactions', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      set(state => ({
        funds: state.funds.map(f =>
          f.id === data.fundId
            ? { ...f, balance: f.balance + (data.type === 'income' ? data.amount : -data.amount), transactions: [...f.transactions, created!] }
            : f
        ),
      }));
      return created!;
    } catch (e: unknown) {
      throw e;
    }
  },
}));
