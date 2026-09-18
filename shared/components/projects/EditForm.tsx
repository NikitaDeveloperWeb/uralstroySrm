'use client';

import { useEffect, useRef, useState } from 'react';
import type { Project } from '@/shared/types/project';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/button';
import { useProjectStore } from '@/shared/stores/projectStore';
import { useClientStore } from '@/shared/stores/clientStore';
import {
  COMPLEXITY_OPTIONS,
  STATUS_OPTIONS,
} from './projectDetailUtils';
import { FormField } from '@/shared/components/ui/FormField';

interface Props {
  project: Project;
  editForm: Partial<Project>;
  setEditForm: (form: Partial<Project> | ((prev: Partial<Project>) => Partial<Project>)) => void;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Project>) => Promise<void>;
}

export function EditForm({ project, editForm, setEditForm, isOpen, onClose, onSave }: Props) {
  const { brigades, fetchBrigades } = useProjectStore();
  const { clients, fetchClients } = useClientStore();
  
  // Refs для полей ввода, чтобы избежать перерендеров при вводе
  const nameRef = useRef<HTMLInputElement>(null);
  const typeRef = useRef<HTMLInputElement>(null);
  const areaRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const costRef = useRef<HTMLInputElement>(null);
  const deadlineRef = useRef<HTMLInputElement>(null);
  const complexityRef = useRef<HTMLSelectElement>(null);
  const statusRef = useRef<HTMLSelectElement>(null);
  const clientIdRef = useRef<HTMLSelectElement>(null);
  const brigadeIdRef = useRef<HTMLSelectElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);
  const prepaymentRef = useRef<HTMLInputElement>(null);
  const prepaymentDateRef = useRef<HTMLInputElement>(null);

  // Инициализация значений при открытии модалки
  useEffect(() => {
    if (isOpen) {
      if (nameRef.current) nameRef.current.value = editForm.name || '';
      if (typeRef.current) typeRef.current.value = editForm.type || '';
      if (areaRef.current) areaRef.current.value = editForm.area || '';
      if (addressRef.current) addressRef.current.value = editForm.address || '';
      if (costRef.current) costRef.current.value = (editForm.cost ?? '').toString();
      if (deadlineRef.current) deadlineRef.current.value = editForm.deadline || '';
      if (complexityRef.current) complexityRef.current.value = editForm.complexity || 'средний';
      if (statusRef.current) statusRef.current.value = editForm.status || 'создан';
      if (clientIdRef.current) clientIdRef.current.value = editForm.clientId?.toString() || '';
      if (brigadeIdRef.current) brigadeIdRef.current.value = editForm.brigade?.id?.toString() || '';
      if (codeRef.current) codeRef.current.value = editForm.code || '';
      if (prepaymentRef.current) prepaymentRef.current.value = (editForm.prepayment ?? '').toString();
      if (prepaymentDateRef.current) prepaymentDateRef.current.value = editForm.prepaymentDate || '';
    }
  }, [isOpen, editForm]);

  useEffect(() => {
    fetchBrigades();
  }, [fetchBrigades]);
  
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleSave = async () => {
    // Собираем значения из refs
    const updatedForm: Partial<Project> = {
      name: nameRef.current?.value || '',
      type: typeRef.current?.value || '',
      area: areaRef.current?.value || '',
      address: addressRef.current?.value || '',
      cost: costRef.current?.value ? Number(costRef.current.value) : undefined,
      deadline: deadlineRef.current?.value || '',
      complexity: complexityRef.current?.value || 'средний',
      status: statusRef.current?.value || 'создан',
      clientId: clientIdRef.current?.value ? Number(clientIdRef.current.value) : undefined,
      brigadeId: brigadeIdRef.current?.value ? Number(brigadeIdRef.current.value) : undefined,
      code: codeRef.current?.value || '',
      prepayment: prepaymentRef.current?.value ? Number(prepaymentRef.current.value) : undefined,
      prepaymentDate: prepaymentDateRef.current?.value || '',
    };

    await onSave(updatedForm);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Редактировать объект">
      <div className="space-y-4">
        <FormField label="Название">
          <input
            ref={nameRef}
            type="text"
            className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Тип объекта">
            <input
              ref={typeRef}
              type="text"
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
            />
          </FormField>
          <FormField label="Площадь (м²)">
            <input
              ref={areaRef}
              type="text"
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
            />
          </FormField>
        </div>

        <FormField label="Адрес">
          <input
            ref={addressRef}
            type="text"
            className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Стоимость">
            <input
              ref={costRef}
              type="number"
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
            />
          </FormField>
          <FormField label="Дата сдачи">
            <input
              ref={deadlineRef}
              type="date"
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Сложность">
            <select
              ref={complexityRef}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
            >
              {COMPLEXITY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Статус">
            <select
              ref={statusRef}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Клиент">
            <select
              ref={clientIdRef}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
            >
              <option value="">Не назначен</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Бригада">
            <select
              ref={brigadeIdRef}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
            >
              <option value="">Не назначена</option>
              {brigades.map((brigade) => (
                <option key={brigade.id} value={brigade.id}>{brigade.name}</option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField label="Код объекта">
          <input
            ref={codeRef}
            type="text"
            className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Сумма предоплаты">
            <input
              ref={prepaymentRef}
              type="number"
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
              placeholder="0"
            />
          </FormField>
          <FormField label="Дата предоплаты">
            <input
              ref={prepaymentDateRef}
              type="date"
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
            />
          </FormField>
        </div>

        <div className="flex gap-4 pt-4">
          <Button
            onClick={handleSave}
            className="flex-1 bg-[#1976d2] hover:bg-[#1565c0] text-white py-3 px-4 rounded-lg font-semibold transition-colors"
          >
            Сохранить
          </Button>
          <Button
            onClick={onClose}
            className="flex-1 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 dark:bg-slate-600 text-gray-700 dark:text-slate-300 py-3 px-4 rounded-lg font-semibold transition-colors"
          >
            Отмена
          </Button>
        </div>
      </div>
    </Modal>
  );
}
