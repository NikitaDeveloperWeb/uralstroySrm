'use client';

import { useState, useEffect } from 'react';
import { useAlert } from '@/shared/hooks/useAlert';
import { Modal } from '@/shared/components/ui/Modal';
import { Loader2, Calendar, Clock, Sun, Globe, TrendingUp, ArrowUpCircle, ArrowDownCircle, DollarSign, FileText, Users, Briefcase, Save, Trash2, History, Download, RefreshCw } from 'lucide-react';

type Period = 'day' | 'week' | 'month' | 'year';

interface Transaction {
  id: number;
  date: string;
  amount: number;
  comment: string | null;
  projectName: string;
  projectCode: string;
}

interface AdvanceItem {
  employeeName: string;
  amount: number;
  purpose: string;
}

interface AdvanceReport {
  id: number;
  date: string;
  totalAmount: number;
  items: AdvanceItem[];
}

interface ExpenseItem {
  id: number;
  date: string;
  amount: number;
  recipient: string;
  purpose: string;
  category: string;
}

interface SalaryItem {
  employeeName: string;
  amount: number;
  period: string;
  grossSalary?: number;
  advances?: number;
  penalties?: number;
  bonuses?: number;
  isPaid?: boolean;
}

interface SalaryReport {
  id: number;
  date: string;
  period: string;
  totalAmount: number;
  status: string;
  items: SalaryItem[];
}

interface EOTItem {
  employeeName: string;
  paymentType: string;
  salary: number;
  comment: string | null;
}

interface EOTReport {
  id: number;
  date: string;
  totalAmount: number;
  status: string;
  items: EOTItem[];
}

interface MonthlyData {
  month: string;
  income: number;
  expense: number;
  profit: number;
}

interface SummaryReport {
  period: string;
  startDate: string;
  endDate: string;
  income: { total: number; transactions: Transaction[] };
  advances: { total: number; reports: AdvanceReport[] };
  expenses: { total: number; items: ExpenseItem[] };
  salary: { total: number; reports: SalaryReport[] };
  eot: { total: number; reports: EOTReport[] };
  summary: { totalIncome: number; totalExpense: number; profit: number };
  monthlyData: MonthlyData[];
}

interface SavedReport {
  id: number;
  name: string;
  period: string;
  date: string;
  periodFrom: string;
  periodTo: string;
  totalIncome: number;
  totalExpense: number;
  profit: number;
  data: string;
  createdAt: string;
}

interface ExpenseCategory {
  id: number;
  name: string;
}

interface SummaryReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SummaryReportModal({ isOpen, onClose }: SummaryReportModalProps) {
  const { alert, confirm } = useAlert();
  const [period, setPeriod] = useState<Period>('month');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
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
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [report, setReport] = useState<SummaryReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'income' | 'advances' | 'expenses' | 'salary' | 'eot' | 'history'>('summary');
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [reportName, setReportName] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(k => k + 1);
  };

  useEffect(() => {
    if (!isOpen) return;
    fetchReport();
    fetchSavedReports();
  }, [isOpen, period, date, month, year, weekStart, weekEnd, refreshKey]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('period', period);
      if (period === 'day') params.append('date', date);
      else if (period === 'week') { params.append('weekStart', weekStart); params.append('weekEnd', weekEnd); }
      else if (period === 'month') params.append('month', month);
      else if (period === 'year') params.append('year', year);
      const res = await fetch(`/api/reports/summary?${params}`);
      const data = await res.json();
      if (data.success) setReport(data.data);
    } catch (error) { console.error('Error fetching summary:', error); }
    finally { setLoading(false); }
  };

  const fetchSavedReports = async () => {
    try {
      const res = await fetch('/api/summary-reports');
      const data = await res.json();
      if (data.success) setSavedReports(data.data);
    } catch (error) { console.error('Error fetching saved reports:', error); }
  };

  const getPeriodFrom = () => {
    if (period === 'week') return weekStart;
    if (period === 'month') return `${month}-01`;
    if (period === 'year') return `${year}-01-01`;
    return date;
  };

  const getPeriodTo = () => {
    if (period === 'week') return weekEnd;
    if (period === 'month') {
      const [y, m] = month.split('-').map(Number);
      const lastDay = new Date(y, m, 0).getDate();
      return `${month}-${lastDay.toString().padStart(2, '0')}`;
    }
    if (period === 'year') return `${year}-12-31`;
    return date;
  };

  const handleSaveReport = async () => {
    if (!reportName.trim()) { alert('Введите название отчета'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/summary-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: reportName,
          period,
          date,
          periodFrom: getPeriodFrom(),
          periodTo: getPeriodTo(),
          totalIncome: report?.summary.totalIncome || 0,
          totalExpense: report?.summary.totalExpense || 0,
          profit: report?.summary.profit || 0,
          data: report,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReportName('');
        await fetchSavedReports();
        alert('Отчет сохранен');
      }
    } catch (error) { console.error('Error saving report:', error); }
    finally { setSaving(false); }
  };

  const handleDeleteSaved = async (id: number) => {
    if (!(await confirm('Удалить этот отчет?'))) return;
    try {
      await fetch(`/api/summary-reports?id=${id}`, { method: 'DELETE' });
      await fetchSavedReports();
    } catch (error) { console.error('Error deleting report:', error); }
  };

  const periodLabels: Record<Period, string> = { day: 'День', week: 'Неделя', month: 'Месяц', year: 'Год' };
  const periodIcons: Record<Period, any> = { day: Clock, week: Calendar, month: Sun, year: Globe };
  const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);

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

  if (!isOpen) return null;
  const maxIncome = Math.max(...(report?.monthlyData.map(d => d.income) || [0]), 1);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Общий отчет" height="h-[90vh]">
      <div className="space-y-4 h-full flex flex-col">
        {/* Period tabs */}
        <div className="flex-shrink-0">
          <div className="flex gap-1 bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
            {(Object.keys(periodLabels) as Period[]).map((p) => {
              const Icon = periodIcons[p];
              return (
                <button key={p} onClick={() => setPeriod(p)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${period === p ? 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-300'}`}>
                  <Icon className="w-4 h-4" />{periodLabels[p]}
                </button>
              );
            })}
          </div>
          <div className="mt-3">
            {period === 'day' && (
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            )}
            {period === 'week' && (
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">С</label>
                  <input type="date" value={weekStart} onChange={(e) => setWeekStart(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">По</label>
                  <input type="date" value={weekEnd} onChange={(e) => setWeekEnd(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
              </div>
            )}
            {period === 'month' && (
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">Месяц</label>
                  <select value={month.split('-')[1]} onChange={(e) => setMonth(`${month.split('-')[0]}-${e.target.value}`)}
                    className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                    {monthNames.map((name, i) => (<option key={i} value={(i + 1).toString().padStart(2, '0')}>{name}</option>))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">Год</label>
                  <select value={year} onChange={(e) => setYear(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                    {yearOptions.map(y => (<option key={y} value={y}>{y}</option>))}
                  </select>
                </div>
              </div>
            )}
            {period === 'year' && (
              <div>
                <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">Год</label>
                <select value={year} onChange={(e) => setYear(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                  {yearOptions.map(y => (<option key={y} value={y}>{y}</option>))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Content tabs */}
        <div className="flex-shrink-0 flex gap-1 bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
          {[
            { key: 'summary' as const, label: 'Сводка' },
            { key: 'income' as const, label: 'Доходы' },
            { key: 'advances' as const, label: 'Авансы' },
            { key: 'expenses' as const, label: 'Расходы' },
            { key: 'salary' as const, label: 'Зарплата' },
            { key: 'eot' as const, label: 'ЕОТ' },
            { key: 'history' as const, label: 'История' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab.key ? 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-300'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Save bar */}
        {activeTab !== 'history' && (
          <div className="flex-shrink-0 flex gap-2 items-center">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Обновить
            </button>
          </div>
        )}
        {activeTab !== 'history' && report && (
          <div className="flex-shrink-0 flex gap-2 items-center bg-blue-50 p-3 rounded-lg border border-blue-200">
            <input type="text" value={reportName} onChange={(e) => setReportName(e.target.value)}
              placeholder="Название отчета..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
            <button onClick={handleSaveReport} disabled={saving}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 dark:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-gray-400 dark:text-slate-500" /></div>
          ) : activeTab === 'history' ? (
            <div className="space-y-3">
              {savedReports.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-slate-400">
                  <History className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-slate-500" />
                  <p className="text-lg font-medium">Нет сохраненных отчетов</p>
                  <p className="text-sm mt-1">Сгенерируйте и сохраните отчет</p>
                </div>
              ) : (
                savedReports.map(r => (
                  <div key={r.id} className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{r.name}</h4>
                        <p className="text-xs text-gray-500 dark:text-slate-400">{new Date(r.date).toLocaleDateString('ru-RU')}</p>
                      </div>
                      <button onClick={() => handleDeleteSaved(r.id)} className="text-red-400 hover:text-red-600 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div><span className="text-gray-500 dark:text-slate-400">Доходы:</span> <span className="font-medium text-green-600">{r.totalIncome.toLocaleString('ru-RU')} ₽</span></div>
                      <div><span className="text-gray-500 dark:text-slate-400">Расходы:</span> <span className="font-medium text-red-600">{r.totalExpense.toLocaleString('ru-RU')} ₽</span></div>
                      <div><span className="text-gray-500 dark:text-slate-400">Прибыль:</span> <span className={`font-medium ${r.profit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>{r.profit.toLocaleString('ru-RU')} ₽</span></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : !report ? (
            <div className="text-center py-12 text-gray-500 dark:text-slate-400"><FileText className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-slate-500" /><p className="text-lg font-medium">Нет данных</p></div>
          ) : (
            <>
              {/* Summary */}
              {activeTab === 'summary' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                      <div className="flex items-center gap-2 mb-1"><ArrowUpCircle className="w-4 h-4 text-green-600" /><p className="text-xs font-medium text-green-700">Доходы</p></div>
                      <p className="text-lg font-bold text-green-900">{report.summary.totalIncome.toLocaleString('ru-RU')} ₽</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                      <div className="flex items-center gap-2 mb-1"><ArrowDownCircle className="w-4 h-4 text-red-600" /><p className="text-xs font-medium text-red-700">Расходы</p></div>
                      <p className="text-lg font-bold text-red-900">{report.summary.totalExpense.toLocaleString('ru-RU')} ₽</p>
                    </div>
                    <div className={`rounded-lg p-3 border ${report.summary.profit >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
                      <div className="flex items-center gap-2 mb-1"><TrendingUp className={`w-4 h-4 ${report.summary.profit >= 0 ? 'text-blue-600' : 'text-orange-600'}`} /><p className={`text-xs font-medium ${report.summary.profit >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>Чистая прибыль</p></div>
                      <p className={`text-lg font-bold ${report.summary.profit >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>{report.summary.profit.toLocaleString('ru-RU')} ₽</p>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Структура</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-slate-700"><span className="text-sm text-gray-600 dark:text-slate-300">Приходы</span><span className="text-sm font-medium text-green-600">+{report.income.total.toLocaleString('ru-RU')} ₽</span></div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-slate-700"><span className="text-sm text-gray-600 dark:text-slate-300">Авансы</span><span className="text-sm font-medium text-green-600">+{report.advances.total.toLocaleString('ru-RU')} ₽</span></div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-slate-700"><span className="text-sm text-gray-600 dark:text-slate-300">Расходы</span><span className="text-sm font-medium text-red-600">-{report.expenses.total.toLocaleString('ru-RU')} ₽</span></div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-slate-700"><span className="text-sm text-gray-600 dark:text-slate-300">Зарплата</span><span className="text-sm font-medium text-red-600">-{report.salary.total.toLocaleString('ru-RU')} ₽</span></div>
                      <div className="flex justify-between items-center py-2"><span className="text-sm text-gray-600 dark:text-slate-300">ЕОТ</span><span className="text-sm font-medium text-red-600">-{report.eot.total.toLocaleString('ru-RU')} ₽</span></div>
                    </div>
                  </div>
                  {report.monthlyData.length > 0 && (
                    <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Динамика прибыли по месяцам</h3>
                      <div className="space-y-3">
                        {report.monthlyData.map((data) => (
                          <div key={data.month} className="space-y-1">
                            <div className="flex justify-between text-xs"><span className="text-gray-600 dark:text-slate-300">{data.month}</span><span className={`font-medium ${data.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{data.profit.toLocaleString('ru-RU')} ₽</span></div>
                            <div className="flex gap-1 h-6"><div className="bg-green-500 rounded-l" style={{ width: `${(data.income / maxIncome) * 100}%` }} /><div className="bg-red-500 rounded-r" style={{ width: `${(data.expense / maxIncome) * 100}%` }} /></div>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-center gap-4 mt-4 pt-3 border-t">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded" /><span className="text-xs text-gray-600 dark:text-slate-300">Доходы</span></div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded" /><span className="text-xs text-gray-600 dark:text-slate-300">Расходы</span></div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Income */}
              {activeTab === 'income' && (
                <div className="space-y-3">
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200 flex justify-between items-center"><span className="text-sm font-medium text-green-800">Итого доходы</span><span className="text-lg font-bold text-green-900">{report.income.total.toLocaleString('ru-RU')} ₽</span></div>
                  {report.income.transactions.length === 0 ? (<div className="text-center py-8 text-gray-500 dark:text-slate-400"><ArrowUpCircle className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-slate-500" /><p className="text-sm">Доходов нет</p></div>) : (
                    <div className="space-y-2">{report.income.transactions.map(t => (<div key={t.id} className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-3"><div className="flex justify-between items-start"><div><p className="text-sm font-medium text-gray-900 dark:text-white">{t.projectName} ({t.projectCode})</p><p className="text-xs text-gray-500 dark:text-slate-400">{new Date(t.date).toLocaleDateString('ru-RU')}</p>{t.comment && <p className="text-xs text-gray-600 dark:text-slate-300 mt-1">{t.comment}</p>}</div><span className="text-sm font-bold text-green-600">+{t.amount.toLocaleString('ru-RU')} ₽</span></div></div>))}</div>
                  )}
                </div>
              )}

              {/* Advances */}
              {activeTab === 'advances' && (
                <div className="space-y-3">
                  <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200 flex justify-between items-center"><span className="text-sm font-medium text-yellow-800">Итого авансы</span><span className="text-lg font-bold text-yellow-900">{report.advances.total.toLocaleString('ru-RU')} ₽</span></div>
                  {report.advances.reports.length === 0 ? (<div className="text-center py-8 text-gray-500 dark:text-slate-400"><FileText className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-slate-500" /><p className="text-sm">Авансов нет</p></div>) : (
                    <div className="space-y-3">{report.advances.reports.map(r => (<div key={r.id} className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-3"><div className="flex justify-between items-center mb-2"><span className="text-xs text-gray-500 dark:text-slate-400">{new Date(r.date).toLocaleDateString('ru-RU')}</span><span className="text-sm font-bold text-yellow-700">{r.totalAmount.toLocaleString('ru-RU')} ₽</span></div><div className="space-y-1">{r.items.map((item, idx) => (<div key={idx} className="flex justify-between text-xs"><span className="text-gray-600 dark:text-slate-300">{item.employeeName}</span><span className="font-medium">{item.amount.toLocaleString('ru-RU')} ₽</span></div>))}</div></div>))}</div>
                  )}
                </div>
              )}

              {/* Expenses */}
              {activeTab === 'expenses' && (
                <div className="space-y-3">
                  <div className="bg-red-50 rounded-lg p-3 border border-red-200 flex justify-between items-center"><span className="text-sm font-medium text-red-800">Итого расходы</span><span className="text-lg font-bold text-red-900">{report.expenses.total.toLocaleString('ru-RU')} ₽</span></div>
                  {report.expenses.items.length === 0 ? (<div className="text-center py-8 text-gray-500 dark:text-slate-400"><ArrowDownCircle className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-slate-500" /><p className="text-sm">Расходов нет</p></div>) : (
                    <div className="space-y-2">{report.expenses.items.map(e => (<div key={e.id} className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-3"><div className="flex justify-between items-start"><div><div className="flex items-center gap-2 mb-1"><span className="text-xs font-medium px-2 py-0.5 bg-orange-100 text-orange-800 rounded">{getCategoryLabel(e.category)}</span><span className="text-xs text-gray-500 dark:text-slate-400">{new Date(e.date).toLocaleDateString('ru-RU')}</span></div><p className="text-sm font-medium text-gray-900 dark:text-white">{e.purpose}</p><p className="text-xs text-gray-600 dark:text-slate-300">Кому: {e.recipient}</p></div><span className="text-sm font-bold text-red-600">-{e.amount.toLocaleString('ru-RU')} ₽</span></div></div>))}</div>
                  )}
                </div>
              )}

              {/* Salary */}
              {activeTab === 'salary' && (
                <div className="space-y-3">
                  <div className="bg-purple-50 rounded-lg p-3 border border-purple-200 flex justify-between items-center"><span className="text-sm font-medium text-purple-800">Итого зарплата</span><span className="text-lg font-bold text-purple-900">{report.salary.total.toLocaleString('ru-RU')} ₽</span></div>
                  {report.salary.reports.length === 0 ? (<div className="text-center py-8 text-gray-500 dark:text-slate-400"><Users className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-slate-500" /><p className="text-sm">Зарплатных отчетов нет</p></div>) : (
                    <div className="space-y-3">{report.salary.reports.map(r => (<div key={r.id} className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-3"><div className="flex justify-between items-center mb-2"><div className="flex items-center gap-2"><span className="text-xs text-gray-500 dark:text-slate-400">{new Date(r.date).toLocaleDateString('ru-RU')}</span><span className="text-xs font-medium px-2 py-0.5 bg-purple-100 text-purple-800 rounded">{r.period}</span><span className={`text-xs font-medium px-2 py-0.5 rounded ${r.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{r.status === 'paid' ? 'Выплачено' : 'Ожидает'}</span></div><span className="text-sm font-bold text-purple-700">{r.totalAmount.toLocaleString('ru-RU')} ₽</span></div><div className="space-y-1">{r.items.map((item, idx) => (<div key={idx} className="flex justify-between text-xs"><span className="text-gray-600 dark:text-slate-300">{item.employeeName}</span><span className="font-medium">{item.amount.toLocaleString('ru-RU')} ₽</span></div>))}</div></div>))}</div>
                  )}
                </div>
              )}

              {/* EOT */}
              {activeTab === 'eot' && (
                <div className="space-y-3">
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 flex justify-between items-center"><span className="text-sm font-medium text-blue-800">Итого ЕОТ</span><span className="text-lg font-bold text-blue-900">{report.eot.total.toLocaleString('ru-RU')} ₽</span></div>
                  {report.eot.reports.length === 0 ? (<div className="text-center py-8 text-gray-500 dark:text-slate-400"><Briefcase className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-slate-500" /><p className="text-sm">ЕОТ отчетов нет</p></div>) : (
                    <div className="space-y-3">{report.eot.reports.map(r => (<div key={r.id} className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-3"><div className="flex justify-between items-center mb-2"><div className="flex items-center gap-2"><span className="text-xs text-gray-500 dark:text-slate-400">{new Date(r.date).toLocaleDateString('ru-RU')}</span><span className={`text-xs font-medium px-2 py-0.5 rounded ${r.status === 'finalized' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{r.status === 'finalized' ? 'Завершён' : 'Ожидает'}</span></div><span className="text-sm font-bold text-blue-700">{r.totalAmount.toLocaleString('ru-RU')} ₽</span></div><div className="space-y-1">{r.items.map((item, idx) => (<div key={idx} className="flex justify-between text-xs"><div><span className="text-gray-600 dark:text-slate-300">{item.employeeName}</span><span className="text-gray-400 dark:text-slate-500 ml-2">({item.paymentType})</span></div><span className="font-medium">{item.salary.toLocaleString('ru-RU')} ₽</span></div>))}</div></div>))}</div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
