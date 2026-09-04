'use client';

import { Banknote, TrendingUp, Calendar } from 'lucide-react';
import type { Project } from '@/shared/types/project';
import { formatCurrency, formatPercent } from './projectDetailUtils';

interface Props {
  project: Project;
}

export function ProjectDetailPrepayment({ project }: Props) {
  const cost = project.cost;
  const prepayment = project.prepayment ?? 0;
  const remaining = cost - prepayment;
  const percent = formatPercent(prepayment, cost);

  if (prepayment === null || prepayment === undefined) return null;

  return (
    <div className="mb-8 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 rounded-xl border border-emerald-200 dark:border-emerald-700 shadow-sm overflow-hidden">
      <div className="p-6 md:p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-md">
            <Banknote className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Предоплата</h2>
            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Финансовая информация объекта</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-5 border border-emerald-100 dark:border-emerald-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <p className="text-sm font-medium text-gray-600 dark:text-slate-300">Сумма предоплаты</p>
            </div>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(prepayment)} ₽</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg p-5 border border-emerald-100 dark:border-emerald-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <p className="text-sm font-medium text-gray-600 dark:text-slate-300">Дата предоплаты</p>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {project.prepaymentDate
                ? new Date(project.prepaymentDate).toLocaleDateString('ru-RU')
                : '—'}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg p-5 border border-blue-100 dark:border-blue-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <Banknote className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <p className="text-sm font-medium text-gray-600 dark:text-slate-300">Остаток к оплате</p>
            </div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(remaining)} ₽</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg p-5 border border-emerald-100 dark:border-emerald-700 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">Прогресс оплаты</span>
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{percent}</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-green-500 h-full rounded-full transition-all duration-500 shadow-sm"
              style={{ width: percent }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
