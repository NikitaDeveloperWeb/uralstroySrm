'use client';

import { Pencil, Users } from 'lucide-react';
import type { Project } from '@/shared/types/project';
import { TYPE_ICONS, STATUS_COLORS, parseJsonSafe } from './projectDetailUtils';

interface Props {
  project: Project;
  onEdit: () => void;
  onStatusChange: (status: string) => void;
}

export function ProjectDetailHeader({ project, onEdit, onStatusChange }: Props) {
  const typeIcon = TYPE_ICONS[project.type] || '🏗';
  const skills = project.brigade?.skills
    ? parseJsonSafe<string[]>(project.brigade.skills)
    : [];
  const memberIds = project.brigade?.memberIds
    ? parseJsonSafe<string[]>(project.brigade.memberIds)
    : [];

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <a 
          href="/projects" 
          className="inline-flex items-center gap-2 text-[#1976d2] hover:text-[#1565c0] font-medium transition-colors group"
        >
          <span className="transform group-hover:-translate-x-1 transition-transform">←</span> Назад к списку
        </a>
        <button 
          onClick={onEdit} 
          className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-800 transition-all border border-transparent hover:border-blue-200 dark:hover:border-blue-700"
          title="Редактировать объект"
        >
          <Pencil className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
        <div className="text-6xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl p-4 shadow-inner">{typeIcon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{project.name}</h1>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
              #{project.id}
            </span>
          </div>
          <p className="text-gray-600 dark:text-slate-300 text-lg flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {project.address}
          </p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-700">
          <div className={`w-3 h-3 rounded-full ${STATUS_COLORS[project.status]} animate-pulse`} />
          <span className="text-gray-700 dark:text-slate-300 font-medium">{project.status.charAt(0).toUpperCase() + project.status.slice(1)}</span>
        </div>
      </div>

      {project.brigade && (
        <div className="mb-8 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-xl border border-purple-200 dark:border-purple-700 p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{project.brigade.name}</h2>
              <p className="text-sm text-purple-600 font-medium">Рабочая бригада</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-purple-100">
              <p className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Навыки бригады</p>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill: string) => (
                  <span key={skill} className="px-3 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 text-sm rounded-full font-medium border border-purple-200 dark:border-purple-700">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-purple-100">
              <p className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Состав бригады</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                  <span className="text-gray-700 dark:text-slate-300">Прораб: 1 чел.</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span className="text-gray-700 dark:text-slate-300">Всего участников: {Array.isArray(memberIds) ? memberIds.length + 1 : 1}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="pt-6 border-t border-gray-200 dark:border-slate-700">
        <p className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">Статус объекта</p>
        <div className="flex flex-wrap gap-3">
          {['создан', 'в работе', 'на паузе', 'завершен'].map((status) => (
            <StatusButton
              key={status}
              status={status}
              isActive={project.status === status}
              onClick={() => onStatusChange(status)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusButton({ status, isActive, onClick }: { status: string; isActive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
        isActive
          ? `${STATUS_COLORS[status]} text-white`
          : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 dark:bg-slate-700'
      }`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </button>
  );
}
