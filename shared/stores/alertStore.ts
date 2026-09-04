import { create } from 'zustand';
import type { AlertState } from '@/shared/types/alert';

interface AlertStore extends AlertState {
  showAlert: (message: string, options?: { title?: string; okText?: string; cancelText?: string }) => void;
  showConfirm: (message: string, options?: { title?: string; okText?: string; cancelText?: string }) => Promise<boolean>;
  closeAlert: () => void;
  handleConfirm: (value: boolean) => void;
}

const DEFAULTS = {
  alert: { title: 'Уведомление', okText: 'OK' },
  confirm: { title: 'Подтверждение', okText: 'Да', cancelText: 'Отмена' },
};

export const useAlertStore = create<AlertStore>((set, get) => ({
  isOpen: false,
  message: '',
  type: 'alert',
  title: DEFAULTS.alert.title,
  okText: DEFAULTS.alert.okText,
  cancelText: DEFAULTS.confirm.cancelText,
  resolve: null,

  showAlert: (message, options = {}) => {
    set({
      isOpen: true,
      message,
      type: 'alert',
      title: options.title || DEFAULTS.alert.title,
      okText: options.okText || DEFAULTS.alert.okText,
      cancelText: '',
      resolve: null,
    });
  },

  showConfirm: async (message, options = {}) => {
    return new Promise<boolean>((resolve) => {
      set({
        isOpen: true,
        message,
        type: 'confirm',
        title: options.title || DEFAULTS.confirm.title,
        okText: options.okText || DEFAULTS.confirm.okText,
        cancelText: options.cancelText || DEFAULTS.confirm.cancelText,
        resolve: (value: boolean) => resolve(value),
      });
    });
  },

  closeAlert: () => {
    set({ isOpen: false, resolve: null });
  },

  handleConfirm: (value: boolean) => {
    const { resolve } = get();
    if (resolve) {
      resolve(value);
    }
    set({ isOpen: false, resolve: null });
  },
}));
