'use client';

import { Banknote } from 'lucide-react';
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
    <div className="mb-8 p-6 bg-green-50 rounded-lg border border-green-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
          <Banknote className="w-5 h-5 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Предоплата</h2>
      </div>
      <div className="grid grid-cols-3 gap-6">
        <div>
          <p className="text-sm text-gray-600 mb-1">Сумма предоплаты</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(prepayment)} ₽</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Дата предоплаты</p>
          <p className="text-lg font-semibold text-gray-900">
            {project.prepaymentDate
              ? new Date(project.prepaymentDate).toLocaleDateString('ru-RU')
              : '—'}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Остаток к оплате</p>
          <p className="text-2xl font-bold text-[#1976d2]">{formatCurrency(remaining)} ₽</p>
        </div>
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Оплачено</span>
          <span>{percent}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-green-500 h-3 rounded-full transition-all"
            style={{ width: percent }}
          />
        </div>
      </div>
    </div>
  );
}
