'use client';

import { useState, useEffect } from 'react';
import { useAlert } from '@/shared/hooks/useAlert';
import { Modal } from '@/shared/components/ui/Modal';
import { Employee } from '@/shared/types/project';
import { useEmployeeStore } from '@/shared/stores/employeeStore';
import { UserCheck, DollarSign, Loader2, Plus, History, Trash2 } from 'lucide-react';

interface AdvanceEntry {
  employeeId: number;
  employeeName: string;
  amount: string;
  purpose: string;
}

interface AdvanceReportItem {
  id: number;
  employeeId: number;
  employeeName: string;
  amount: number;
  purpose: string;
  date: string;
}

interface AdvanceReport {
  id: number;
  date: string;
  totalAmount: number;
  items: AdvanceReportItem[];
}

interface AdvanceReportCombinedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { date: string; entries: AdvanceEntry[] }) => void;
  reports: AdvanceReport[];
  onDelete: (id: number) => Promise<void>;
}

type TabType = 'create' | 'history';

interface EmployeeAdvances {
  employeeId: number;
  employeeName: string;
  advances: AdvanceReportItem[];
  total: number;
}

interface MonthGroup {
  monthKey: string;
  monthName: string;
  employees: EmployeeAdvances[];
  total: number;
}

export function AdvanceReportCombinedModal({
  isOpen,
  onClose,
  onSubmit,
  reports,
  onDelete,
}: AdvanceReportCombinedModalProps) {
  const { confirm } = useAlert();
  const { employees, fetchEmployees, loading } = useEmployeeStore();
  const [activeTab, setActiveTab] = useState<TabType>('create');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [entries, setEntries] = useState<AdvanceEntry[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [collapsedMonths, setCollapsedMonths] = useState<Set<string>>(new Set());
  const [collapsedEmployees, setCollapsedEmployees] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
      setDate(new Date().toISOString().split('T')[0]);
      setEntries([]);
      setActiveTab('create');
      setCollapsedMonths(new Set());
      setCollapsedEmployees(new Set());
    }
  }, [isOpen, fetchEmployees]);

  const toggleEmployee = (employee: Employee) => {
    setEntries(prev => {
      const exists = prev.find(e => e.employeeId === employee.id);
      if (exists) return prev.filter(e => e.employeeId !== employee.id);
      return [...prev, {
        employeeId: employee.id,
        employeeName: employee.fullName,
        amount: '',
        purpose: '',
      }];
    });
  };

  const updateAmount = (employeeId: number, amount: string) => {
    setEntries(prev => prev.map(e =>
      e.employeeId === employeeId ? { ...e, amount } : e
    ));
  };

  const updatePurpose = (employeeId: number, purpose: string) => {
    setEntries(prev => prev.map(e =>
      e.employeeId === employeeId ? { ...e, purpose } : e
    ));
  };

  const handleSubmit = async () => {
    const validEntries = entries.filter(e => e.amount && parseFloat(e.amount) > 0);
    if (validEntries.length === 0) return;
    setSaving(true);
    try {
      await onSubmit({ date, entries: validEntries });
      onClose();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (await confirm('Удалить этот авансовый отчет?')) {
      setDeleting(id);
      try {
        await onDelete(id);
      } catch (error) {
        console.error('Ошибка при удалении:', error);
      } finally {
        setDeleting(null);
      }
    }
  };

  const toggleMonth = (monthKey: string) => {
    setCollapsedMonths(prev => {
      const next = new Set(prev);
      if (next.has(monthKey)) {
        next.delete(monthKey);
      } else {
        next.add(monthKey);
      }
      return next;
    });
  };

  const toggleEmployeeHistory = (employeeId: number) => {
    setCollapsedEmployees(prev => {
      const next = new Set(prev);
      if (next.has(employeeId)) {
        next.delete(employeeId);
      } else {
        next.add(employeeId);
      }
      return next;
    });
  };

  const formatMonthName = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
  };

  const formatMonthKey = (dateStr: string): string => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${date.getMonth().toString().padStart(2, '0')}`;
  };

  const formatShortDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  const groupByEmployeeAndMonth = (reports: AdvanceReport[]): MonthGroup[] => {
    const employeeMap = new Map<number, Map<string, EmployeeAdvances>>();

    for (const report of reports) {
      for (const item of report.items) {
        const monthKey = formatMonthKey(report.date);
        const monthName = formatMonthName(report.date);

        if (!employeeMap.has(item.employeeId)) {
          employeeMap.set(item.employeeId, new Map());
        }

        const monthsMap = employeeMap.get(item.employeeId)!;
        if (!monthsMap.has(monthKey)) {
          monthsMap.set(monthKey, {
            employeeId: item.employeeId,
            employeeName: item.employeeName,
            advances: [],
            total: 0,
          });
        }

        const group = monthsMap.get(monthKey)!;
        group.advances.push({ ...item, date: report.date });
        group.total += item.amount;
      }
    }

    const result: MonthGroup[] = [];
    const monthGroups = new Map<string, MonthGroup>();

    for (const [, monthsMap] of employeeMap) {
      for (const [monthKey, empData] of monthsMap) {
        if (!monthGroups.has(monthKey)) {
          monthGroups.set(monthKey, {
            monthKey,
            monthName: empData.advances[0].date
              ? formatMonthName(empData.advances[0].date)
              : monthKey,
            employees: [],
            total: 0,
          });
        }

        const monthGroup = monthGroups.get(monthKey)!;
        monthGroup.employees.push(empData);
        monthGroup.total += empData.total;
      }
    }

    result.push(...monthGroups.values());
    result.sort((a, b) => b.monthKey.localeCompare(a.monthKey));

    return result;
  };

  const groupedReports = groupByEmployeeAndMonth(reports);
  const totalAmount = reports.reduce((sum, r) => sum + r.totalAmount, 0);
  const totalEntries = entries.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Авансовые отчеты" height="h-[90vh]">
      <div className="space-y-4 h-full flex flex-col">
        {/* Tabs */}
        <div className="flex-shrink-0 flex gap-1 bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'create'
                ? 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-300'
            }`}
          >
            <Plus className="w-4 h-4" />
            Создать
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-300'
            }`}
          >
            <History className="w-4 h-4" />
            История
          </button>
        </div>

        {/* Create tab */}
        {activeTab === 'create' && (
          <>
            {/* Date */}
            <div className="flex-shrink-0 pb-4 border-b">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-64 rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm"
              />
            </div>

            {/* Employee list */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400 dark:text-slate-500" />
                </div>
              ) : (
                <div className="border rounded-lg">
                  {employees.map((employee) => {
                    const isSelected = entries.some(e => e.employeeId === employee.id);
                    return (
                      <button
                        key={employee.id}
                        type="button"
                        onClick={() => toggleEmployee(employee)}
                        className={`w-full flex items-center justify-between px-4 py-3 text-left border-b last:border-0 hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-700 transition-colors ${
                          isSelected ? 'bg-green-50' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            isSelected ? 'bg-green-600 border-green-600' : 'border-gray-300 dark:border-slate-600'
                          }`}>
                            {isSelected && <UserCheck className="w-3 h-3 text-white" />}
                          </div>
                          <span className="text-sm text-gray-900 dark:text-white">{employee.fullName}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Selected entries form */}
            {entries.length > 0 && (
              <div className="flex-shrink-0 space-y-3 mt-4 border-t pt-4 max-h-60 overflow-y-auto">
                {entries.map((entry) => (
                  <div key={entry.employeeId} className="bg-white dark:bg-slate-800 rounded-lg border p-3 space-y-2">
                    <p className="text-sm font-medium">{entry.employeeName}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                        <input
                          type="number"
                          placeholder="Сумма"
                          value={entry.amount}
                          onChange={(e) => updateAmount(entry.employeeId, e.target.value)}
                          className="w-full pl-8 pr-2 py-1.5 text-sm border rounded"
                          min="0"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Цель"
                        value={entry.purpose}
                        onChange={(e) => updatePurpose(entry.employeeId, e.target.value)}
                        className="px-2 py-1.5 text-sm border rounded"
                      />
                    </div>
                  </div>
                ))}

                <div className="bg-green-50 rounded-lg p-3 flex justify-between items-center">
                  <span className="text-sm font-medium">Итого: {entries.length} чел.</span>
                  <span className="text-lg font-bold">{totalEntries.toLocaleString('ru-RU')} ₽</span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex-shrink-0 flex justify-end gap-3 pt-4 border-t">
              <button
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-700"
              >
                Отмена
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving || entries.length === 0}
                className="px-6 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </>
        )}

        {/* History tab */}
        {activeTab === 'history' && (
          <>
            {/* Summary */}
            <div className="flex-shrink-0 grid grid-cols-2 gap-3">
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <p className="text-xs font-medium text-green-700 mb-1">Всего отчетов</p>
                <p className="text-xl font-bold text-green-900">{reports.length}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <p className="text-xs font-medium text-green-700 mb-1">Общая сумма</p>
                <p className="text-xl font-bold text-green-900">{totalAmount.toLocaleString('ru-RU')} ₽</p>
              </div>
            </div>

            {/* Report list */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {reports.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-slate-400">
                  <History className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-slate-500" />
                  <p className="text-lg font-medium">Нет авансовых отчетов</p>
                  <p className="text-sm mt-1">Создайте первый отчет на вкладке "Создать"</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {groupedReports.map((monthGroup) => {
                    const isMonthCollapsed = collapsedMonths.has(monthGroup.monthKey);
                    return (
                      <div key={monthGroup.monthKey} className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
                        {/* Month header */}
                        <button
                          onClick={() => toggleMonth(monthGroup.monthKey)}
                          className="w-full flex items-center justify-between px-4 py-3 bg-green-50 hover:bg-green-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <History className="w-4 h-4 text-green-600" />
                            <span className="font-semibold text-green-900 capitalize">
                              {monthGroup.monthName}
                            </span>
                            <span className="text-xs text-green-700">
                              {monthGroup.employees.length} {monthGroup.employees.length === 1 ? 'сотрудник' : monthGroup.employees.length < 5 ? 'сотрудника' : 'сотрудников'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-green-800">
                              {monthGroup.total.toLocaleString('ru-RU')} ₽
                            </span>
                            {isMonthCollapsed ? (
                              <Plus className="w-4 h-4 text-green-600" />
                            ) : (
                              <span className="text-green-600 text-lg leading-none">−</span>
                            )}
                          </div>
                        </button>

                        {/* Month content */}
                        {!isMonthCollapsed && (
                          <div className="divide-y divide-gray-100 dark:divide-slate-700">
                            {monthGroup.employees.map((emp) => {
                              const isEmpCollapsed = collapsedEmployees.has(emp.employeeId);
                              return (
                                <div key={emp.employeeId} className="bg-white dark:bg-slate-800">
                                  {/* Employee header */}
                                  <button
                                    onClick={() => toggleEmployeeHistory(emp.employeeId)}
                                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-700 transition-colors"
                                  >
                                    <div className="flex items-center gap-3">
                                      <UserCheck className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                                      <span className="font-medium text-gray-900 dark:text-white">{emp.employeeName}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-gray-900 dark:text-white">
                                        {emp.total.toLocaleString('ru-RU')} ₽
                                      </span>
                                      {isEmpCollapsed ? (
                                        <Plus className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                                      ) : (
                                        <span className="text-gray-400 dark:text-slate-500 text-lg leading-none">−</span>
                                      )}
                                    </div>
                                  </button>

                                  {/* Employee advances */}
                                  {!isEmpCollapsed && (
                                    <div className="px-4 pb-3 space-y-2">
                                      {emp.advances.map((advance) => (
                                        <div
                                          key={advance.id}
                                          className="flex justify-between items-center bg-gray-50 dark:bg-slate-700 rounded-lg p-3"
                                        >
                                          <div className="flex items-center gap-3">
                                            <History className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                                            <div>
                                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {formatShortDate(advance.date)}
                                              </p>
                                              <p className="text-xs text-gray-500 dark:text-slate-400">{advance.purpose}</p>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <DollarSign className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                              {advance.amount.toLocaleString('ru-RU')} ₽
                                            </span>
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(advance.id);
                                              }}
                                              disabled={deleting === advance.id}
                                              className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                                              title="Удалить отчет"
                                            >
                                              {deleting === advance.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                              ) : (
                                                <Trash2 className="w-4 h-4" />
                                              )}
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
