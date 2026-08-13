'use client';

import { formatCurrency, MANAGER_PERCENTAGE } from './projectDetailUtils';

interface Props {
  projectCost: number;
}

export function ProjectDetailManager({ projectCost }: Props) {
  const managerAmount = Math.round((projectCost * MANAGER_PERCENTAGE) / 100);

  return (
    <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Оплата менеджменту</h2>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-gray-600 mb-1">Стоимость объекта</p>
          <p className="text-lg font-semibold text-gray-900">{formatCurrency(projectCost)} ₽</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Процент на менеджмент</p>
          <p className="text-lg font-semibold text-gray-900">{MANAGER_PERCENTAGE}%</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Сумма менеджменту</p>
          <p className="text-lg font-bold text-[#1976d2]">{formatCurrency(managerAmount)} ₽</p>
        </div>
      </div>
    </div>
  );
}
