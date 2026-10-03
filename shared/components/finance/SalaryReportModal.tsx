'use client';

import { useState } from 'react';
import { useAlert } from '@/shared/hooks/useAlert';
import { Modal } from '@/shared/components/ui/Modal';
import { Calendar, Loader2, FileText, User, DollarSign, CheckCircle, ChevronDown, ChevronUp, RefreshCw, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

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
  const [updating, setUpdating] = useState<string | null>(null);

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

  const handleUpdate = async (period: string) => {
    if (!(await confirm('Пересчитать зарплату за ' + period + '?'))) return;
    
    setUpdating(period);
    try {
      const res = await fetch('/api/salary-reports/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period, regenerate: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка');
      await onRefresh();
      alert('Зарплатный отчет пересчитан');
    } catch (error: any) {
      alert(error.message || 'Ошибка при обновлении');
    } finally {
      setUpdating(null);
    }
  };

  const handleExportExcel = async (report: SalaryReport) => {
    try {
      // Fetch hourly rates
      const ratesRes = await fetch('/api/hourly-rates');
      const ratesData = await ratesRes.json();
      const hourlyRates: Record<string, number> = {};
      
      if (ratesData.success && ratesData.data) {
        for (const rate of ratesData.data) {
          hourlyRates[rate.position] = rate.rate;
        }
      }

      // Fetch employees to get their hourly rates
      const empRes = await fetch('/api/employees');
      const empData = await empRes.json();
      const employeeRates: Record<number, number> = {};
      
      if (empData.success && empData.data) {
        for (const emp of empData.data) {
          if (emp.hourlyRate) {
            employeeRates[emp.id] = emp.hourlyRate.rate;
          }
        }
      }

      // Build Excel data
      const rows: string[][] = [
        ['Зарплатный отчет'],
        ['Период: ' + report.period],
        ['Дата формирования: ' + formatDate(report.date)],
        [],
        ['ФИО', 'Часовая ставка', 'Кол-во часов', 'Кол-во смен', 'Общая ЗП', 'Авансы', 'Штрафы', 'Премии', 'Остаток к выдаче'],
      ];

      let totalGross = 0;
      let totalAdvances = 0;
      let totalPenalties = 0;
      let totalBonuses = 0;
      let totalNet = 0;

      for (const item of report.items) {
        const hourlyRate = employeeRates[item.employeeId] || 0;
        const gross = item.grossSalary || 0;
        const advances = item.advances || 0;
        const penalties = item.penalties || 0;
        const bonuses = item.bonuses || 0;
        const net = item.amount;

        totalGross += gross;
        totalAdvances += advances;
        totalPenalties += penalties;
        totalBonuses += bonuses;
        totalNet += net;

        rows.push([
          item.employeeName,
          hourlyRate > 0 ? hourlyRate + ' ₽/ч' : '—',
          String(item.hours || 0),
          String(item.shifts || 0),
          gross.toLocaleString('ru-RU'),
          advances > 0 ? '-' + advances.toLocaleString('ru-RU') : '0',
          penalties > 0 ? '-' + penalties.toLocaleString('ru-RU') : '0',
          bonuses > 0 ? '+' + bonuses.toLocaleString('ru-RU') : '0',
          net.toLocaleString('ru-RU'),
        ]);
      }

      // Add totals row
      rows.push([]);
      rows.push([
        'ИТОГО',
        '',
        '',
        '',
        totalGross.toLocaleString('ru-RU'),
        '-' + totalAdvances.toLocaleString('ru-RU'),
        '-' + totalPenalties.toLocaleString('ru-RU'),
        totalBonuses > 0 ? '+' + totalBonuses.toLocaleString('ru-RU') : '0',
        totalNet.toLocaleString('ru-RU'),
      ]);

      // Create workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(rows);
      
      // Set column widths
      ws['!cols'] = [
        { wch: 40 }, // ФИО
        { wch: 15 }, // Часовая ставка
        { wch: 14 }, // Кол-во часов
        { wch: 14 }, // Кол-во смен
        { wch: 14 }, // Общая ЗП
        { wch: 14 }, // Авансы
        { wch: 14 }, // Штрафы
        { wch: 14 }, // Премии
        { wch: 18 }, // Остаток к выдаче
      ];

      // Add borders and styling
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
      const borderStyle = { style: 'thin', color: { rgb: '000000' } };
      
      for (let R = range.s.r; R <= range.e.r; R++) {
        for (let C = range.s.c; C <= range.e.c; C++) {
          const addr = XLSX.utils.encode_cell({ r: R, c: C });
          if (!ws[addr]) continue;
          if (!ws[addr].s) ws[addr].s = {};
          ws[addr].s.border = borderStyle;
          
          // Header styling
          if (R === 0) {
            ws[addr].s.font = { bold: true, sz: 14 };
          }
          // Column headers
          if (R === 4) {
            ws[addr].s.font = { bold: true };
            ws[addr].s.fill = { fgColor: { rgb: 'E8E8E8' } };
          }
          // Totals row
          if (R === rows.length - 1) {
            ws[addr].s.font = { bold: true };
          }
        }
      }

      XLSX.utils.book_append_sheet(wb, ws, 'Зарплатный отчет');
      XLSX.writeFile(wb, 'zarplata_' + report.period + '_' + new Date().toISOString().split('T')[0] + '.xlsx');
    } catch (error: any) {
      console.error('Export error:', error);
      alert('Ошибка при экспорте: ' + (error.message || 'неизвестная ошибка'));
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
              <li>• Сменная: часы из расписания × ставка</li>
              <li>• Оклад: не выше monthlySalary</li>
              <li>• Вычитаются авансы, добавляются премии/штрафы</li>
              <li>• Кнопка 🔄 для пересчета отчета</li>
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
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExportExcel(report);
                            }}
                            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900 rounded-lg transition-colors"
                            title="Экспорт в Excel"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdate(report.period);
                            }}
                            disabled={updating === report.period}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors disabled:opacity-50"
                            title="Пересчитать зарплату"
                          >
                            {updating === report.period ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <RefreshCw className="w-4 h-4" />
                            )}
                          </button>
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
