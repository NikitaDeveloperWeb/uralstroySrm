import { useState } from 'react';
import { Modal } from '@/shared/components/ui/Modal';

interface SalaryReport {
  id: string;
  employeeName: string;
  amount: number;
  period: string;
  paymentDate: string;
  status: 'pending' | 'paid';
  createdAt: string;
}

interface SalaryReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (report: Omit<SalaryReport, 'id' | 'createdAt'>) => void;
}

export function SalaryReportModal({ isOpen, onClose, onSubmit }: SalaryReportModalProps) {
  const [employeeName, setEmployeeName] = useState('');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<'pending' | 'paid'>('pending');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeName || !amount || !period || !paymentDate) return;
    onSubmit({
      employeeName,
      amount: parseFloat(amount),
      period,
      paymentDate,
      status,
    });
    setEmployeeName('');
    setAmount('');
    setPeriod('');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setStatus('pending');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Зарплатный отчет" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Сотрудник</label>
          <input
            type="text"
            value={employeeName}
            onChange={(e) => setEmployeeName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            placeholder="ФИО сотрудника"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Сумма начисления (₽)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Период</label>
            <input
              type="month"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Дата выплаты</label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Статус</label>
            <div className="flex gap-2 mt-1.5">
              {([
                { value: 'pending', label: 'Не выплачена', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
                { value: 'paid', label: 'Выплачена', color: 'bg-green-50 text-green-700 border-green-200' },
              ] as const).map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setStatus(s.value as typeof status)}
                  className={`flex-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                    status === s.value ? `${s.color} ring-2 ring-offset-1` : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Отмена
          </button>
          <button
            type="submit"
            className="px-6 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700"
          >
            Сохранить отчет
          </button>
        </div>
      </form>
    </Modal>
  );
}
