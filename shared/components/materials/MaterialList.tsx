'use client';

import { Pencil, Trash2 } from 'lucide-react';
import type { Material } from '@/shared/types/material';

interface MaterialListProps {
  materials: Material[];
  onEdit: (material: Material) => void;
  onDelete: (id: number) => void;
}

const statusColors: Record<string, string> = {
  'in-stock': 'bg-green-100 text-green-800',
  'ordered': 'bg-blue-100 text-blue-800',
};

const statusLabels: Record<string, string> = {
  'in-stock': 'В наличии',
  'ordered': 'Под заказ',
};

export function MaterialList({ materials, onEdit, onDelete }: MaterialListProps) {
  if (materials.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-slate-400 dark:text-slate-400 text-lg">Материалы не найдены</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200 dark:border-slate-700 dark:border-slate-700 bg-gray-50 dark:bg-slate-700 dark:bg-slate-750">
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-slate-300 dark:text-slate-300">Наименование</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-slate-300 dark:text-slate-300">Категория</th>
              <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700 dark:text-slate-300 dark:text-slate-300">Количество</th>
              <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700 dark:text-slate-300 dark:text-slate-300">Ед. изм.</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-slate-300 dark:text-slate-300">Местоположение</th>
              <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700 dark:text-slate-300 dark:text-slate-300">Цена</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-slate-300 dark:text-slate-300">Партия</th>
              <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700 dark:text-slate-300 dark:text-slate-300">Статус</th>
              {materials.some((m) => m.status === 'ordered') && (
                <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700 dark:text-slate-300 dark:text-slate-300">Доставка</th>
              )}
              <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700 dark:text-slate-300 dark:text-slate-300">Действия</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((material) => (
              <tr key={material.id} className="border-b border-gray-100 dark:border-slate-700 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-700 transition-colors">
                <td className="py-4 px-6 text-gray-900 dark:text-white dark:text-white font-medium">{material.name}</td>
                <td className="py-4 px-6 text-gray-600 dark:text-slate-300 dark:text-slate-400">{material.category}</td>
                <td className="py-4 px-6 text-gray-600 dark:text-slate-300 dark:text-slate-400 text-center">{material.quantity}</td>
                <td className="py-4 px-6 text-gray-600 dark:text-slate-300 dark:text-slate-400 text-center">{material.unit}</td>
                <td className="py-4 px-6 text-gray-600 dark:text-slate-300 dark:text-slate-400">{material.location || '—'}</td>
                <td className="py-4 px-6 text-gray-600 dark:text-slate-300 dark:text-slate-400 text-center">{material.price?.toLocaleString('ru-RU') || '—'}</td>
                <td className="py-4 px-6 text-gray-600 dark:text-slate-300 dark:text-slate-400">{material.lotNumber || '—'}</td>
                <td className="py-4 px-6 text-center">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusColors[material.status]}`}>
                    {statusLabels[material.status]}
                  </span>
                </td>
                {material.status === 'ordered' && (
                  <td className="py-4 px-6 text-center text-gray-600 dark:text-slate-300 dark:text-slate-400 text-sm">
                    {material.expectedDelivery || '—'}
                  </td>
                )}
                <td className="py-4 px-6 text-center">
                  <div className="flex items-center justify-center gap-3">
                    <button onClick={() => onEdit(material)} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDelete(material.id)} className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
