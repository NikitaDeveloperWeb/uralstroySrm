'use client';

import type { Project } from '@/shared/types/project';
import { formatCurrency, COMPLEXITY_COLORS } from './projectDetailUtils';

interface Props {
  project: Project;
}

export function ProjectDetailInfo({ project }: Props) {
  return (
    <div className="grid grid-cols-2 gap-6 mb-8">
      <InfoItem label="Тип объекта" value={project.type} />
      <InfoItem label="Площадь" value={`${project.area} м²`} />
      <InfoItem label="Стоимость" value={formatCurrency(project.cost)} />
      <InfoItem label="Дата сдачи" value={new Date(project.deadline).toLocaleDateString('ru-RU')} />
      <InfoItemComplexity complexity={project.complexity} />
      <InfoItem label="Адрес" value={project.address} />
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-gray-100 pb-4">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function InfoItemComplexity({ complexity }: { complexity: string }) {
  return (
    <div className="border-b border-gray-100 pb-4">
      <p className="text-sm text-gray-500 mb-1">Сложность</p>
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${COMPLEXITY_COLORS[complexity]}`} />
        <p className="text-xl font-semibold text-gray-900">{complexity}</p>
      </div>
    </div>
  );
}
