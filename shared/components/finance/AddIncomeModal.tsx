'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/shared/components/ui/Modal';
import { Loader2, Building2 } from 'lucide-react';

interface Project {
  id: number;
  name: string;
  code: string;
  status: string;
}

interface AddIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onSuccess: () => void;
}

export function AddIncomeModal({ isOpen, onClose, projects, onSuccess }: AddIncomeModalProps) {
  const [formData, setFormData] = useState({
    projectId: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    comment: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData({
        projectId: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        comment: '',
      });
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectId || !formData.amount) {
      setError('Заполните все обязательные поля');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setError('Введите корректную сумму');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const res = await fetch(`/api/projects/${formData.projectId}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(amount),
          date: formData.date,
          comment: formData.comment || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Ошибка при создании транзакции');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Ошибка при создании транзакции');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Быстрый приход">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Объект</label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500" />
            <select
              value={formData.projectId}
              onChange={e => setFormData(prev => ({ ...prev, projectId: e.target.value }))}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            >
              <option value="">Выберите объект</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name} ({project.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Сумма (₽)</label>
          <input
            type="number"
            min="0"
            step="1"
            value={formData.amount}
            onChange={e => setFormData(prev => ({ ...prev, amount: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="0"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Дата</label>
          <input
            type="date"
            value={formData.date}
            onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Комментарий</label>
          <textarea
            rows={2}
            value={formData.comment}
            onChange={e => setFormData(prev => ({ ...prev, comment: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            placeholder="Комментарий к платежу..."
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={saving || !formData.projectId || !formData.amount || isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0}
            className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 dark:bg-slate-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            {saving ? 'Сохранение...' : 'Добавить приход'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 dark:bg-slate-600 text-gray-700 dark:text-slate-300 py-3 px-4 rounded-lg font-semibold transition-colors"
            disabled={saving}
          >
            Отмена
          </button>
        </div>
      </form>
    </Modal>
  );
}
