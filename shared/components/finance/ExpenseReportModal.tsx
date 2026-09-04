'use client';

import { useState, useEffect, useMemo } from 'react';
import { Calendar, ChevronDown, ChevronUp, Clock, Loader2, Sun, Globe, Search, Trash2 } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';


interface ExpenseItem {
  id: number;
  date: string;
  amount: number;
  recipient: string;
  purpose: string;
  category: string;
}

interface ExpenseCategory {
  id: number;
  name: string;
}

type Period = 'day' | 'week' | 'month' | 'year';

interface ExpenseReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExpenseReportModal({ isOpen, onClose }: ExpenseReportModalProps) {
  const [period, setPeriod] = useState<Period>('day');
  
  // Day: single date
  const [dayDate, setDayDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Week: start and end
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
  
  // Month: month and year
  const [monthDate, setMonthDate] = useState(new Date().toISOString().slice(0, 7));
  
  // Year: year
  const [yearDate, setYearDate] = useState(new Date().getFullYear().toString());

  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/expense-categories')
      .then(res => res.json())
      .then(data => {
        const categories = (data as any).data || data || [];
        setExpenseCategories(categories);
      })
      .catch(err => {
        console.error('Failed to fetch expense categories:', err);
      });
  }, []);

  const getCategoryLabel = (categoryName: string) => {
    const category = expenseCategories.find(c => c.name === categoryName);
    return category ? category.name : categoryName;
  };

  useEffect(() => {
    if (!isOpen) return;
    fetchExpenses();
  }, [isOpen, period, dayDate, weekStart, weekEnd, monthDate, yearDate]);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      let url = '/api/expenses?';
      let params: string[] = [];

      if (period === 'day') {
        params.push(`date=${dayDate}`);
      } else {
        let start: string;
        let end: string;
        if (period === 'week') {
          start = weekStart;
          end = weekEnd;
        } else if (period === 'month') {
          const [y, m] = monthDate.split('-');
          start = `${monthDate}-01`;
          const lastDay = new Date(parseInt(y), parseInt(m), 0).getDate();
          end = `${monthDate}-${lastDay.toString().padStart(2, '0')}`;
        } else {
          start = `${yearDate}-01-01`;
          end = `${yearDate}-12-31`;
        }
        params.push(`from=${start}`, `to=${end}`);
      }

      url += params.join('&');

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setExpenses(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const avgCheck = expenses.length > 0 ? Math.round(totalAmount / expenses.length) : 0;

  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const matchesSearch = !searchQuery || 
        exp.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (exp.category || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || exp.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [expenses, searchQuery, selectedCategory]);

  const filteredTotal = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const filteredAvg = filteredExpenses.length > 0 ? Math.round(filteredTotal / filteredExpenses.length) : 0;

  const allCategories = useMemo(() => {
    const cats = new Set(expenses.map(e => e.category).filter(Boolean));
    return Array.from(cats);
  }, [expenses]);

  const expensesByCategory = expenses.reduce((acc, exp) => {
    const cat = exp.category || 'other';
    if (!acc[cat]) {
      acc[cat] = { count: 0, total: 0 };
    }
    acc[cat].count++;
    acc[cat].total += exp.amount;
    return acc;
  }, {} as Record<string, { count: number; total: number }>);

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

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить этот расход?')) return;
    setDeleting(id);
    try {
      await fetch(`/api/expenses?id=${id}`, { method: 'DELETE' });
      fetchExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
    } finally {
      setDeleting(null);
    }
  };

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Расходы" height="h-[90vh]">
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
                className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
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
                    className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">По</label>
                  <input
                    type="date"
                    value={weekEnd}
                    onChange={(e) => setWeekEnd(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
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
                    className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
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
                    className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
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
                  className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                >
                  {yearOptions.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Search and filter */}
        <div className="flex-shrink-0 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Поиск по названию, получателю или категории..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          {allCategories.length > 0 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Все категории</option>
              {allCategories.map(cat => (
                <option key={cat} value={cat}>
                  {getCategoryLabel(cat)}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Summary cards */}
        <div className="flex-shrink-0 grid grid-cols-3 gap-3">
          <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
            <p className="text-xs font-medium text-orange-700 mb-1">Всего расходов</p>
            <p className="text-xl font-bold text-orange-900">{filteredExpenses.length}</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
            <p className="text-xs font-medium text-orange-700 mb-1">Общая сумма</p>
            <p className="text-xl font-bold text-orange-900">{filteredTotal.toLocaleString('ru-RU')} ₽</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
            <p className="text-xs font-medium text-orange-700 mb-1">Средний чек</p>
            <p className="text-xl font-bold text-orange-900">{filteredAvg.toLocaleString('ru-RU')} ₽</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400 dark:text-slate-500" />
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-slate-700 rounded-lg">
              <Calendar className="w-12 h-12 text-gray-300 dark:text-slate-500 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-slate-400 font-medium">Расходов нет</p>
              <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">Нет расходов за выбранный период</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Categories */}
              {Object.keys(expensesByCategory).length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">По категориям</h3>
                  <div className="space-y-2">
                    {Object.entries(expensesByCategory).map(([cat, data]) => {
                      const catExpenses = filteredExpenses.filter(e => e.category === cat);
                      const isExpanded = expandedCategory === cat;
                      return (
                        <div key={cat}>
                          <button
                            onClick={() => setExpandedCategory(isExpanded ? null : cat)}
                            className="w-full flex items-center justify-between py-2 border-b border-gray-100 dark:border-slate-700 last:border-0 hover:bg-gray-50 dark:hover:bg-slate-700 dark:hover:bg-slate-700 rounded-lg px-2 -mx-2 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium px-2 py-1 bg-orange-100 text-orange-800 rounded">
                                {getCategoryLabel(cat)}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-slate-400">{data.count} шт.</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900 dark:text-white">{data.total.toLocaleString('ru-RU')} ₽</span>
                              <svg className={`w-4 h-4 text-gray-400 dark:text-slate-500 dark:text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </button>
                          {isExpanded && (
                            <div className="mt-2 ml-4 space-y-1">
                              {catExpenses.map(exp => (
                                <div key={exp.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-700 dark:bg-slate-700 rounded text-sm">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-gray-800 dark:text-slate-200 dark:text-slate-200 truncate">{exp.purpose}</p>
                                    <p className="text-xs text-gray-400 dark:text-slate-500 dark:text-slate-500">{exp.recipient} · {exp.date}</p>
                                  </div>
                                  <span className="font-semibold text-gray-900 dark:text-white dark:text-white ml-4 flex-shrink-0">{exp.amount.toLocaleString('ru-RU')} ₽</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Expenses list */}
              <div>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center justify-between w-full p-4 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 dark:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Список расходов</h3>
                    <span className="text-xs font-medium px-2 py-1 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-full">
                      {filteredExpenses.length}
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
                      {filteredExpenses.map((expense, index) => (
                        <div key={expense.id} className="p-4 hover:bg-orange-50/30 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-gray-500 dark:text-slate-400">#{index + 1}</span>
                                <span className="text-xs font-medium px-2 py-0.5 bg-orange-100 text-orange-800 rounded">
                                  {getCategoryLabel(expense.category)}
                                </span>
                              </div>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">{expense.purpose}</p>
                              <p className="text-xs text-gray-600 dark:text-slate-300">Кому: {expense.recipient}</p>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <p className="text-base font-bold text-gray-900 dark:text-white">
                                {expense.amount.toLocaleString('ru-RU')} ₽
                              </p>
                              <button
                                onClick={() => handleDelete(expense.id)}
                                disabled={deleting === expense.id}
                                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                                title="Удалить расход"
                              >
                                {deleting === expense.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
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
