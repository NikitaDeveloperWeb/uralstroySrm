'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Save, X } from 'lucide-react';

interface Employee {
  id: number;
  fullName: string;
  workplace: string;
}

interface ScheduleEntry {
  id: number;
  date: string;
  employeeId: number;
  hours?: number;
  status?: string;
}

export default function SchedulePage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [schedules, setSchedules] = useState<ScheduleEntry[]>([]);
  const [editing, setEditing] = useState<{ empId: number; date: string } | null>(null);
  const [editVal, setEditVal] = useState<number | 'В'>(8);
  const [loading, setLoading] = useState(true);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/employees').then(r => r.json()),
      fetch(`/api/schedules?year=${year}&month=${month}`).then(r => r.json()),
    ]).then(([empRes, schedRes]) => {
      setEmployees(empRes.data || []);
      const normalizedSchedules = (schedRes.data || []).map((s: ScheduleEntry) => {
        const d = s.date;
        const normalized = typeof d === 'string' ? d.split('T')[0] : d;
        return { ...s, date: normalized };
      }).filter((s: ScheduleEntry) => {
        const expectedPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
        return s.date.startsWith(expectedPrefix);
      });
      console.log(`📅 Смены за ${monthName}:`, normalizedSchedules.length, JSON.stringify(normalizedSchedules.slice(0, 2)));
      console.log(`  Фильтр: ${year}-${String(month + 1).padStart(2, '0')}`);
      setSchedules(normalizedSchedules);
      setLoading(false);
    });
  }, [year, month]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = new Date(year, month).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
  const today = now.getDate();
  const isCurrent = month === now.getMonth() && year === now.getFullYear();
  const dateStr = (d: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const prev = () => month === 0 ? (setMonth(11), setYear(y => y - 1)) : setMonth(m => m - 1);
  const next = () => month === 11 ? (setMonth(0), setYear(y => y + 1)) : setMonth(m => m + 1);

  const getHours = (empId: number, d: string) => {
    const s = schedules.find(x => x.employeeId === empId && x.date === d);
    if (!s) return null;
    return s.status === 'Отсутствует' ? 'В' : typeof s.hours === 'number' ? s.hours : null;
  };

  const isWeekend = (d: number) => {
    const dateObj = new Date(year, month, d);
    return dateObj.getDay() === 0 || dateObj.getDay() === 6;
  };

  const totalHours = (empId: number) => {
    return schedules
      .filter(s => s.employeeId === empId && s.hours && s.status !== 'Отсутствует')
      .reduce((a, s) => a + s.hours!, 0);
  };
  const absences = (empId: number) => schedules.filter(s => s.employeeId === empId && s.status === 'Отсутствует').length;

  const save = async () => {
    if (!editing) return;
    const existing = schedules.find(s => s.employeeId === editing.empId && s.date === editing.date);
    
    try {
      const body: any = {
        date: editing.date,
        employeeId: editing.empId,
      };
      
      if (editVal === 'В') {
        body.status = 'Отсутствует';
      } else {
        body.hours = editVal;
        body.status = 'план';
      }
      
      if (existing) {
        await fetch(`/api/schedules/${existing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } else {
        await fetch('/api/schedules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }
      
      const r = await fetch(`/api/schedules?year=${year}&month=${month}`);
      const d = await r.json();
      const normalizedSchedules = (d.data || []).map((s: ScheduleEntry) => {
        const d = s.date;
        const normalized = typeof d === 'string' ? d.split('T')[0] : d;
        return { ...s, date: normalized };
      });
      setSchedules(normalizedSchedules);
    } catch (e) {
      console.error(e);
    }
    setEditing(null);
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1976d2]"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white dark:text-white dark:text-white">График работы</h1>
        <span className="text-sm text-gray-500 dark:text-slate-400 dark:text-slate-400 dark:text-slate-400">Сотрудников: {employees.length}</span>
      </div>

      <div className="bg-white dark:bg-slate-800 dark:bg-slate-800 dark:bg-slate-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={prev} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600 dark:bg-slate-700 dark:hover:bg-slate-700 rounded-lg"><ChevronLeft className="w-5 h-5" /></button>
          <h2 className="text-xl font-bold capitalize dark:text-white">{monthName}</h2>
          <button onClick={next} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600 dark:bg-slate-700 dark:hover:bg-slate-700 rounded-lg"><ChevronRight className="w-5 h-5" /></button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-gray-50 dark:bg-slate-700 dark:bg-slate-700 dark:bg-slate-750 border px-3 py-3 text-left text-sm font-semibold dark:text-slate-300 min-w-[200px]">Сотрудник</th>
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
                  const isWknd = isWeekend(d);
                  return (
                    <th
                      key={d}
                      onMouseEnter={() => setHoveredCol(d)}
                      onMouseLeave={() => setHoveredCol(null)}
                      className={`border px-2 py-3 text-center text-sm font-semibold min-w-[40px] ${isCurrent && d === today ? 'bg-[#1976d2] text-white' : isWknd ? 'bg-red-100 text-red-700' : 'bg-blue-50 text-blue-700'} ${hoveredCol === d ? 'bg-blue-100' : ''}`}
                    >
                      {d}
                    </th>
                  );
                })}
                <th className="sticky right-0 z-10 bg-gray-50 dark:bg-slate-700 dark:bg-slate-700 dark:bg-slate-750 border px-3 py-3 text-center text-sm font-semibold dark:text-slate-300 min-w-[80px]">Итого</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp, rowIdx) => (
                <tr key={emp.id} onMouseEnter={() => setHoveredRow(rowIdx)} onMouseLeave={() => setHoveredRow(null)}>
                  <td className={`sticky left-0 z-10 bg-white dark:bg-slate-800 dark:bg-slate-800 dark:bg-slate-800 border px-3 py-2 ${hoveredRow === rowIdx ? 'bg-blue-100 dark:bg-slate-700' : ''}`}>
                    <p className="text-sm font-medium truncate dark:text-white">{emp.fullName}</p>
                  </td>
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
                    const ds = dateStr(d);
                    const val = getHours(emp.id, ds);
                    const isEdit = editing?.empId === emp.id && editing?.date === ds;
                    const weekend = isWeekend(d);
                    const isHovered = hoveredRow === rowIdx || hoveredCol === d;

                    return (
                      <td
                        key={d}
                        onMouseEnter={() => { setHoveredRow(rowIdx); setHoveredCol(d); }}
                        onMouseLeave={() => { setHoveredRow(null); setHoveredCol(null); }}
                        className={`border px-1 py-1 text-center ${isCurrent && d === today ? 'bg-blue-50' : ''} ${isHovered ? 'bg-blue-100' : ''}`}
                      >
                        {isEdit ? (
                          <div className="flex flex-col gap-1 p-1">
                            <div className="flex gap-1">
                              <input
                                type="number"
                                min="1"
                                max="24"
                                value={editVal === 'В' ? '' : editVal}
                                onChange={e => setEditVal(e.target.value ? Number(e.target.value) : 0)}
                                className="w-14 px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 dark:border-slate-600 dark:border-slate-600 rounded text-center dark:bg-slate-700 dark:text-white"
                                autoFocus
                              />
                              <button onClick={() => setEditVal('В')} className={`px-2 py-1 text-xs font-bold rounded ${editVal === 'В' ? 'bg-red-500 text-white' : 'bg-gray-100 dark:bg-slate-700 dark:bg-slate-700'}`}>В</button>
                            </div>
                            <div className="flex gap-1">
                              <button onClick={save} className="text-green-600 hover:text-green-800"><Save className="w-3 h-3" /></button>
                              <button onClick={() => setEditing(null)} className="text-gray-500 dark:text-slate-400 dark:text-slate-400 hover:text-gray-700 dark:text-slate-300 dark:text-slate-300"><X className="w-3 h-3" /></button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditing({ empId: emp.id, date: ds });
                              const hours = val;
                              setEditVal(hours === 'В' ? 'В' : (hours ?? 8));
                            }}
                            className={`w-full py-1 px-1 rounded text-xs font-semibold ${val === 'В' ? 'bg-red-100 text-red-700' : typeof val === 'number' ? 'bg-green-50 text-green-700' : weekend ? (isCurrent && d === today ? 'bg-blue-100' : 'bg-red-50') : (isCurrent && d === today ? 'bg-blue-50' : 'bg-blue-50')}`}
                          >
                            {val}
                          </button>
                        )}
                      </td>
                    );
                  })}
                  <td className={`sticky right-0 z-10 bg-white dark:bg-slate-800 dark:bg-slate-800 dark:bg-slate-800 border px-3 py-2 text-center ${hoveredRow === rowIdx ? 'bg-blue-100 dark:bg-slate-700' : ''}`}>
                    <p className="text-sm font-bold text-[#1976d2]">{totalHours(emp.id)}</p>
                    {absences(emp.id) > 0 && <p className="text-xs text-red-600">{absences(emp.id)} В</p>}
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
