'use client';

import type { Project } from '@/shared/types/project';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/button';
import {
  COMPLEXITY_OPTIONS,
  STATUS_OPTIONS,
} from './projectDetailUtils';

interface Props {
  project: Project;
  editForm: Partial<Project>;
  setEditForm: (form: Partial<Project> | ((prev: Partial<Project>) => Partial<Project>)) => void;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => Promise<void>;
}

export function EditForm({ project, editForm, setEditForm, isOpen, onClose, onSave }: Props) {
  const handleSave = async () => {
    await onSave();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Редактировать объект">
      <div className="space-y-4">
        <FormField label="Название">
          <input
            type="text"
            value={editForm.name || ''}
            onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Тип объекта">
            <input
              type="text"
              value={editForm.type || ''}
              onChange={(e) => setEditForm((prev) => ({ ...prev, type: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
            />
          </FormField>
          <FormField label="Площадь (м²)">
            <input
              type="text"
              value={editForm.area || ''}
              onChange={(e) => setEditForm((prev) => ({ ...prev, area: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
            />
          </FormField>
        </div>

        <FormField label="Адрес">
          <input
            type="text"
            value={editForm.address || ''}
            onChange={(e) => setEditForm((prev) => ({ ...prev, address: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Стоимость">
            <input
              type="number"
              value={editForm.cost ?? ''}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  cost: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
            />
          </FormField>
          <FormField label="Дата сдачи">
            <input
              type="date"
              value={editForm.deadline || ''}
              onChange={(e) => setEditForm((prev) => ({ ...prev, deadline: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Сложность">
            <select
              value={editForm.complexity || 'средний'}
              onChange={(e) => setEditForm((prev) => ({ ...prev, complexity: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
            >
              {COMPLEXITY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Статус">
            <select
              value={editForm.status || 'создан'}
              onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField label="Код объекта">
          <input
            type="text"
            value={editForm.code || ''}
            onChange={(e) => setEditForm((prev) => ({ ...prev, code: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Сумма предоплаты">
            <input
              type="number"
              value={editForm.prepayment ?? ''}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  prepayment: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
              placeholder="0"
            />
          </FormField>
          <FormField label="Дата предоплаты">
            <input
              type="date"
              value={editForm.prepaymentDate || ''}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, prepaymentDate: e.target.value }))
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
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
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold transition-colors"
          >
            Отмена
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}
