export type AlertType = 'alert' | 'confirm';

export interface AlertOptions {
  title?: string;
  okText?: string;
  cancelText?: string;
  type?: AlertType;
}

export interface AlertState {
  isOpen: boolean;
  message: string;
  type: AlertType;
  title: string;
  okText: string;
  cancelText: string;
  resolve: ((value: boolean) => void) | null;
}
