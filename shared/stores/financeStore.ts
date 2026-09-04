import { create } from 'zustand';
import { apiFetch, createQueryUrl, ApiResponse } from '@/shared/lib/api-client';

export interface Expense {
  id: number;
  date: string;
  amount: number;
  recipient: string;
  purpose: string;
  category: string;
}

interface AdvanceReportItem {
  id: number;
  employeeId: number;
  employeeName: string;
  amount: number;
  purpose: string;
  date: string;
}

interface AdvanceReport {
  id: number;
  date: string;
  totalAmount: number;
  items: AdvanceReportItem[];
}

interface SalaryReportItem {
  id: number;
  employeeId: number;
  employeeName: string;
  amount: number;
  period: string;
  grossSalary?: number;
  advances?: number;
  penalties?: number;
  bonuses?: number;
  days?: number;
  shifts?: number;
  hours?: number;
  isPaid?: boolean;
}

interface SalaryReport {
  id: number;
  date: string;
  period: string;
  totalAmount: number;
  status: string;
  items: SalaryReportItem[];
}

interface FinanceStore {
  expenses: Expense[];
  advanceReports: AdvanceReport[];
  salaryReports: SalaryReport[];
  loading: boolean;
  error: string | null;

  fetchExpenses: (params?: { date?: string; from?: string; to?: string }) => Promise<void>;
  addExpense: (data: Omit<Expense, 'id'>) => Promise<void>;
  deleteExpense: (id: number) => Promise<void>;

  fetchAdvanceReports: (date?: string) => Promise<void>;
  addAdvanceReport: (data: { date: string; entries: Array<{ employeeId: number; employeeName: string; amount: string; purpose: string }> }) => Promise<void>;

  fetchSalaryReports: (date?: string) => Promise<void>;
  addSalaryReport: (data: { date: string; entries: Array<{ employeeId: number; employeeName: string; amount: string; period: string }>; period: string }) => Promise<void>;
}

export const useFinanceStore = create<FinanceStore>((set) => ({
  expenses: [],
  advanceReports: [],
  salaryReports: [],
  loading: false,
  error: null,

  fetchExpenses: async (params = {}) => {
    set({ loading: true });
    try {
      const { data } = await apiFetch<ApiResponse<Expense[]>>(createQueryUrl('/api/expenses', params));
      set({ expenses: data ?? [], loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  addExpense: async (data) => {
    try {
      await apiFetch<ApiResponse>('/api/expenses', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      const query = new URLSearchParams();
      query.append('date', new Date().toISOString().split('T')[0]);
      const { data: expenses } = await apiFetch<ApiResponse<Expense[]>>(`/api/expenses?${query}`);
      set({ expenses: expenses ?? [], loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message });
    }
  },

  deleteExpense: async (id) => {
    try {
      await apiFetch(`/api/expenses?id=${id}`, { method: 'DELETE' });
      set((state) => ({
        expenses: state.expenses.filter(e => e.id !== id),
      }));
    } catch (e: unknown) {
      set({ error: (e as Error).message });
    }
  },

  fetchAdvanceReports: async (date?: string) => {
    set({ loading: true });
    try {
      const { data } = await apiFetch<ApiResponse<AdvanceReport[]>>(createQueryUrl('/api/advance-reports', date ? { date } : undefined));
      set({ advanceReports: data ?? [], loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  addAdvanceReport: async (data) => {
    try {
      await apiFetch<ApiResponse>('/api/advance-reports', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      const { data: reports } = await apiFetch<ApiResponse<AdvanceReport[]>>('/api/advance-reports');
      set({ advanceReports: reports ?? [], loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message });
    }
  },

  fetchSalaryReports: async (date?: string) => {
    set({ loading: true });
    try {
      const { data } = await apiFetch<ApiResponse<SalaryReport[]>>(createQueryUrl('/api/salary-reports', date ? { date } : undefined));
      set({ salaryReports: data ?? [], loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  addSalaryReport: async (data) => {
    try {
      await apiFetch<ApiResponse>('/api/salary-reports', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      const { data: reports } = await apiFetch<ApiResponse<SalaryReport[]>>('/api/salary-reports');
      set({ salaryReports: reports ?? [], loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message });
    }
  },
}));
