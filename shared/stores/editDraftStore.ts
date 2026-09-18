import { create } from 'zustand';

interface DraftItem {
  name: string;
  quantity: string;
  cost: number;
  category: string | null;
}

interface EditDraftStore {
  drafts: Map<string, DraftItem>;
  setDraft: (key: string, field: keyof DraftItem, value: string | number) => void;
  getDraft: (key: string) => DraftItem | undefined;
}

export const useEditDraftStore = create<EditDraftStore>((set, get) => ({
  drafts: new Map(),
  
  setDraft: (key, field, value) => {
    set((state) => {
      const newDrafts = new Map(state.drafts);
      const existing = newDrafts.get(key) || { name: '', quantity: '', cost: 0, category: null };
      newDrafts.set(key, { ...existing, [field]: value });
      return { drafts: newDrafts };
    });
  },
  
  getDraft: (key) => {
    return get().drafts.get(key);
  },
}));
