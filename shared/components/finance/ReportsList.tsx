'use client';

import { useState, useMemo } from 'react';
import { Search, Calendar, Trash2, ArrowDownRight, Minus } from 'lucide-react';

interface FinanceReport {
  id: string;
  type: 'object' | 'advance' | 'salary' | 'daily-expense' | 'daily-earning';
  date: string;
  amount: number;
  description: string;
  createdAt: string;
}

interface ReportsListProps {
  reports: FinanceReport[];
  onDelete: (id: string) => void;
}

type ReportTypeFilter = 'all' | FinanceReport['type'];

export function ReportsList({ reports, onDelete }: ReportsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [typeFilter, setTypeFilter] = useState<ReportTypeFilter>('all');

  const filteredReports = useMemo(() => {
    return reports
      .filter((report) => {
        if (typeFilter !== 'all' && report.type !== typeFilter) return false;
        if (dateFrom && report.date < dateFrom) return false;
        if (dateTo && report.date > dateTo) return false;
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            report.description.toLowerCase().includes(query) ||
            report.id.toLowerCase().includes(query)
          );
        }
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [reports, typeFilter, dateFrom, dateTo, searchQuery]);

  const totalAmount = useMemo(
    () => filteredReports.reduce((sum, r) => sum + r.amount, 0),
    [filteredReports]
  );

  const typeLabels: Record<FinanceReport['type'], string> = {
    object: 'По объекту',
    advance: 'Авансовый',
    salary: 'Зарплатный',
    'daily-expense': 'Расходы',
    'daily-earning': 'Заработок',
  };

  const typeBadgeColors: Record<FinanceReport['type'], string> = {
    object: 'bg-blue-100 text-blue-700',
    advance: 'bg-green-100 text-green-700',
    salary: 'bg-purple-100 text-purple-700',
    'daily-expense': 'bg-orange-100 text-orange-700',
    'daily-earning': 'bg-red-100 text-red-700',
  };

  const getTypeIcon = (type: FinanceReport['type']) => {
    switch (type) {
      case 'object':
        return <ArrowDownRight className="w-4 h-4 text-blue-500" />;
      case 'advance':
        return <ArrowDownRight className="w-4 h-4 text-green-500" />;
      case 'salary':
        return <ArrowDownRight className="w-4 h-4 text-purple-500" />;
      case 'daily-expense':
        return <Minus className="w-4 h-4 text-orange-500" />;
      case 'daily-earning':
        return <ArrowDownRight className="w-4 h-4 text-red-500" />;
    }
  };

  const activeFiltersCount = [
    typeFilter !== 'all' ? 1 : 0,
    dateFrom ? 1 : 0,
    dateTo ? 1 : 0,
    searchQuery ? 1 : 0,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSearchQuery('');
    setDateFrom('');
    setDateTo('');
    setTypeFilter('all');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white dark:text-white">История отчетов</h2>
        <span className="text-sm text-gray-500 dark:text-slate-400">
          {filteredReports.length} {filteredReports.length === 1 ? 'запись' : filteredReports.length < 5 ? 'записи' : 'записей'}
        </span>
      </div>

      <div className="bg-white dark:bg-slate-800 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 dark:border-slate-700 p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по описанию..."
              className="w-full rounded-lg border border-gray-300 dark:border-slate-600 dark:border-slate-600 dark:bg-slate-700 dark:text-white pl-9 pr-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              placeholder="С"
              className="w-full rounded-lg border border-gray-300 dark:border-slate-600 dark:border-slate-600 dark:bg-slate-700 dark:text-white pl-9 pr-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              placeholder="По"
              className="w-full rounded-lg border border-gray-300 dark:border-slate-600 dark:border-slate-600 dark:bg-slate-700 dark:text-white pl-9 pr-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500 dark:text-slate-400">Тип:</span>
          {([
            { value: 'all' as const, label: 'Все' },
            { value: 'object' as const, label: 'По объекту' },
            { value: 'advance' as const, label: 'Авансовый' },
            { value: 'salary' as const, label: 'Зарплатный' },
            { value: 'daily-expense' as const, label: 'Расходы' },
            { value: 'daily-earning' as const, label: 'Заработок' },
          ]).map((filter) => (
            <button
              key={filter.value}
              onClick={() => setTypeFilter(filter.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                typeFilter === filter.value
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 dark:bg-slate-700 dark:bg-slate-700 text-gray-600 dark:text-slate-300 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600'
              }`}
            >
              {filter.label}
            </button>
          ))}

          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="ml-auto text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Сбросить ({activeFiltersCount})
            </button>
          )}
        </div>
      </div>

      {filteredReports.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 dark:border-slate-700">
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-700 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3">
            <Search className="w-5 h-5 text-gray-400 dark:text-slate-500" />
          </div>
          <p className="text-gray-500 dark:text-slate-400 text-sm dark:text-slate-400">Отчеты не найдены</p>
          <p className="text-gray-400 dark:text-slate-500 text-xs mt-1 dark:text-slate-500">
            {activeFiltersCount > 0 ? 'Попробуйте изменить фильтры' : 'Создайте первый отчет'}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-slate-800 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-slate-700 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-700 dark:border-slate-600">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-700 dark:text-slate-300 dark:text-white">Дата</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-700 dark:text-slate-300 dark:text-white">Тип</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-700 dark:text-slate-300 dark:text-white">Описание</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-700 dark:text-slate-300 dark:text-white">Сумма</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-700 dark:text-slate-300 dark:text-white w-12">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700 dark:divide-slate-700">
                  {filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-700 transition-colors">
                      <td className="px-4 py-3 text-gray-900 dark:text-white dark:text-white whitespace-nowrap">
                        {new Date(report.date).toLocaleDateString('ru-RU', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${typeBadgeColors[report.type]}`}>
                          {getTypeIcon(report.type)}
                          {typeLabels[report.type]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-slate-300 dark:text-slate-300 max-w-xs truncate">
                        {report.description || '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white dark:text-white whitespace-nowrap">
                        {report.amount.toLocaleString('ru-RU')} ₽
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => onDelete(report.id)}
                          className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-between items-center bg-gray-50 dark:bg-slate-700 dark:bg-slate-700 rounded-xl px-5 py-3 border border-gray-200 dark:border-slate-700 dark:border-slate-600">
            <span className="text-sm text-gray-600 dark:text-slate-300 dark:text-slate-300">Всего по фильтру:</span>
            <span className="text-lg font-bold text-gray-900 dark:text-white dark:text-white">{totalAmount.toLocaleString('ru-RU')} ₽</span>
          </div>
        </>
      )}
    </div>
  );
}
