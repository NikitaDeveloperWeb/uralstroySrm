import { create } from 'zustand';
import { ProjectTransaction } from '@/shared/types/project';

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

export const useProjectTransactionStore = create<ProjectTransactionState>((set, get) => ({
  transactions: [],
  loading: false,
  error: null,

  fetchTransactions: async (projectId: number) => {
    try {
      set({ loading: true, error: null });
      
      const response = await fetch(`/api/projects/${projectId}/transactions`);
      
      if (!response.ok) {
        throw new Error('Не удалось загрузить транзакции');
      }
      
      const data = await response.json();
      set({ transactions: data.success ? data.data : [], loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Произошла ошибка';
      set({ error: message, loading: false });
    }
  },

  createTransaction: async (data: CreateTransactionInput) => {
    try {
      set({ loading: true, error: null });
      
      const response = await fetch(`/api/projects/${data.projectId}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: data.projectId,
          amount: data.amount,
          date: data.date,
          comment: data.comment,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', response.status, errorData);
        throw new Error(errorData.message || `Ошибка ${response.status}: не удалось создать транзакцию`);
      }
      
      const result = await response.json();
      const newTransaction = result.success ? result.data : null;
      
      if (newTransaction) {
        set((state) => ({
          transactions: [...state.transactions, newTransaction],
          loading: false,
        }));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Произошла ошибка';
      set({ error: message, loading: false });
      throw error;
    }
  },

  updateTransaction: async (projectId: number, id: number, data: UpdateTransactionInput) => {
    try {
      set({ loading: true, error: null });
      
      const response = await fetch(`/api/projects/${projectId}/transactions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(data.amount !== undefined && { amount: data.amount }),
          ...(data.date !== undefined && { date: data.date }),
          ...(data.comment !== undefined && { comment: data.comment }),
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Не удалось обновить транзакцию');
      }
      
      const result = await response.json();
      const updatedTransaction = result.success ? result.data : null;
      
      if (updatedTransaction) {
        set((state) => ({
          transactions: state.transactions.map(t => 
            t.id === id ? updatedTransaction : t
          ),
          loading: false,
        }));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Произошла ошибка';
      set({ error: message, loading: false });
      throw error;
    }
  },

  deleteTransaction: async (projectId: number, id: number) => {
    try {
      set({ loading: true, error: null });
      
      const response = await fetch(`/api/projects/${projectId}/transactions/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Не удалось удалить транзакцию');
      }
      
      set((state) => ({
        transactions: state.transactions.filter(t => t.id !== id),
        loading: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Произошла ошибка';
      set({ error: message, loading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
