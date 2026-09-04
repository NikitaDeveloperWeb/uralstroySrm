'use client';

import { useState } from 'react';
import { useAlert } from '@/shared/hooks/useAlert';
import { Modal } from '@/shared/components/ui/Modal';
import { Calendar, Loader2, FileText, User, DollarSign, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface SalaryReportItem {
  id: number;
  employeeId: number;
  employeeName: string;
  amount: number;
  period: string;
  grossSalary?: number;
  advances?: number;
  penalties?: number;
  bonuses?: number;
  days?: number;
  shifts?: number;
  hours?: number;
  isPaid?: boolean;
}

interface SalaryReport {
  id: number;
  date: string;
  period: string;
  totalAmount: number;
  status: string;
  items: SalaryReportItem[];
}

interface SalaryReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => Promise<void>;
  reports: SalaryReport[];
}

export function SalaryReportModal({ isOpen, onClose, onRefresh, reports }: SalaryReportModalProps) {
  const { alert, confirm } = useAlert();
  const [expandedReports, setExpandedReports] = useState<Set<number>>(new Set());
  const [paying, setPaying] = useState<number | null>(null);
  const [salaryMonth, setSalaryMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [generating, setGenerating] = useState(false);

  const toggleReport = (reportId: number) => {
    setExpandedReports(prev => {
      const next = new Set(prev);
      if (next.has(reportId)) {
        next.delete(reportId);
      } else {
        next.add(reportId);
      }
      return next;
    });
  };

  const handlePay = async (itemId: number, employeeName: string, amount: number) => {
    if (!(await confirm(`Выдать ${amount.toLocaleString('ru-RU')} ₽ сотруднику ${employeeName}?`))) return;
    
    setPaying(itemId);
    try {
      const res = await fetch('/api/salary-pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, employeeName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка');
      await onRefresh();
    } catch (error: any) {
      alert(error.message || 'Ошибка при выплате');
    } finally {
      setPaying(null);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const [year, month] = salaryMonth.split('-').map(Number);
      const res = await fetch('/api/salary-reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month, year }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка');
      await onRefresh();
      onClose();
    } catch (error: any) {
      alert(error.message || 'Ошибка при генерации зарплатного отчета');
    } finally {
      setGenerating(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
    };
    const labels: Record<string, string> = {
      pending: 'Ожидает',
      paid: 'Выплачено',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
        {labels[status] || labels.pending}
      </span>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Зарплатные отчеты" height="h-[90vh]">
      <div className="space-y-4 h-full flex flex-col">
        {/* Period selector */}
        <div className="flex-shrink-0 pb-4 border-b">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Период</label>
              <div className="flex gap-2">
                <input
                  type="month"
                  value={salaryMonth}
                  onChange={(e) => setSalaryMonth(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 dark:bg-slate-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                  {generating ? '...' : 'Создать'}
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Будут рассчитаны все смены и вычтены все авансы за выбранный месяц
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="flex-shrink-0 pb-4">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <FileText className="w-5 h-5 text-purple-600 mb-2" />
            <h3 className="font-semibold text-purple-900 mb-1">Как рассчитывается ЗП?</h3>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• Суммируются все начисления из ЕОТ за месяц</li>
              <li>• Вычитаются все выданные авансы</li>
              <li>• Показывается итог к выплате</li>
            </ul>
          </div>
        </div>

        {/* Reports list */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {reports.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-slate-500" />
              <p className="text-sm">Нет зарплатных отчетов</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => {
                const isExpanded = expandedReports.has(report.id);
                return (
                  <div key={report.id} className="bg-white dark:bg-slate-800 rounded-lg border overflow-hidden">
                    {/* Report header */}
                    <div 
                      className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-700 cursor-pointer transition-colors"
                      onClick={() => toggleReport(report.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                            <span className="text-sm text-gray-600 dark:text-slate-300">{formatDate(report.date)}</span>
                            {getStatusBadge(report.status)}
                          </div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            Период: {report.period}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                            {report.items.length} {report.items.length === 1 ? 'запись' : report.items.length < 5 ? 'записи' : 'записей'} · 
                            {report.items.filter(i => i.isPaid).length} выплачено
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 dark:text-white">
                            {report.totalAmount.toLocaleString('ru-RU')} ₽
                          </span>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400 dark:text-slate-500" /> : <ChevronDown className="w-4 h-4 text-gray-400 dark:text-slate-500" />}
                        </div>
                      </div>
                    </div>

                    {/* Expanded content */}
                    {isExpanded && (
                      <div className="border-t bg-gray-50 dark:bg-slate-700 p-4 space-y-2">
                        {report.items.map((item) => {
                          const gross = item.grossSalary || item.amount + (item.advances || 0);
                          const advances = item.advances || 0;
                          const penalties = item.penalties || 0;
                          const bonuses = item.bonuses || 0;
                          const remaining = item.amount;
                          
                          return (
                            <div 
                              key={item.id} 
                              className={`rounded-lg p-3 border ${item.isPaid ? 'bg-green-50 border-green-200' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700'}`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                  <User className={`w-4 h-4 ${item.isPaid ? 'text-green-600' : 'text-gray-400 dark:text-slate-500'}`} />
                                  <div>
                                    <p className={`text-sm font-medium ${item.isPaid ? 'text-green-900' : 'text-gray-900 dark:text-white'}`}>
                                      {item.employeeName}
                                    </p>
                                    <div className="flex gap-2 text-xs text-gray-500 dark:text-slate-400">
                                      {item.days && (
                                        <span>{item.days} {item.days === 1 ? 'день' : item.days < 5 ? 'дня' : 'дней'}</span>
                                      )}
                                      {item.shifts && (
                                        <span>· {item.shifts} {item.shifts === 1 ? 'смена' : item.shifts < 5 ? 'смены' : 'смен'}</span>
                                      )}
                                      {item.hours && (
                                        <span>· {item.hours} {item.hours === 1 ? 'час' : item.hours < 5 ? 'часа' : 'часов'}</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {item.isPaid ? (
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <button
                                      onClick={() => handlePay(item.id, item.employeeName, remaining)}
                                      disabled={paying === item.id}
                                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 dark:bg-slate-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                                    >
                                      {paying === item.id ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                                      {paying === item.id ? '...' : 'Выдать'}
                                    </button>
                                  )}
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                                <div className="bg-white dark:bg-slate-800 rounded p-2 border">
                                  <p className="text-gray-500 dark:text-slate-400">Начислено</p>
                                  <p className="font-semibold text-blue-600">{gross.toLocaleString('ru-RU')} ₽</p>
                                </div>
                                <div className="bg-white dark:bg-slate-800 rounded p-2 border">
                                  <p className="text-gray-500 dark:text-slate-400">Авансы</p>
                                  <p className="font-semibold text-red-600">-{advances.toLocaleString('ru-RU')} ₽</p>
                                </div>
                                <div className="bg-white dark:bg-slate-800 rounded p-2 border">
                                  <p className="text-gray-500 dark:text-slate-400">Штрафы</p>
                                  <p className="font-semibold text-red-600">-{penalties.toLocaleString('ru-RU')} ₽</p>
                                </div>
                                {bonuses > 0 && (
                                  <div className="bg-white dark:bg-slate-800 rounded p-2 border">
                                    <p className="text-gray-500 dark:text-slate-400">Премии</p>
                                    <p className="font-semibold text-green-600">+{bonuses.toLocaleString('ru-RU')} ₽</p>
                                  </div>
                                )}
                                <div className="bg-white dark:bg-slate-800 rounded p-2 border">
                                  <p className="text-gray-500 dark:text-slate-400">К выплате</p>
                                  <p className="font-semibold text-green-600">{remaining.toLocaleString('ru-RU')} ₽</p>
                                </div>
                              </div>
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
