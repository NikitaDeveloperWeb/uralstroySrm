'use client';

import { useState, useEffect } from 'react';
import { ProjectObjectCardEditModal } from './ProjectObjectCardEditModal';
import { FormField } from '@/shared/components/ui/FormField';
import type { Project, Brigade } from '@/shared/types/project';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editForm: Partial<Project>;
  setEditForm: (form: Partial<Project> | ((prev: Partial<Project>) => Partial<Project>)) => void;
  onSave: (data: Partial<Project>) => void;
  brigades: Brigade[];
  clients?: { id: number; name: string }[];
}

export function ProjectEditForm({ isOpen, onClose, editForm, setEditForm, onSave, brigades, clients }: Props) {
  const [activeTab, setActiveTab] = useState<'basic' | 'objectCard'>('basic');
  const [showObjectCardModal, setShowObjectCardModal] = useState(false);
  
  // Локальный state для полей формы чтобы избежать потери фокуса
  const [localForm, setLocalForm] = useState<Partial<Project>>(editForm || {});

  // Обновляем localForm при изменении editForm
  useEffect(() => {
    setLocalForm(editForm || {});
  }, [editForm]);

  if (!isOpen) return null;

  const inputClasses = 'w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] dark:bg-slate-700 dark:text-white';
  const gridInputClasses = 'grid grid-cols-2 gap-4';

  // Обновляем localForm при изменении поля
  const updateField = (field: string, value: string | number | null | undefined) => {
    setLocalForm((prev) => ({ ...prev, [field]: value }));
  };

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
                value={localForm.name || ''}
                onChange={(e) => updateField('name', e.target.value)}
                className={inputClasses}
              />
            </FormField>

            <div className={gridInputClasses}>
              <FormField label="Тип объекта">
                <input
                  type="text"
                  value={localForm.type || ''}
                  onChange={(e) => updateField('type', e.target.value)}
                  className={inputClasses}
                />
              </FormField>
              <FormField label="Площадь (м²)">
                <input
                  type="text"
                  value={localForm.area || ''}
                  onChange={(e) => updateField('area', e.target.value)}
                  className={inputClasses}
                />
              </FormField>
            </div>

            <FormField label="Адрес">
              <input
                type="text"
                value={localForm.address || ''}
                onChange={(e) => updateField('address', e.target.value)}
                className={inputClasses}
              />
            </FormField>

            <div className={gridInputClasses}>
              <FormField label="Стоимость">
                <input
                  type="number"
                  value={localForm.cost ?? ''}
                  onChange={(e) => updateField('cost', e.target.value ? Number(e.target.value) : undefined)}
                  className={inputClasses}
                />
              </FormField>
              <FormField label="Дата сдачи">
                <input
                  type="date"
                  value={localForm.deadline || ''}
                  onChange={(e) => updateField('deadline', e.target.value)}
                  className={inputClasses}
                />
              </FormField>
            </div>

            <div className={gridInputClasses}>
              <FormField label="Сложность">
                <select
                  value={localForm.complexity || 'средний'}
                  onChange={(e) => updateField('complexity', e.target.value)}
                  className={inputClasses}
                >
                  <option value="легкий">Легкий</option>
                  <option value="средний">Средний</option>
                  <option value="сложный">Сложный</option>
                </select>
              </FormField>
              <FormField label="Статус">
                <select
                  value={localForm.status || 'создан'}
                  onChange={(e) => updateField('status', e.target.value)}
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
                value={localForm.code || ''}
                onChange={(e) => updateField('code', e.target.value)}
                className={inputClasses}
              />
            </FormField>

            <FormField label="Бригада">
              <select
                value={localForm.brigadeId ?? ''}
                onChange={(e) => updateField('brigadeId', e.target.value ? Number(e.target.value) : null)}
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
                  value={localForm.clientId ?? ''}
                  onChange={(e) => updateField('clientId', e.target.value ? Number(e.target.value) : null)}
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
                  value={localForm.prepayment ?? ''}
                  onChange={(e) => updateField('prepayment', e.target.value ? Number(e.target.value) : null)}
                  className={inputClasses}
                />
              </FormField>
              <FormField label="Дата предоплаты">
                <input
                  type="date"
                  value={localForm.prepaymentDate || ''}
                  onChange={(e) => updateField('prepaymentDate', e.target.value)}
                  className={inputClasses}
                />
              </FormField>
            </div>
          </div>
        )}

        {/* Save/Cancel buttons */}
        <div className="flex gap-4 pt-4">
          <button
            onClick={() => {
              onSave(localForm);
            }}
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


