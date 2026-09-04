'use client';

import type { Project } from '@/shared/types/project';
import { formatCurrency, COMPLEXITY_COLORS } from './projectDetailUtils';

interface Props {
  project: Project;
}

export function ProjectDetailInfo({ project }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      <InfoCard label="Тип объекта" value={project.type} icon="🏠" />
      <InfoCard label="Площадь" value={`${project.area} м²`} icon="📐" />
      <InfoCard label="Стоимость" value={formatCurrency(project.cost)} icon="💰" highlight />
      <InfoCard label="Дата сдачи" value={new Date(project.deadline).toLocaleDateString('ru-RU')} icon="📅" />
      <InfoCardComplexity complexity={project.complexity} icon="⚡" />
      <InfoCard label="Адрес" value={project.address} icon="📍" />
    </div>
  );
}

function InfoCard({ label, value, icon, highlight = false }: { label: string; value: string; icon: string; highlight?: boolean }) {
  return (
    <div className={`group bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 transition-all hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 ${highlight ? 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-blue-200 dark:border-blue-700' : ''}`}>
      <div className="flex items-start gap-3">
        <div className="text-2xl group-hover:scale-110 transition-transform">{icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-600 dark:text-slate-300 mb-1">{label}</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white truncate">{value}</p>
        </div>
      </div>
    </div>
  );
}

function InfoCardComplexity({ complexity, icon }: { complexity: string; icon: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 transition-all hover:shadow-md hover:border-blue-300 group">
      <div className="flex items-start gap-3">
        <div className="text-2xl group-hover:scale-110 transition-transform">{icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-600 dark:text-slate-300 mb-2">Сложность</p>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${COMPLEXITY_COLORS[complexity]}`} />
            <p className="text-lg font-bold text-gray-900 dark:text-white">{complexity.charAt(0).toUpperCase() + complexity.slice(1)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
