import { create } from 'zustand';

interface ProjectLaborState {
  paymentStatuses: (string | null)[];
  toggleStatus: (index: number) => void;
  setStatuses: (statuses: (string | null)[]) => void;
  resetStatuses: () => void;
}

export const useProjectLaborStore = create<ProjectLaborState>((set) => ({
  paymentStatuses: [],

  toggleStatus: (index: number) => {
    set((state) => {
      const next = [...state.paymentStatuses];
      next[index] = next[index] === 'executed' ? null : 'executed';
      return { paymentStatuses: next };
    });
  },

  setStatuses: (statuses: (string | null)[]) => {
    set({ paymentStatuses: statuses });
  },

  resetStatuses: () => {
    set({ paymentStatuses: [] });
  },
}));
