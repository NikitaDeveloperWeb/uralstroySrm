'use client';

import { useState, useCallback, useEffect } from 'react';
import { useFinancialPlans } from '@/shared/hooks/useFinancialPlans';
import PeriodSelector from '@/shared/components/financial-planning/PeriodSelector';
import SummaryCards from '@/shared/components/financial-planning/SummaryCards';
import ProjectsTable from '@/shared/components/financial-planning/ProjectsTable';
import PlanModal from '@/shared/components/financial-planning/PlanModal';

interface Project {
  id: number;
  name: string;
  code: string;
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekEnd(date: Date): Date {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getMonthEnd(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

export default function FinancialPlanningPage() {
  const today = new Date();
  const [isWeekMode, setIsWeekMode] = useState(true);
  const [weekPeriodFrom, setWeekPeriodFrom] = useState<Date>(getWeekStart(today));
  const [weekPeriodTo, setWeekPeriodTo] = useState<Date>(getWeekEnd(today));
  const [monthPeriodFrom, setMonthPeriodFrom] = useState<Date>(getMonthStart(today));
  const [monthPeriodTo, setMonthPeriodTo] = useState<Date>(getMonthEnd(today));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<{
    planId: number;
    projectId: number;
    plannedAmount: number;
    comment: string | null;
  } | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const activeProjects = projects.filter(p => p.id > 0); // фильтруем завершённые

  // Выбираем период в зависимости от режима
  const currentPeriodFrom = isWeekMode ? weekPeriodFrom : monthPeriodFrom;
  const currentPeriodTo = isWeekMode ? weekPeriodTo : monthPeriodTo;

  const { summary, loading: plansLoading, error, createPlan, updatePlan, deletePlan, refetch } = useFinancialPlans(currentPeriodFrom, currentPeriodTo);

  // Загружаем список проектов
  useEffect(() => {
    let cancelled = false;

    async function loadProjects() {
      try {
        const res = await fetch('/api/projects');
        const data = await res.json();
        if (!cancelled && data.success) {
          const allProjects = data.data;
          const active = allProjects.filter((p: any) => p.status !== 'completed');
          setProjects(active);
        }
      } catch (err) {
        console.error('Failed to load projects:', err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProjects();
    return () => {
      cancelled = true;
    };
  }, []);

  const handlePeriodChange = useCallback((from: Date, to: Date) => {
    if (isWeekMode) {
      setWeekPeriodFrom(from);
      setWeekPeriodTo(to);
    } else {
      setMonthPeriodFrom(from);
      setMonthPeriodTo(to);
    }
  }, [isWeekMode]);

  const handleCreatePlan = async (data: {
    projectId: number;
    periodFrom: Date;
    periodTo: Date;
    plannedAmount: number;
    comment: string;
  }) => {
    if (editingProject) {
      await updatePlan(editingProject.planId, {
        periodFrom: data.periodFrom,
        periodTo: data.periodTo,
        plannedAmount: data.plannedAmount,
        comment: data.comment,
      });
    } else {
      await createPlan(data);
    }
    setEditingProject(null);
  };

  const handleEdit = (project: { planId: number; projectId: number; plannedAmount: number; comment: string | null }) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleDelete = async (planId: number) => {
    if (confirm('Удалить план?')) {
      await deletePlan(planId);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingProject(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Финансовое планирование</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setIsWeekMode(true)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isWeekMode
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-600'
              }`}
            >
              📅 Неделя
            </button>
            <button
              onClick={() => setIsWeekMode(false)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                !isWeekMode
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-600'
              }`}
            >
              📆 Месяц
            </button>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Создать план
        </button>
      </div>

      <PeriodSelector periodFrom={currentPeriodFrom} periodTo={currentPeriodTo} onPeriodChange={handlePeriodChange} />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {plansLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Загрузка...</div>
        </div>
      ) : summary ? (
        <>
          <SummaryCards
            totalPlanned={summary.totalPlanned}
            totalActual={summary.totalActual}
            totalProgress={summary.totalProgress}
          />

          <ProjectsTable
            projects={summary.projects}
            totalPlanned={summary.totalPlanned}
            totalActual={summary.totalActual}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-gray-500">Нет данных для выбранного периода</div>
        </div>
      )}

      <PlanModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleCreatePlan}
        periodFrom={currentPeriodFrom}
        periodTo={currentPeriodTo}
        projects={projects}
        editingProject={editingProject}
      />
    </div>
  );
}
