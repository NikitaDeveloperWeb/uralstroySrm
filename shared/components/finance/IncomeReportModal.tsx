'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/shared/components/ui/Modal';
import { Calendar, ChevronDown, ChevronUp, Clock, Loader2, Sun, Globe, Building2, ArrowUpCircle } from 'lucide-react';

interface Transaction {
  id: number;
  projectId: number;
  amount: number;
  date: string;
  comment: string | null;
}

interface ProjectInfo {
  id: number;
  name: string;
  code: string;
}

type Period = 'day' | 'week' | 'month' | 'year';

interface IncomeReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function IncomeReportModal({ isOpen, onClose }: IncomeReportModalProps) {
  const [period, setPeriod] = useState<Period>('day');
  
  const [dayDate, setDayDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    const start = new Date(d);
    start.setDate(d.getDate() - day);
    return start.toISOString().split('T')[0];
  });
  const [weekEnd, setWeekEnd] = useState(() => {
    const d = new Date();
    const end = new Date(d);
    end.setDate(d.getDate() + (6 - d.getDay()));
    return end.toISOString().split('T')[0];
  });
  
  const [monthDate, setMonthDate] = useState(new Date().toISOString().slice(0, 7));
  
  const [yearDate, setYearDate] = useState(new Date().getFullYear().toString());

  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    fetchData();
  }, [isOpen, period, dayDate, weekStart, weekEnd, monthDate, yearDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const projectsRes = await fetch('/api/projects');
      const projectsData = await projectsRes.json();
      const projectList: ProjectInfo[] = projectsData.data || [];
      setProjects(projectList);

      const allTransactions: Transaction[] = [];
      
      for (const project of projectList) {
        if (!project.id) continue;
        try {
          const res = await fetch(`/api/projects/${project.id}/transactions`);
          if (res.ok) {
            const data = await res.json();
            if (data.data) {
              allTransactions.push(...data.data.map((t: any) => ({
                ...t,
                projectId: project.id,
              })));
            }
          }
        } catch (err) {
          console.error('Error fetching transactions for project', project.id, ':', err);
        }
      }

      const filtered = filterByPeriod(allTransactions);
      setTransactions(filtered);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterByPeriod = (allTransactions: Transaction[]): Transaction[] => {
    if (period === 'day') {
      return allTransactions.filter(t => {
        const txDate = new Date(t.date);
        const txDateStr = txDate.getFullYear() + '-' + 
          String(txDate.getMonth() + 1).padStart(2, '0') + '-' + 
          String(txDate.getDate()).padStart(2, '0');
        return txDateStr === dayDate;
      });
    }

    let startDateStr: string;
    let endDateStr: string;

    if (period === 'week') {
      startDateStr = weekStart;
      endDateStr = weekEnd;
    } else if (period === 'month') {
      const [y, m] = monthDate.split('-');
      startDateStr = `${monthDate}-01`;
      const lastDay = new Date(parseInt(y), parseInt(m), 0).getDate();
      endDateStr = `${monthDate}-${lastDay.toString().padStart(2, '0')}`;
    } else {
      startDateStr = `${yearDate}-01-01`;
      endDateStr = `${yearDate}-12-31`;
    }

    const startDt = new Date(startDateStr);
    const endDt = new Date(endDateStr);
    
    return allTransactions.filter(t => {
      const txDate = new Date(t.date);
      return txDate >= startDt && txDate <= endDt;
    });
  };

  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  const avgCheck = transactions.length > 0 ? Math.round(totalAmount / transactions.length) : 0;

  const groupedByProject = transactions.reduce((acc, t) => {
    if (!acc[t.projectId]) {
      acc[t.projectId] = { transactions: [], total: 0 };
    }
    acc[t.projectId].transactions.push(t);
    acc[t.projectId].total += t.amount;
    return acc;
  }, {} as Record<number, { transactions: Transaction[]; total: number }>);

  const periodLabels: Record<Period, string> = {
    day: 'День',
    week: 'Неделя',
    month: 'Месяц',
    year: 'Год',
  };

  const periodIcons: Record<Period, any> = {
    day: Clock,
    week: Calendar,
    month: Sun,
    year: Globe,
  };

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Приходы" height="h-[90vh]">
      <div className="space-y-6 h-full flex flex-col">
        {/* Tabs */}
        <div className="flex-shrink-0">
          <div className="flex gap-1 bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
            {(Object.keys(periodLabels) as Period[]).map((p) => {
              const Icon = periodIcons[p];
              return (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    period === p
                      ? 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {periodLabels[p]}
                </button>
              );
            })}
          </div>

          {/* Period-specific date pickers */}
          <div className="mt-3">
            {period === 'day' && (
              <input
                type="date"
                value={dayDate}
                onChange={(e) => setDayDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            )}

            {period === 'week' && (
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">С</label>
                  <input
                    type="date"
                    value={weekStart}
                    onChange={(e) => setWeekStart(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">По</label>
                  <input
                    type="date"
                    value={weekEnd}
                    onChange={(e) => setWeekEnd(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>
            )}

            {period === 'month' && (
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">Месяц</label>
                  <select
                    value={monthDate.split('-')[1]}
                    onChange={(e) => setMonthDate(`${monthDate.split('-')[0]}-${e.target.value}`)}
                    className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    {monthNames.map((name, i) => (
                      <option key={i} value={(i + 1).toString().padStart(2, '0')}>{name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">Год</label>
                  <select
                    value={yearDate}
                    onChange={(e) => setYearDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    {yearOptions.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {period === 'year' && (
              <div>
                <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">Год</label>
                <select
                  value={yearDate}
                  onChange={(e) => setYearDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  {yearOptions.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Summary cards */}
        <div className="flex-shrink-0 grid grid-cols-3 gap-3">
          <div className="bg-teal-50 rounded-lg p-3 border border-teal-200">
            <p className="text-xs font-medium text-teal-700 mb-1">Всего приходов</p>
            <p className="text-xl font-bold text-teal-900">{transactions.length}</p>
          </div>
          <div className="bg-teal-50 rounded-lg p-3 border border-teal-200">
            <p className="text-xs font-medium text-teal-700 mb-1">Общая сумма</p>
            <p className="text-xl font-bold text-teal-900">{totalAmount.toLocaleString('ru-RU')} ₽</p>
          </div>
          <div className="bg-teal-50 rounded-lg p-3 border border-teal-200">
            <p className="text-xs font-medium text-teal-700 mb-1">Средний чек</p>
            <p className="text-xl font-bold text-teal-900">{avgCheck.toLocaleString('ru-RU')} ₽</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400 dark:text-slate-500" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-slate-700 rounded-lg">
              <ArrowUpCircle className="w-12 h-12 text-gray-300 dark:text-slate-500 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-slate-400 font-medium">Приходов нет</p>
              <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">Нет платежей за выбранный период</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Projects */}
              {Object.keys(groupedByProject).length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">По объектам</h3>
                  <div className="space-y-2">
                    {Object.entries(groupedByProject).map(([projectId, data]) => {
                      const project = projects.find((p) => p.id === parseInt(projectId));
                      return (
                        <div key={projectId} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-slate-700 last:border-0">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-teal-600" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {project?.name || `Проект #${projectId}`}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-slate-400">{data.transactions.length} шт.</span>
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-white">{data.total.toLocaleString('ru-RU')} ₽</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Transactions list */}
              <div>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center justify-between w-full p-4 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 dark:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Список приходов</h3>
                    <span className="text-xs font-medium px-2 py-1 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-full">
                      {transactions.length}
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-600 dark:text-slate-300" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-600 dark:text-slate-300" />
                  )}
                </button>

                {isExpanded && (
                  <div className="mt-2 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
                    <div className="divide-y divide-gray-100 dark:divide-slate-700">
                      {transactions.map((transaction, index) => {
                        const project = projects.find((p) => p.id === transaction.projectId);
                        return (
                          <div key={transaction.id} className="p-4 hover:bg-teal-50/30 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-medium text-gray-500 dark:text-slate-400">#{index + 1}</span>
                                  <span className="text-xs font-medium px-2 py-0.5 bg-teal-100 text-teal-800 rounded">
                                    {project?.name || `Проект #${transaction.projectId}`}
                                  </span>
                                </div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">
                                  {transaction.comment || 'Платеж'}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-slate-300">
                                  {new Date(transaction.date).toLocaleDateString('ru-RU')}
                                </p>
                              </div>
                              <p className="text-base font-bold text-gray-900 dark:text-white ml-4">
                                {transaction.amount.toLocaleString('ru-RU')} ₽
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
