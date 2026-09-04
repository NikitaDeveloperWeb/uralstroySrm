'use client';

import { useState, useEffect } from 'react';
import { useAlert } from '@/shared/hooks/useAlert';
import { Modal } from '@/shared/components/ui/Modal';
import { Trash2, Calendar, DollarSign, User, FileText, ChevronDown, ChevronUp } from 'lucide-react';

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

interface AdvanceReportViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  reports: AdvanceReport[];
  onDelete: (id: number) => Promise<void>;
}

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

export function AdvanceReportViewModal({
  isOpen,
  onClose,
  reports,
  onDelete,
}: AdvanceReportViewModalProps) {
  const { confirm } = useAlert();
  const [deleting, setDeleting] = useState<number | null>(null);
  const [collapsedMonths, setCollapsedMonths] = useState<Set<string>>(new Set());
  const [collapsedEmployees, setCollapsedEmployees] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!isOpen) {
      setCollapsedMonths(new Set());
      setCollapsedEmployees(new Set());
    }
  }, [isOpen]);

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

  const toggleEmployee = (employeeId: number) => {
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

  // Group advances by employee and month
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

    // Convert to sorted array
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

    // Sort by month descending
    result.push(...monthGroups.values());
    result.sort((a, b) => b.monthKey.localeCompare(a.monthKey));

    return result;
  };

  const groupedReports = groupByEmployeeAndMonth(reports);
  const totalAmount = reports.reduce((sum, r) => sum + r.totalAmount, 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Авансовые отчеты" height="h-[90vh]">
      <div className="space-y-4 h-full flex flex-col">
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
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-slate-500" />
              <p className="text-lg font-medium">Нет авансовых отчетов</p>
              <p className="text-sm mt-1">Создайте первый отчет через кнопку "Авансовые отчеты"</p>
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
                        <Calendar className="w-4 h-4 text-green-600" />
                        <span className="font-semibold text-green-900 capitalize">
                          {monthGroup.monthName}
                        </span>
                        <span className="text-xs text-green-700">
                          {monthGroup.employees.length} {monthGroup.employees.length === 1 ? 'сотрудник' : monthGroup.employees.length < 5 ? 'сотрудника' : 'сотрудников'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-green-800">
                          {monthGroup.total.toLocaleString('ru-RU')} ₽
                        </span>
                        {isMonthCollapsed ? (
                          <ChevronDown className="w-4 h-4 text-green-600" />
                        ) : (
                          <ChevronUp className="w-4 h-4 text-green-600" />
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
                                onClick={() => toggleEmployee(emp.employeeId)}
                                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-700 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <User className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                                  <span className="font-medium text-gray-900 dark:text-white">{emp.employeeName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-gray-900 dark:text-white">
                                    {emp.total.toLocaleString('ru-RU')} ₽
                                  </span>
                                  {isEmpCollapsed ? (
                                    <ChevronDown className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                                  ) : (
                                    <ChevronUp className="w-4 h-4 text-gray-400 dark:text-slate-500" />
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
                                        <Calendar className="w-4 h-4 text-gray-400 dark:text-slate-500" />
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

        {/* Actions */}
        <div className="flex-shrink-0 flex justify-end gap-3 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-700"
          >
            Закрыть
          </button>
        </div>
      </div>
    </Modal>
  );
}
