'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { statusColors, typeIcons } from '@/shared/data/projects';
import type { Project as ProjectType, Brigade } from '@/shared/types/project';

const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

export function ProjectsCalendar() {
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [brigades, setBrigades] = useState<Brigade[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('все');
  const [filterType, setFilterType] = useState<string>('все');

  useEffect(() => {
    async function loadData() {
      try {
        const [projectsRes, brigadesRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/brigades'),
        ]);

        if (projectsRes.ok) {
          const projectsData = await projectsRes.json();
          setProjects(projectsData.data || []);
        }

        if (brigadesRes.ok) {
          const brigadesData = await brigadesRes.json();
          setBrigades(brigadesData.data || []);
        }
      } catch (error) {
        console.error('Ошибка загрузки данных для календаря:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay() - 1;
  const adjustedFirstDay = firstDayOfMonth === -1 ? 6 : firstDayOfMonth;

  const days = useMemo(() => {
    const daysArray: (Date | null)[] = [];
    for (let i = 0; i < adjustedFirstDay; i++) {
      daysArray.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      daysArray.push(new Date(year, month, day));
    }
    return daysArray;
  }, [year, month, daysInMonth, adjustedFirstDay]);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      if (filterStatus !== 'все' && p.status !== filterStatus) return false;
      if (filterType !== 'все' && p.type !== filterType) return false;
      return true;
    });
  }, [projects, filterStatus, filterType]);

  const formatDate = (date: Date | string) => {
    const d = date instanceof Date ? date : new Date(date as string);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const projectsByDate = useMemo(() => {
    const map = new Map<string, ProjectType[]>();
    for (const project of filteredProjects) {
      const projectDate = formatDate(project.deadline);
      if (!map.has(projectDate)) {
        map.set(projectDate, []);
      }
      map.get(projectDate)!.push(project);
    }
    return map;
  }, [filteredProjects]);

  const brigadesByDate = useMemo(() => {
    const map = new Map<string, number[]>();
    for (const project of filteredProjects) {
      if (project.brigadeId) {
        const projectDate = project.deadline;
        if (!map.has(projectDate)) {
          map.set(projectDate, []);
        }
        if (!map.get(projectDate)!.includes(project.brigadeId!)) {
          map.get(projectDate)!.push(project.brigadeId!);
        }
      }
    }
    return map;
  }, [filteredProjects]);

  const getProjectsForDay = (date: Date) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return projectsByDate.get(dateStr) || [];
  };

  const getBrigadesForDay = (date: Date) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return brigadesByDate.get(dateStr) || [];
  };

  const getBrigadeById = (id: number) => brigades.find(b => b.id === id);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(prev =>
      prev && prev.getDate() === date.getDate() && prev.getMonth() === date.getMonth() && prev.getFullYear() === date.getFullYear()
        ? null
        : date
    );
  };

  const types = [
    { value: 'все', label: 'Все' },
    { value: 'дом', label: 'Дом' },
    { value: 'баня', label: 'Баня' },
    { value: 'туалет', label: 'Туалет' },
    { value: 'хозблок', label: 'Хозблок' },
    { value: 'веранда', label: 'Веранда' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#1976d2]"></div>
          <p className="mt-4 text-gray-600">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Календарь объектов</h1>
        <span className="text-sm text-gray-500">Всего проектов: {projects.length}</span>
      </div>

      {/* Фильтры */}
      <div className="flex gap-4">
        <div className="flex gap-2">
          <span className="text-sm text-gray-600 self-center">Статус:</span>
          {['все', 'создан', 'в работе', 'завершен'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterStatus === status
                  ? 'bg-[#1976d2] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status === 'все' ? 'Все' : status === 'в работе' ? 'В работе' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <span className="text-sm text-gray-600 self-center">Тип:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 border-0 focus:ring-2 focus:ring-[#1976d2]"
          >
            {types.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 md:p-6">
        {/* Навигация */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">{months[month]} {year}</p>
          </div>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Дни недели */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {daysOfWeek.map((day, index) => (
            <div key={index} className="text-center py-2 text-sm font-semibold text-gray-600">
              {day}
            </div>
          ))}
        </div>

        {/* Сетка дней */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((date, index) => {
            if (!date) {
              return <div key={index} className="min-h-[120px]" />;
            }
            const today = isToday(date);
            const selected = isSelected(date);
            const dayProjects = getProjectsForDay(date);
            const dayBrigades = getBrigadesForDay(date);

            return (
              <div
                key={index}
                onClick={() => handleDateClick(date)}
                className={`min-h-[120px] rounded-lg border-2 flex flex-col items-center justify-start pt-2 px-2 cursor-pointer transition-all overflow-hidden ${
                  today
                    ? 'border-[#1976d2] bg-[#1976d2]/10'
                    : selected
                    ? 'border-[#1976d2] bg-[#1976d2]/5'
                    : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                }`}
              >
                {/* Номер дня */}
                <span
                  className={`text-sm font-medium mb-0.5 ${
                    today ? 'text-[#1976d2] font-bold' : selected ? 'text-[#1976d2]' : 'text-gray-700'
                  }`}
                >
                  {date.getDate()}
                </span>

                {/* Метки проектов */}
                <div className="flex flex-col gap-0.5 w-full mb-1">
                  {dayProjects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className="group flex items-center gap-1 px-1 py-0.5 rounded text-xs hover:bg-gray-100 transition-colors truncate w-full"
                      title={`${typeIcons[project.type] || '🏗'} ${project.name} (${project.status})`}
                    >
                      <span className="flex-shrink-0 text-[10px]">{typeIcons[project.type] || '🏗'}</span>
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusColors[project.status]}`} />
                      <span className="text-gray-600 truncate group-hover:text-gray-900">
                        {project.name.length > 8 ? project.name.slice(0, 8) + '…' : project.name}
                      </span>
                    </Link>
                  ))}
                </div>

                {/* Метки бригад */}
                {dayBrigades.length > 0 && (
                  <div className="flex flex-wrap gap-0.5 justify-center w-full">
                    {dayBrigades.map((brigadeId) => {
                      const brigade = getBrigadeById(brigadeId);
                      if (!brigade) return null;
                      return (
                        <div
                          key={brigadeId}
                          className="w-5 h-5 rounded-full bg-purple-200 text-purple-800 text-[10px] font-bold flex items-center justify-center"
                          title={brigade.name}
                        >
                          {brigade.name.charAt(brigade.name.length - 1)}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Легенда */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Легенда</h3>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-gray-600">В работе</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-gray-600">Завершен</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-500" />
              <span className="text-gray-600">Создан</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-purple-200 text-purple-800 text-xs font-bold flex items-center justify-center" style={{width: '12px', height: '12px'}}>Б</div>
              <span className="text-gray-600">Бригада</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-[#1976d2]/30 border border-[#1976d2]" />
              <span className="text-gray-600">Сегодня</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
