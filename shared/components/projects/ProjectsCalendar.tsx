'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Plus, X, Users, CalendarDays, Briefcase } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
const statusColors: Record<string, string> = {
  создан: 'bg-gray-400',
  active: 'bg-green-500',
  'в работе': 'bg-green-500',
  'на паузе': 'bg-yellow-500',
  завершен: 'bg-blue-500',
};

const typeIcons: Record<string, string> = {
  дом: '🏠',
  баня: '🧖',
  туалет: '🚽',
  хозблок: '🏗',
  веранда: '🏡',
};
import type { Project as ProjectType, Brigade } from '@/shared/types/project';
import { useAlert } from '@/shared/hooks/useAlert';

interface ScheduleEntry {
  id: number;
  date: string;
  employeeId: number;
  employee: { fullName: string };
  projectId: number | null;
  project: { name: string } | null;
  brigadeId: number | null;
  brigade: { name: string } | null;
  workType: string | null;
  hours: number | null;
  status: string;
  comment: string | null;
}

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

  // Schedules state
  const [schedules, setSchedules] = useState<ScheduleEntry[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    date: '',
    employeeId: '',
    projectId: '',
    brigadeId: '',
    workType: '',
    hours: '',
    comment: '',
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [projectsRes, brigadesRes, schedulesRes, employeesRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/brigades'),
          fetch('/api/schedules'),
          fetch('/api/employees'),
        ]);

        if (projectsRes.ok) {
          const projectsData = await projectsRes.json();
          setProjects(projectsData.data || []);
        }

        if (brigadesRes.ok) {
          const brigadesData = await brigadesRes.json();
          setBrigades(brigadesData.data || []);
        }

        if (schedulesRes.ok) {
          const schedulesData = await schedulesRes.json();
          setSchedules(schedulesData.data || []);
        }

        if (employeesRes.ok) {
          const employeesData = await employeesRes.json();
          setEmployees(employeesData.data || []);
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

  const getSchedulesForDate = (date: Date) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return schedules.filter(s => s.date.startsWith(dateStr));
  };

  const openScheduleModal = (date?: Date) => {
    setScheduleForm({
      date: date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      employeeId: '',
      projectId: '',
      brigadeId: '',
      workType: '',
      hours: '',
      comment: '',
    });
    setIsScheduleModalOpen(true);
  };

  const handleSaveSchedule = async () => {
    if (!scheduleForm.date || !scheduleForm.employeeId) return;

    try {
      const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: scheduleForm.date,
          employeeId: Number(scheduleForm.employeeId),
          projectId: scheduleForm.projectId ? Number(scheduleForm.projectId) : null,
          brigadeId: scheduleForm.brigadeId ? Number(scheduleForm.brigadeId) : null,
          workType: scheduleForm.workType || null,
          hours: scheduleForm.hours ? Number(scheduleForm.hours) : null,
          comment: scheduleForm.comment || null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSchedules(prev => [...prev, data.data]);
        setIsScheduleModalOpen(false);
      }
    } catch (error) {
      console.error('Ошибка сохранения смены:', error);
      const { alert } = useAlert();
      alert('Ошибка сохранения смены');
    }
  };

  const handleDeleteSchedule = async (id: number) => {
    const { confirm } = useAlert();
    if (!(await confirm('Удалить эту смену?'))) return;
    try {
      const res = await fetch(`/api/schedules/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSchedules(prev => prev.filter(s => s.id !== id));
      }
    } catch (error) {
      console.error('Ошибка удаления смены:', error);
    }
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
          <p className="mt-4 text-gray-600 dark:text-slate-300">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Календарь объектов</h1>
        <span className="text-sm text-gray-500 dark:text-slate-400">Всего проектов: {projects.length}</span>
      </div>

      {/* Фильтры */}
      <div className="flex gap-4">
        <div className="flex gap-2">
          <span className="text-sm text-gray-600 dark:text-slate-300 self-center">Статус:</span>
          {['все', 'создан', 'в работе', 'завершен'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterStatus === status
                  ? 'bg-[#1976d2] text-white'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 dark:bg-slate-700'
              }`}
            >
              {status === 'все' ? 'Все' : status === 'в работе' ? 'В работе' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <span className="text-sm text-gray-600 dark:text-slate-300 self-center">Тип:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 border-0 focus:ring-2 focus:ring-[#1976d2]"
          >
            {types.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-slate-700 p-4 md:p-6">
        {/* Кнопка добавить смену */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => openScheduleModal()}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Добавить смену
          </button>
        </div>
        {/* Навигация */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-600 dark:bg-slate-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900 dark:text-white">{months[month]} {year}</p>
          </div>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-600 dark:bg-slate-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Дни недели */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {daysOfWeek.map((day, index) => (
            <div key={index} className="text-center py-2 text-sm font-semibold text-gray-600 dark:text-slate-300">
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
            const dateStr = date instanceof Date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` : date;
            const daySchedules = schedules.filter(s => s.date === dateStr);

            return (
              <div
                key={index}
                className={`min-h-[120px] rounded-lg border-2 flex flex-col items-center justify-start pt-2 px-2 transition-all overflow-hidden ${
                  today
                    ? 'border-[#1976d2] bg-[#1976d2]/10'
                    : selected
                    ? 'border-[#1976d2] bg-[#1976d2]/5'
                    : 'border-gray-100 dark:border-slate-700 hover:border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-700'
                }`}
              >
                <div
                  className="w-full h-full flex flex-col"
                  onClick={() => handleDateClick(date)}
                >
                {/* Номер дня и кнопка добавить смену */}
                <div className="flex items-center justify-between w-full px-1 mb-0.5">
                  <span
                    className={`text-sm font-medium ${
                      today ? 'text-[#1976d2] font-bold' : selected ? 'text-[#1976d2]' : 'text-gray-700 dark:text-slate-300'
                    }`}
                  >
                    {date.getDate()}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openScheduleModal(date);
                    }}
                    className="text-gray-400 dark:text-slate-500 hover:text-emerald-600 transition-colors"
                    title="Добавить смену"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Метки проектов */}
                <div className="flex flex-col gap-0.5 w-full mb-1">
                  {dayProjects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className="group flex items-center gap-1 px-1 py-0.5 rounded text-xs hover:bg-gray-100 dark:hover:bg-slate-600 dark:bg-slate-700 transition-colors truncate w-full"
                      title={`${typeIcons[project.type] || '🏗'} ${project.name} (${project.status})`}
                    >
                      <span className="flex-shrink-0 text-[10px]">{typeIcons[project.type] || '🏗'}</span>
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusColors[project.status]}`} />
                      <span className="text-gray-600 dark:text-slate-300 truncate group-hover:text-gray-900 dark:text-white">
                        {project.name.length > 8 ? project.name.slice(0, 8) + '…' : project.name}
                      </span>
                    </Link>
                  ))}
                </div>

                {/* Метки смен */}
                {daySchedules.length > 0 && (
                  <div className="flex flex-col gap-0.5 w-full mt-1 pt-1 border-t border-gray-100 dark:border-slate-700">
                    {daySchedules.slice(0, 2).map((schedule) => (
                      <div
                        key={schedule.id}
                        className="flex items-center gap-1 px-1 py-0.5 rounded text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors truncate"
                        title={`${schedule.employee.fullName}${schedule.workType ? ' — ' + schedule.workType : ''}${schedule.comment ? ': ' + schedule.comment : ''}`}
                      >
                        <CalendarDays className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate flex-1">{schedule.employee.fullName.split(' ')[0]} {schedule.employee.fullName.split(' ')[1]?.[0] || ''}.</span>
                      </div>
                    ))}
                    {daySchedules.length > 2 && (
                      <div className="text-[10px] text-gray-500 dark:text-slate-400 text-center font-medium">
                        +{daySchedules.length - 2} смен
                      </div>
                    )}
                  </div>
                )}

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
              </div>
            );
          })}
        </div>

        {/* Легенда */}
        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">Легенда</h3>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-gray-600 dark:text-slate-300">В работе</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-gray-600 dark:text-slate-300">Завершен</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-50 dark:bg-slate-7000" />
              <span className="text-gray-600 dark:text-slate-300">Создан</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-purple-200 text-purple-800 text-xs font-bold flex items-center justify-center" style={{width: '12px', height: '12px'}}>Б</div>
              <span className="text-gray-600 dark:text-slate-300">Бригада</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-[#1976d2]/30 border border-[#1976d2]" />
              <span className="text-gray-600 dark:text-slate-300">Сегодня</span>
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно добавления смены */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Добавить смену"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Дата</label>
            <input
              type="date"
              value={scheduleForm.date}
              onChange={e => setScheduleForm(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Сотрудник *</label>
            <select
              value={scheduleForm.employeeId}
              onChange={e => setScheduleForm(prev => ({ ...prev, employeeId: e.target.value, brigadeId: '' }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Выберите сотрудника</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.fullName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Бригада</label>
            <select
              value={scheduleForm.brigadeId}
              onChange={e => setScheduleForm(prev => ({ ...prev, brigadeId: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Не выбрана</option>
              {brigades.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Проект</label>
            <select
              value={scheduleForm.projectId}
              onChange={e => setScheduleForm(prev => ({ ...prev, projectId: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Не выбран</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Тип работы</label>
              <input
                type="text"
                value={scheduleForm.workType}
                onChange={e => setScheduleForm(prev => ({ ...prev, workType: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Например: Сварка"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Часы</label>
              <input
                type="number"
                value={scheduleForm.hours}
                onChange={e => setScheduleForm(prev => ({ ...prev, hours: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="8"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Комментарий</label>
            <textarea
              value={scheduleForm.comment}
              onChange={e => setScheduleForm(prev => ({ ...prev, comment: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              rows={2}
            />
          </div>
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleSaveSchedule}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
            >
              Сохранить
            </button>
            <button
              onClick={() => setIsScheduleModalOpen(false)}
              className="flex-1 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 dark:bg-slate-600 text-gray-700 dark:text-slate-300 py-3 px-4 rounded-lg font-semibold transition-colors"
            >
              Отмена
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
