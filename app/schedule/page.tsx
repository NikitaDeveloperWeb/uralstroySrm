'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Save, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface Employee {
  id: number;
  fullName: string;
  workplace: 'цех' | 'монтаж';
}

interface ShiftCell {
  employeeId: number;
  date: string;
  value: number | 'В';
}

const employees: Employee[] = [
  { id: 1, fullName: 'Иванов Иван Иванович', workplace: 'цех' },
  { id: 2, fullName: 'Петров Петр Сергеевич', workplace: 'монтаж' },
  { id: 3, fullName: 'Сидоров Алексей Дмитриевич', workplace: 'цех' },
  { id: 4, fullName: 'Козлов Дмитрий Николаевич', workplace: 'монтаж' },
  { id: 5, fullName: 'Морозова Анна Владимировна', workplace: 'цех' },
  { id: 6, fullName: 'Новиков Сергей Андреевич', workplace: 'монтаж' },
  { id: 7, fullName: 'Волкова Елена Игоревна', workplace: 'цех' },
  { id: 8, fullName: 'Соколов Максим Павлович', workplace: 'монтаж' },
  { id: 9, fullName: 'Кузнецов Дмитрий Александрович', workplace: 'цех' },
  { id: 10, fullName: 'Попова Ирина Вячеславовна', workplace: 'монтаж' },
  { id: 11, fullName: 'Васильев Андрей Николаевич', workplace: 'цех' },
  { id: 12, fullName: 'Смиркина Ольга Петровна', workplace: 'монтаж' },
  { id: 13, fullName: 'Федоров Михаил Сергеевич', workplace: 'цех' },
  { id: 14, fullName: 'Михайлова Татьяна Ивановна', workplace: 'монтаж' },
  { id: 15, fullName: 'Егоров Алексей Михайлович', workplace: 'цех' },
  { id: 16, fullName: 'Николаева Елена Дмитриевна', workplace: 'монтаж' },
  { id: 17, fullName: 'Степанов Сергей Иванович', workplace: 'цех' },
  { id: 18, fullName: 'Андреева Наталья Александровна', workplace: 'монтаж' },
  { id: 19, fullName: 'Макаров Дмитрий Сергеевич', workplace: 'цех' },
  { id: 20, fullName: 'Захарова Ирина Константиновна', workplace: 'монтаж' },
  { id: 21, fullName: 'Белов Олег Владимирович', workplace: 'цех' },
  { id: 22, fullName: 'Комарова Светлана Юрьевна', workplace: 'монтаж' },
  { id: 23, fullName: 'Орлов Максим Андреевич', workplace: 'цех' },
  { id: 24, fullName: 'Павлова Елена Вадимовна', workplace: 'монтаж' },
  { id: 25, fullName: 'Козин Андрей Петрович', workplace: 'цех' },
  { id: 26, fullName: 'Лебедева Ольга Сергеевна', workplace: 'монтаж' },
  { id: 27, fullName: 'Фомин Виталий Николаевич', workplace: 'цех' },
  { id: 28, fullName: 'Сорокина Мария Дмитриевна', workplace: 'монтаж' },
  { id: 29, fullName: 'Тихонов Роман Александрович', workplace: 'цех' },
  { id: 30, fullName: 'Григорьева Анна Петровна', workplace: 'монтаж' },
];

const workplaceColors: Record<string, string> = {
  цех: 'bg-blue-100 text-blue-800',
  монтаж: 'bg-purple-100 text-purple-800',
};

export default function SchedulePage() {
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [cells, setCells] = useState<ShiftCell[]>([
    { employeeId: 1, date: getDateStr(now.getFullYear(), now.getMonth(), now.getDate()), value: 8 },
    { employeeId: 2, date: getDateStr(now.getFullYear(), now.getMonth(), now.getDate()), value: 8 },
    { employeeId: 4, date: getDateStr(now.getFullYear(), now.getMonth(), now.getDate()), value: 7 },
  ]);
  const [editingCell, setEditingCell] = useState<{ employeeId: number; date: string } | null>(null);
  const [editValue, setEditValue] = useState<number | 'В'>(8);

  function getDateStr(year: number, month: number, day: number): string {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const monthName = new Date(currentYear, currentMonth).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
  const currentDay = now.getDate();
  const isCurrentMonthView = currentMonth === now.getMonth() && currentYear === now.getFullYear();

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const handleCellClick = (employeeId: number, date: string) => {
    const existing = cells.find(c => c.employeeId === employeeId && c.date === date);
    setEditingCell({ employeeId, date });
    setEditValue(existing?.value ?? 8);
  };

  const handleCellSave = () => {
    if (editingCell) {
      const { employeeId, date } = editingCell;
      setCells(prev => {
        const filtered = prev.filter(c => !(c.employeeId === employeeId && c.date === date));
        return [...filtered, { employeeId, date, value: editValue }];
      });
    }
    setEditingCell(null);
  };

  const handleCellCancel = () => {
    setEditingCell(null);
  };

  const handleClearDay = (employeeId: number, date: string) => {
    setCells(prev => prev.filter(c => !(c.employeeId === employeeId && c.date === date)));
    setEditingCell(null);
  };

  const getCellValue = (employeeId: number, date: string) => {
    return cells.find(c => c.employeeId === employeeId && c.date === date)?.value;
  };

  const getTotalHours = (employeeId: number) => {
    return cells
      .filter(c => c.employeeId === employeeId && typeof c.value === 'number')
      .reduce((sum, c) => sum + (c.value as number), 0);
  };

  const getAbsencesCount = (employeeId: number) => {
    return cells.filter(c => c.employeeId === employeeId && c.value === 'В').length;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">График работы</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold text-gray-900 capitalize">{monthName}</h2>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-gray-50 border border-gray-200 px-3 py-3 text-left text-sm font-semibold text-gray-700 min-w-[200px]">
                  Сотрудник
                </th>
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                  <th key={day} className={`border border-gray-200 px-2 py-3 text-center text-sm font-semibold min-w-[40px] ${
                    isCurrentMonthView && day === currentDay
                      ? 'bg-[#1976d2] text-white'
                      : 'text-gray-700'
                  }`}>
                    {day}
                  </th>
                ))}
                <th className="sticky right-0 z-10 bg-gray-50 border border-gray-200 px-3 py-3 text-center text-sm font-semibold text-gray-700 min-w-[80px]">
                  Итого
                </th>
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp.id}>
                  <td className="sticky left-0 z-10 bg-white border border-gray-200 px-3 py-2">
                    <div className="min-w-[180px]">
                      <p className="font-medium text-gray-900 text-sm truncate">{emp.fullName}</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${workplaceColors[emp.workplace]}`}>
                        {emp.workplace}
                      </span>
                    </div>
                  </td>
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                    const dateStr = getDateStr(currentYear, currentMonth, day);
                    const cellValue = getCellValue(emp.id, dateStr);
                    const isEditing = editingCell?.employeeId === emp.id && editingCell?.date === dateStr;
                    const displayValue = cellValue ?? '';
                    const isAbsent = cellValue === 'В';
                    const hasHours = typeof cellValue === 'number' && cellValue > 0;
                    const hasValue = hasHours || isAbsent;
                    const isCurrentDay = isCurrentMonthView && day === currentDay;

                    return (
                      <td key={day} className={`border border-gray-200 px-1 py-1 text-center relative ${
                        isCurrentDay ? 'bg-blue-50' : ''
                      }`}>
                        {isEditing ? (
                          <div className="flex flex-col items-center gap-1 p-1">
                            <div className="flex gap-1">
                              <input
                                type="number"
                                min="1"
                                max="24"
                                value={editValue === 'В' ? '' : editValue}
                                onChange={e => setEditValue(e.target.value ? Number(e.target.value) : 0)}
                                className="w-14 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#1976d2] text-center"
                                placeholder="В"
                                autoFocus
                              />
                              <button
                                onClick={() => setEditValue('В')}
                                className={`px-2 py-1 text-xs font-bold rounded transition-colors ${
                                  editValue === 'В'
                                    ? 'bg-red-500 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                В
                              </button>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={handleCellSave}
                                className="text-green-600 hover:text-green-800 p-0.5"
                              >
                                <Save className="w-3 h-3" />
                              </button>
                              <button
                                onClick={handleCellCancel}
                                className="text-gray-500 hover:text-gray-700 p-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleCellClick(emp.id, dateStr)}
                            className={`w-full py-1 px-1 rounded text-xs font-semibold transition-colors ${
                              isAbsent
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : hasHours
                                ? 'bg-green-50 text-green-700 hover:bg-green-100'
                                : 'hover:bg-gray-50 text-gray-400'
                            }`}
                          >
                            {displayValue}
                          </button>
                        )}
                      </td>
                    );
                  })}
                  <td className="sticky right-0 z-10 bg-white border border-gray-200 px-3 py-2 text-center">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-[#1976d2]">{getTotalHours(emp.id)}</p>
                      {getAbsencesCount(emp.id) > 0 && (
                        <p className="text-xs text-red-600">{getAbsencesCount(emp.id)} В</p>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
