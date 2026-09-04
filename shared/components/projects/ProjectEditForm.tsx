'use client';

import { useState } from 'react';
import { ProjectObjectCardEditModal } from './ProjectObjectCardEditModal';
import { FormField } from '@/shared/components/ui/FormField';
import type { Project, Brigade } from '@/shared/types/project';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editForm: Partial<Project>;
  setEditForm: (form: Partial<Project> | ((prev: Partial<Project>) => Partial<Project>)) => void;
  onSave: () => void;
  brigades: Brigade[];
  clients?: { id: number; name: string }[];
}

export function ProjectEditForm({ isOpen, onClose, editForm, setEditForm, onSave, brigades, clients }: Props) {
  const [activeTab, setActiveTab] = useState<'basic' | 'objectCard'>('basic');
  const [showObjectCardModal, setShowObjectCardModal] = useState(false);

  if (!isOpen) return null;

  const inputClasses = 'w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] dark:bg-slate-700 dark:text-white';
  const gridInputClasses = 'grid grid-cols-2 gap-4';

  return (
    <>
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('basic')}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === 'basic'
                ? 'border-b-2 border-[#1976d2] text-[#1976d2]'
                : 'text-gray-500 dark:text-slate-400 dark:text-slate-400 hover:text-gray-700 dark:text-slate-300 dark:hover:text-white'
            }`}
          >
            Основные данные
          </button>
          <button
            onClick={() => setShowObjectCardModal(true)}
            className="px-4 py-2 font-medium text-sm text-gray-500 dark:text-slate-400 dark:text-slate-400 hover:text-gray-700 dark:text-slate-300 dark:hover:text-white transition-colors"
          >
            🏗 Карта объекта
          </button>
        </div>

        {/* Basic fields */}
        {activeTab === 'basic' && (
          <div className="space-y-4">
            <FormField label="Название">
              <input
                type="text"
                value={editForm.name || ''}
                onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                className={inputClasses}
              />
            </FormField>

            <div className={gridInputClasses}>
              <FormField label="Тип объекта">
                <input
                  type="text"
                  value={editForm.type || ''}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, type: e.target.value }))}
                  className={inputClasses}
                />
              </FormField>
              <FormField label="Площадь (м²)">
                <input
                  type="text"
                  value={editForm.area || ''}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, area: e.target.value }))}
                  className={inputClasses}
                />
              </FormField>
            </div>

            <FormField label="Адрес">
              <input
                type="text"
                value={editForm.address || ''}
                onChange={(e) => setEditForm((prev) => ({ ...prev, address: e.target.value }))}
                className={inputClasses}
              />
            </FormField>

            <div className={gridInputClasses}>
              <FormField label="Стоимость">
                <input
                  type="number"
                  value={editForm.cost ?? ''}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, cost: e.target.value ? Number(e.target.value) : undefined }))}
                  className={inputClasses}
                />
              </FormField>
              <FormField label="Дата сдачи">
                <input
                  type="date"
                  value={editForm.deadline || ''}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, deadline: e.target.value }))}
                  className={inputClasses}
                />
              </FormField>
            </div>

            <div className={gridInputClasses}>
              <FormField label="Сложность">
                <select
                  value={editForm.complexity || 'средний'}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, complexity: e.target.value }))}
                  className={inputClasses}
                >
                  <option value="легкий">Легкий</option>
                  <option value="средний">Средний</option>
                  <option value="сложный">Сложный</option>
                </select>
              </FormField>
              <FormField label="Статус">
                <select
                  value={editForm.status || 'создан'}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value }))}
                  className={inputClasses}
                >
                  <option value="создан">Создан</option>
                  <option value="в работе">В работе</option>
                  <option value="завершен">Завершен</option>
                </select>
              </FormField>
            </div>

            <FormField label="Код объекта">
              <input
                type="text"
                value={editForm.code || ''}
                onChange={(e) => setEditForm((prev) => ({ ...prev, code: e.target.value }))}
                className={inputClasses}
              />
            </FormField>

            <FormField label="Бригада">
              <select
                value={editForm.brigadeId ?? ''}
                onChange={(e) => setEditForm((prev) => ({ ...prev, brigadeId: e.target.value ? Number(e.target.value) : null }))}
                className={inputClasses}
              >
                <option value="">Без бригады</option>
                {(brigades || []).map((brigade) => (
                  <option key={brigade.id} value={brigade.id}>
                    {brigade.name}
                  </option>
                ))}
              </select>
            </FormField>

            {clients && clients.length > 0 && (
              <FormField label="Клиент">
                <select
                  value={editForm.clientId ?? ''}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, clientId: e.target.value ? Number(e.target.value) : null }))}
                  className={inputClasses}
                >
                  <option value="">Без клиента</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </FormField>
            )}

            <div className={gridInputClasses}>
              <FormField label="Сумма предоплаты">
                <input
                  type="number"
                  value={editForm.prepayment ?? ''}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, prepayment: e.target.value ? Number(e.target.value) : null }))}
                  className={inputClasses}
                />
              </FormField>
              <FormField label="Дата предоплаты">
                <input
                  type="date"
                  value={editForm.prepaymentDate || ''}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, prepaymentDate: e.target.value }))}
                  className={inputClasses}
                />
              </FormField>
            </div>
          </div>
        )}

        {/* Save/Cancel buttons */}
        <div className="flex gap-4 pt-4">
          <button
            onClick={onSave}
            className="flex-1 bg-[#1976d2] hover:bg-[#1565c0] text-white py-3 px-4 rounded-lg font-semibold transition-colors"
          >
            Сохранить
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 dark:bg-slate-700 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300 dark:text-slate-300 py-3 px-4 rounded-lg font-semibold transition-colors"
          >
            Отмена
          </button>
        </div>
      </div>

      {/* Object card modal */}
      <ProjectObjectCardEditModal
        isOpen={showObjectCardModal}
        onClose={() => setShowObjectCardModal(false)}
        editForm={editForm}
        setEditForm={setEditForm}
        onSave={() => setShowObjectCardModal(false)}
      />
    </>
  );
}


