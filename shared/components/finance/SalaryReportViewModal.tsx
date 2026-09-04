'use client';

import { useState, useEffect } from 'react';
import { useAlert } from '@/shared/hooks/useAlert';
import { Modal } from '@/shared/components/ui/Modal';
import { Trash2, Calendar, DollarSign, User, FileText } from 'lucide-react';

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
}

interface SalaryReport {
  id: number;
  date: string;
  period: string;
  totalAmount: number;
  status: string;
  items: SalaryReportItem[];
}

interface SalaryReportViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  reports: SalaryReport[];
  onDelete: (id: number) => Promise<void>;
  onUpdateStatus: (id: number, status: string) => Promise<void>;
}

export function SalaryReportViewModal({
  isOpen,
  onClose,
  reports,
  onDelete,
  onUpdateStatus,
}: SalaryReportViewModalProps) {
  const { confirm } = useAlert();
  const [selectedReport, setSelectedReport] = useState<SalaryReport | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setSelectedReport(null);
      setDeleting(null);
    }
  }, [isOpen]);

  const handleDelete = async (id: number) => {
    if (await confirm('Удалить этот зарплатный отчет?')) {
      setDeleting(id);
      try {
        await onDelete(id);
        if (selectedReport?.id === id) {
          setSelectedReport(null);
        }
      } catch (error) {
        console.error('Ошибка при удалении:', error);
      } finally {
        setDeleting(null);
      }
    }
  };

  const handleStatusChange = async (status: string) => {
    if (selectedReport) {
      await onUpdateStatus(selectedReport.id, status);
      setSelectedReport(null);
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
        {/* Report list */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {reports.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-slate-500" />
              <p className="text-lg font-medium">Нет зарплатных отчетов</p>
              <p className="text-sm mt-1">Создайте первый отчет через кнопку ниже</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className={`bg-white dark:bg-slate-800 rounded-lg border p-4 cursor-pointer hover:border-blue-400 transition-colors ${
                    selectedReport?.id === report.id ? 'border-blue-500 bg-blue-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                        <span className="text-sm text-gray-600 dark:text-slate-300">
                          {formatDate(report.date)}
                        </span>
                        {getStatusBadge(report.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-600 dark:text-slate-300">
                          {report.items.length} {report.items.length === 1 ? 'запись' : report.items.length < 5 ? 'записи' : 'записей'}
                        </span>
                        <span className="text-gray-600 dark:text-slate-300">
                          Период: {report.period}
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {report.totalAmount.toLocaleString('ru-RU')} ₽
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(report.id);
                      }}
                      disabled={deleting === report.id}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected report details */}
        {selectedReport && (
          <div className="flex-shrink-0 mt-4 border-t pt-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg border p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-900 dark:text-white">Детали отчета</h3>
                <span className="text-lg font-bold text-green-600">
                  {selectedReport.totalAmount.toLocaleString('ru-RU')} ₽
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleStatusChange('pending')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    selectedReport.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'border text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-700'
                  }`}
                >
                  Ожидает
                </button>
                <button
                  onClick={() => handleStatusChange('paid')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    selectedReport.status === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : 'border text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-700'
                  }`}
                >
                  Выплачено
                </button>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300">Сотрудники:</h4>
                {selectedReport.items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3 space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{item.employeeName}</p>
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
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-white dark:bg-slate-800 rounded p-2">
                        <p className="text-gray-500 dark:text-slate-400">Начислено</p>
                        <p className="font-semibold text-blue-600">
                          {(item.grossSalary || item.amount).toLocaleString('ru-RU')} ₽
                        </p>
                      </div>
                      <div className="bg-white dark:bg-slate-800 rounded p-2">
                        <p className="text-gray-500 dark:text-slate-400">Авансы</p>
                        <p className="font-semibold text-red-600">
                          -{(item.advances || 0).toLocaleString('ru-RU')} ₽
                        </p>
                      </div>
                      {item.penalties && item.penalties > 0 && (
                        <div className="bg-white dark:bg-slate-800 rounded p-2">
                          <p className="text-gray-500 dark:text-slate-400">Штрафы</p>
                          <p className="font-semibold text-red-600">
                            -{item.penalties.toLocaleString('ru-RU')} ₽
                          </p>
                        </div>
                      )}
                      {item.bonuses && item.bonuses > 0 && (
                        <div className="bg-white dark:bg-slate-800 rounded p-2">
                          <p className="text-gray-500 dark:text-slate-400">Премии</p>
                          <p className="font-semibold text-green-600">
                            +{item.bonuses.toLocaleString('ru-RU')} ₽
                          </p>
                        </div>
                      )}
                      <div className="bg-white dark:bg-slate-800 rounded p-2">
                        <p className="text-gray-500 dark:text-slate-400">Итого</p>
                        <p className="font-semibold text-green-600">
                          {item.amount.toLocaleString('ru-RU')} ₽
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

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
