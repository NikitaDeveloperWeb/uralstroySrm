'use client';

import { useState } from 'react';
import { PAYMENT_CATEGORIES, MANAGER_PERCENTAGE, formatCurrency } from './projectDetailUtils';

interface Props {
  projectCost: number;
}

export function ProjectDetailLabor({ projectCost }: Props) {
  const [statuses, setStatuses] = useState<Record<number, 'executed' | 'pending'>>(
    Object.fromEntries(PAYMENT_CATEGORIES.map((_, i) => [i, 'pending'])),
  );
  const totalPercent = PAYMENT_CATEGORIES.reduce((sum, cat) => sum + cat.percentage, 0);

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Оплата труда</h2>
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Категория</th>
            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Процент</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Сумма (₽)</th>
            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Статус</th>
          </tr>
        </thead>
        <tbody>
          {PAYMENT_CATEGORIES.map((cat, index) => {
            const amount = Math.round((projectCost * cat.percentage) / 100);
            const isExecuted = statuses[index] === 'executed';

            return (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-900">{cat.name}</td>
                <td className="py-3 px-4 text-center text-gray-600">{cat.percentage}%</td>
                <td className="py-3 px-4 text-right font-medium text-gray-900">{formatCurrency(amount)}</td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() =>
                      setStatuses((prev) => ({
                        ...prev,
                        [index]: isExecuted ? 'pending' : 'executed',
                      }))
                    }
                    className={`${isExecuted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} text-xs font-medium px-2.5 py-0.5 rounded cursor-pointer hover:opacity-80`}
                  >
                    {isExecuted ? 'Выполнен' : 'Не выполнен'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-gray-200">
            <td className="py-3 px-4 font-bold text-gray-900">Итого</td>
            <td className="py-3 px-4 text-center font-bold text-gray-900">{totalPercent}%</td>
            <td className="py-3 px-4 text-right font-bold text-[#1976d2] text-lg">
              {formatCurrency(Math.round((projectCost * totalPercent) / 100))}
            </td>
            <td className="py-3 px-4"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
