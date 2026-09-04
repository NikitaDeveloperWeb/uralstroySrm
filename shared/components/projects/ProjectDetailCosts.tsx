'use client';

import { MATERIALS_BREAKDOWN } from './projectDetailUtils';

interface Props {
  area: string;
}

const TOTAL_PER_M2 = MATERIALS_BREAKDOWN.reduce((sum, item) => sum + item.perM2, 0);

export function ProjectDetailCosts({ area }: Props) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Стоимость квадратов</h2>
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-gray-200 dark:border-slate-700">
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-slate-300">Позиция</th>
            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-slate-300">Количество (м²)</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-slate-300">За м² (₽)</th>
          </tr>
        </thead>
        <tbody>
          {MATERIALS_BREAKDOWN.map((item) => (
            <tr key={item.label} className="border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-700">
              <td className="py-3 px-4 text-gray-900 dark:text-white">{item.label}</td>
              <td className="py-3 px-4 text-center text-gray-600 dark:text-slate-300">
                {Math.round(parseInt(area) * item.qtyMultiplier).toLocaleString('ru-RU')}
              </td>
              <td className="py-3 px-4 text-right text-gray-600 dark:text-slate-300">{item.perM2.toLocaleString('ru-RU')}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-gray-200 dark:border-slate-700">
            <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">Итого</td>
            <td className="py-3 px-4 text-center font-bold text-gray-900 dark:text-white">{area} м²</td>
            <td className="py-3 px-4 text-right font-bold text-gray-900 dark:text-white">{TOTAL_PER_M2.toLocaleString('ru-RU')}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
