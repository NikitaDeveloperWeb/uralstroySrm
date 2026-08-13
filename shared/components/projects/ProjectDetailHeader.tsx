'use client';

import { Users } from 'lucide-react';
import type { Project } from '@/shared/types/project';
import { TYPE_ICONS, STATUS_COLORS, parseJsonSafe } from './projectDetailUtils';

interface Props {
  project: Project;
  onEdit: () => void;
}

export function ProjectDetailHeader({ project, onEdit }: Props) {
  const typeIcon = TYPE_ICONS[project.type] || '🏗';
  const skills = project.brigade?.skills
    ? parseJsonSafe<string[]>(project.brigade.skills)
    : [];
  const memberIds = project.brigade?.memberIds
    ? parseJsonSafe<string[]>(project.brigade.memberIds)
    : [];

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <div className="flex items-center justify-between mb-6">
        <a href="/projects" className="text-[#1976d2] hover:underline">
          ← Назад
        </a>
        <button onClick={onEdit} className="text-blue-600 hover:text-blue-800 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-6 mb-8">
        <div className="text-6xl">{typeIcon}</div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
          <p className="text-gray-500 text-lg">{project.address}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-mono text-gray-600 bg-gray-100 px-3 py-1 rounded">
            {project.code}
          </span>
          <div className={`w-4 h-4 rounded-full ${STATUS_COLORS[project.status]}`} />
          <span className="text-gray-600 font-medium">{project.status}</span>
        </div>
      </div>

      {project.brigade && (
        <div className="mb-8 p-6 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{project.brigade.name}</h2>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Навыки бригады</p>
              <div className="flex flex-wrap gap-1">
                {skills.map((skill: string) => (
                  <span key={skill} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Состав бригады</p>
              <div className="space-y-1 text-sm">
                <p className="text-gray-700">Прораб: 1 чел.</p>
                <p className="text-gray-700">Всего участников: {Array.isArray(memberIds) ? memberIds.length + 1 : 1}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        <p className="text-sm font-medium text-gray-700 mb-3">Статус объекта</p>
        <div className="flex gap-4">
          {['создан', 'в работе', 'завершен'].map((status) => (
            <StatusButton
              key={status}
              status={status}
              isActive={project.status === status}
              onClick={() => {}}
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
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </button>
  );
}
