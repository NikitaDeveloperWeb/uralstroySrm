'use client';

import { Button } from '@/shared/components/ui/button';
import { FileText, Hammer, Wallet, Users, Printer } from 'lucide-react';

interface Props {
  onOpenMaterials: () => void;
  onOpenWorks: () => void;
  onOpenOverheads: () => void;
  onOpenBrigade: () => void;
}

export function ProjectEstimateSection({ onOpenMaterials, onOpenWorks, onOpenOverheads, onOpenBrigade }: Props) {
  return (
    <div className="mb-6 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
      <div className="p-5 md:p-6 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-slate-700 dark:to-blue-900/30 border-b border-gray-200 dark:border-slate-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Управление сметой и ресурсами
        </h3>
        <p className="text-sm text-gray-600 dark:text-slate-300 mt-1">Настройте материалы, работы, расходы и бригаду</p>
      </div>
      
      <div className="p-5 md:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={onOpenMaterials}
            className="group flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-blue-400 hover:shadow-md transition-all text-left"
          >
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">Смета материалов</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Добавить материалы</p>
            </div>
          </button>

          <button
            onClick={onOpenWorks}
            className="group flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-blue-400 hover:shadow-md transition-all text-left"
          >
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800 transition-colors">
              <Hammer className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">Смета работ</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Выполненные работы</p>
            </div>
          </button>

          <button
            onClick={onOpenOverheads}
            className="group flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-emerald-400 hover:shadow-md transition-all text-left"
          >
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800 transition-colors">
              <Wallet className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">Общие расходы</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Дополнительные затраты</p>
            </div>
          </button>

          <button
            onClick={onOpenBrigade}
            className="group flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-purple-400 hover:shadow-md transition-all text-left"
          >
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors">Бригада</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Назначить бригаду</p>
            </div>
          </button>
        </div>

        <div className="mt-5 flex justify-center">
          <button
            disabled
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 dark:bg-slate-700 text-gray-500 dark:text-slate-400 rounded-lg font-medium text-sm transition-colors border border-gray-200 dark:border-slate-700 cursor-not-allowed"
          >
            <Printer className="w-4 h-4" />
            Распечатать
          </button>
        </div>
      </div>
    </div>
  );
}
