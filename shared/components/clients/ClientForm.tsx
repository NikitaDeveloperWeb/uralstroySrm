'use client';

import React, { useRef, useEffect, memo } from 'react';
import { Modal } from '@/shared/components/ui/Modal';
import { useAlert } from '@/shared/hooks/useAlert';

interface Client {
  id: number;
  name: string;
  phone: string;
  email: string | null;
}

interface ClientFormProps {
  isOpen: boolean;
  editingClient: Client | null;
  onClose: () => void;
  onSave: (data: { name: string; phone: string; email: string | null }) => void;
}

export const ClientForm = memo(function ClientForm({
  isOpen,
  editingClient,
  onClose,
  onSave,
}: ClientFormProps) {
  const { alert } = useAlert();
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (editingClient) {
        if (nameRef.current) nameRef.current.value = editingClient.name;
        if (phoneRef.current) phoneRef.current.value = editingClient.phone;
        if (emailRef.current) emailRef.current.value = editingClient.email || '';
      } else {
        if (nameRef.current) nameRef.current.value = '';
        if (phoneRef.current) phoneRef.current.value = '';
        if (emailRef.current) emailRef.current.value = '';
      }
    }
  }, [isOpen, editingClient]);

  const handleSave = () => {
    const name = nameRef.current?.value?.trim();
    const phone = phoneRef.current?.value?.trim();
    
    if (!name || !phone) {
      alert('Заполните ФИО и телефон');
      return;
    }

    onSave({
      name,
      phone,
      email: emailRef.current?.value?.trim() || null,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingClient ? 'Редактировать клиента' : 'Новый клиент'}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300 mb-1">ФИО</label>
          <input
            ref={nameRef}
            type="text"
            className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] dark:bg-slate-700 dark:text-white"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300 mb-1">Телефон</label>
            <input
              ref={phoneRef}
              type="tel"
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] dark:bg-slate-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300 mb-1">Email</label>
            <input
              ref={emailRef}
              type="email"
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] dark:bg-slate-700 dark:text-white"
            />
          </div>
        </div>
        <div className="flex gap-4 pt-4">
          <button
            onClick={handleSave}
            className="flex-1 bg-[#1976d2] hover:bg-[#1565c0] text-white py-3 px-4 rounded-lg font-semibold transition-colors"
          >
            Сохранить
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 dark:bg-slate-600 text-gray-700 dark:text-slate-300 py-3 px-4 rounded-lg font-semibold transition-colors"
          >
            Отмена
          </button>
        </div>
      </div>
    </Modal>
  );
});
