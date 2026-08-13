import { useState } from 'react';
import { Modal } from '@/shared/components/ui/Modal';

interface AdvanceReport {
  id: string;
  employeeName: string;
  amount: number;
  date: string;
  purpose: string;
  status: 'pending' | 'paid' | 'returned';
  createdAt: string;
}

interface AdvanceReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (report: Omit<AdvanceReport, 'id' | 'createdAt'>) => void;
}

export function AdvanceReportModal({ isOpen, onClose, onSubmit }: AdvanceReportModalProps) {
  const [employeeName, setEmployeeName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [purpose, setPurpose] = useState('');
  const [status, setStatus] = useState<'pending' | 'paid' | 'returned'>('pending');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeName || !amount || !date || !purpose) return;
    onSubmit({
      employeeName,
      amount: parseFloat(amount),
      date,
      purpose,
      status,
    });
    setEmployeeName('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setPurpose('');
    setStatus('pending');
    onClose();
  };

  const statusOptions = [
    { value: 'pending', label: 'Ожидает', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    { value: 'paid', label: 'Выдан', color: 'bg-green-50 text-green-700 border-green-200' },
    { value: 'returned', label: 'Возвращен', color: 'bg-red-50 text-red-700 border-red-200' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Авансовый отчет" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Сотрудник</label>
            <input
              type="text"
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              placeholder="ФИО сотрудника"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Сумма (₽)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Дата выдачи</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Статус</label>
            <div className="flex gap-2 mt-1.5">
              {statusOptions.map((s) => (
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Цель выдачи</label>
          <textarea
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 resize-none"
            rows={3}
            placeholder="Для чего выдан аванс..."
            required
          />
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
            className="px-6 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700"
          >
            Сохранить отчет
          </button>
        </div>
      </form>
    </Modal>
  );
}
