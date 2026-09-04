import { useAlertStore } from '@/shared/stores/alertStore';

export function useAlert() {
  const showAlert = useAlertStore((state) => state.showAlert);
  const showConfirm = useAlertStore((state) => state.showConfirm);

  return {
    alert: (message: string, options?: { title?: string; okText?: string }) =>
      showAlert(message, options),
    confirm: (message: string, options?: { title?: string; okText?: string; cancelText?: string }) =>
      showConfirm(message, options),
  };
}
