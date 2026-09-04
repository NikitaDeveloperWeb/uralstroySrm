'use client';

import { Building2 } from 'lucide-react';

interface ManagerPaymentProps {
  projectCost: number;
  percentage: number;
}

export function ManagerPayment({ projectCost, percentage }: ManagerPaymentProps) {
  const amount = Math.round((projectCost * percentage) / 100);

  return (
    <div className="mt-8 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl border border-indigo-200 dark:border-indigo-700 shadow-sm overflow-hidden">
      <div className="p-5 md:p-6 border-b border-indigo-100 dark:border-indigo-700 bg-white dark:bg-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Оплата менеджменту</h2>
            <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Управленческие расходы</p>
          </div>
        </div>
      </div>

      <div className="p-5 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-indigo-100 dark:border-indigo-700 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-sm font-medium text-gray-600 dark:text-slate-300 mb-2">Стоимость объекта</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{projectCost.toLocaleString('ru-RU')} ₽</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-indigo-100 dark:border-indigo-700 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-sm font-medium text-gray-600 dark:text-slate-300 mb-2">Процент на менеджмент</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{percentage}%</p>
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-lg p-4 border border-indigo-200 dark:border-indigo-700 shadow-sm">
            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-2">Сумма менеджменту</p>
            <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">{amount.toLocaleString('ru-RU')} ₽</p>
          </div>
        </div>
      </div>
    </div>
  );
}
