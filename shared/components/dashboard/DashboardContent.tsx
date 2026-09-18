'use client';

import { useEffect, useState } from 'react';
import { Download, BarChart3 } from 'lucide-react';
import { ProjectBalanceModal } from '@/shared/components/dashboard/ProjectBalanceModal';
import { MonthlyPlanTable } from '@/shared/components/dashboard/MonthlyPlanTable';

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalEmployees: number;
  employeesToday: number;
  avgProjectCost: number;
  balance: number;
  totalIncome: number;
  totalExpense: number;
  totalBrigades: number;
  activeBrigades: number;
  totalWarehouseValue: number;
}

interface Project {
  id: number;
  name: string;
  status: string;
  cost: number;
  address: string;
  createdAt: string;
}

interface WarehouseItem {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  cost: number;
}

interface Transaction {
  id: number;
  amount: number;
  date: string;
  comment: string | null;
  project?: { name: string } | null;
}

interface SalaryChart {
  date: string;
  amount: number;
}

interface StatusChart {
  name: string;
  count: number;
}

export function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [warehouseItems, setWarehouseItems] = useState<WarehouseItem[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [salaryChartData, setSalaryChartData] = useState<SalaryChart[]>([]);
  const [statusChartData, setStatusChartData] = useState<StatusChart[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [isMonthlyPlanModalOpen, setIsMonthlyPlanModalOpen] = useState(false);

  const handleBackup = async () => {
    try {
      setIsBackingUp(true);
      const res = await fetch('/api/backup');
      if (!res.ok) throw new Error('Backup failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = res.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || 'backup.db';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Backup error:', error);
      alert('Не удалось создать резервную копию');
    } finally {
      setIsBackingUp(false);
    }
  };

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStats(data.data.stats);
          setRecentProjects(data.data.recentProjects);
          setWarehouseItems(data.data.warehouseItems);
          setRecentTransactions(data.data.recentTransactions || []);
          setSalaryChartData(data.data.salaryChartData);
          setStatusChartData(data.data.statusChartData);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Dashboard fetch error:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#1976d2]"></div>
          <p className="mt-2 text-gray-600 dark:text-slate-300 dark:text-slate-400">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  const statusColors: Record<string, { bg: string; text: string }> = {
    active: { bg: 'bg-green-100', text: 'text-green-800' },
    completed: { bg: 'bg-blue-100', text: 'text-blue-800' },
    paused: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-800' }
  };

  const statusLabels: Record<string, string> = {
    active: 'Активные',
    completed: 'Завершенные',
    paused: 'Приостановленные',
    cancelled: 'Отмененные'
  };

  const maxSalary = Math.max(...salaryChartData.map(d => d.amount), 1);
  const totalStatus = statusChartData.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="space-y-6">
      {/* Кнопки */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => setIsBalanceModalOpen(true)}
          className="flex items-center gap-2 bg-[#1976d2] hover:bg-[#1565c0] text-white font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <BarChart3 className="w-4 h-4" />
          Баланс по объектам
        </button>
        <button
          onClick={handleBackup}
          disabled={isBackingUp}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          {isBackingUp ? 'Создание копии...' : 'Резервная копия'}
        </button>
      </div>

      {/* Статистика с градиентами */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Активные проекты</p>
              <p className="text-4xl font-bold mt-2">{stats?.activeProjects || 0}</p>
              <p className="text-blue-100 text-xs mt-2">Всего: {stats?.totalProjects || 0}</p>
            </div>
            <div className="text-5xl opacity-30">🏗️</div>
          </div>
          <div className="mt-4 bg-white dark:bg-slate-800/20 rounded-full h-2">
            <div
              className="bg-white dark:bg-slate-800 rounded-full h-2 transition-all"
              style={{ width: `${stats?.totalProjects ? (stats.activeProjects / stats.totalProjects) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Сотрудники</p>
              <p className="text-4xl font-bold mt-2">{stats?.totalEmployees || 0}</p>
              <p className="text-green-100 text-xs mt-2">На смене: {stats?.employeesToday || 0}</p>
            </div>
            <div className="text-5xl opacity-30">👥</div>
          </div>
          <div className="mt-4 bg-white dark:bg-slate-800/20 rounded-full h-2">
            <div
              className="bg-white dark:bg-slate-800 rounded-full h-2 transition-all"
              style={{ width: `${stats?.totalEmployees ? (stats.employeesToday / stats.totalEmployees) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Средний проект</p>
              <p className="text-4xl font-bold mt-2">{(stats?.avgProjectCost || 0).toLocaleString('ru-RU')}</p>
              <p className="text-purple-100 text-xs mt-2">рублей</p>
            </div>
            <div className="text-5xl opacity-30">💰</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm">Оборот</p>
              <p className="text-4xl font-bold mt-2">{(stats?.balance || 0).toLocaleString('ru-RU')}</p>
              <p className="text-amber-100 text-xs mt-2">рублей</p>
            </div>
            <div className="text-5xl opacity-30">📊</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Последние проекты */}
        <div className="bg-white dark:bg-slate-800 dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-slate-700 dark:border-slate-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white dark:text-white mb-4 flex items-center gap-2">
            <span className="text-xl">📋</span>
            Последние проекты
          </h3>
          <div className="space-y-3">
            {recentProjects.map(project => (
              <div key={project.id} className="group p-4 bg-gray-50 dark:bg-slate-700 dark:bg-slate-750 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white dark:text-white group-hover:text-blue-700 transition-colors">
                      {project.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-slate-400 dark:text-slate-400 mt-1">{project.address}</div>
                  </div>
                  <div className="text-right ml-3">
                    <div className="text-sm font-bold text-gray-900 dark:text-white dark:text-white">
                      {(project.cost || 0).toLocaleString('ru-RU')} ₽
                    </div>
                    <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${statusColors[project.status]?.bg || 'bg-gray-100 dark:bg-slate-700'} ${statusColors[project.status]?.text || 'text-gray-800 dark:text-slate-200'}`}>
                      {statusLabels[project.status] || project.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Последние финансовые операции */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-slate-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="text-xl">💳</span>
            Последние операции
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {recentTransactions.map(tx => (
              <div key={tx.id} className="p-3 bg-gray-50 dark:bg-slate-700 dark:bg-slate-750 rounded-lg hover:bg-amber-50 dark:hover:bg-slate-700 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white dark:text-white">
                      {tx.comment || 'Операция'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-slate-400 dark:text-slate-400 mt-1">
                      {tx.project?.name || 'Без проекта'}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-slate-500 dark:text-slate-500 mt-0.5">
                      {new Date(tx.date).toLocaleDateString('ru-RU')}
                    </div>
                  </div>
                  <div className="text-right ml-3">
                    <div className="text-sm font-bold text-amber-700">
                      {tx.amount.toLocaleString('ru-RU')} ₽
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {recentTransactions.length === 0 && (
            <div className="text-center py-8 text-gray-400 dark:text-slate-500 dark:text-slate-500">
              <div className="text-4xl mb-2">📭</div>
              <p className="text-sm">Нет операций</p>
            </div>
          )}
        </div>

        {/* Бригады и статусы */}
        <div className="bg-white dark:bg-slate-800 dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-slate-700 dark:border-slate-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white dark:text-white mb-4 flex items-center gap-2">
            <span className="text-xl">👷</span>
            Бригады
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-blue-700 dark:text-blue-400 font-medium">Всего бригад</span>
                <span className="text-2xl font-bold text-blue-900 dark:text-blue-300">{stats?.totalBrigades || 0}</span>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-green-700 dark:text-green-400 font-medium">Активных</span>
                <span className="text-2xl font-bold text-green-900 dark:text-green-300">{stats?.activeBrigades || 0}</span>
              </div>
              <div className="mt-2 bg-white dark:bg-slate-800/50 rounded-full h-2">
                <div
                  className="bg-green-600 rounded-full h-2 transition-all"
                  style={{ width: `${stats?.totalBrigades ? (stats.activeBrigades / stats.totalBrigades) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Круговая диаграмма статусов */}
          {totalStatus > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-300 dark:text-slate-300 mb-3">Статусы проектов</h4>
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-24 flex-shrink-0">
                  <svg viewBox="0 0 36 36" className="w-24 h-24 transform -rotate-90">
                    {(() => {
                      let cumulativePercent = 0;
                      const colors: Record<string, string> = {
                        active: '#22c55e',
                        completed: '#3b82f6',
                        paused: '#eab308',
                        cancelled: '#ef4444'
                      };
                      return statusChartData.map((status, index) => {
                        const percent = (status.count / totalStatus) * 100;
                        const strokeDasharray = `${percent} ${100 - percent}`;
                        const strokeDashoffset = -cumulativePercent;
                        cumulativePercent += percent;
                        return (
                          <circle
                            key={status.name}
                            cx="18"
                            cy="18"
                            r="15.915"
                            fill="transparent"
                            stroke={colors[status.name] || '#9ca3af'}
                            strokeWidth="3"
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                          />
                        );
                      });
                    })()}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-700 dark:text-slate-300 dark:text-slate-300">{totalStatus}</span>
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  {statusChartData.map(status => {
                    const percent = totalStatus > 0 ? Math.round((status.count / totalStatus) * 100) : 0;
                    const colors: Record<string, string> = {
                      active: 'bg-green-500',
                      completed: 'bg-blue-500',
                      paused: 'bg-yellow-500',
                      cancelled: 'bg-red-500'
                    };
                    return (
                      <div key={status.name} className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${colors[status.name] || 'bg-gray-50 dark:bg-slate-7000'}`} />
                        <span className="text-xs text-gray-600 dark:text-slate-300 dark:text-slate-400 flex-1">{statusLabels[status.name] || status.name}</span>
                        <span className="text-xs font-bold text-gray-900 dark:text-white dark:text-white">{percent}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* График выплат */}
      {salaryChartData.length > 0 && (
        <div className="bg-white dark:bg-slate-800 dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-slate-700 dark:border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white dark:text-white flex items-center gap-2">
              <span className="text-xl">📈</span>
              Динамика выплат
            </h3>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-slate-300 dark:text-slate-400">Общая сумма</p>
              <p className="text-xl font-bold text-[#1976d2]">
                {salaryChartData.reduce((sum, d) => sum + d.amount, 0).toLocaleString('ru-RU')} ₽
              </p>
            </div>
          </div>
          <div className="flex items-end gap-3 h-48 pb-4 border-b border-gray-200 dark:border-slate-700">
            {salaryChartData.map((item, index) => {
              const height = maxSalary > 0 ? (item.amount / maxSalary) * 100 : 0;
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="relative w-full">
                    <div
                      className="w-full bg-gradient-to-t from-[#1976d2] to-[#42a5f5] rounded-t-lg transition-all duration-300 group-hover:from-[#1565c0] group-hover:to-[#1976d2] cursor-pointer"
                      style={{ height: `${Math.max(height, 5)}%` }}
                      title={`${item.amount.toLocaleString('ru-RU')} ₽`}
                    />
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {item.amount.toLocaleString('ru-RU')} ₽
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-slate-400 dark:text-slate-400 pt-2">{item.date.split('-')[2]}.{item.date.split('-')[1]}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Модальное окно баланса по объектам */}
      <ProjectBalanceModal
        isOpen={isBalanceModalOpen}
        onClose={() => setIsBalanceModalOpen(false)}
      />

      {/* План на месяц */}
      <MonthlyPlanTable
        onOpenAddModal={() => setIsMonthlyPlanModalOpen(true)}
      />
    </div>
  );
}
