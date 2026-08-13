'use client';

import { MATERIALS_BREAKDOWN } from './projectDetailUtils';

interface Props {
  area: string;
}

const TOTAL_PER_M2 = MATERIALS_BREAKDOWN.reduce((sum, item) => sum + item.perM2, 0);

export function ProjectDetailCosts({ area }: Props) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Стоимость квадратов</h2>
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Позиция</th>
            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Количество (м²)</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">За м² (₽)</th>
          </tr>
        </thead>
        <tbody>
          {MATERIALS_BREAKDOWN.map((item) => (
            <tr key={item.label} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4 text-gray-900">{item.label}</td>
              <td className="py-3 px-4 text-center text-gray-600">
                {Math.round(parseInt(area) * item.qtyMultiplier).toLocaleString('ru-RU')}
              </td>
              <td className="py-3 px-4 text-right text-gray-600">{item.perM2.toLocaleString('ru-RU')}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-gray-200">
            <td className="py-3 px-4 font-bold text-gray-900">Итого</td>
            <td className="py-3 px-4 text-center font-bold text-gray-900">{area} м²</td>
            <td className="py-3 px-4 text-right font-bold text-gray-900">{TOTAL_PER_M2.toLocaleString('ru-RU')}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
