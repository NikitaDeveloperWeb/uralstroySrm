'use client';

import { useState, useEffect } from 'react';
import { X, Building2, TrendingUp, Wallet } from 'lucide-react';

interface ProjectBalanceItem {
  id: number;
  name: string;
  area: string;
  address: string;
  cost: number;
  prepayment: number | null;
  prepaymentDate: string | null;
  status: string;
  totalTransactions: number;
  totalPlannedPayments: number;
  completionPercent: number;
}

interface ProjectBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  создан: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Создан' },
  'в работе': { bg: 'bg-green-100', text: 'text-green-800', label: 'В работе' },
  'на паузе': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'На паузе' },
  завершен: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Завершен' },
};

export function ProjectBalanceModal({ isOpen, onClose }: ProjectBalanceModalProps) {
  const [data, setData] = useState<ProjectBalanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [includeCompleted, setIncludeCompleted] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/projects/balance?includeCompleted=${includeCompleted}`);
        const json = await res.json();
        if (json.success) {
          setData(json.data || []);
        } else {
          setError(json.error || 'Не удалось загрузить данные');
        }
      } catch (err: unknown) {
        console.error('Failed to fetch project balance:', err);
        setError('Ошибка сети');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, includeCompleted]);

  if (!isOpen) return null;

  const totalCost = data.reduce((sum, item) => sum + item.cost, 0);
  const totalPrepayment = data.reduce((sum, item) => sum + (item.prepayment || 0), 0);
  const totalPlanned = data.reduce((sum, item) => sum + item.totalPlannedPayments, 0);
  const totalAll = totalPrepayment + totalPlanned;
  const avgCompletion = data.length > 0
    ? Math.round(data.reduce((sum, item) => sum + item.completionPercent, 0) / data.length)
    : 0;

  const formatCurrency = (value: number) => {
    return value.toLocaleString('ru-RU') + ' ₽';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 h-full overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-[90vw] h-[95vh] flex flex-col mx-4 my-2">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-[#1976d2]" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Баланс по объектам</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:text-slate-300 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="p-6 pb-0 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
          <div className="flex gap-2">
            <button
              onClick={() => setIncludeCompleted(false)}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                !includeCompleted
                  ? 'bg-[#1976d2] text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              Незавершенные ({data.filter(d => d.status !== 'завершен').length})
            </button>
            <button
              onClick={() => setIncludeCompleted(true)}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                includeCompleted
                  ? 'bg-[#1976d2] text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              Все объекты ({data.length})
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 opacity-80" />
              <span className="text-blue-100 text-sm">Всего объектов</span>
            </div>
            <p className="text-3xl font-bold">{data.length}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📊</span>
              <span className="text-purple-100 text-sm">Сумма по договору</span>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(totalCost)}</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">💰</span>
              <span className="text-emerald-100 text-sm">Получено всего</span>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(totalAll)}</p>
            <p className="text-xs text-emerald-100 mt-1">
              Предоплаты: {formatCurrency(totalPrepayment)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 opacity-80" />
              <span className="text-amber-100 text-sm">Среднее выполнение</span>
            </div>
            <p className="text-3xl font-bold">{avgCompletion}%</p>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#1976d2]"></div>
                <p className="mt-2 text-gray-600 dark:text-slate-300">Загрузка...</p>
              </div>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
              {error}
            </div>
          ) : data.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-400 dark:text-slate-500">
              <div className="text-center">
                <div className="text-6xl mb-4">🏗️</div>
                <p className="text-lg">Нет незавершенных объектов</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200 dark:border-slate-700">
                    <th className="text-left py-4 px-3 text-sm font-semibold text-gray-700 dark:text-slate-300">#</th>
                    <th className="text-left py-4 px-3 text-sm font-semibold text-gray-700 dark:text-slate-300">Объект</th>
                    <th className="text-left py-4 px-3 text-sm font-semibold text-gray-700 dark:text-slate-300">Адрес</th>
                    <th className="text-right py-4 px-3 text-sm font-semibold text-gray-700 dark:text-slate-300">Сумма по договору</th>
                    <th className="text-right py-4 px-3 text-sm font-semibold text-gray-700 dark:text-slate-300">Предоплата</th>
                    <th className="text-right py-4 px-3 text-sm font-semibold text-gray-700 dark:text-slate-300">Плановые платежи</th>
                    <th className="text-right py-4 px-3 text-sm font-semibold text-gray-700 dark:text-slate-300">Всего получено</th>
                    <th className="text-center py-4 px-3 text-sm font-semibold text-gray-700 dark:text-slate-300">Статус</th>
                    <th className="text-center py-4 px-3 text-sm font-semibold text-gray-700 dark:text-slate-300">Выполнение</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => {
                    const totalReceived = (item.prepayment || 0) + item.totalPlannedPayments;
                    return (
                      <tr
                        key={item.id}
                        className="border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-750 transition-colors"
                      >
                        <td className="py-4 px-3 text-sm text-gray-500 dark:text-slate-400">
                          {index + 1}
                        </td>
                        <td className="py-4 px-3 text-sm font-medium text-gray-900 dark:text-white">
                          {item.name}
                          {item.area && (
                            <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                              {item.area} м²
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-3 text-sm text-gray-600 dark:text-slate-300">
                          {item.address}
                        </td>
                        <td className="py-4 px-3 text-sm text-right font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(item.cost)}
                        </td>
                        <td className="py-4 px-3 text-sm text-right text-emerald-600 dark:text-emerald-400">
                          {item.prepayment ? formatCurrency(item.prepayment) : '—'}
                        </td>
                        <td className="py-4 px-3 text-sm text-right text-blue-600 dark:text-blue-400">
                          {item.totalPlannedPayments > 0 ? formatCurrency(item.totalPlannedPayments) : '—'}
                        </td>
                        <td className="py-4 px-3 text-sm text-right font-bold text-gray-900 dark:text-white">
                          {formatCurrency(totalReceived)}
                        </td>
                        <td className="py-4 px-3 text-sm text-center">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              statusColors[item.status]?.bg || 'bg-gray-100'
                            } ${statusColors[item.status]?.text || 'text-gray-800'}`}
                          >
                            {statusColors[item.status]?.label || item.status}
                          </span>
                        </td>
                        <td className="py-4 px-3 text-sm text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-24 bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  item.completionPercent >= 100
                                    ? 'bg-emerald-500'
                                    : item.completionPercent >= 50
                                    ? 'bg-blue-500'
                                    : 'bg-amber-500'
                                }`}
                                style={{ width: `${item.completionPercent}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-gray-700 dark:text-slate-300 w-10 text-right">
                              {item.completionPercent}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-slate-700 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-900 dark:text-white rounded-lg transition-colors font-semibold"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
