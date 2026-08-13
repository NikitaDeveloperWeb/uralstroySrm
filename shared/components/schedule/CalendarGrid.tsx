'use client';

import { useState, useMemo } from 'react';

interface Employee {
  id: number;
  fullName: string;
  workplace: 'цех' | 'монтаж';
}

interface Shift {
  id: number;
  employeeId: number;
  date: string;
  hours: number;
}

interface CalendarGridProps {
  employees: Employee[];
  shifts: Shift[];
  onCellClick: (employeeId: number, date: string) => void;
}

const workplaceColors: Record<string, string> = {
  цех: 'bg-blue-100 text-blue-800',
  монтаж: 'bg-purple-100 text-purple-800',
};

const fullNameShort = (name: string) => {
  const parts = name.split(' ');
  return parts.length >= 2 ? `${parts[0]} ${parts[1]?.[0]}.${parts[2]?.[0] || ''}` : parts[0];
};

export function CalendarGrid({ employees, shifts, onCellClick }: CalendarGridProps) {
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());

  const year = currentYear;
  const month = currentMonth;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = getMonthName(month);

  const prevMonth = () => {
    if (month === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (month === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const goToToday = () => {
    setCurrentMonth(now.getMonth());
    setCurrentYear(now.getFullYear());
  };

  const getShiftForEmployee = (employeeId: number, day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return shifts.find(s => s.employeeId === employeeId && s.date === dateStr);
  };

  const isToday = (day: number) => {
    return now.getDate() === day && now.getMonth() === month && now.getFullYear() === year;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h3 className="text-lg font-bold text-gray-900 min-w-[180px] text-center">
              {monthName} {year}
            </h3>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <button
            onClick={goToToday}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Сегодня
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          <div className="grid" style={{ gridTemplateColumns: `180px repeat(${daysInMonth}, minmax(48px, 1fr))` }}>
            <div className="p-3 border-b border-r border-gray-200 bg-gray-50" />

            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
              <div
                key={day}
                className={`p-2 text-center border-b border-gray-200 ${isToday(day) ? 'bg-blue-50' : 'bg-gray-50'}`}
              >
                <span className={`text-sm font-semibold ${isToday(day) ? 'text-blue-600' : 'text-gray-700'}`}>
                  {day}
                </span>
              </div>
            ))}

            {employees.map(emp => (
              <>
                <div key={emp.id} className="p-3 border-b border-r border-gray-200 flex items-center gap-2 bg-white hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 bg-[#1976d2] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">
                      {emp.fullName.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{fullNameShort(emp.fullName)}</p>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${workplaceColors[emp.workplace]}`}>
                      {emp.workplace}
                    </span>
                  </div>
                </div>

                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                  const shift = getShiftForEmployee(emp.id, day);
                  const today = isToday(day);
                  const dateObj = new Date(year, month, day);
                  const dayOfWeek = dateObj.getDay();
                  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                  let cellBg = today ? 'bg-blue-50/50' : 'bg-white';
                  let content: React.ReactNode = null;

                  if (shift) {
                    if (shift.hours > 0) {
                      cellBg = 'bg-blue-100';
                      content = (
                        <span className="text-xs font-bold text-blue-700">{shift.hours}</span>
                      );
                    }
                  } else if (isWeekend) {
                    content = (
                      <span className="text-xs font-bold text-green-600">в</span>
                    );
                    if (!today) {
                      cellBg = 'bg-green-50';
                    }
                  }

                  return (
                    <div
                      key={day}
                      onClick={() => onCellClick(emp.id, `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`)}
                      className={`p-1 text-center border-b border-r border-gray-100 cursor-pointer hover:bg-blue-100 transition-colors ${cellBg}`}
                    >
                      {content}
                    </div>
                  );
                })}
              </>
            ))}
          </div>
        </div>
      </div>

      <div className="p-3 border-t border-gray-200 bg-gray-50 flex items-center gap-6 text-xs text-gray-600">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-blue-100" />
          <span>Отработанное время</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-green-500 text-white flex items-center justify-center text-[9px] font-bold">в</div>
          <span>Выходной</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-blue-50 border border-blue-300" />
          <span>Сегодня</span>
        </div>
      </div>
    </div>
  );
}

function getMonthName(month: number) {
  const names = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
  ];
  return names[month];
}
