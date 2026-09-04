'use client';

import { useAlertStore } from '@/shared/stores/alertStore';
import { CustomAlert } from '@/shared/components/ui/CustomAlert';

export function AlertProvider() {
  const { isOpen, message, type, title, okText, cancelText, handleConfirm, closeAlert } = useAlertStore();

  return (
    <CustomAlert
      isOpen={isOpen}
      message={message}
      type={type}
      title={title}
      okText={okText}
      cancelText={cancelText}
      onConfirm={() => {
        if (type === 'confirm') {
          handleConfirm(true);
        } else {
          closeAlert();
        }
      }}
      onCancel={() => {
        if (type === 'confirm') {
          handleConfirm(false);
        } else {
          closeAlert();
        }
      }}
    />
  );
}
