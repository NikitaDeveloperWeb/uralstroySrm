'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/shared/components/ui/Modal';

interface Fund {
  id?: string;
  name: string;
  type: string;
  targetAmount: number;
  description: string;
}

interface FundCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (fund: Omit<Fund, 'id'>) => void;
  editingFund?: Fund | null;
}

const fundTypes = [
  { value: 'bonus', label: 'Фонд премирования', icon: '🎯', description: 'Бонусы и поощрения сотрудников' },
  { value: 'development', label: 'Фонд развития', icon: '📈', description: 'Развитие бизнеса и инфраструктуры' },
  { value: 'emergency', label: 'Чрезвычайный фонд', icon: '🚨', description: 'Непредвиденные расходы и форс-мажоры' },
  { value: 'equipment', label: 'Фонд техники', icon: '🛠️', description: 'Покупка и обслуживание оборудования' },
  { value: 'other', label: 'Прочий фонд', icon: '💰', description: 'Другие цели' },
];

export function FundCreateModal({ isOpen, onClose, onSubmit, editingFund }: FundCreateModalProps) {
  const [formData, setFormData] = useState({
    name: editingFund?.name || '',
    type: editingFund?.type || 'bonus',
    targetAmount: editingFund?.targetAmount || 0,
    description: editingFund?.description || '',
  });

  useEffect(() => {
    if (editingFund) {
      setFormData({
        name: editingFund.name,
        type: editingFund.type,
        targetAmount: editingFund.targetAmount,
        description: editingFund.description,
      });
    } else {
      setFormData({
        name: '',
        type: 'bonus',
        targetAmount: 0,
        description: '',
      });
    }
  }, [editingFund, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingFund ? 'Редактировать фонд' : 'Создать фонд'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Название фонда</label>
          <input
            type="text"
            value={formData.name}
            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
            placeholder="Например: Фонд премирования Q4"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Тип фонда</label>
          <div className="grid grid-cols-2 gap-3">
            {fundTypes.map(type => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  formData.type === type.value
                    ? 'border-[#1976d2] bg-blue-50'
                    : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:border-slate-600'
                }`}
              >
                <div className="text-2xl mb-1">{type.icon}</div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{type.label}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{type.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Целевая сумма (₽)</label>
          <input
            type="number"
            min="0"
            step="1000"
            value={formData.targetAmount}
            onChange={e => setFormData(prev => ({ ...prev, targetAmount: Number(e.target.value) }))}
            className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
            placeholder="0"
          />
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Оставьте 0, если целевая сумма не установлена</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Описание</label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] resize-none"
            placeholder="Для чего предназначен этот фонд..."
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            className="flex-1 bg-[#1976d2] hover:bg-[#1565c0] text-white py-3 px-4 rounded-lg font-semibold transition-colors"
          >
            {editingFund ? 'Сохранить' : 'Создать фонд'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 dark:bg-slate-600 text-gray-700 dark:text-slate-300 py-3 px-4 rounded-lg font-semibold transition-colors"
          >
            Отмена
          </button>
        </div>
      </form>
    </Modal>
  );
}
