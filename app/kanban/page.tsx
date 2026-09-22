'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useProjectStore } from '@/shared/stores/projectStore';
import type { Project } from '@/shared/types/project';

const COLUMNS: { status: string; title: string; color: string; bg: string }[] = [
  { status: 'создан', title: 'Новые', color: 'border-t-blue-500', bg: 'bg-blue-50/50 dark:bg-blue-950/20' },
  { status: 'в работе', title: 'В работе', color: 'border-t-yellow-500', bg: 'bg-yellow-50/50 dark:bg-yellow-950/20' },
  { status: 'на паузе', title: 'На паузе', color: 'border-t-orange-500', bg: 'bg-orange-50/50 dark:bg-orange-950/20' },
  { status: 'завершен', title: 'Завершено', color: 'border-t-green-500', bg: 'bg-green-50/50 dark:bg-green-950/20' },
];

const typeIcons: Record<string, string> = {
  дом: '🏠',
  баня: '🧖',
  туалет: '🚽',
  хозблок: '🏗',
  веранда: '🏡',
};

export default function KanbanPage() {
  const router = useRouter();
  const projects = useProjectStore(state => state.projects);
  const fetchProjects = useProjectStore(state => state.fetchProjects);
  const updateProject = useProjectStore(state => state.updateProject);

  const draggedIdRef = useRef<number | null>(null);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const grouped = COLUMNS.map(col => ({
    ...col,
    items: projects.filter(p => p.status === col.status),
  }));

  const handleDragStart = useCallback((id: number) => {
    draggedIdRef.current = id;
  }, []);

  const handleDrop = useCallback(async (newStatus: string) => {
    const id = draggedIdRef.current;
    if (!id) return;
    try {
      await updateProject(id, { status: newStatus });
    } catch (err) {
      console.error('Drop failed:', err);
    }
    draggedIdRef.current = null;
  }, [updateProject]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Объекты</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {grouped.map(col => (
          <div
            key={col.status}
            className={`flex-1 min-w-[280px] bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col`}
          >
            <div className={`p-4 border-t-4 ${col.color} rounded-t-xl`}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">{col.title}</h3>
                <span className="text-xs font-medium text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                  {col.items.length}
                </span>
              </div>
            </div>
            <div
              className={`flex-1 p-3 space-y-2 overflow-y-auto ${col.bg} rounded-b-xl min-h-[400px]`}
              onDragOver={(e) => { e.preventDefault(); }}
              onDrop={() => handleDrop(col.status)}
            >
              {col.items.length === 0 ? (
                <p className="text-center text-sm text-gray-400 dark:text-slate-500 py-6">Перетащите объект сюда</p>
              ) : (
                col.items.map((project) => (
                  <div
                    key={project.id}
                    draggable
                    onDragStart={() => handleDragStart(project.id)}
                    onClick={() => router.push(`/projects/${project.id}`)}
                    className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing transition-shadow group"
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <div className="text-xl">{typeIcons[project.type] || '🏗'}</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{project.name}</h4>
                        <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{project.address}</p>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400">
                      <span>{project.area} м²</span>
                      <span>{project.cost.toLocaleString()} ₽</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
