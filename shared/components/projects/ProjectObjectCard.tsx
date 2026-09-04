'use client';

import { ChevronDown, Edit3 } from 'lucide-react';
import type { Project } from '@/shared/types/project';

interface Props {
  project: Project;
  collapsed: boolean;
  onToggle: () => void;
  onEdit?: () => void;
}

export function ProjectObjectCard({ project, collapsed, onToggle, onEdit }: Props) {
  const hasAnyField =
    project.floors ||
    project.roofType ||
    project.foundations ||
    project.walls ||
    project.hasMansard !== null && project.hasMansard !== undefined ||
    project.hasVeranda !== null && project.hasVeranda !== undefined ||
    project.hasPorhch !== null && project.hasPorhch !== undefined ||
    project.communication ||
    project.description ||
    project.baseType ||
    project.homeType ||
    project.roofMaterial ||
    project.layout ||
    project.insulationThickness ||
    project.roofColor ||
    project.insulation ||
    project.windows ||
    project.doorType;

  if (!hasAnyField) {
    return (
      <div className="mb-6 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border border-amber-200 p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-2xl">
            ℹ️
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-700 dark:text-slate-300">
              Карта объекта не заполнена. Заполните данные для лучшего учета.
            </p>
          </div>
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
            >
              Заполнить данные
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 md:p-6 hover:bg-blue-100/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-xl">🏗</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Карта объекта</h2>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-600 dark:text-slate-300 transition-transform ${collapsed ? '' : 'rotate-180'}`}
        />
      </button>
      {!collapsed && (
        <div className="p-5 md:p-6 pt-0">
          {onEdit && (
            <div className="mb-5 flex justify-end">
              <button
                onClick={onEdit}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-lg font-medium text-sm transition-colors border border-gray-200 dark:border-slate-700 shadow-sm"
              >
                <Edit3 className="w-4 h-4" />
                Редактировать
              </button>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {project.floors && (
              <FieldCard label="Этажей" value={String(project.floors)} icon="🏢" />
            )}
            {project.roofType && (
              <FieldCard label="Тип крыши" value={project.roofType} icon="🏠" />
            )}
            {project.roofColor && (
              <FieldCard label="Цвет крыши" value={project.roofColor} icon="🎨" />
            )}
            {project.hasMansard !== null && project.hasMansard !== undefined && (
              <FieldCard label="Мансарда" value={project.hasMansard ? '✅ Да' : '❌ Нет'} icon="🏘" />
            )}
            {project.hasVeranda !== null && project.hasVeranda !== undefined && (
              <FieldCard
                label="Веранда"
                value={
                  <span>
                    {project.hasVeranda ? '✅ Да' : '❌ Нет'}
                    {project.verandaSize && (
                      <span className="block text-xs text-gray-500 dark:text-slate-400 mt-1">
                        {project.verandaSize}
                      </span>
                    )}
                  </span>
                }
                icon="🏡"
              />
            )}
            {project.hasPorhch !== null && project.hasPorhch !== undefined && (
              <FieldCard label="Крыльцо" value={project.hasPorhch ? '✅ Да' : '❌ Нет'} icon="🚪" />
            )}
            {project.foundations && (
              <FieldCard label="Фундамент" value={project.foundations} icon="🧱" />
            )}
            {project.walls && (
              <FieldCard label="Стены" value={project.walls} icon="🏗" />
            )}
            {project.insulation && (
              <FieldCard label="Утепление" value={project.insulation} icon="🌡" />
            )}
            {project.insulationThickness && (
              <FieldCard label="Толщина утепления" value={project.insulationThickness} icon="📏" />
            )}
            {project.windows && (
              <FieldCard label="Окна" value={project.windows} icon="🪟" />
            )}
            {project.doorType && (
              <FieldCard label="Двери" value={project.doorType} icon="🚪" />
            )}
            {project.baseType && (
              <FieldCard label="Основание" value={project.baseType} icon="⚙️" />
            )}
            {project.homeType && (
              <FieldCard label="Тип дома" value={project.homeType} icon="🏠" />
            )}
            {project.roofMaterial && (
              <FieldCard label="Тип кровли" value={project.roofMaterial} icon="🔨" />
            )}
          </div>
          {project.communication && (
            <FieldBlock label="Коммуникации" value={project.communication} icon="⚡" />
          )}
          {project.description && (
            <FieldBlock label="Описание" value={project.description} icon="📝" />
          )}
          {project.layout && (
            <FieldBlock label="Планировка" value={project.layout} icon="📐" pre />
          )}
        </div>
      )}
    </div>
  );
}

function FieldCard({ label, value, icon }: { label: string; value: React.ReactNode; icon?: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        {icon && <span className="text-xl">{icon}</span>}
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-1">{label}</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

function FieldBlock({
  label,
  value,
  icon,
  pre,
}: {
  label: string;
  value: string;
  icon?: string;
  pre?: boolean;
}) {
  return (
    <div className="mt-4 bg-white dark:bg-slate-800 rounded-lg p-5 border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 mb-2">
        {icon && <span className="text-xl">{icon}</span>}
        <p className="text-xs font-medium text-gray-600 dark:text-slate-300 uppercase tracking-wide">{label}</p>
      </div>
      <p className={`text-sm text-gray-900 dark:text-white ${pre ? 'whitespace-pre-line' : ''}`}>{value}</p>
    </div>
  );
}
