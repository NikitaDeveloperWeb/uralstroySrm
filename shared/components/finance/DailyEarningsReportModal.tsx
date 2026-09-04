import { useState, useMemo } from 'react';
import { Modal } from '@/shared/components/ui/Modal';

interface EmployeeWorkReport {
  id: string;
  employeeName: string;
  hours: number;
  rate: number;
  date: string;
  completedJobs: number;
}

interface DailyEarningsReport {
  id: string;
  date: string;
  employeeReports: EmployeeWorkReport[];
  totalEarnings: number;
  createdAt: string;
}

interface DailyEarningsReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (report: Omit<DailyEarningsReport, 'id' | 'totalEarnings' | 'createdAt'>) => void;
  existingReports: EmployeeWorkReport[];
}

export function DailyEarningsReportModal({ isOpen, onClose, onSubmit, existingReports }: DailyEarningsReportModalProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [customName, setCustomName] = useState('');
  const [customHours, setCustomHours] = useState('');
  const [customRate, setCustomRate] = useState('');
  const [customJobs, setCustomJobs] = useState('');

  const filteredReports = useMemo(
    () => existingReports.filter((r) => r.date.startsWith(selectedDate)),
    [existingReports, selectedDate]
  );

  const addCustomEmployee = () => {
    if (!customName || !customHours || !customRate) return;
    const newReport: EmployeeWorkReport = {
      id: `custom-${Date.now()}`,
      employeeName: customName,
      hours: parseFloat(customHours),
      rate: parseFloat(customRate),
      date: selectedDate,
      completedJobs: parseInt(customJobs) || 0,
    };
    onSubmit({
      date: selectedDate,
      employeeReports: [...filteredReports, newReport],
    });
    setCustomName('');
    setCustomHours('');
    setCustomRate('');
    setCustomJobs('');
  };

  const totalEarnings = filteredReports.reduce((sum, r) => sum + r.hours * r.rate, 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Заработок за день">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Дата</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full sm:w-64 rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Отчетность сотрудников</label>
          {filteredReports.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-slate-700">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-slate-700">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-700 dark:text-slate-300">Сотрудник</th>
                    <th className="text-center px-4 py-2.5 font-medium text-gray-700 dark:text-slate-300">Часы</th>
                    <th className="text-center px-4 py-2.5 font-medium text-gray-700 dark:text-slate-300">Ставка/ч</th>
                    <th className="text-center px-4 py-2.5 font-medium text-gray-700 dark:text-slate-300">Заработок</th>
                    <th className="text-center px-4 py-2.5 font-medium text-gray-700 dark:text-slate-300">Задачи</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((report) => (
                    <tr key={report.id} className="border-t border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-700">
                      <td className="px-4 py-2.5 text-gray-900 dark:text-white font-medium">{report.employeeName}</td>
                      <td className="px-4 py-2.5 text-center text-gray-600 dark:text-slate-300">{report.hours}</td>
                      <td className="px-4 py-2.5 text-center text-gray-600 dark:text-slate-300">{report.rate} ₽</td>
                      <td className="px-4 py-2.5 text-center font-semibold text-red-700">
                        {(report.hours * report.rate).toLocaleString('ru-RU')} ₽
                      </td>
                      <td className="px-4 py-2.5 text-center text-gray-600 dark:text-slate-300">{report.completedJobs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 dark:bg-slate-700 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-slate-400">Нет отчетов от сотрудников за эту дату</p>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">Добавить вручную</label>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="ФИО"
              className="rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
            <input
              type="number"
              value={customHours}
              onChange={(e) => setCustomHours(e.target.value)}
              placeholder="Часы"
              min="0"
              step="0.5"
              className="rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
            <input
              type="number"
              value={customRate}
              onChange={(e) => setCustomRate(e.target.value)}
              placeholder="Ставка/ч (₽)"
              min="0"
              className="rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
            <input
              type="number"
              value={customJobs}
              onChange={(e) => setCustomJobs(e.target.value)}
              placeholder="Задачи"
              min="0"
              className="rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
            <button
              type="button"
              onClick={addCustomEmployee}
              className="rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 px-4"
            >
              Добавить
            </button>
          </div>
        </div>

        <div className="bg-red-50 rounded-lg p-4 flex justify-between items-center">
          <span className="text-sm font-medium text-red-800">Общий заработок:</span>
          <span className="text-2xl font-bold text-red-900">
            {totalEarnings.toLocaleString('ru-RU')} ₽
          </span>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-gray-200 dark:border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-700"
          >
            Закрыть
          </button>
          <button
            type="button"
            onClick={() => {
              onSubmit({
                date: selectedDate,
                employeeReports: [...filteredReports],
              });
              onClose();
            }}
            className="px-6 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700"
          >
            Сохранить отчет
          </button>
        </div>
      </div>
    </Modal>
  );
}
