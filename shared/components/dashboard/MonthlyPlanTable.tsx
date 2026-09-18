'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Pencil, Trash2, Building2, Calendar, DollarSign } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';

interface FinancialPlan {
  id: number;
  projectId: number;
  periodFrom: string;
  periodTo: string;
  plannedAmount: number;
  comment: string | null;
  project: {
    id: number;
    name: string;
    code: string;
  };
}

interface Project {
  id: number;
  name: string;
  code: string;
  status: string;
  cost: number;
}

interface MonthlyPlanTableProps {
  onOpenAddModal: () => void;
}

export function MonthlyPlanTable({ onOpenAddModal }: MonthlyPlanTableProps) {
  const [plans, setPlans] = useState<FinancialPlan[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<FinancialPlan | null>(null);

  // Получаем текущий месяц (фиксируем для избежания пересоздания при ререндерах)
  const monthPeriod = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { monthStart, monthEnd, now };
  }, []);

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        periodFrom: monthPeriod.monthStart.toISOString(),
        periodTo: monthPeriod.monthEnd.toISOString(),
      });
      const res = await fetch(`/api/financial-plans?${params}`);
      const data = await res.json();
      if (data.success) {
        setPlans(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch plans:', err);
    } finally {
      setLoading(false);
    }
  }, [monthPeriod]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  // Загружаем проекты для модалки
  useEffect(() => {
    if (isAddModalOpen || editingPlan) {
      fetch('/api/projects')
        .then(res => res.json())
        .then(data => {
          const allProjects = (data as any).data || data || [];
          const active = allProjects.filter((p: any) => p.status !== 'завершен');
          setProjects(Array.isArray(active) ? active : []);
        })
        .catch(err => console.error('Failed to fetch projects:', err));
    }
  }, [isAddModalOpen, editingPlan]);

  const handleCreatePlan = async (data: {
    projectId: number;
    periodFrom: Date;
    periodTo: Date;
    plannedAmount: number;
    comment: string;
  }) => {
    try {
      const res = await fetch('/api/financial-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: data.projectId,
          periodFrom: data.periodFrom.toISOString(),
          periodTo: data.periodTo.toISOString(),
          plannedAmount: data.plannedAmount,
          comment: data.comment,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.message || 'Ошибка при создании плана');
        return;
      }

      setIsAddModalOpen(false);
      fetchPlans();
    } catch (err) {
      console.error('Failed to create plan:', err);
      alert('Ошибка при создании плана');
    }
  };

  const handleUpdatePlan = async (planId: number, data: {
    periodFrom?: Date;
    periodTo?: Date;
    plannedAmount?: number;
    comment?: string;
  }) => {
    try {
      const res = await fetch(`/api/financial-plans?id=${planId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.message || 'Ошибка при обновлении плана');
        return;
      }

      setEditingPlan(null);
      fetchPlans();
    } catch (err) {
      console.error('Failed to update plan:', err);
      alert('Ошибка при обновлении плана');
    }
  };

  const handleDeletePlan = async (planId: number) => {
    if (!confirm('Удалить план?')) return;

    try {
      const res = await fetch(`/api/financial-plans?id=${planId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.message || 'Ошибка при удалении плана');
        return;
      }

      fetchPlans();
    } catch (err) {
      console.error('Failed to delete plan:', err);
      alert('Ошибка при удалении плана');
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('ru-RU') + ' ₽';
  };

  const totalPlanned = plans.reduce((sum, plan) => sum + (plan.plannedAmount || 0), 0);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-slate-700">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#1976d2]"></div>
            <p className="mt-2 text-gray-600 dark:text-slate-300">Загрузка...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-slate-700">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Building2 className="w-6 h-6 text-[#1976d2]" />
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">План на {monthPeriod.now.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              {plans.length} {plans.length === 1 ? 'объект' : plans.length < 5 ? 'объекта' : 'объектов'}
            </p>
          </div>
        </div>
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-2 bg-[#1976d2] hover:bg-[#1565c0] text-white font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Добавить объект
        </button>
      </div>

      {/* Summary */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Общий план бюджета:</span>
          </div>
          <span className="text-2xl font-bold text-blue-700 dark:text-blue-400">{formatCurrency(totalPlanned)}</span>
        </div>
      </div>

      {/* Table */}
      {plans.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏗️</div>
          <p className="text-gray-500 dark:text-slate-400 text-lg mb-2">Нет запланированных объектов</p>
          <p className="text-sm text-gray-400 dark:text-slate-500">Добавьте объекты в план на этот месяц</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200 dark:border-slate-700">
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 dark:text-slate-300">Объект</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 dark:text-slate-300">Код</th>
                <th className="text-right py-4 px-4 text-sm font-semibold text-gray-700 dark:text-slate-300">План бюджета</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 dark:text-slate-300">Комментарий</th>
                <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700 dark:text-slate-300">Действия</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan.id} className="border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-750 transition-colors">
                  <td className="py-4 px-4">
                    <div className="font-medium text-gray-900 dark:text-white">{plan.project.name}</div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600 dark:text-slate-300">{plan.project.code}</td>
                  <td className="py-4 px-4 text-right font-bold text-[#1976d2]">
                    {formatCurrency(plan.plannedAmount)}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600 dark:text-slate-300 max-w-xs truncate">
                    {plan.comment || '—'}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setEditingPlan(plan)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors p-1"
                        title="Редактировать"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePlan(plan.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors p-1"
                        title="Удалить"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700 font-bold">
                <td colSpan={2} className="py-4 px-4 text-gray-900 dark:text-white">Итого:</td>
                <td className="py-4 px-4 text-right text-[#1976d2]">{formatCurrency(totalPlanned)}</td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Модалка добавления */}
      <AddProjectPlanModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreatePlan}
        projects={projects}
        periodFrom={monthPeriod.monthStart}
        periodTo={monthPeriod.monthEnd}
      />

      {/* Модалка редактирования */}
      <EditProjectPlanModal
        isOpen={!!editingPlan}
        onClose={() => setEditingPlan(null)}
        plan={editingPlan}
        projects={projects}
        onSubmit={handleUpdatePlan}
      />
    </div>
  );
}

// Модалка добавления
interface AddProjectPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    projectId: number;
    periodFrom: Date;
    periodTo: Date;
    plannedAmount: number;
    comment: string;
  }) => Promise<void>;
  projects: Project[];
  periodFrom: Date;
  periodTo: Date;
}

function AddProjectPlanModal({ isOpen, onClose, onSubmit, projects, periodFrom, periodTo }: AddProjectPlanModalProps) {
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    await onSubmit({
      projectId: Number(formData.get('projectId')),
      periodFrom,
      periodTo,
      plannedAmount: Number(formData.get('plannedAmount')),
      comment: formData.get('comment') as string,
    });

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Добавить объект в план" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Проект *</label>
          <select name="projectId" required className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] dark:bg-slate-700 dark:text-white">
            <option value="">Выберите проект</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.code} — {project.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">План бюджета (₽) *</label>
          <input
            type="number"
            name="plannedAmount"
            min="0"
            required
            className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] dark:bg-slate-700 dark:text-white"
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Период</label>
          <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg text-sm text-gray-700 dark:text-slate-300">
            {periodFrom.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })} — {periodTo.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Комментарий</label>
          <textarea
            name="comment"
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] dark:bg-slate-700 dark:text-white resize-none"
            placeholder="Необязательно"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 bg-[#1976d2] hover:bg-[#1565c0] text-white py-3 px-4 rounded-lg font-semibold transition-colors"
          >
            Добавить в план
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300 py-3 px-4 rounded-lg font-semibold transition-colors"
          >
            Отмена
          </button>
        </div>
      </form>
    </Modal>
  );
}

// Модалка редактирования
interface EditProjectPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: FinancialPlan | null;
  projects: Project[];
  onSubmit: (planId: number, data: {
    periodFrom?: Date;
    periodTo?: Date;
    plannedAmount?: number;
    comment?: string;
  }) => Promise<void>;
}

function EditProjectPlanModal({ isOpen, onClose, plan, projects, onSubmit }: EditProjectPlanModalProps) {
  if (!isOpen || !plan) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    await onSubmit(plan.id, {
      plannedAmount: Number(formData.get('plannedAmount')),
      comment: formData.get('comment') as string,
    });

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Редактировать план" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Проект</label>
          <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg text-sm text-gray-700 dark:text-slate-300">
            {plan.project.code} — {plan.project.name}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">План бюджета (₽) *</label>
          <input
            type="number"
            name="plannedAmount"
            defaultValue={plan.plannedAmount}
            min="0"
            required
            className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] dark:bg-slate-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Период</label>
          <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg text-sm text-gray-700 dark:text-slate-300">
            {new Date(plan.periodFrom).toLocaleDateString('ru-RU')} — {new Date(plan.periodTo).toLocaleDateString('ru-RU')}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Комментарий</label>
          <textarea
            name="comment"
            defaultValue={plan.comment || ''}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] dark:bg-slate-700 dark:text-white resize-none"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 bg-[#1976d2] hover:bg-[#1565c0] text-white py-3 px-4 rounded-lg font-semibold transition-colors"
          >
            Сохранить
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300 py-3 px-4 rounded-lg font-semibold transition-colors"
          >
            Отмена
          </button>
        </div>
      </form>
    </Modal>
  );
}
