import { useState } from 'react';
import { Modal } from '@/shared/components/ui/Modal';

interface Report {
  id: string;
  objectName: string;
  type: 'income' | 'expense' | 'advance';
  amount: number;
  date: string;
  description: string;
  contractNumber: string;
  createdAt: string;
}

interface ObjectReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (report: Omit<Report, 'id' | 'createdAt'>) => void;
}

export function ObjectReportModal({ isOpen, onClose, onSubmit }: ObjectReportModalProps) {
  const [objectName, setObjectName] = useState('');
  const [type, setType] = useState<'income' | 'expense' | 'advance'>('income');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [contractNumber, setContractNumber] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!objectName || !amount || !date) return;
    onSubmit({
      objectName,
      type,
      amount: parseFloat(amount),
      date,
      description,
      contractNumber,
    });
    setObjectName('');
    setType('income');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setContractNumber('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Отчет по объекту" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Название объекта</label>
            <input
              type="text"
              value={objectName}
              onChange={(e) => setObjectName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Улица, дом"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Номер договора</label>
            <input
              type="text"
              value={contractNumber}
              onChange={(e) => setContractNumber(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="ДГ-001"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Тип операции</label>
          <div className="flex gap-2">
            {([
              { value: 'income', label: 'Приход', color: 'bg-green-50 text-green-700 border-green-200' },
              { value: 'expense', label: 'Затраты', color: 'bg-red-50 text-red-700 border-red-200' },
              { value: 'advance', label: 'Аванс', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
            ] as const).map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                  type === t.value ? `${t.color} ring-2 ring-offset-1` : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Сумма (₽)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Дата</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Описание</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            rows={3}
            placeholder="Дополнительная информация по операции..."
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
            className="px-6 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
          >
            Сохранить отчет
          </button>
        </div>
      </form>
    </Modal>
  );
}
